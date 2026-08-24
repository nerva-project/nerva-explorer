# Forking the Nerva Explorer

This guide explains how to fork the Nerva Block Explorer for another Cryptonote-based coin (or a Nerva testnet fork). The codebase is designed to be mostly coin-agnostic: only the configuration file and the public assets need to change for a standard fork.

## 1. Fork and clone

1. Click **Fork** on the GitHub repository (or create a new repository from the template).
2. Clone your fork locally:

   ```bash
   git clone https://github.com/<your-org>/<your-explorer>.git
   cd <your-explorer>
   npm install
   ```

3. Rename the project in `package.json` and `README.md` to match your coin.

## 2. Point at your daemon

The explorer never calls `nervad` directly. It expects a thin HTTP proxy that translates the explorer's query-string API into the daemon's JSON-RPC interface. The default Nerva proxy lives at:

```
https://api.nerva.one/daemon/explorer/index.php
```

To point the explorer at your own proxy, set the public env var `NEXT_PUBLIC_EXPLORER_API`:

```bash
# .env or .env.local
NEXT_PUBLIC_EXPLORER_API=https://explorer.yourcoin.org/rpc.php
```

The proxy must implement the endpoints listed in the README (`get_info`, `get_block_headers_range`, `get_transaction_pool`, `get_generated_coins`, `get_block_header_by_height`, `get_block_header_by_hash`, `get_transactions`). If your proxy is written in PHP and may emit PHP warnings before the JSON body, the explorer's API client already strips anything before the first `{` or `[` so it tolerates that.

## 3. Update the coin configuration

Open `src/config/config.ts` and adjust the `coin` block:

```typescript
export const config = {
  apiEndpoint: process.env.NEXT_PUBLIC_EXPLORER_API || "https://...",
  coin: {
    name: "YOURCOIN",
    symbol: "YRC",
    unitPlaces: 12,            // atomic-to-decimal shift; 12 for Cryptonote
    blockTarget: 60,           // seconds
    updateInterval: 15000,     // ms
    tailEmissionReward: 0.3,   // FINAL_SUBSIDY_PER_MINUTE, in decimal coins per block
  },
  links: { /* your community links */ },
};
```

`unitPlaces` is the only value that has wide-reaching effects: every atomic-to-decimal conversion (block rewards, fees, supply) divides by `10^unitPlaces`. Most Cryptonote coins use 12, but a few use 11 or 9.

## 4. Swap the branding assets

Replace the files in `public/explorer/`:

| File | Purpose |
|---|---|
| `logo-color.png` | Header logo on light backgrounds (used in dark mode too) |
| `logo-dark.png` | Optional alt logo |
| `logo-white.png` | Optional alt logo |
| `favicon.ico` | Browser tab icon |

The header logo is rendered at 32x32 px; the footer logo at 36x36 px. Provide at least a 128x128 px source and let the browser scale it.

## 5. Update the theme colors (optional)

The design tokens live at the top of `src/app/globals.css` as CSS variables (`--brand-teal`, `--brand-purple`, `--clr-accent`, etc.). Adjust them to match your coin's identity. Both light and dark mode variants must be updated.

## 6. Deploying under a subpath

If you cannot host the explorer at the root of a domain (for example `https://yourcoin.org/explorer/`), set the `NEXT_PUBLIC_BASE_PATH` env var:

```bash
NEXT_PUBLIC_BASE_PATH=/explorer
```

Next.js will then prefix every internal URL and asset with `/explorer`. All `<Link>` and `next/image` references in the explorer already honor `basePath` automatically; raw `<a href="/explorer/...">` strings do not, so prefer the `Link` component or relative paths when adding new navigation.

## 7. Security headers and CSP

The Next.js config (`next.config.ts`) ships with a strict Content-Security-Policy:

```
default-src 'self';
script-src 'self' 'unsafe-inline';
connect-src 'self' https://api.nerva.one;
...
```

If you change the upstream API host, also update the `connect-src` directive so the browser-side proxy fallback is allowed to connect. (In normal operation the browser only talks to your own Next.js server via `/api/rpc`; the upstream host appears in `connect-src` as a defense-in-depth measure.)

## 8. Test, build, ship

```bash
npm run lint   # type-check and lint
npm run build  # production build
npm start      # serve the production build
```

Recommended targets:

- Vercel (zero-config, supports App Router and Edge functions)
- A Node.js host behind a reverse proxy (Caddy, Nginx, Traefik)
- Docker (build with `node:22-alpine`, expose 3000)

## 9. Keeping up with upstream

Add the original repository as an "upstream" remote and periodically rebase:

```bash
git remote add upstream https://github.com/nerva-project/nerva-explorer.git
git fetch upstream
git rebase upstream/master
```

Most upstream changes will land cleanly because all coin-specific values are isolated in `src/config/config.ts` and the public assets.
