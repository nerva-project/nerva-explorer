"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ToolsIcon, CodeIcon, ZapIcon, CoinsIcon, DownloadIcon } from "./icons";
import { config } from "@/config/config";
import {
  COIN_CONFIG,
  type NetworkInfo,
} from "@/lib/nerva-api";

type ToolsSectionProps = {
  networkInfo?: NetworkInfo | null;
};

export default function ToolsSection({ networkInfo }: ToolsSectionProps) {
  return (
    <section id="tools" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight" style={{ color: "var(--clr-text)" }}>
            <ToolsIcon className="h-6 w-6" style={{ color: "var(--clr-accent)" }} />
            Tools &amp; <span className="gradient-text">Utilities</span>
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--clr-text-muted)" }}>
            Convert units, calculate rewards, and integrate the Nerva API in your projects.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <UnitConverter />
          <MiningCalculator networkInfo={networkInfo} />
          <ApiQuickStart />
          <UsefulLinks />
        </div>
      </div>
    </section>
  );
}

function UnitConverter() {
  const [xnv, setXnv] = useState("1");
  const [atomic, setAtomic] = useState("");

  const updateXnv = (v: string) => {
    setXnv(v);
    const num = parseFloat(v);
    if (!isNaN(num)) {
      setAtomic(String(Math.round(num * Math.pow(10, COIN_CONFIG.unitPlaces))));
    } else {
      setAtomic("");
    }
  };

  const updateAtomic = (v: string) => {
    setAtomic(v);
    const num = Number(v);
    if (!isNaN(num)) {
      setXnv(String(num / Math.pow(10, COIN_CONFIG.unitPlaces)));
    } else {
      setXnv("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border p-6"
      style={{
        borderColor: "var(--clr-border)",
        background: "var(--clr-bg-surface)",
      }}
    >
      <h3 className="flex items-center gap-2 text-base font-semibold mb-4" style={{ color: "var(--clr-text)" }}>
        <CoinsIcon className="h-5 w-5" style={{ color: "var(--clr-accent)" }} />
        Unit Converter
      </h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>
            XNV
          </label>
          <input
            type="number"
            value={xnv}
            onChange={(e) => updateXnv(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--clr-accent)]"
            style={{ borderColor: "var(--clr-border)", color: "var(--clr-text)" }}
          />
        </div>
        <div className="flex justify-center">
          <span style={{ color: "var(--clr-text-muted)" }}>↕</span>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>
            Atomic Units
          </label>
          <input
            type="number"
            value={atomic}
            onChange={(e) => updateAtomic(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--clr-accent)]"
            style={{ borderColor: "var(--clr-border)", color: "var(--clr-text)" }}
          />
        </div>
        <p className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
          1 XNV = 10<sup>{COIN_CONFIG.unitPlaces}</sup> atomic units (piconero)
        </p>
      </div>
    </motion.div>
  );
}

type MiningCalculatorProps = {
  networkInfo?: NetworkInfo | null;
};

function MiningCalculator({ networkInfo }: MiningCalculatorProps) {
  // Default to the live network difficulty when available; fall back to a
  // reasonable constant otherwise. The user can override the value manually
  // in the input below.
  const defaultDifficulty =
    networkInfo?.difficulty !== undefined && networkInfo.difficulty > 0
      ? String(networkInfo.difficulty)
      : "2587340";

  const [hashrate, setHashrate] = useState("1000");
  const [difficulty, setDifficulty] = useState(defaultDifficulty);

  const calc = () => {
    const h = parseFloat(hashrate) || 0;
    const d = parseFloat(difficulty) || 0;
    if (h <= 0 || d <= 0) return null;
    // Expected time to find a block (seconds) = difficulty / hashrate
    const expectedTime = d / h;
    // Expected XNV per day = (86400 / expectedTime) * block_reward
    const blocksPerDay = 86400 / expectedTime;
    // Tail emission reward per block, sourced from config so forks can override.
    const reward = config.coin.tailEmissionReward;
    return {
      expectedTime,
      blocksPerDay,
      xnvPerDay: blocksPerDay * reward,
      xnvPerWeek: blocksPerDay * reward * 7,
      xnvPerMonth: blocksPerDay * reward * 30,
    };
  };

  const result = calc();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.05 }}
      className="rounded-2xl border p-6"
      style={{
        borderColor: "var(--clr-border)",
        background: "var(--clr-bg-surface)",
      }}
    >
      <h3 className="flex items-center gap-2 text-base font-semibold mb-4" style={{ color: "var(--clr-text)" }}>
        <ZapIcon className="h-5 w-5" style={{ color: "#10b981" }} />
        Mining Calculator
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>
            Your Hashrate (H/s)
          </label>
          <input
            type="number"
            value={hashrate}
            onChange={(e) => setHashrate(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--clr-accent)]"
            style={{ borderColor: "var(--clr-border)", color: "var(--clr-text)" }}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>
            Network Difficulty
          </label>
          <input
            type="number"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--clr-accent)]"
            style={{ borderColor: "var(--clr-border)", color: "var(--clr-text)" }}
          />
        </div>
      </div>

      {result && (
        <div className="mt-4 space-y-2 rounded-lg p-3" style={{ background: "var(--clr-bg-secondary)" }}>
          <Stat label="Expected time per block" value={`${result.expectedTime > 86400 ? (result.expectedTime / 86400).toFixed(1) + " days" : result.expectedTime > 3600 ? (result.expectedTime / 3600).toFixed(1) + " hours" : result.expectedTime.toFixed(0) + " sec"}`} />
          <Stat label="Blocks per day" value={result.blocksPerDay.toFixed(4)} />
          <Stat label="XNV per day" value={`${result.xnvPerDay.toFixed(4)} XNV`} highlight />
          <Stat label="XNV per week" value={`${result.xnvPerWeek.toFixed(2)} XNV`} />
          <Stat label="XNV per month" value={`${result.xnvPerMonth.toFixed(2)} XNV`} />
        </div>
      )}
    </motion.div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: "var(--clr-text-muted)" }}>{label}</span>
      <span className="font-semibold" style={{ color: highlight ? "#10b981" : "var(--clr-text)" }}>
        {value}
      </span>
    </div>
  );
}

