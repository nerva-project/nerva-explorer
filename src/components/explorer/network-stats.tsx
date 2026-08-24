"use client";

import {
  type NetworkInfo,
  type BlockHeader,
  displayUnits,
  formatHashrate,
  decimalUnits,
  averageSolveTime,
  COIN_CONFIG,
} from "@/lib/nerva-api";
import BlockClock from "./block-clock";
import SyncProgress from "./sync-progress";

type Props = {
  networkInfo: NetworkInfo | null;
  blocks: BlockHeader[];
  generatedCoins: number;
  loading: boolean;
};

export default function NetworkStats({ networkInfo, blocks, generatedCoins, loading }: Props) {
  // No longer need a `now` ticker here — BlockClock manages its own
  // per-second timer. We only need the stat values, which come from
  // the parent via props.

  if (loading && !networkInfo) {
    return (
      <section className="py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-20 rounded-lg shimmer" style={{ background: "var(--clr-bg-surface)" }} />
        </div>
      </section>
    );
  }

  if (!networkInfo) return null;

  const lastBlock = blocks[0];
  const lastReward = lastBlock ? decimalUnits(lastBlock.reward) : 0;
  const solveTime = averageSolveTime(blocks);
  const circulating = generatedCoins;

  const stats = [
    { label: "Height", value: networkInfo.height.toLocaleString() },
    { label: "Hashrate", value: formatHashrate(networkInfo.difficulty) },
    { label: "Difficulty", value: displayUnits(networkInfo.difficulty, 2) },
    { label: "Avg Solve", value: solveTime ? `${solveTime.toFixed(1)}s` : "—" },
    { label: "TX Count", value: networkInfo.tx_count.toLocaleString() },
    { label: "Mempool", value: networkInfo.tx_pool_size.toString() },
    { label: "Supply", value: circulating > 0 ? `${circulating.toLocaleString(undefined, { maximumFractionDigits: 0 })} XNV` : "—" },
    { label: "Reward", value: `${lastReward.toFixed(4)} XNV` },
  ];

  return (
    <section id="network" className="py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Status bar: block clock + sync */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg border px-4 py-2.5"
          style={{ borderColor: "var(--clr-border)", background: "var(--clr-bg-surface)" }}>
          <BlockClock
            lastBlockTimestamp={lastBlock ? lastBlock.timestamp : null}
            tipHash={lastBlock ? lastBlock.hash : null}
            blockTarget={COIN_CONFIG.blockTarget}
          />
          <div className="hidden sm:block h-6 w-px" style={{ background: "var(--clr-border)" }} />
          <div className="flex-1 min-w-[150px]">
            <SyncProgress height={networkInfo.height} targetHeight={networkInfo.target_height} />
          </div>
        </div>

        {/* Compact stat grid - monochrome, no icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px rounded-lg overflow-hidden border"
          style={{ borderColor: "var(--clr-border)", background: "var(--clr-border)" }}>
          {stats.map((stat) => (
            <div key={stat.label} className="px-3 py-2" style={{ background: "var(--clr-bg-surface)" }}>
              <div className="text-[10px] mb-0.5" style={{ color: "var(--clr-text-subtle)" }}>
                {stat.label}
              </div>
              <div className="text-sm font-mono font-medium truncate" style={{ color: "var(--clr-text)" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
