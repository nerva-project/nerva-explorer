import { NextResponse } from "next/server";
import { getInfo, getBlockHeaderByHeight, COIN_CONFIG } from "@/lib/nerva-api";

// Server-side, cached mining-activity data for the heatmap.
//
// The heatmap needs one block per day boundary to compute each day's average
// hashrate (work done / time elapsed, via cumulative_difficulty). Doing that in
// the browser means ~16 upstream requests per visitor. Here it runs once on the
// server and is cached in memory, so every visitor gets a single small JSON and
// the upstream work happens at most once per TTL across all visitors.
//
// stale-while-revalidate: an expired entry is served immediately while a fresh
// one is computed in the background, so only the very first ever request waits.

export const dynamic = "force-dynamic";

const BLOCKS_PER_DAY = Math.round(86400 / COIN_CONFIG.blockTarget);
const DAYS = 15;
const TTL_MS = 15 * 60 * 1000; // refresh at most every 15 minutes
const COMPUTE_TIMEOUT_MS = 15000;

type DayHashrate = { date: number; hashrate: number };

let cache: { data: DayHashrate[]; expires: number } | null = null;
let inflight: Promise<DayHashrate[]> | null = null;

async function compute(): Promise<DayHashrate[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COMPUTE_TIMEOUT_MS);
  try {
    const info = await getInfo(controller.signal);
    const tip = info.height - 1;

    // One boundary block per day (plus today), so DAYS periods between them.
    const heights: number[] = [];
    for (let i = 0; i <= DAYS; i++) {
      const h = tip - i * BLOCKS_PER_DAY;
      if (h > 1) heights.push(h);
    }

    const boundaries = (
      await Promise.all(
        heights.map((h) => getBlockHeaderByHeight(h, controller.signal).catch(() => null))
      )
    )
      .filter((b): b is NonNullable<typeof b> => b !== null)
      .map((b) => ({ ts: b.timestamp, cd: b.cumulative_difficulty }))
      .sort((a, b) => a.ts - b.ts);

    // Average hashrate per period = work done / time elapsed. A missing boundary
    // just widens a period; work/time keeps it correct.
    const periods: DayHashrate[] = [];
    for (let k = 0; k < boundaries.length - 1; k++) {
      const dt = boundaries[k + 1].ts - boundaries[k].ts;
      if (dt <= 0) continue;
      periods.push({
        // Label each square with the end of its window, so the newest square
        // carries today's date.
        date: boundaries[k + 1].ts,
        hashrate: (boundaries[k + 1].cd - boundaries[k].cd) / dt,
      });
    }
    return periods;
  } finally {
    clearTimeout(timeout);
  }
}

function refresh(): Promise<DayHashrate[]> {
  if (!inflight) {
    inflight = compute()
      .then((data) => {
        cache = { data, expires: Date.now() + TTL_MS };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function GET() {
  const now = Date.now();
  const fresh = cache !== null && cache.expires > now;

  // Serve any cached data immediately; refresh in the background if it's stale.
  if (cache !== null) {
    if (!fresh) void refresh().catch(() => {});
    return NextResponse.json(
      { days: cache.data, stale: !fresh },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  }

  // No cache yet (first ever request): compute and wait.
  try {
    const data = await refresh();
    return NextResponse.json(
      { days: data },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch {
    return NextResponse.json({ error: "Failed to compute mining data" }, { status: 502 });
  }
}
