import { NextRequest, NextResponse } from "next/server";
import { config } from "@/config/config";

// Server-side API proxy: forwards requests to the upstream Nerva RPC API.
// Benefits: avoids CORS issues, adds caching for cacheable endpoints,
// timeout, and strips PHP warnings.

// Endpoints that return real-time state and must NOT be cached.
// get_info changes every block (height, difficulty, tx_pool_size, etc.)
// get_transaction_pool changes whenever a tx enters or leaves the mempool.
const NO_CACHE_ENDPOINTS = new Set(["get_info", "get_transaction_pool"]);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const endpoint = request.nextUrl.searchParams.get("endpoint");
  if (!endpoint) {
    return NextResponse.json(
      { error: "Missing endpoint parameter" },
      { status: 400 }
    );
  }

  // Forward all query params to the upstream API
  const params = new URLSearchParams(request.nextUrl.searchParams);
  const url = `${config.apiEndpoint}?${params.toString()}`;

  // Per-endpoint cache policy:
  // - Real-time endpoints (get_info, get_transaction_pool): no-store
  // - Everything else (block headers, generated coins, etc.): cache 10s
  const isNoCache = NO_CACHE_ENDPOINTS.has(endpoint);
  const cacheControl = isNoCache
    ? "no-store"
    : "public, s-maxage=10, stale-while-revalidate=30";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      // Don't let Next.js cache the upstream fetch; we set our own
      // Cache-Control on the response below.
      cache: "no-store",
    });
    clearTimeout(timeout);

    const text = await res.text();

    // Defensive: strip PHP warning HTML that the upstream sometimes prepends.
    // Find the first { or [ which marks the start of actual JSON data.
    const jsonStart = text.search(/[{[]/);
    const cleanText = jsonStart >= 0 ? text.slice(jsonStart) : text;

    const contentType =
      res.headers.get("content-type") || "application/json";

    return new NextResponse(cleanText, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: `Upstream request failed: ${message}` },
      { status: 502 }
    );
  }
}
