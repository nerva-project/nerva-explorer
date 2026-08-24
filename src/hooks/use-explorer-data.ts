"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getInfo,
  getBlockHeaders,
  getTxPool,
  getGeneratedCoins,
  type NetworkInfo,
  type BlockHeader,
  type TxPoolEntry,
  COIN_CONFIG,
} from "@/lib/nerva-api";

export type ExplorerData = {
  networkInfo: NetworkInfo | null;
  blocks: BlockHeader[];
  txPool: TxPoolEntry[];
  generatedCoins: number;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
};

const BLOCK_FETCH_COUNT = 60;
const CYCLE_TIMEOUT_MS = 10_000;

export function useExplorerData(autoRefresh = true): ExplorerData {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [blocks, setBlocks] = useState<BlockHeader[]>([]);
  const [txPool, setTxPool] = useState<TxPoolEntry[]>([]);
  const [generatedCoins, setGeneratedCoins] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const mountedRef = useRef(true);
  // Guard against overlapping fetch cycles (e.g. when the upstream is slow).
  const inFlightRef = useRef(false);
  // Tag each cycle so stale responses from an aborted cycle are discarded.
  const cycleRef = useRef(0);
  // Track previous values to skip redundant refetches.
  const prevHeightRef = useRef<number | null>(null);
  const prevPoolSizeRef = useRef<number | null>(null);

  const fetchAll = useCallback(async () => {
    // In-flight guard: skip if a previous cycle is still running.
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    // Increment cycle tag. Any response carrying an older tag is stale.
    const cycle = ++cycleRef.current;

    // Each cycle gets its own AbortController with a hard timeout so a
    // hung upstream can't pin the refresh loop forever.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CYCLE_TIMEOUT_MS);

    try {
      setError(null);
      const info = await getInfo(controller.signal);
      if (!mountedRef.current || cycle !== cycleRef.current) return;

      setNetworkInfo(info);

      // Build the block range to fetch.
      // The Nerva API rejects ranges where end >= current height, so use
      // height - 1.
      const endHeight = info.height - 1;
      const startHeight = Math.max(0, endHeight - BLOCK_FETCH_COUNT + 1);

      // Conditional refetch: only fetch block headers if the height changed
      // since the last successful cycle. This avoids hammering the upstream
      // when no new block has been mined.
      const heightChanged =
        prevHeightRef.current === null ||
        info.height !== prevHeightRef.current;

      // Conditional refetch: only fetch the tx pool if its size changed.
      const poolChanged =
        prevPoolSizeRef.current === null ||
        info.tx_pool_size !== prevPoolSizeRef.current;

      const [headers, pool] = await Promise.all([
        heightChanged
          ? getBlockHeaders(startHeight, endHeight, controller.signal)
          : Promise.resolve(null),
        poolChanged
          ? getTxPool(controller.signal)
          : Promise.resolve(null),
      ]);
      if (!mountedRef.current || cycle !== cycleRef.current) return;

      if (headers !== null) {
        // Sort newest first.
        const sortedBlocks = headers.sort((a, b) => b.height - a.height);
        setBlocks(sortedBlocks);
        prevHeightRef.current = info.height;
      }

      if (pool !== null) {
        setTxPool(pool);
        prevPoolSizeRef.current = info.tx_pool_size;
      }

      // Generated coins only changes when height changes.
      if (heightChanged) {
        try {
          const coins = await getGeneratedCoins(endHeight, controller.signal);
          if (mountedRef.current && cycle === cycleRef.current) {
            setGeneratedCoins(coins);
          }
        } catch {
          // Not critical - keep previous value.
        }
      }

      setLastUpdated(Date.now());
    } catch (e) {
      if (mountedRef.current && cycle === cycleRef.current) {
        // Suppress error message for aborts (they're usually just the user
        // navigating away or a stale cycle being superseded).
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Failed to fetch data");
      }
    } finally {
      clearTimeout(timeout);
      inFlightRef.current = false;
      if (mountedRef.current && cycle === cycleRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Pause auto-refresh when the tab is hidden; resume immediately on
    // visibilitychange back to visible.
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        // Resume: kick a fresh cycle right away.
        fetchAll();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Initial fetch.
    if (document.visibilityState !== "hidden") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAll();
    }

    let interval: ReturnType<typeof setInterval> | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        // Skip cycles while the tab is hidden; the visibilitychange handler
        // above will fire a fresh fetch as soon as the user returns.
        if (document.visibilityState === "hidden") return;
        fetchAll();
      }, COIN_CONFIG.updateInterval);
    }

    return () => {
      mountedRef.current = false;
      document.removeEventListener("visibilitychange", onVisibility);
      if (interval) clearInterval(interval);
    };
  }, [fetchAll, autoRefresh]);

  return {
    networkInfo,
    blocks,
    txPool,
    generatedCoins,
    loading,
    error,
    lastUpdated,
    refresh: fetchAll,
  };
}
