/* Papan pasar Polyhood.
 *
 * Bentuk datanya mengikuti model yang lazim dipakai bursa prediksi sungguhan:
 * yang tampil sebagai satu kartu adalah sebuah **event**, dan tiap baris hasil
 * di dalamnya adalah **market** tersendiri — punya `groupItemTitle`, harga, buku order, dan **gambarnya
 * sendiri**. Itu sebabnya kartu berhasil-banyak bisa memasang foto per baris,
 * bukan cuma satu ikon di kepala kartu.
 *
 * Istilah dipertahankan apa adanya supaya mudah dicocokkan dengan model yang
 * sudah baku di bidang ini: `negRisk` (hasil saling meniadakan, jumlah peluang ≈ 100),
 * `showMarketImages` (event menampilkan gambar tiap baris), `groupItemTitle`
 * (label pendek satu market di dalam event), `bestBid`/`bestAsk`/`spread`,
 * `lastTradePrice`, `oneDayPriceChange`, `acceptingOrders`.
 *
 * Semua angka di sini seed statis: cukup untuk memperlihatkan bentuk papan,
 * bukan pembacaan pasar sungguhan. Jangan pernah menghitung angka ringkasan
 * (total pasar terbuka, volume) dari panjang array di sini — array ini sampel
 * yang dirender, bukan populasi. Angka ringkasan ditulis terpisah di
 * `boardStats`.
 */

export type Category =
  | "Politics"
  | "Crypto"
  | "Sports"
  | "Tech"
  | "Finance"
  | "Culture"
  | "Economy"
  | "Esports"
  | "Weather";

/** Satu market: selalu dua sisi, harga dalam dolar per lembar (0–1). */
export type Market = {
  slug: string;
  /** Label pendek baris ini di dalam kartu event. */
  groupItemTitle: string;
  /** Pertanyaan utuh, dipakai di halaman market. */
  question: string;
  outcomes: [string, string];
  outcomePrices: [number, number];
  bestBid: number;
  bestAsk: number;
  lastTradePrice: number;
  /** Perubahan harga sisi pertama dalam 24 jam, dalam dolar per lembar. */
  oneDayPriceChange: number;
  volume24hr: number;
  liquidity: number;
  acceptingOrders: boolean;
  closed: boolean;
  /** Gambar baris ini. Lihat catatan `glyph` di bawah. */
  glyph: string;
};

export type Team = {
  name: string;
  short: string;
  tint: string;
  score?: number;
};

/** Bagaimana kartu event digambar. Diturunkan dari isi event, bukan gaya
 *  bebas: `grouped` untuk banyak market, `binary` untuk satu market ya/tidak,
 *  `updown` untuk pasar arah harga bergulir, `game` untuk pertandingan. */
export type EventFormat = "grouped" | "binary" | "updown" | "game";

export type PolyEvent = {
  slug: string;
  title: string;
  description: string;
  category: Category;
  /** Gambar event ini. Lihat catatan `glyph` di bawah. */
  glyph: string;
  tags: string[];
  format: EventFormat;
  /** Hasil saling meniadakan; jumlah peluang seluruh baris mendekati 100%. */
  negRisk: boolean;
  /** Event memasang gambar tiap baris, bukan hanya ikon di kepala kartu. */
  showMarketImages: boolean;
  resolutionSource: string;
  endDate: string;
  volume: number;
  volume24hr: number;
  liquidity: number;
  markets: Market[];
  /** Warna dasar kartu saat gambarnya belum termuat. */
  tint: string;
  live?: boolean;
  period?: string;
  gameStartTime?: string;
  teams?: [Team, Team];
};

