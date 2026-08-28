"use client";

import { useEffect, useRef, useState } from "react";
import { displayUnits } from "@/lib/nerva-api";

type DayHashrate = { date: number; hashrate: number };

// The heavy work (one header per day boundary, cumulative_difficulty math) is
// done and cached server-side at /api/mining, so this component makes a single
// request for a small precomputed array instead of ~16 upstream calls.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Kept only so the number of loading squares matches the server's window.
const DAYS = 15;

export default function MiningHeatmap() {
  const [dayData, setDayData] = useState<DayHashrate[] | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const controller = new AbortController();
    fetch(`${basePath}/api/mining`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setDayData(Array.isArray(d.days) ? d.days : []))
      .catch(() => setDayData([]));

    return () => controller.abort();
  }, []);

  // Loading state (also the SSR output, since the fetch is client-only, so
  // there are no server/client-dependent values to mismatch on hydration).
  if (dayData === null) {
    return (
      <div
        className="rounded-lg border p-3"
        style={{ borderColor: "var(--clr-border)", background: "var(--clr-bg-surface)" }}
      >
        <div className="text-xs font-medium mb-2" style={{ color: "var(--clr-text)" }}>
          Mining Activity
        </div>
        <div className="flex flex-wrap gap-[2px]">
          {[...Array(DAYS)].map((_, i) => (
            <div key={i} className="w-[14px] h-[14px] rounded-sm shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (dayData.length === 0) return null;

  const rates = dayData.map((d) => d.hashrate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);

  // Opacity encodes hashrate relative to the window's min/max. Guard the flat
  // case (min === max) so every square doesn't collapse to one tier.
  const opacity = (hr: number) => {
    if (max === min) return 0.7;
    const r = (hr - min) / (max - min);
    if (r > 0.75) return 1;
    if (r > 0.5) return 0.7;
    if (r > 0.25) return 0.4;
    return 0.15;
  };

  return (
    <div
      className="rounded-lg border p-3"
      style={{ borderColor: "var(--clr-border)", background: "var(--clr-bg-surface)" }}
    >
      <div className="text-xs font-medium mb-2" style={{ color: "var(--clr-text)" }}>
        Mining Activity
      </div>
      <div className="flex flex-wrap gap-[2px]">
        {dayData.map((d) => (
          <div
            key={d.date}
            className="w-[14px] h-[14px] rounded-sm cursor-pointer transition-transform hover:scale-125"
            style={{ background: "var(--clr-accent)", opacity: opacity(d.hashrate) }}
            title={`${new Date(d.date * 1000).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })} - avg ${displayUnits(d.hashrate, 2)}H/s`}
          />
        ))}
      </div>
      <div
        className="flex items-center justify-between mt-2 text-[9px]"
        style={{ color: "var(--clr-text-subtle)" }}
      >
        <span>{dayData.length}d</span>
        <div className="flex items-center gap-1">
          <span>low</span>
          {[0.15, 0.4, 0.7, 1].map((o) => (
            <div
              key={o}
              className="w-[10px] h-[10px] rounded-sm"
              style={{ background: "var(--clr-accent)", opacity: o }}
            />
          ))}
          <span>high</span>
        </div>
      </div>
    </div>
  );
}
