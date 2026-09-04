/* ============================================================================
 * SATU-SATUNYA TEMPAT UNTUK MENGGANTI CA, TICKER, DAN TAUTAN LOCK.
 *
 * Tidak ada alamat kontrak, simbol token, atau tautan lock yang ditulis
 * langsung di komponen mana pun. Semuanya dibaca dari berkas ini, jadi cukup
 * ubah di sini sekali dan seluruh situs — header, papan pasar, halaman token,
 * footer, metadata Open Graph — ikut berubah.
 *
 *   token.address   -> alamat kontrak (CA)
 *   token.symbol    -> simbol token; "$POLYHOOD" dirakit sendiri dari sini
 *   lock.contract   -> id kontrak lock di Hoodlock (URL-nya dirakit sendiri)
 *
 * Sisanya (nama, domain, X, repo) juga di berkas ini.
 * ========================================================================== */

export const brand = {
  name: "Polyhood",
  wordmark: "POLYHOOD",
  domain: "polyhood.io",
  url: "https://polyhood.io",
  tagline: "Trade the outcome, not the opinion.",
  description:
    "Polyhood is an on-chain prediction market on Robinhood Chain. Every question resolves to a settled price, every share is redeemable one-for-one, and the whole book stays readable from the chain.",
} as const;

/* ---------------------------------------------------------------------------
 * TOKEN — ganti `address` saat CA asli sudah ada.
 * `ticker`, bentuk pendek CA, dan tautan explorer semuanya diturunkan dari sini.
 * ------------------------------------------------------------------------- */
export const token = {
  name: "Polyhood",
  symbol: "POLYHOOD",
  chain: "Robinhood Chain",
  decimals: 18,

  // Pajak transaksi, dalam persen. Ditulis di sini supaya angkanya cuma ada
  // di satu tempat kalau nanti berubah.
  buyTax: 1,
  sellTax: 1,

  // <<< CA DI SINI >>>
  address: "0xxxxxxxxxxxxxxxxxxxxxxxxxxx",

  // Basis explorer Robinhood Chain (Blockscout). Kalau dikosongkan, CA tampil
  // sebagai teks yang bisa disalin saja, tanpa tautan yang menuju entah ke mana.
  explorerBase: "https://robinhoodchain.blockscout.com/address/",

  get ticker() {
    return `$${this.symbol}`;
  },
  /** "1% / 1%" — dirakit dari buyTax dan sellTax. */
  get taxLabel() {
    return `${this.buyTax}% / ${this.sellTax}%`;
  },
  /** CA yang dipendekkan untuk tampilan sempit: 0x1234…abcd */
  get shortAddress() {
    const a = this.address;
    return a.length > 14 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
  },
  /** true selama CA masih placeholder — UI menyebut "belum dipublikasikan"
   *  alih-alih menautkan alamat yang bukan alamat. */
  get isPlaceholder() {
    return !/^0x[0-9a-fA-F]{40}$/.test(this.address);
  },
  /** null selama CA masih placeholder, supaya tidak ada tautan mati. */
  get explorerUrl(): string | null {
    if (this.isPlaceholder || !this.explorerBase) return null;
    return `${this.explorerBase}${this.address}`;
  },
} as const;

/* ---------------------------------------------------------------------------
 * LOCK — project di Robinhood Chain memakai Hoodlock, bukan Streamflow.
 * Isi `contract` dengan id kontrak lock; URL penuhnya dirakit otomatis.
 * ------------------------------------------------------------------------- */
export const lock = {
  provider: "Hoodlock",
  site: "https://hoodlock.tech/",
  base: "https://hoodlock.tech/proof/lock/",

  // <<< ID KONTRAK LOCK DI SINI >>>
  contract: "",

  get url(): string | null {
    return this.contract ? `${this.base}${this.contract}` : null;
  },
  /** false selama `contract` masih kosong — tombol lock ikut menyesuaikan. */
  get isSet() {
    return this.contract.length > 0;
  },
} as const;

export const links = {
  x: "https://x.com/polyhoodRH",
  github: "https://github.com/polyhoodRH/polyhood-protocol",
  docs: "/how-it-works",
} as const;

export const nav = [
  { label: "Markets", href: "/" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Token", href: "/token" },
  { label: "How it works", href: "/how-it-works" },
] as const;
