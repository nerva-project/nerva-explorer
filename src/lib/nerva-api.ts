// Nerva Explorer API client
// Mirrors the structure of the original Vue explorer's services/Explorer/explorer.service.js
//
// All public API functions accept an optional AbortSignal so callers can cancel
// in-flight requests (used by the auto-refresh hook to avoid stacking requests
// and to discard stale responses when the tab is hidden).

import { config } from "@/config/config";

// Determine the API base URL.
//
// On the client (browser): use the server-side proxy at /api/rpc so the
// browser never hits the upstream directly (avoids CORS, adds caching).
// The proxy path is prefixed with NEXT_PUBLIC_BASE_PATH if set, so
// subpath deploys (/explorer/) work correctly.
//
// On the server (server components, route handlers): fetch the upstream
// directly via config.apiEndpoint. Node's fetch cannot resolve relative
// URLs like "/api/rpc", so we must use the absolute upstream URL when
// running server-side. This is what makes /block/[id] and /tx/[hash]
// deep links work on cold loads (refresh, shared links).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const API_BASE =
  typeof window === "undefined"
    ? config.apiEndpoint
    : config.useServerProxy
      ? `${basePath}/api/rpc`
      : config.apiEndpoint;

// Coin configuration - exported for use across the app (formatters, tools, etc.)
export const COIN_CONFIG = config.coin;

// Types
export type NetworkInfo = {
  height: number;
  difficulty: number;
  tx_count: number;
  tx_pool_size: number;
  target: number;
  target_height: number;
  top_block_hash: string;
  status: string;
  incoming_connections_count: number;
  outgoing_connections_count: number;
  white_peerlist_size: number;
  grey_peerlist_size: number;
  cumulative_difficulty: number;
  block_size_limit: number;
  block_size_median: number;
  database_size: number;
  nettype: string;
  start_time: number;
};

export type BlockHeader = {
  height: number;
  hash: string;
  prev_hash: string;
  timestamp: number;
  difficulty: number;
  cumulative_difficulty: number;
  reward: number;
  block_size: number;
  block_weight: number;
  long_term_weight: number;
  num_txes: number;
  nonce: number;
  orphan_status: boolean;
  depth: number;
  major_version: number;
  minor_version: number;
  miner_tx_hash: string;
};

export type TxPoolEntry = {
  id_hash: string;
  fee: number;
  receive_time: number;
  weight: number;
  blob_size: number;
  kept_by_block: boolean;
  last_failed_id_hash: string;
  last_failed_height: number;
  last_relayed_time: number;
  max_used_block_height: number;
  relayed: boolean;
  do_not_relay: boolean;
  double_spend_seen: boolean;
  // raw JSON payload from the daemon (present in the response but unused by the UI)
  json?: unknown;
};

// Transaction detail returned by get_transactions.
// Many fields are optional because in-pool transactions have fewer fields
// than confirmed transactions (e.g. block_height is null for pool txs).
export type TransactionDetail = {
  tx_hash?: string;
  id_hash?: string;
  block_height?: number | null;
  block_timestamp?: number;
  in_pool?: boolean;
  fee?: number;
  tx_size?: number;
  unlock_time?: number;
  vin?: unknown[];
  vout?: unknown[];
  extra?: string | unknown[];
};

// ---------------------------------------------------------------------------
// JSON parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parse JSON defensively: strip any leading PHP warning HTML or whitespace by
 * finding the first `{` or `[` character, then JSON.parse the remainder.
 *
 * The Nerva upstream API occasionally emits warnings like
 *   `<br /><b>Warning</b>: Undefined property: stdClass::$foo in /srv/index.php on line 12<br />\n{...}`
 * before the actual JSON body. A bare `JSON.parse` would choke on those.
 *
 * Throws SyntaxError if the remaining text is not valid JSON.
 */
