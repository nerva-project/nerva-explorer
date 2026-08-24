"use client";

import { useMemo } from "react";
import { type BlockHeader } from "@/lib/nerva-api";

type Props = {
  blocks: BlockHeader[];
};

export default function MiningHeatmap({ blocks }: Props) {
  const dayData = useMemo(() => {
    if (blocks.length === 0) return [];
    const byDay = new Map<string, { blocks: BlockHeader[]; ts: number }>();
    for (const block of blocks) {
      const d = new Date(block.timestamp * 1000);
      const key = d.toISOString().slice(0, 10);
      if (!byDay.has(key)) byDay.set(key, { blocks: [], ts: block.timestamp });
      byDay.get(key)!.blocks.push(block);
    }
    return Array.from(byDay.entries())
      .map(([date, { blocks: bs, ts }]) => ({
        date,
        ts,
        count: bs.length,
        avgDiff: bs.reduce((s, b) => s + b.difficulty, 0) / bs.length,
      }))
      .sort((a, b) => a.ts - b.ts);
  }, [blocks]);

  if (dayData.length === 0) return null;
  const maxCount = Math.max(...dayData.map((d) => d.count));

  const opacity = (count: number) => {
    const r = count / maxCount;
    if (r > 0.75) return 1;
    if (r > 0.5) return 0.7;
    if (r > 0.25) return 0.4;
    return 0.15;
  };

  return (
    <div className="rounded-lg border p-3" style={{ borderColor: "var(--clr-border)", background: "var(--clr-bg-surface)" }}>
      <div className="text-xs font-medium mb-2" style={{ color: "var(--clr-text)" }}>
        Mining Activity
      </div>
      <div className="flex flex-wrap gap-[2px]">
        {dayData.map((day) => (
          <div
            key={day.date}
            className="w-[14px] h-[14px] rounded-sm cursor-pointer transition-transform hover:scale-125"
            style={{
              background: "var(--clr-accent)",
              opacity: opacity(day.count),
            }}
            title={`${new Date(day.ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${day.count} blocks`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 text-[9px]" style={{ color: "var(--clr-text-subtle)" }}>
        <span>{dayData.length}d</span>
        <div className="flex items-center gap-1">
          <span>low</span>
          {[0.15, 0.4, 0.7, 1].map((o) => (
            <div key={o} className="w-[10px] h-[10px] rounded-sm" style={{ background: "var(--clr-accent)", opacity: o }} />
          ))}
          <span>high</span>
        </div>
      </div>
    </div>
  );
}
