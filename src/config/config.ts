// Nerva Explorer configuration
// Single source of truth for API endpoint, coin parameters, and external links.
// Forks should override NEXT_PUBLIC_EXPLORER_API to point at their own daemon.

export const config = {
  // API endpoint - can be overridden via NEXT_PUBLIC_EXPLORER_API env var
  // When using the built-in server proxy (recommended), this is the upstream URL
  // the proxy will fetch from. The browser itself hits /api/rpc instead.
  apiEndpoint:
    process.env.NEXT_PUBLIC_EXPLORER_API ||
    "https://api.nerva.one/daemon/explorer/index.php",

  // Whether to use the server-side proxy (/api/rpc) instead of calling the
  // API directly from the browser. Set to false to call the API directly
  // (requires CORS to be open on the upstream).
  useServerProxy: process.env.NEXT_PUBLIC_DISABLE_SERVER_PROXY !== "true",

  coin: {
    name: "NERVA",
    symbol: "XNV",
    unitPlaces: 12,
    blockTarget: 60, // seconds
    updateInterval: 5000, // ms - auto-refresh interval (get_info is no-store and tiny, 5s lets the counter track the network within a few seconds)
    // Tail emission floor reward per block.
    // From FINAL_SUBSIDY_PER_MINUTE in src/cryptonote_config.h:
    // 300000000000 atomic units = 0.3 XNV per minute = 0.3 XNV per block
    // (since block target is 60s = 1 block per minute).
    // Nerva is in tail emission, so this is the base reward for every block.
    // Blocks containing transactions add the tx fees on top.
    tailEmissionReward: 0.3,
  },

  links: {
    website: "https://nerva.one",
    docs: "https://docs.nerva.one",
    github: "https://github.com/nerva-project",
    discord: "https://discord.com/invite/jsdbEns/",
    twitter: "https://twitter.com/NervaCurrency",
    reddit: "https://www.reddit.com/r/NervaCrypto/",
    nodeMap: "https://map.nerva.one/",
    miningCalculator: "https://nerva.one/nerva-mining-profitability-calculator/",
    explorer: "https://explorer.nerva.one",
  },
} as const;
