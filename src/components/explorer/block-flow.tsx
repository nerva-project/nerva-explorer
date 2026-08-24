"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type BlockHeader, formatBlockTime } from "@/lib/nerva-api";

type Props = {
  blocks: BlockHeader[];
  onSelectBlock: (block: BlockHeader) => void;
};

export default function BlockFlow({ blocks, onSelectBlock }: Props) {
  const visibleBlocks = blocks.slice(0, 20);

  return (
    <div className="border-b overflow-hidden" style={{ borderColor: "var(--clr-border)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-2">
          <div className="flex items-center gap-1.5 flex-shrink-0 pr-2 border-r" style={{ borderColor: "var(--clr-border)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
              LIVE
            </span>
          </div>

          <div className="flex gap-1 overflow-hidden flex-1">
            <AnimatePresence initial={false}>
              {visibleBlocks.map((block) => {
                const hasTxs = block.num_txes > 0;
                return (
                  <motion.button
                    key={block.hash}
                    layout
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    onClick={() => onSelectBlock(block)}
                    className="flex-shrink-0 px-2 py-1 rounded text-[11px] font-mono transition-colors hover:bg-[var(--clr-bg-hover)] cursor-pointer"
                    style={{
                      color: hasTxs ? "var(--clr-accent)" : "var(--clr-text-muted)",
                      background: hasTxs ? "var(--clr-bg-secondary)" : "transparent",
                    }}
                    title={`Block #${block.height} — ${formatBlockTime(block.timestamp).abs}${hasTxs ? ` · ${block.num_txes} tx` : ""}`}
                  >
                    {block.height.toLocaleString()}
                    {hasTxs && (
                      <span
                        className="ml-1.5 inline-flex items-center px-1 py-0.5 rounded text-[8px] font-semibold leading-none"
                        style={{
                          background: "var(--clr-accent)",
                          color: "var(--clr-bg-surface)",
                        }}
                        aria-label={`${block.num_txes} transaction${block.num_txes > 1 ? "s" : ""} in this block`}
                      >
                        {block.num_txes} tx
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
