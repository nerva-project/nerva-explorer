"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Miner-set timestamp of the current tip block (seconds). Used only as a seed on first load. */
  lastBlockTimestamp: number | null;
  /** Hash (or unique id) of the current tip block. Used to detect tip changes. */
  tipHash: string | null;
  blockTarget: number;
};

/**
 * Block clock using arrival-time counting.
 *
 * Why: Nerva block timestamps are miner-set and only loosely constrained
 * (roughly a 2-hour future tolerance). When a fresh block's timestamp is
 * ahead of the viewer's clock, the subtraction goes negative; when it is
 * behind, the counter looks like it never resets.
 *
 * Fix: stop measuring from the miner timestamp and measure from the moment
 * the client first observes a new tip. It is monotonic, never negative, and
 * always starts near 0.
 *
 * We seed the first value on page load from the clamped miner timestamp
 * (Math.max(0, now - blocks[0].timestamp)) since the current tip was mined
 * before the page opened. We switch to arrival-time for every tip detected
 * while the page stays open.
 */
export default function BlockClock({ lastBlockTimestamp, tipHash, blockTarget }: Props) {
  // elapsed in seconds since the client first observed the current tip
  const [elapsed, setElapsed] = useState(0);
  // arrival stamp (seconds) of the current tip; null until we see one
  const arrivalStampRef = useRef<number | null>(null);
  // last tip hash we observed, to detect changes
  const lastTipRef = useRef<string | null>(null);

  useEffect(() => {
    if (!tipHash) return;

    // Detect tip change: when tipHash differs from the last one we saw,
    // stamp the arrival time to "now".
    if (tipHash !== lastTipRef.current) {
      lastTipRef.current = tipHash;
      if (arrivalStampRef.current === null) {
        // First observation on this page load: seed from the clamped miner
        // timestamp so we don't start at 0 if the block was mined a while ago.
        const now = Math.floor(Date.now() / 1000);
        const seed = lastBlockTimestamp
          ? Math.max(0, now - lastBlockTimestamp)
          : 0;
        arrivalStampRef.current = now - seed;
      } else {
        // New tip detected while the page stayed open: reset to "just arrived".
        arrivalStampRef.current = Math.floor(Date.now() / 1000);
      }
    }

    const update = () => {
      if (arrivalStampRef.current === null) return;
      const value = Math.max(0, Math.floor(Date.now() / 1000) - arrivalStampRef.current);
      setElapsed(value);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [tipHash, lastBlockTimestamp]);

  if (!tipHash) return null;

  // Clamp progress to [0, 1] so the ring never breaks on negative elapsed.
  const progress = Math.max(0, Math.min(elapsed / blockTarget, 1));
  const isOverdue = elapsed > blockTarget;

  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-8 h-8 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke="var(--clr-border)"
            strokeWidth="2.5"
          />
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke={isOverdue ? "#f59e0b" : "var(--clr-accent)"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.3s" }}
          />
        </svg>
      </div>
      <div>
        <div className="text-sm font-mono font-medium" style={{ color: "var(--clr-text)" }}>
          {elapsed}s
        </div>
        <div className="text-[10px]" style={{ color: "var(--clr-text-subtle)" }}>
          since last block
        </div>
      </div>
    </div>
  );
}