export function parseJsonDefensively(text: string): unknown {
  const jsonStart = text.search(/[{[]/);
  const cleanText = jsonStart >= 0 ? text.slice(jsonStart) : text;
  return JSON.parse(cleanText);
}

type RpcError = { code?: number; message?: string };

/**
 * Low-level fetch helper used by every public API function below.
 *
 * - Uses `parseJsonDefensively` so PHP warnings are stripped.
 * - Throws when the response body is an `{"error":...}` shape.
 * - Unwraps `{"result":...}` shapes when caller expects the inner value.
 *   (Callers that need to distinguish bare arrays from `{"result":[...]}`
 *   should inspect the parsed value themselves.)
 */
async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { cache: "no-store", signal });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  const text = await res.text();
  const data = parseJsonDefensively(text);

  // Reject {"error": ...} shapes uniformly across all endpoints.
  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "error" in data
  ) {
    const err = (data as { error: RpcError | string }).error;
    const message =
      typeof err === "string"
        ? err
        : err?.message || "Unknown RPC error";
    throw new Error(message);
  }

  return data as T;
}

/** Build a URL against API_BASE with the given endpoint and query params. */
function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const search = new URLSearchParams({ endpoint, ...(params || {}) });
  return `${API_BASE}?${search.toString()}`;
}

// ---------------------------------------------------------------------------
// Formatters (pure, no I/O)
// ---------------------------------------------------------------------------

// Helper: format display units (k, M, G, T, P, E)
export function displayUnits(input: number, decimals = 0): string {
  const units = ["", "k", "M", "G", "T", "P", "E"];
  let val = input;
  let i = 0;
  while (val >= 1000 && i < units.length - 1) {
    val = val / 1000;
    i++;
  }
  return `${val.toFixed(decimals)} ${units[i]}`.trim();
}

// Helper: convert atomic units to decimal XNV
export function decimalUnits(numIn: number): number {
  if (isNaN(numIn)) return 0;
  return numIn / Math.pow(10, COIN_CONFIG.unitPlaces);
}

// Helper: format hashrate from difficulty
export function formatHashrate(difficulty: number): string {
  return `${displayUnits(difficulty / COIN_CONFIG.blockTarget, 2)}H/s`;
}

// Helper: block size formatter
export function formatBlockSize(size: number): string {
  return `${displayUnits(size, size >= 1000 ? 2 : 0)}B`;
}

// Helper: format XNV amount
export function formatXNV(atomic: number, decimals = 4): string {
  return `${decimalUnits(atomic).toFixed(decimals)} XNV`;
}

// Helper: format timestamp to relative + absolute
export function formatBlockTime(unix: number): { ago: string; abs: string } {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unix;
  let ago: string;
  if (diff < 60) ago = `${diff}s ago`;
  else if (diff < 3600) ago = `${Math.floor(diff / 60)}m ago`;
  else if (diff < 86400) ago = `${Math.floor(diff / 3600)}h ago`;
  else ago = `${Math.floor(diff / 86400)}d ago`;
  const d = new Date(unix * 1000);
  const abs = d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  return { ago, abs };
}

// Utility: average solve time from blocks
export function averageSolveTime(blocks: BlockHeader[]): number | null {
  if (blocks.length < 2) return null;
  const sorted = [...blocks].sort((a, b) => a.height - b.height);
  const times: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    times.push(sorted[i].timestamp - sorted[i - 1].timestamp);
  }
  if (times.length === 0) return null;
  return times.reduce((sum, t) => sum + t, 0) / times.length;
}

// Utility: chart data from blocks (hashrate + solve time series)
export function buildBlockChartData(blocks: BlockHeader[]) {
  const sorted = [...blocks].sort((a, b) => a.height - b.height);
  const hashrateData: { x: number; y: number }[] = [];
  const blockTimeData: { x: number; y: number }[] = [];
  let lastTime: number | null = null;

  for (const b of sorted) {
    const hashrate = b.difficulty / COIN_CONFIG.blockTarget;
    hashrateData.push({ x: b.height, y: hashrate });
    const solveTime = lastTime ? b.timestamp - lastTime : 60;
    blockTimeData.push({ x: b.height, y: solveTime });
    lastTime = b.timestamp;
  }
  return { hashrateData, blockTimeData };
}

