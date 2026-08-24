"use client";

import { useState } from "react";
import { type BlockHeader, formatBlockTime, formatBlockSize, decimalUnits } from "@/lib/nerva-api";

type Props = {
  blocks: BlockHeader[];
  loading: boolean;
  onSelectBlock: (block: BlockHeader) => void;
};

export default function BlocksTable({ blocks, loading, onSelectBlock }: Props) {
  const [filter, setFilter] = useState<"all" | "tx">("all");
  const filtered = filter === "tx" ? blocks.filter((b) => b.num_txes > 0) : blocks;

  return (
    <section id="blocks" className="py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium" style={{ color: "var(--clr-text)" }}>
            Recent Blocks
          </h2>
          <div className="flex gap-1 text-[10px]">
            <button type="button" onClick={() => setFilter("all")} className={`px-2 py-0.5 rounded ${filter === "all" ? "text-white" : ""}`} style={{ background: filter === "all" ? "var(--clr-accent)" : "var(--clr-bg-secondary)", color: filter === "all" ? "#fff" : "var(--clr-text-muted)" }}>All</button>
            <button type="button" onClick={() => setFilter("tx")} className={`px-2 py-0.5 rounded ${filter === "tx" ? "text-white" : ""}`} style={{ background: filter === "tx" ? "var(--clr-accent)" : "var(--clr-bg-secondary)", color: filter === "tx" ? "#fff" : "var(--clr-text-muted)" }}>With TXs</button>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--clr-border)", background: "var(--clr-bg-surface)" }}>
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--clr-bg-secondary)" }}>
                  <th className="px-3 py-1.5 text-left text-[10px] font-medium" style={{ color: "var(--clr-text-subtle)" }}>Height</th>
                  <th className="px-3 py-1.5 text-left text-[10px] font-medium" style={{ color: "var(--clr-text-subtle)" }}>Timestamp</th>
                  <th className="px-3 py-1.5 text-left text-[10px] font-medium" style={{ color: "var(--clr-text-subtle)" }}>Hash</th>
                  <th className="px-3 py-1.5 text-right text-[10px] font-medium" style={{ color: "var(--clr-text-subtle)" }}>Size</th>
                  <th className="px-3 py-1.5 text-right text-[10px] font-medium" style={{ color: "var(--clr-text-subtle)" }}>TXs</th>
                  <th className="px-3 py-1.5 text-right text-[10px] font-medium" style={{ color: "var(--clr-text-subtle)" }}>Reward</th>
                </tr>
              </thead>
              <tbody>
                {loading && blocks.length === 0
                  ? [...Array(10)].map((_, i) => (<tr key={i}><td colSpan={6} className="h-10 shimmer" /></tr>))
                  : filtered.slice(0, 50).map((block) => {
                      const time = formatBlockTime(block.timestamp);
                      return (
                        <tr
                          key={block.hash}
                          className="border-t cursor-pointer transition-colors hover:bg-[var(--clr-bg-hover)]"
                          style={{ borderColor: "var(--clr-border-light)" }}
                          onClick={() => onSelectBlock(block)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectBlock(block); } }}
                        >
                          <td className="px-3 py-1.5 text-xs font-mono" style={{ color: "var(--clr-accent)" }}>{block.height.toLocaleString()}</td>
                          <td className="px-3 py-1.5 text-[11px] whitespace-nowrap" style={{ color: "var(--clr-text-muted)" }}>{time.ago}</td>
                          <td className="px-3 py-1.5"><span className="hash hash-truncate" style={{ color: "var(--clr-text-muted)", maxWidth: 200 }}>{block.hash}</span></td>
                          <td className="px-3 py-1.5 text-right text-[11px] font-mono" style={{ color: "var(--clr-text-muted)" }}>{formatBlockSize(block.block_size)}</td>
                          <td className="px-3 py-1.5 text-right text-[11px] font-mono" style={{ color: block.num_txes > 0 ? "var(--clr-accent)" : "var(--clr-text-subtle)" }}>{block.num_txes}</td>
                          <td className="px-3 py-1.5 text-right text-[11px] font-mono" style={{ color: "var(--clr-text)" }}>{decimalUnits(block.reward).toFixed(4)}</td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y" style={{ borderColor: "var(--clr-border-light)" }}>
            {filtered.slice(0, 30).map((block) => {
              const time = formatBlockTime(block.timestamp);
              return (
                <button key={block.hash} onClick={() => onSelectBlock(block)} className="block w-full p-2.5 text-left hover:bg-[var(--clr-bg-hover)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium" style={{ color: "var(--clr-accent)" }}>#{block.height.toLocaleString()}</span>
                    <span className="text-[10px]" style={{ color: "var(--clr-text-muted)" }}>{time.ago}</span>
                  </div>
                  <div className="mt-0.5 hash hash-truncate text-[10px]" style={{ color: "var(--clr-text-subtle)" }}>{block.hash}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