/* --------------------------------------------------------------------------
 * GLYPH — menentukan gambar apa yang digambar untuk tiap event dan tiap baris.
 *
 * Nilainya salah satu dari:
 *   "percent"            piktogram dari pustaka di scripts/make-market-art.mjs
 *   "mono:A"             monogram huruf, memakai warna event
 *   "mono:HAR#b4283c"    monogram dengan warna sendiri (lambang tim)
 *
 * Gambarnya harus berkaitan dengan isi pasarnya. Kotak abstrak yang tidak
 * berhubungan membuat papan terasa dibangkitkan asal-asalan — pembaca tidak
 * bisa mengenali satu pasar pun dari ikonnya.
 * ----------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
 * Ringkasan papan. Ditulis tangan — bukan turunan dari `events` di bawah.
 * ----------------------------------------------------------------------- */
export const boardStats = {
  openMarkets: 1_284,
  volume24h: 41_600_000,
  settled: 9_730,
  traders: 128_400,
} as const;

export const categories: Category[] = [
  "Politics",
  "Crypto",
  "Sports",
  "Tech",
  "Finance",
  "Culture",
  "Economy",
  "Esports",
  "Weather",
];

/** Bentuk singkat satu market ya/tidak, supaya definisi event di bawah tidak
 *  tenggelam dalam medan yang nilainya bisa diturunkan. Spread dan bid/ask
 *  dirakit dari harga: bid setengah tick di bawah, ask setengah tick di atas. */
