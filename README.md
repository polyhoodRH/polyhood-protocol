# Polyhood

An on-chain prediction market interface on Robinhood Chain. Every question carries
its resolution rule on the page, shares redeem one-for-one against the settled
outcome, and the numbers behind the board are readable from the chain rather than
taken on trust.

[polyhood.io](https://polyhood.io) · [@polyhoodRH](https://x.com/polyhoodRH)

## What is here

| Route | What it does |
|---|---|
| `/` | The market board — featured market, hot topics, and the full grid with category filters |
| `/markets/[slug]` | A single event: probability history, resolution rule, the order book across its markets, and the order panel |
| `/leaderboard` | Realised profit, traded volume, and hit rate across settled markets |
| `/token` | $POLYHOOD — contract address, supply split, and the Hoodlock lock proof |
| `/how-it-works` | How a question becomes a price, and how a price becomes a payout |

Market prices on this build are a static seed, and the order book is not connected
yet. Connecting a wallet proves the address is yours: it approves no spending and
moves nothing.

## Running it

```bash
npm install
npm run build
npm run start        # http://localhost:3000
```

`npm run dev` works too, but the production server is what the deployed site runs.

No environment variables are required. Nothing on the site reads a secret, and the
build is green without any `.env` file present.

## Assets

Market artwork is generated, one tile per event and one per market row. Each
market names the glyph that depicts it (`glyph` in `src/lib/markets.ts`), so an
icon tells you what the market is about instead of being decorative filler:

```bash
node scripts/make-market-art.mjs   # writes public/markets/
```

Re-run it after adding or renaming a slug, or after changing a `glyph`. The
script stops and names anything missing a glyph rather than writing a blank
plate.

Subject glyphs use [Twemoji](https://github.com/jdecked/twemoji) artwork —
copyright Twitter, Inc and other contributors, licensed under
[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) — composited onto
Polyhood's own gradient plates. The SVGs are vendored under `scripts/emoji/` so
the artwork regenerates without network access. Glyphs that carry data (bar
heights for numeric ranges, direction arrows) and the lettered monograms for
teams and candidates are drawn by the script itself.

Every image is `.webp`. The mark is white, which suits a site that is dark
throughout — `favicon.webp` keeps its transparent background, and
`logo-square.webp` carries the blue plate for avatars and the apple touch icon.
`cover.webp` is the Open Graph card.

## Stack

Next.js App Router with React 19 and Tailwind v4. Wallet support is written
directly against EIP-6963 and EIP-1193 with no wallet library, so the dependency
list stays at three packages.

## Changing the contract address, ticker, or lock

Everything brand-facing lives in `src/config/brand.ts`. No component contains a
hard-coded address, symbol, or lock URL — change the value there once and the
header, token page, footer, and page metadata all follow.

```ts
token.address    // contract address; the explorer link is derived from it
token.symbol     // "$POLYHOOD" is assembled from this
lock.contract    // Hoodlock lock id; the proof URL is assembled from this
```

While `token.address` is still a placeholder, the token page says so plainly and
renders no explorer link, instead of pointing at an address that does not exist.
The same holds for the lock: without a contract id, the proof button reads as
pending rather than linking nowhere.

Network parameters live in `src/config/chain.ts`. Those values are not a design
choice — a wallet refuses to connect if the chain id or RPC does not match.

## Licence

MIT.
