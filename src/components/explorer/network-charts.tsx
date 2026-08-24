"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { type BlockHeader, COIN_CONFIG, displayUnits } from "@/lib/nerva-api";
import { ChartIcon } from "./icons";

type Props = {
  blocks: BlockHeader[];
};

export default function NetworkCharts({ blocks }: Props) {
  const [chartType, setChartType] = useState<"hashrate" | "blocktime" | "difficulty">("hashrate");

  const data = useMemo(() => {
    const sorted = [...blocks].sort((a, b) => a.height - b.height);
    const result: Array<{ height: number; hashrate: number; blocktime: number; difficulty: number; reward: number }> = [];
    sorted.reduce<number | null>((prevTime, b) => {
      const hashrate = b.difficulty / COIN_CONFIG.blockTarget;
      const solveTime = prevTime !== null ? b.timestamp - prevTime : 60;
      result.push({
        height: b.height,
        hashrate: Math.round(hashrate),
        blocktime: solveTime,
        difficulty: b.difficulty,
        reward: b.reward / 1e12,
      });
      return b.timestamp;
    }, null);
    return result;
  }, [blocks]);

  if (data.length < 2) return null;

  const renderChart = () => {
    const color = chartType === "hashrate" ? "#5efc8d" : chartType === "blocktime" ? "#7d83ff" : "#55a8bf";
    const name = chartType === "hashrate" ? "Hashrate (H/s)" : chartType === "blocktime" ? "Block Time (s)" : "Difficulty";

    if (chartType === "blocktime") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-border)" />
            <XAxis dataKey="height" stroke="var(--clr-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--clr-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--clr-bg-surface)",
                border: "1px solid var(--clr-border)",
                borderRadius: "12px",
                color: "var(--clr-text)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--clr-text-muted)" }}
            />
            <Bar dataKey="blocktime" name={name} fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-border)" />
          <XAxis dataKey="height" stroke="var(--clr-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--clr-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => displayUnits(v, 1)} />
          <Tooltip
            contentStyle={{
              background: "var(--clr-bg-surface)",
              border: "1px solid var(--clr-border)",
              borderRadius: "12px",
              color: "var(--clr-text)",
              fontSize: "12px",
            }}
            labelStyle={{ color: "var(--clr-text-muted)" }}
            formatter={(value) => {
              const num =
                typeof value === "number"
                  ? value
                  : parseFloat(String(value ?? "0"));
              if (chartType === "hashrate") return [`${displayUnits(num, 2)}H/s`, name];
              return [displayUnits(num, 2), name];
            }}
          />
          <Area
            type="monotone"
            dataKey={chartType}
            name={name}
            stroke={color}
            strokeWidth={2}
            fill="url(#areaGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const tabs = [
    { key: "hashrate" as const, label: "Hashrate", color: "#5efc8d" },
    { key: "blocktime" as const, label: "Block Time", color: "#7d83ff" },
    { key: "difficulty" as const, label: "Difficulty", color: "#55a8bf" },
  ];

  return (
    <section id="charts" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight" style={{ color: "var(--clr-text)" }}>
              <ChartIcon className="h-6 w-6" style={{ color: "var(--clr-accent)" }} />
              Network <span className="gradient-text">Charts</span>
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--clr-text-muted)" }}>
              Last {data.length} blocks · Updated in real-time
            </p>
          </div>

          <div className="flex gap-1 rounded-full p-1" style={{ background: "var(--clr-bg-secondary)" }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setChartType(tab.key)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all"
                style={{
                  background: chartType === tab.key ? "var(--clr-bg-surface)" : "transparent",
                  color: chartType === tab.key ? tab.color : "var(--clr-text-muted)",
                  boxShadow: chartType === tab.key ? "var(--shadow-soft)" : "none",
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: tab.color }} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl border p-4 sm:p-6"
          style={{
            borderColor: "var(--clr-border)",
            background: "var(--clr-bg-surface)",
          }}
        >
          {renderChart()}
        </div>
      </div>
    </section>
  );
}
