"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Header from "@/components/explorer/header";
import BlockFlow from "@/components/explorer/block-flow";
import NetworkStats from "@/components/explorer/network-stats";
import BlocksTable from "@/components/explorer/blocks-table";
import MempoolTable from "@/components/explorer/mempool-table";
import MempoolVisualization from "@/components/explorer/mempool-viz";
import NetworkCharts from "@/components/explorer/network-charts";
import MiningHeatmap from "@/components/explorer/mining-heatmap";
import ToolsSection from "@/components/explorer/tools";
import Footer from "@/components/explorer/footer";
import DetailModal from "@/components/explorer/detail-modal";
import { useExplorerData } from "@/hooks/use-explorer-data";
import {
  type BlockHeader,
  type TransactionDetail,
  getBlockHeaderByHash,
  getBlockHeaderByHeight,
  getTransaction,
} from "@/lib/nerva-api";

function matchInitialPath(pathname: string): { kind: "block" | "tx"; id: string } | null {
  const blockMatch = pathname.match(/^\/block\/(.+)$/);
  if (blockMatch) return { kind: "block", id: decodeURIComponent(blockMatch[1]) };
  const txMatch = pathname.match(/^\/tx\/(.+)$/);
  if (txMatch) return { kind: "tx", id: decodeURIComponent(txMatch[1]) };
  return null;
}

export default function Home() {
  const { networkInfo, blocks, txPool, generatedCoins, loading, error } =
    useExplorerData(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockHeader | null>(null);
  const [txDetail, setTxDetail] = useState<TransactionDetail | null>(null);
  const [loadingTx, setLoadingTx] = useState(false);
  const internalNavRef = useRef(false);

  const onSelectBlock = useCallback((block: BlockHeader) => {
    setSelectedBlock(block);
    setTxDetail(null);
    setLoadingTx(false);
    setModalOpen(true);
    internalNavRef.current = true;
    history.pushState({ modal: "block", id: block.hash }, "", `/block/${block.hash}`);
  }, []);

  const onSelectTx = useCallback(async (hash: string) => {
    setSelectedBlock(null);
    setTxDetail(null);
    setLoadingTx(true);
    setModalOpen(true);
    internalNavRef.current = true;
    history.pushState({ modal: "tx", id: hash }, "", `/tx/${hash}`);
    try {
      const tx = await getTransaction(hash);
      setTxDetail(tx);
    } catch {
      setTxDetail(null);
    } finally {
      setLoadingTx(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedBlock(null);
    setTxDetail(null);
    setLoadingTx(false);
    if (internalNavRef.current) {
      internalNavRef.current = false;
      history.back();
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      internalNavRef.current = false;
      setModalOpen(false);
      setSelectedBlock(null);
      setTxDetail(null);
      setLoadingTx(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const match = matchInitialPath(window.location.pathname);
    if (!match) return;
    history.replaceState({}, "", "/");
    if (match.kind === "block") {
      const fetchFn = /^\d+$/.test(match.id)
        ? getBlockHeaderByHeight(parseInt(match.id, 10))
        : getBlockHeaderByHash(match.id);
      fetchFn
        .then((block) => onSelectBlock(block))
        .catch(() => {});
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void onSelectTx(match.id);
    }
  }, [onSelectBlock, onSelectTx]);

  const onSearch = useCallback(
    async (q: string) => {
      if (/^\d+$/.test(q)) {
        try {
          const block = await getBlockHeaderByHeight(parseInt(q, 10));
          onSelectBlock(block);
          return;
        } catch {
          // fallthrough
        }
      }
      if (/^[0-9a-fA-F]{64}$/.test(q)) {
        try {
          const block = await getBlockHeaderByHash(q);
          onSelectBlock(block);
          return;
        } catch {
          // fallthrough
        }
        try {
          await onSelectTx(q);
          return;
        } catch {
          // fallthrough
        }
      }
      try {
        await onSelectTx(q);
      } catch {
        // ignored
      }
    },
    [onSelectBlock, onSelectTx]
  );

  return (
    <div id="top" className="min-h-screen flex flex-col">
      <Header onSearch={onSearch} />

      {blocks.length > 0 && (
        <BlockFlow blocks={blocks} onSelectBlock={onSelectBlock} />
      )}

      <main className="flex-1">
        {error && (
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div
              className="rounded-lg border p-4 text-sm"
              style={{
                borderColor: "rgba(239, 68, 68, 0.3)",
                background: "rgba(239, 68, 68, 0.08)",
                color: "#ef4444",
              }}
            >
              Connection error: {error}. Retrying automatically...
            </div>
          </div>
        )}

        <NetworkStats
          networkInfo={networkInfo}
          blocks={blocks}
          generatedCoins={generatedCoins}
          loading={loading}
        />

        {/* Mempool visualization + Mining heatmap side by side */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MempoolVisualization txPool={txPool} onSelectTx={onSelectTx} networkInfo={networkInfo} />
              </div>
              <div>
                <MiningHeatmap blocks={blocks} />
              </div>
            </div>
          </div>
        </section>

        <NetworkCharts blocks={blocks} />

        <BlocksTable blocks={blocks} loading={loading} onSelectBlock={onSelectBlock} />

        <MempoolTable txPool={txPool} loading={loading} onSelectTx={onSelectTx} />

        <ToolsSection networkInfo={networkInfo} />
      </main>

      <Footer />

      <DetailModal
        open={modalOpen}
        block={selectedBlock}
        txDetail={txDetail}
        loadingTx={loadingTx}
        onClose={closeModal}
      />
    </div>
  );
}