function ApiQuickStart() {
  const [copied, setCopied] = useState(false);
  const code = `// Fetch latest Nerva network info
const res = await fetch(
  '${config.apiEndpoint}?endpoint=get_info'
);
const data = await res.json();
console.log('Height:', data.height);
console.log('Difficulty:', data.difficulty);`;

  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border p-6"
      style={{
        borderColor: "var(--clr-border)",
        background: "var(--clr-bg-surface)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-base font-semibold" style={{ color: "var(--clr-text)" }}>
          <CodeIcon className="h-5 w-5" style={{ color: "var(--brand-indigo)" }} />
          API Quick Start
        </h3>
        <button
          type="button"
          onClick={copy}
          className="rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[var(--clr-bg-hover)]"
          style={{ color: "var(--clr-accent)" }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="overflow-x-auto rounded-lg p-3 text-xs"
        style={{
          background: "var(--clr-bg-secondary)",
          color: "var(--clr-text)",
          fontFamily: "var(--font-mono), monospace",
        }}
      >
        <code>{code}</code>
      </pre>
      <a
        href={`${config.apiEndpoint}?endpoint=get_info`}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--clr-accent)" }}
      >
        Try the API →
      </a>
    </motion.div>
  );
}

function UsefulLinks() {
  const links = [
    { label: "Nerva Website", href: config.links.website, icon: "🌐" },
    { label: "Documentation", href: config.links.docs, icon: "📚" },
    { label: "GitHub Repository", href: config.links.github, icon: "🐙" },
    { label: "Discord Community", href: config.links.discord, icon: "💬" },
    { label: "Mining Calculator", href: config.links.miningCalculator, icon: "⛏️" },
    { label: "Node Map", href: config.links.nodeMap, icon: "🗺️" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border p-6"
      style={{
        borderColor: "var(--clr-border)",
        background: "var(--clr-bg-surface)",
      }}
    >
      <h3 className="flex items-center gap-2 text-base font-semibold mb-4" style={{ color: "var(--clr-text)" }}>
        <DownloadIcon className="h-5 w-5" style={{ color: "#f59e0b" }} />
        Useful Links
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-[var(--clr-bg-hover)]"
            style={{
              borderColor: "var(--clr-border-light)",
              color: "var(--clr-text)",
            }}
          >
            <span className="text-base">{link.icon}</span>
            <span className="flex-1">{link.label}</span>
            <span aria-hidden="true" style={{ color: "var(--clr-text-muted)" }}>→</span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