function market(
  slug: string,
  groupItemTitle: string,
  question: string,
  price: number,
  opts: {
    drift?: number;
    volume24hr?: number;
    liquidity?: number;
    spread?: number;
    outcomes?: [string, string];
    closed?: boolean;
    glyph?: string;
  } = {},
): Market {
  const { drift = 0, volume24hr = 120_000, liquidity = 60_000, spread = 0.02 } = opts;
  const half = spread / 2;
  return {
    slug,
    groupItemTitle,
    question,
    outcomes: opts.outcomes ?? ["Yes", "No"],
    outcomePrices: [round(price), round(1 - price)],
    bestBid: round(Math.max(0.01, price - half)),
    bestAsk: round(Math.min(0.99, price + half)),
    lastTradePrice: round(price),
    oneDayPriceChange: round(drift),
    volume24hr,
    liquidity,
    acceptingOrders: !opts.closed,
    closed: Boolean(opts.closed),
    glyph: opts.glyph ?? "dot",
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export const events: PolyEvent[] = [
  {
    slug: "policy-rate-next-meeting",
    glyph: "percent",
    title: "Where does the policy rate land at the next meeting?",
    description:
      "Resolves to the target range published in the statement released at the close of the meeting. A range change of any size counts as a move.",
    category: "Economy",
    tags: ["Rates", "Macro"],
    format: "grouped",
    negRisk: true,
    showMarketImages: true,
    resolutionSource: "Statement published at the close of the meeting",
    endDate: "Sep 30, 2026",
    volume: 84_200_000,
    volume24hr: 3_100_000,
    liquidity: 1_240_000,
    tint: "#3b6fd4",
    markets: [
      market("no-change", "No change", "Does the target range stay where it is?", 0.56, { glyph: "flat", drift: 0.04, volume24hr: 1_400_000, liquidity: 520_000 }),
      market("cut-25", "Cut 25 bps", "Is the range cut by 25 basis points?", 0.39, { glyph: "down-one", drift: -0.03, volume24hr: 1_100_000, liquidity: 410_000 }),
      market("cut-50", "Cut 50 bps", "Is the range cut by 50 basis points?", 0.04, { glyph: "down-two", drift: -0.01, volume24hr: 380_000, liquidity: 190_000 }),
      market("hike", "Hike", "Is the range raised?", 0.01, { glyph: "up-one", volume24hr: 220_000, liquidity: 120_000 }),
    ],
  },
  {
    slug: "eth-five-minute-direction",
    glyph: "candles",
    title: "ETH up or down over the next five minutes?",
    description:
      "Settles on the index price at the close of the interval against the price at the open. An exact tie resolves down.",
    category: "Crypto",
    tags: ["Ether", "Rolling"],
    format: "updown",
    negRisk: false,
    showMarketImages: false,
    resolutionSource: "Index price at the close of the interval",
    endDate: "Rolling, every 5 minutes",
    volume: 12_400_000,
    volume24hr: 4_800_000,
    liquidity: 620_000,
    tint: "#6b7ddb",
    live: true,
    period: "Live",
    markets: [
      market("direction", "Up", "Does ETH close the interval above the open?", 0.53, {
        drift: 0.02,
        outcomes: ["Up", "Down"],
        volume24hr: 4_800_000,
        liquidity: 620_000,
        spread: 0.01,
      }),
    ],
  },
  {
    slug: "largest-rollup-by-tvl",
    glyph: "layers",
    title: "Which rollup ends the year with the largest TVL?",
    description:
      "Measured by bridged value on the last day of the year, using the median of three public dashboards so a single feed cannot decide the market.",
    category: "Crypto",
    tags: ["Rollups", "TVL"],
    format: "grouped",
    negRisk: true,
    showMarketImages: true,
    resolutionSource: "Median of three public TVL dashboards",
    endDate: "Dec 31, 2026",
    volume: 6_800_000,
    volume24hr: 410_000,
    liquidity: 280_000,
    tint: "#8b5cf6",
    markets: [
      market("rollup-a", "Rollup A", "Does Rollup A end the year with the largest TVL?", 0.44, { glyph: "mono:A", drift: 0.02, volume24hr: 180_000 }),
      market("rollup-b", "Rollup B", "Does Rollup B end the year with the largest TVL?", 0.31, { glyph: "mono:B", drift: -0.02, volume24hr: 120_000 }),
      market("rollup-c", "Rollup C", "Does Rollup C end the year with the largest TVL?", 0.18, { glyph: "mono:C", drift: 0.01, volume24hr: 70_000 }),
      market("field", "Someone else", "Does any other rollup end the year on top?", 0.07, { glyph: "mono:?", drift: -0.01, volume24hr: 40_000 }),
    ],
  },
  {
    slug: "harbor-city-vs-northgate",
    glyph: "football",
    title: "Harbor City vs Northgate",
    description:
      "Resolves to the team credited with the win in the official box score. A tie voids both sides and refunds at cost.",
    category: "Sports",
    tags: ["Premier Division"],
    format: "game",
    negRisk: true,
    showMarketImages: true,
    resolutionSource: "Official box score",
    endDate: "At the final whistle",
    volume: 918_000,
    volume24hr: 310_000,
    liquidity: 140_000,
    tint: "#c2410c",
    live: true,
    period: "78'",
    teams: [
      { name: "Harbor City", short: "HAR", tint: "#b4283c", score: 1 },
      { name: "Northgate", short: "NGT", tint: "#2f6bd4", score: 0 },
    ],
    markets: [
      market("harbor-city", "Harbor City", "Does Harbor City win?", 0.42, { glyph: "mono:HAR#b4283c", drift: -0.08, volume24hr: 160_000 }),
      market("northgate", "Northgate", "Does Northgate win?", 0.58, { glyph: "mono:NGT#2f6bd4", drift: 0.08, volume24hr: 150_000 }),
    ],
  },
  {
    slug: "mainnet-upgrade-on-time",
    glyph: "chip",
    title: "Does the mainnet upgrade ship before the announced date?",
    description:
      "Resolves yes when the upgrade is active on mainnet, not when a release is tagged. A testnet-only activation does not count.",
    category: "Tech",
    tags: ["Release"],
    format: "binary",
    negRisk: false,
    showMarketImages: false,
    resolutionSource: "Activation on mainnet",
    endDate: "Nov 15, 2026",
    volume: 3_100_000,
    volume24hr: 220_000,
    liquidity: 160_000,
    tint: "#0e9f6e",
    markets: [
      market("ships-on-time", "Yes", "Does the upgrade ship before the announced date?", 0.71, { drift: 0.05, volume24hr: 220_000, liquidity: 160_000 }),
    ],
  },
  {
    slug: "next-major-venue-listing",
    glyph: "tag",
    title: "Which asset gets the next major venue listing?",
    description:
      "Resolves on the first listing announcement published by the venue itself. Rumors and unconfirmed reports do not settle this market.",
    category: "Finance",
    tags: ["Listings"],
    format: "grouped",
    negRisk: true,
    showMarketImages: true,
    resolutionSource: "Announcement published by the venue",
    endDate: "Oct 31, 2026",
    volume: 2_450_000,
    volume24hr: 190_000,
    liquidity: 110_000,
    tint: "#d97706",
    markets: [
      market("asset-a", "Asset A", "Is Asset A listed first?", 0.38, { glyph: "mono:A", drift: 0.05, volume24hr: 80_000 }),
      market("asset-b", "Asset B", "Is Asset B listed first?", 0.27, { glyph: "mono:B", drift: -0.04, volume24hr: 55_000 }),
      market("asset-c", "Asset C", "Is Asset C listed first?", 0.22, { glyph: "mono:C", drift: 0.01, volume24hr: 34_000 }),
      market("asset-d", "Asset D", "Is Asset D listed first?", 0.13, { glyph: "mono:D", drift: -0.02, volume24hr: 21_000 }),
    ],
  },
  {
    slug: "riverside-vs-summit-park",
    glyph: "basketball",
    title: "Riverside vs Summit Park",
    description: "Resolves to the winner in the official box score, including overtime.",
    category: "Sports",
    tags: ["Conference play"],
    format: "game",
    negRisk: true,
    showMarketImages: true,
    resolutionSource: "Official box score",
    endDate: "At the final buzzer",
    volume: 702_000,
    volume24hr: 240_000,
    liquidity: 96_000,
    tint: "#166534",
    live: true,
    period: "Q3 · 04:12",
    teams: [
      { name: "Riverside", short: "RIV", tint: "#a16207", score: 71 },
      { name: "Summit Park", short: "SMP", tint: "#1d4ed8", score: 83 },
    ],
    markets: [
      market("riverside", "Riverside", "Does Riverside win?", 0.28, { glyph: "mono:RIV#a16207", drift: -0.12, volume24hr: 120_000 }),
      market("summit-park", "Summit Park", "Does Summit Park win?", 0.72, { glyph: "mono:SMP#1d4ed8", drift: 0.12, volume24hr: 120_000 }),
    ],
  },
  {
    slug: "named-storm-landfall",
    glyph: "storm",
    title: "Does a named storm make landfall this month?",
    description:
      "Resolves on the advisory issued by the national meteorological service. A storm that dissipates offshore does not settle this yes.",
    category: "Weather",
    tags: ["Storms"],
    format: "binary",
    negRisk: false,
    showMarketImages: false,
    resolutionSource: "Advisory from the national meteorological service",
    endDate: "End of month",
    volume: 1_240_000,
    volume24hr: 90_000,
    liquidity: 70_000,
    tint: "#0891b2",
    markets: [
      market("landfall", "Yes", "Does a named storm make landfall this month?", 0.34, { drift: -0.06, volume24hr: 90_000, liquidity: 70_000 }),
    ],
  },
  {
    slug: "top-public-benchmark",
    glyph: "trophy",
    title: "Which lab holds the top public benchmark score at quarter end?",
    description:
      "Resolves to the top entry on the named public leaderboard at the close of the quarter. Withdrawn submissions are ignored.",
    category: "Tech",
    tags: ["Benchmarks"],
    format: "grouped",
    negRisk: true,
    showMarketImages: true,
    resolutionSource: "Named public leaderboard at quarter close",
    endDate: "Dec 31, 2026",
    volume: 5_600_000,
    volume24hr: 380_000,
    liquidity: 240_000,
    tint: "#7c3aed",
    markets: [
      market("lab-a", "Lab A", "Does Lab A hold the top score?", 0.47, { glyph: "mono:A", drift: 0.03, volume24hr: 160_000 }),
      market("lab-b", "Lab B", "Does Lab B hold the top score?", 0.29, { glyph: "mono:B", drift: -0.01, volume24hr: 110_000 }),
      market("lab-c", "Lab C", "Does Lab C hold the top score?", 0.16, { glyph: "mono:C", drift: -0.02, volume24hr: 70_000 }),
      market("other-lab", "Anyone else", "Does any other lab hold the top score?", 0.08, { glyph: "mono:?", volume24hr: 40_000 }),
    ],
  },
  {
    slug: "btc-hourly-direction",
    glyph: "coin",
    title: "BTC up or down over the next hour?",
    description: "Settles on the index price at the top of the hour against the price one hour prior.",
    category: "Crypto",
    tags: ["Bitcoin", "Rolling"],
    format: "updown",
    negRisk: false,
    showMarketImages: false,
    resolutionSource: "Index price at the top of the hour",
    endDate: "Rolling, hourly",
    volume: 18_900_000,
    volume24hr: 7_400_000,
    liquidity: 890_000,
    tint: "#f59e0b",
    live: true,
    period: "Live",
    markets: [
      market("direction", "Up", "Does BTC close the hour above the open?", 0.49, {
        drift: -0.01,
        outcomes: ["Up", "Down"],
        volume24hr: 7_400_000,
        liquidity: 890_000,
        spread: 0.01,
      }),
    ],
  },
  {
    slug: "vanguard-vs-blacklight",
    glyph: "gamepad",
    title: "Vanguard vs Blacklight",
    description: "Best of three. Resolves to the roster credited with the series win by the tournament organiser.",
    category: "Esports",
    tags: ["Autumn Split"],
    format: "game",
    negRisk: true,
    showMarketImages: true,
    resolutionSource: "Result published by the tournament organiser",
    endDate: "At series end",
    volume: 293_000,
    volume24hr: 88_000,
    liquidity: 42_000,
    tint: "#be185d",
    gameStartTime: "4:00 PM",
    teams: [
      { name: "Vanguard", short: "VGD", tint: "#9333ea" },
      { name: "Blacklight", short: "BLK", tint: "#0f766e" },
    ],
    markets: [
      market("vanguard", "Vanguard", "Does Vanguard take the series?", 0.69, { glyph: "mono:VGD#9333ea", drift: 0.04, volume24hr: 45_000 }),
      market("blacklight", "Blacklight", "Does Blacklight take the series?", 0.31, { glyph: "mono:BLK#0f766e", drift: -0.04, volume24hr: 43_000 }),
    ],
  },
  {
    slug: "next-payroll-print",
    glyph: "briefcase",
    title: "How many jobs does the next payroll report add?",
    description:
      "Resolves on the first print, not on later revisions. Buckets are inclusive at the lower bound and exclusive at the upper.",
    category: "Economy",
    tags: ["Labour"],
    format: "grouped",
    negRisk: true,
    showMarketImages: true,
    resolutionSource: "First print of the payroll report",
    endDate: "Next release date",
    volume: 24_800_000,
    volume24hr: 1_450_000,
    liquidity: 640_000,
    tint: "#0369a1",
    markets: [
      market("under-75k", "Under 75k", "Does the print come in under 75k?", 0.21, { glyph: "bar-one", drift: 0.06, volume24hr: 380_000 }),
      market("75k-150k", "75k – 150k", "Does the print land between 75k and 150k?", 0.43, { glyph: "bar-two", drift: -0.02, volume24hr: 520_000 }),
      market("150k-225k", "150k – 225k", "Does the print land between 150k and 225k?", 0.26, { glyph: "bar-three", drift: -0.03, volume24hr: 340_000 }),
      market("over-225k", "Over 225k", "Does the print come in over 225k?", 0.1, { glyph: "bar-four", drift: -0.01, volume24hr: 210_000 }),
    ],
  },
  {
    slug: "team-supply-stays-locked",
    glyph: "padlock",
    title: "Does the team supply stay locked through year end?",
    description:
      "Resolves against the lock contract itself: yes if no unlock transaction clears before the final block of the year.",
    category: "Crypto",
    tags: ["Lock"],
    format: "binary",
    negRisk: false,
    showMarketImages: false,
    resolutionSource: "Lock contract on chain",
    endDate: "Dec 31, 2026",
    volume: 860_000,
    volume24hr: 64_000,
    liquidity: 52_000,
    tint: "#2f5cff",
    markets: [
      market("stays-locked", "Yes", "Does the team supply stay locked through year end?", 0.88, { drift: 0.02, volume24hr: 64_000, liquidity: 52_000 }),
    ],
  },
  {
    slug: "top-award-winner",
    glyph: "film",
    title: "Which film takes the top award?",
    description: "Resolves to the winner announced on stage. A retracted announcement resolves to the corrected winner.",
    category: "Culture",
    tags: ["Awards"],
    format: "grouped",
    negRisk: true,
    showMarketImages: true,
    resolutionSource: "Winner announced on stage",
    endDate: "Ceremony night",
    volume: 1_970_000,
    volume24hr: 140_000,
    liquidity: 88_000,
    tint: "#a21caf",
    markets: [
      market("film-a", "Film A", "Does Film A take the top award?", 0.36, { glyph: "mono:A", drift: 0.02, volume24hr: 52_000 }),
      market("film-b", "Film B", "Does Film B take the top award?", 0.33, { glyph: "mono:B", drift: 0.04, volume24hr: 48_000 }),
      market("film-c", "Film C", "Does Film C take the top award?", 0.19, { glyph: "mono:C", drift: -0.05, volume24hr: 26_000 }),
      market("field-film", "Field", "Does any other film take the top award?", 0.12, { glyph: "mono:?", drift: -0.01, volume24hr: 14_000 }),
    ],
  },
  {
    slug: "spending-bill-before-recess",
    glyph: "document",
    title: "Does the spending bill pass before recess?",
    description:
      "Resolves yes on a recorded final passage vote in both chambers before the recess begins. A procedural vote is not passage.",
    category: "Politics",
    tags: ["Legislation"],
    format: "binary",
    negRisk: false,
    showMarketImages: false,
    resolutionSource: "Recorded final passage vote in both chambers",
    endDate: "Start of recess",
    volume: 9_400_000,
    volume24hr: 720_000,
    liquidity: 310_000,
    tint: "#dc2626",
    markets: [
      market("passes", "Yes", "Does the spending bill pass before recess?", 0.62, { drift: -0.04, volume24hr: 720_000, liquidity: 310_000 }),
    ],
  },
  {
    slug: "chamber-control",
    glyph: "ballot",
    title: "Which party holds the chamber after the vote?",
    description:
      "Resolves on certified results, not on a call by any outlet. An exact split resolves to the party holding the tiebreaker.",
    category: "Politics",
    tags: ["Elections"],
    format: "grouped",
    negRisk: true,
    showMarketImages: true,
    resolutionSource: "Certified results",
    endDate: "Certification day",
    volume: 31_500_000,
    volume24hr: 2_100_000,
    liquidity: 980_000,
    tint: "#4338ca",
    markets: [
      market("party-a", "Party A", "Does Party A hold the chamber?", 0.54, { glyph: "mono:A", drift: 0.01, volume24hr: 1_050_000, liquidity: 470_000 }),
      market("party-b", "Party B", "Does Party B hold the chamber?", 0.45, { glyph: "mono:B", drift: -0.01, volume24hr: 980_000, liquidity: 460_000 }),
      market("no-majority", "No majority", "Does neither party reach a majority?", 0.01, { glyph: "split", volume24hr: 70_000, liquidity: 50_000 }),
    ],
  },
];

/* --------------------------------------------------------------------------
 * Gambar. Tiap event punya ikonnya sendiri, dan tiap market di dalam event
 * punya gambar barisnya sendiri — persis seperti model aslinya. Berkasnya
 * dibuat oleh `scripts/make-market-art.mjs` dan namanya diturunkan dari slug,
 * jadi tidak ada jalur gambar yang ditulis tangan di komponen mana pun.
 * ----------------------------------------------------------------------- */
export function eventIcon(event: PolyEvent): string {
  return `/markets/${event.slug}.webp`;
}

export function marketIcon(event: PolyEvent, m: Market): string {
  return `/markets/${event.slug}--${m.slug}.webp`;
}

/* --------------------------------------------------------------------------
 * Pemformat. Satu tempat, supaya "$84M" tidak ditulis berbeda di tiap kartu.
 * ----------------------------------------------------------------------- */
export function usd(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

/** Harga satu lembar sebagai sen. 0.56 -> "56¢". */
export function cents(price: number): string {
  return `${Math.round(price * 100)}¢`;
}

/** Harga sebagai peluang bulat. 0.56 -> 56. */
export function pct(price: number): number {
  return Math.round(price * 100);
}

/** Selisih ask dan bid, dalam sen. */
export function spread(m: Market): string {
  return `${Math.round((m.bestAsk - m.bestBid) * 100)}¢`;
}

/** Peluang utama yang dipakai kartu dan cincin: baris paling mahal. */
export function leadMarket(event: PolyEvent): Market {
  return event.markets.reduce((a, b) => (b.outcomePrices[0] > a.outcomePrices[0] ? b : a));
}

export function eventBySlug(slug: string): PolyEvent | undefined {
  return events.find((e) => e.slug === slug);
}

export function isLive(event: PolyEvent): boolean {
  return Boolean(event.live);
}

/* --------------------------------------------------------------------------
 * Topik panas & papan peringkat.
 * ----------------------------------------------------------------------- */
export const hotTopics = [
  { rank: 1, label: "Rate decision", flow: 3_000_000, slug: "policy-rate-next-meeting" },
  { rank: 2, label: "Chamber control", flow: 2_100_000, slug: "chamber-control" },
  { rank: 3, label: "Payroll print", flow: 1_450_000, slug: "next-payroll-print" },
  { rank: 4, label: "Benchmark lead", flow: 980_000, slug: "top-public-benchmark" },
  { rank: 5, label: "Supply lock", flow: 640_000, slug: "team-supply-stays-locked" },
] as const;

export const leaders = [
  { rank: 1, handle: "0x8f21…c4a9", profit: 412_800, volume: 6_240_000, hit: 64 },
  { rank: 2, handle: "0x1d70…9b32", profit: 361_400, volume: 8_910_000, hit: 58 },
  { rank: 3, handle: "0xa4c9…17ef", profit: 298_050, volume: 3_470_000, hit: 71 },
  { rank: 4, handle: "0x66b2…d081", profit: 244_900, volume: 5_020_000, hit: 55 },
  { rank: 5, handle: "0xf013…8a5c", profit: 201_330, volume: 2_880_000, hit: 67 },
  { rank: 6, handle: "0x2ea8…4f19", profit: 187_620, volume: 7_140_000, hit: 51 },
  { rank: 7, handle: "0x9c47…20bd", profit: 154_010, volume: 1_960_000, hit: 69 },
  { rank: 8, handle: "0x35de…e772", profit: 132_480, volume: 4_310_000, hit: 53 },
  { rank: 9, handle: "0xb180…6c04", profit: 118_950, volume: 2_240_000, hit: 60 },
  { rank: 10, handle: "0x7a63…af8e", profit: 96_270, volume: 1_570_000, hit: 62 },
] as const;
