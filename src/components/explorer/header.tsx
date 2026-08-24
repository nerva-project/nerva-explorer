"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SunIcon, MoonIcon, MenuIcon, CloseIcon, SearchIcon } from "./icons";
import { config } from "@/config/config";

const NAV_ITEMS = [
  { label: "Blocks", href: "#blocks" },
  { label: "Mempool", href: "#mempool" },
  { label: "Charts", href: "#charts" },
  { label: "Tools", href: "#tools" },
];

const EXTERNAL_LINKS = [
  { label: "Docs", href: config.links.docs },
  { label: "GitHub", href: config.links.github },
];

export default function Header({ onSearch }: { onSearch?: (q: string) => void }) {
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { obs.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) { document.documentElement.classList.add("dark"); localStorage.setItem("nerva-explorer-theme", "dark"); }
    else { document.documentElement.classList.remove("dark"); localStorage.setItem("nerva-explorer-theme", "light"); }
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q && onSearch) onSearch(q);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors`}
      style={{
        background: scrolled ? "color-mix(in srgb, var(--clr-bg) 92%, transparent)" : "var(--clr-bg)",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        borderColor: "var(--clr-border)",
      }}
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2">
          <img src="/explorer/logo-color.png" alt="Nerva" width={24} height={24} className="h-6 w-6" />
          <span className="text-sm font-semibold" style={{ color: "var(--clr-text)" }}>
            Nerva Explorer
          </span>
        </a>

        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--clr-text-subtle)" }} />
            <input
              ref={searchRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Block height, hash, or tx id..."
              className="w-full rounded border bg-transparent py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[var(--clr-accent)]"
              style={{ borderColor: "var(--clr-border)", color: "var(--clr-text)" }}
            />
          </div>
        </form>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <a key={item.label} href={item.href} className="px-2 py-1 text-[11px] rounded transition-colors hover:bg-[var(--clr-bg-hover)]" style={{ color: "var(--clr-text-muted)" }}>
              {item.label}
            </a>
          ))}
          <div className="mx-1 h-4 w-px" style={{ background: "var(--clr-border)" }} />
          {EXTERNAL_LINKS.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="px-2 py-1 text-[11px] rounded transition-colors hover:bg-[var(--clr-bg-hover)]" style={{ color: "var(--clr-text-muted)" }}>
              {link.label}
            </a>
          ))}
          <button type="button" onClick={toggleDark} className="ml-1 rounded p-1.5 transition-colors hover:bg-[var(--clr-bg-hover)]" aria-label="Toggle dark mode">
            {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <button type="button" onClick={toggleDark} className="rounded p-1.5" aria-label="Toggle dark mode">
            {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => setMobileOpen((v) => !v)} className="rounded p-1.5" aria-label="Toggle menu">
            {mobileOpen ? <CloseIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t md:hidden"
            style={{ background: "var(--clr-bg)", borderColor: "var(--clr-border)" }}
          >
            <div className="px-4 py-3 space-y-2">
              <form onSubmit={submitSearch}>
                <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search..." className="w-full rounded border bg-transparent px-3 py-1.5 text-xs outline-none" style={{ borderColor: "var(--clr-border)", color: "var(--clr-text)" }} />
              </form>
              <div className="grid grid-cols-2 gap-1">
                {NAV_ITEMS.map((item) => (
                  <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="rounded px-2 py-1.5 text-xs text-center" style={{ color: "var(--clr-text-muted)" }}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
