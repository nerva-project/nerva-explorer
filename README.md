# Nerva Block Explorer

A modern block explorer for the [Nerva (XNV)](https://nerva.one) cryptocurrency, a privacy-focused and CPU-minable coin built on Cryptonote technology.

![Nerva Explorer](public/explorer/logo-color.png)

## Overview

This repository contains a complete rewrite of the Nerva block explorer. The original implementation was built with Vue.js and Vuetify; this version uses Next.js 16, TypeScript, and Tailwind CSS to deliver a faster, more maintainable, and visually consistent experience across desktop and mobile devices.

The explorer consumes the official Nerva RPC proxy at `https://api.nerva.one/daemon/explorer/index.php` and refreshes network data every 15 seconds.

## Features

### Network statistics

Eight live cards displayed at the top of the page:

- Network height (with a live indicator when the last block was mined less than 90 seconds ago)
- Current hashrate and difficulty
- Average solve time compared to the 60-second target
- Total transaction count and mempool size
- Circulating supply with emission percentage
- Current block reward
- Network type and consensus version
- On-disk database size

### Charts

Three switchable visualizations of the last 60 blocks, built with Recharts:

- Hashrate (area chart)
- Block time (bar chart)
- Difficulty (area chart)

### Recent blocks

A table of the 60 most recent blocks, showing height, timestamp, hash, size, transaction count, and reward. A toggle filters between all blocks and blocks containing transactions.

### Transaction mempool

A list of pending transactions waiting to be included in a block, with timestamp, hash, fee, and weight. An empty-state message is displayed when the mempool contains no transactions.

### Detail modal

Clicking a block or transaction opens a modal with the full set of fields returned by the API. Every field with a copyable value has a copy-to-clipboard button. The modal can be closed with the Escape key or by clicking the backdrop.

### Smart search

The search bar in the header accepts three input types:

- A numeric block height
- A 64-character block hash
- A transaction hash

The explorer detects the input type automatically and opens the corresponding detail modal.

### Tools

The tools section contains four utilities:

- **Unit converter** between XNV and atomic units (10^12 piconero)
- **Mining calculator** estimating expected time per block, blocks per day, and XNV rewards per day, week, and month based on a user-supplied hashrate and the current network difficulty
- **API quick start** with a copy-pasteable JavaScript snippet
- **Useful links** to the website, documentation, GitHub, Discord, mining calculator, and node map

### Theme

Light and dark modes are both supported. The preference is persisted in `localStorage` under the key `nerva-explorer-theme`. On the first visit, the explorer follows the operating system preference.

## Technology stack

- **Framework**: [Next.js 16](https://nextjs.org/) with the App Router and TypeScript 5
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with CSS variables for theming
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Fonts**: Rubik (sans-serif) and JetBrains Mono (hashes and code)
- **API**: Nerva RPC proxy at `https://api.nerva.one/daemon/explorer/index.php`

## Getting started

### Prerequisites

- Node.js 18.18 or newer (or [Bun](https://bun.sh/) 1.0 or newer)
- A package manager: `npm`, `yarn`, `pnpm`, or `bun`

### Installation

```bash
git clone https://github.com/XelisVault/nerva-explorer.git
cd nerva-explorer
npm install
```

### Development server

```bash
npm run dev
```

The explorer is then available at [http://localhost:3000](http://localhost:3000). The page reloads automatically when source files change.

### Production build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Project structure

```
nerva-explorer/
├── public/
│   └── explorer/                # Nerva logos and favicon
├── src/
│   ├── app/
│   │   ├── globals.css          # Design system and Tailwind theme
│   │   ├── layout.tsx           # Root layout (fonts, dark mode script)
│   │   └── page.tsx             # Main page assembling all sections
│   ├── components/
│   │   └── explorer/
│   │       ├── header.tsx           # Sticky header with search, navigation, and theme toggle
│   │       ├── network-stats.tsx     # Eight live stat cards
│   │       ├── network-charts.tsx    # Hashrate, block time, and difficulty charts
│   │       ├── blocks-table.tsx      # Recent blocks table (desktop and mobile)
│   │       ├── mempool-table.tsx     # Transaction mempool
│   │       ├── detail-modal.tsx      # Modal for block and transaction details
│   │       ├── tools.tsx             # Converter, calculator, API snippet, links
│   │       ├── footer.tsx            # Footer with link columns
│   │       └── icons.tsx             # Custom SVG icon set
│   ├── hooks/
│   │   └── use-explorer-data.ts     # React hook polling the API every 15 seconds
│   └── lib/
│       ├── nerva-api.ts             # Nerva RPC client and helpers
│       └── utils.ts                 # Tailwind class merge utility
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## API reference

The explorer consumes the official Nerva RPC proxy at:

```
https://api.nerva.one/daemon/explorer/index.php
```

### Endpoints used

| Endpoint | Description |
|---|---|
| `?endpoint=get_info` | Network info: height, difficulty, transaction count, and more |
| `?endpoint=get_block_headers_range&start=N&end=M` | Block headers between two heights |
| `?endpoint=get_transaction_pool` | Pending transactions in the mempool |
| `?endpoint=get_generated_coins&height=N` | Total emitted coins at a given height |
| `?endpoint=get_block_header_by_height&height=N` | Single block header by height |
| `?endpoint=get_block_header_by_hash&hash=H` | Single block header by hash |
| `?endpoint=get_transactions&hash[]=H` | Transaction details by hash |

### Implementation notes

A few quirks of the upstream API required specific handling in the client:

- `get_block_headers_range` rejects ranges where `end` is greater than or equal to the current height. The hook uses `end = height - 1`.
- `get_generated_coins` returns a plain number rather than a JSON object. It is parsed with `parseFloat` on the raw response text.
- The value returned by `get_generated_coins` is already expressed in XNV. By contrast, `block.reward` is in atomic units and must be divided by 10^12 to obtain XNV.

## Design tokens

The palette is inspired by the original Nerva hero gradient (teal to purple).

| Token | Light | Dark |
|---|---|---|
| Background | `#f8fafc` | `#0a0814` |
| Surface | `#ffffff` | `#1a1633` |
| Text | `#1e293b` | `#e6e3f5` |
| Accent | `#635891` | `#b9a5ff` |
| Brand teal | `#55a8bf` | `#5fc4dc` |
| Brand purple | `#635891` | `#9d8fd6` |

## Contributing

Pull requests are welcome. For changes that affect the public interface or the API client behaviour, please open an issue first to discuss the proposal.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes using a clear message
4. Push to the branch: `git push origin feat/my-feature`
5. Open a pull request

Please run `npm run lint` before submitting.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Credits

- Original Vue implementation: [nerva-project/nerva-explorer](https://github.com/nerva-project/nerva-explorer)
- Nerva project: [nerva.one](https://nerva.one) and [docs.nerva.one](https://docs.nerva.one)
- Built with [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), and [Recharts](https://recharts.org/)

## Links

- Website: https://nerva.one
- Documentation: https://docs.nerva.one
- GitHub: https://github.com/nerva-project
- Discord: https://discord.com/invite/jsdbEns/
- Twitter: https://twitter.com/NervaCurrency
- Node map: https://map.nerva.one/
- Mining calculator: https://nerva.one/nerva-mining-profitability-calculator/