// ---------------------------------------------------------------------------
// RPC API functions
// ---------------------------------------------------------------------------

// API: get_info
export async function getInfo(signal?: AbortSignal): Promise<NetworkInfo> {
  return fetchJSON<NetworkInfo>(buildUrl("get_info"), signal);
}

// API: get_block_headers_range
export async function getBlockHeaders(
  start: number,
  end: number,
  signal?: AbortSignal
): Promise<BlockHeader[]> {
  const data = await fetchJSON<
    BlockHeader[] | { headers?: BlockHeader[] }
  >(
    buildUrl("get_block_headers_range", {
      start: String(start),
      end: String(end),
    }),
    signal
  );
  if (Array.isArray(data)) return data;
  return data.headers || [];
}

// API: get_transaction_pool
export async function getTxPool(signal?: AbortSignal): Promise<TxPoolEntry[]> {
  const data = await fetchJSON<
    TxPoolEntry[] | { transactions?: TxPoolEntry[] }
  >(buildUrl("get_transaction_pool"), signal);
  if (Array.isArray(data)) return data;
  return data.transactions || [];
}

// API: get_generated_coins
// The upstream returns either a plain number or {"generated_coins": N}.
// Returns 0 on any parse failure (the value is non-critical for the UI).
export async function getGeneratedCoins(
  height: number,
  signal?: AbortSignal
): Promise<number> {
  try {
    const data = await fetchJSON<number | { generated_coins?: number }>(
      buildUrl("get_generated_coins", { height: String(height) }),
      signal
    );
    if (typeof data === "number") return data;
    if (
      data &&
      typeof data === "object" &&
      typeof data.generated_coins === "number"
    ) {
      return data.generated_coins;
    }
    return 0;
  } catch {
    return 0;
  }
}

// API: get_block_header_by_height
export async function getBlockHeaderByHeight(
  height: number,
  signal?: AbortSignal
): Promise<BlockHeader> {
  const data = await fetchJSON<{ block_header?: BlockHeader }>(
    buildUrl("get_block_header_by_height", { height: String(height) }),
    signal
  );
  if (!data.block_header) {
    throw new Error("Block header not found");
  }
  return data.block_header;
}

// API: get_block_header_by_hash
// The hash is user-supplied (from search) so it MUST be URL-encoded to avoid
// characters like # or & truncating or polluting the query string.
export async function getBlockHeaderByHash(
  hash: string,
  signal?: AbortSignal
): Promise<BlockHeader> {
  const data = await fetchJSON<{ block_header?: BlockHeader }>(
    buildUrl("get_block_header_by_hash", { hash }),
    signal
  );
  if (!data.block_header) {
    throw new Error("Block header not found");
  }
  return data.block_header;
}

// API: get_transactions
// The upstream returns either:
//   - a bare array (in-pool txs sometimes come back this way, possibly with
//     a PHP warning prefix),
//   - {"result": [...]},
//   - {"error": {...}} (handled by fetchJSON).
// Returns null when no matching transaction is found.
export async function getTransaction(
  hash: string,
  signal?: AbortSignal
): Promise<TransactionDetail | null> {
  const data = await fetchJSON<
    TransactionDetail[] | { result?: TransactionDetail[] }
  >(buildUrl("get_transactions", { "hash[]": hash }), signal);

  let arr: TransactionDetail[];
  if (Array.isArray(data)) {
    arr = data;
  } else if (
    data &&
    typeof data === "object" &&
    Array.isArray(data.result)
  ) {
    arr = data.result;
  } else {
    arr = [];
  }
  return arr.length > 0 ? arr[0] : null;
}
