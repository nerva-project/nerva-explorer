"use client";

type Props = {
  height: number;
  targetHeight: number;
};

export default function SyncProgress({ height, targetHeight }: Props) {
  if (targetHeight === 0 || height >= targetHeight) {
    return (
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#10b981" }}>
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
        </svg>
        <span className="font-medium">Synced</span>
      </div>
    );
  }

  const pct = Math.min((height / targetHeight) * 100, 100);
  const remaining = targetHeight - height;

  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] font-medium" style={{ color: "var(--clr-text-muted)" }}>
          Syncing
        </span>
        <span className="text-[10px] font-mono" style={{ color: "var(--clr-text-muted)" }}>
          {pct.toFixed(1)}% · {remaining.toLocaleString()} blocks
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--clr-bg-secondary)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "var(--clr-accent)",
          }}
        />
      </div>
    </div>
  );
}
