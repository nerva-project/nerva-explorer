"use client";

import { motion } from "framer-motion";
import { type TxPoolEntry, decimalUnits } from "@/lib/nerva-api";
import { ExchangeIcon } from "./icons";

type Props = {
  txPool: TxPoolEntry[];
  loading: boolean;
  onSelectTx: (hash: string) => void;
};

// Format a mempool entry's receive_time. Pool entries that have not yet been
// relayed may report receive_time === 0; show those as "Pending" rather than
// the epoch.
function formatPoolTime(receiveTime: number): string {
  if (receiveTime === 0) return "Pending";
  return new Date(receiveTime * 1000).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

// Keyboard activation helper: trigger the supplied action on Enter or Space,
// mirroring native button semantics for our <motion.tr role="button"> rows.
function rowKeyDown(
  e: React.KeyboardEvent,
  action: () => void
): void {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    action();
  }
}

export default function MempoolTable({ txPool, loading, onSelectTx }: Props) {
  return (
    <section id="mempool" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight" style={{ color: "var(--clr-text)" }}>
            <ExchangeIcon className="h-6 w-6" style={{ color: "var(--clr-accent)" }} />
            Transaction <span className="gradient-text">Mempool</span>
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--clr-text-muted)" }}>
            {txPool.length} unconfirmed transaction{txPool.length !== 1 ? "s" : ""} waiting to be included in a block
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            borderColor: "var(--clr-border)",
            background: "var(--clr-bg-surface)",
          }}
        >
          {txPool.length === 0 ? (
            <div className="py-16 text-center">
              <ExchangeIcon
                className="mx-auto h-12 w-12 mb-3"
                style={{ color: "var(--clr-text-subtle)" }}
              />
              <p className="font-semibold" style={{ color: "var(--clr-text)" }}>
                Mempool is empty
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--clr-text-muted)" }}>
                No pending transactions. Network is calm.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "var(--clr-bg-secondary)" }}>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>Tx Hash</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>Fee</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && txPool.length === 0
                      ? [...Array(3)].map((_, i) => (
                          <tr key={i}>
                            <td colSpan={4} className="h-14 shimmer" />
                          </tr>
                        ))
                      : txPool.map((tx, i) => {
                          const time = formatPoolTime(tx.receive_time);
                          return (
                            <motion.tr
                              key={tx.id_hash}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: Math.min(i * 0.05, 0.5) }}
                              className="tx-row border-t"
                              style={{ borderColor: "var(--clr-border-light)" }}
                              onClick={() => onSelectTx(tx.id_hash)}
                              onKeyDown={(e) => rowKeyDown(e, () => onSelectTx(tx.id_hash))}
                              tabIndex={0}
                              role="button"
                              aria-label={`View transaction ${tx.id_hash}`}
                            >
                              <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--clr-text)" }}>
                                {time}
                              </td>
                              <td className="px-4 py-3">
                                <span className="hash hash-truncate" style={{ color: "var(--clr-accent)", maxWidth: 320 }}>
                                  {tx.id_hash}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap" style={{ color: "var(--clr-text)" }}>
                                {decimalUnits(tx.fee).toFixed(8)} XNV
                              </td>
                              <td className="px-4 py-3 text-right text-sm" style={{ color: "var(--clr-text-muted)" }}>
                                {tx.weight}
                              </td>
                            </motion.tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y" style={{ borderColor: "var(--clr-border-light)" }}>
                {txPool.map((tx) => {
                  const time = formatPoolTime(tx.receive_time);
                  return (
                    <button
                      key={tx.id_hash}
                      onClick={() => onSelectTx(tx.id_hash)}
                      className="block w-full p-4 text-left transition-colors hover:bg-[var(--clr-bg-hover)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
                          {time}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: "var(--clr-text)" }}>
                          {decimalUnits(tx.fee).toFixed(8)} XNV
                        </span>
                      </div>
                      <div className="mt-1 hash hash-truncate text-xs" style={{ color: "var(--clr-accent)" }}>
                        {tx.id_hash}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
