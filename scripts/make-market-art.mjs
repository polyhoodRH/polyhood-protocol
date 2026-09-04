/* Membuat gambar untuk tiap event dan tiap baris market di papan.
 *
 * Gambarnya HARUS berkaitan dengan isi pasarnya. Papan pasar prediksi dibaca
 * dengan mata: ikon yang tidak berhubungan membuat seluruh papan terasa
 * dibangkitkan asal-asalan, karena tidak ada satu pasar pun yang bisa dikenali
 * dari gambarnya. Karena itu tiap event dan tiap market menyebut `glyph`-nya
 * sendiri di src/lib/markets.ts, bukan bentuk yang diundi dari hash slug.
 *
 * Gambarnya digambar di sini — milik Polyhood sendiri — bukan diambil dari
 * bursa lain: gambar di sana foto pihak ketiga (potret orang, foto berita,
 * lambang klub, bendera negara) yang bukan hak kita untuk ditayangkan ulang.
 *
 *   node scripts/make-market-art.mjs
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const SRC = "src/lib/markets.ts";
const OUT = "public/markets";

/* ==========================================================================
 * GAMBAR PASAR
 *
 * Sebagian besar glyph memakai artwork Twemoji (CC-BY 4.0) yang di-vendor ke
 * scripts/emoji/ — berwarna, langsung dikenali, dan lisensinya memang
 * mengizinkan pemakaian ulang selama disebutkan. Atribusinya ada di README.
 *
 * Yang tidak diambil dari sana adalah bentuk yang memuat data: batang tinggi
 * bertingkat untuk rentang angka, dan monogram huruf untuk tim serta kandidat.
 * Keduanya harus mengikuti isi barisnya, jadi tidak ada emoji yang cocok.
 * ======================================================================== */
const EMOJI = {
  percent: "1f3e6",    // bank — keputusan suku bunga
  candles: "1f4c8",    // grafik naik — arah harga
  coin: "1fa99",       // koin — aset kripto
  layers: "1f9f1",     // bata — lapisan rollup
  chip: "1f680",       // roket — rilis mainnet
  tag: "1f3f7",        // label — pencatatan di bursa
  football: "26bd",
  basketball: "1f3c0",
  gamepad: "1f3ae",    // esports
  storm: "1f300",      // siklon
  trophy: "1f3c6",     // papan peringkat
  briefcase: "1f4bc",  // ketenagakerjaan
  padlock: "1f512",    // pasokan terkunci
  film: "1f3ac",       // penghargaan film
  document: "1f4dc",   // undang-undang
  ballot: "1f5f3",     // pemilihan
  split: "2696",       // timbangan — jalan buntu, tidak ada mayoritas
};

const attrs = (o) => Object.entries(o).map(([k, v]) => `${k}="${v}"`).join(" ");
const slab = (x, y, w, h, r, o = 1) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="currentColor" opacity="${o}"/>`;

const line = (d) =>
  `<path d="${d}" ${attrs({ fill: "none", stroke: "currentColor", "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" })}/>`;

/** Bentuk yang tetap digambar sendiri.
 *
 * Batang: tingginya memuat data — mengikuti besar rentang angkanya.
 *
 * Panah arah: emoji panah Twemoji berwarna biru, dan pelat pasar suku bunga
 * juga biru, jadi pada 20px panahnya lenyap ke latarnya. Di baris sekecil itu
 * keterbacaan menang atas warna. */
const DRAWN = {
  flat: () => line("M26 50 H74"),
  "up-one": () => line("M50 76 V26M32 42 L50 24 L68 42"),
  "down-one": () => line("M50 24 V74M32 58 L50 76 L68 58"),
  "down-two": () => line("M30 32 L50 50 L70 32M30 54 L50 72 L70 54"),
  "bar-one": () => slab(42, 58, 16, 20, 4),
  "bar-two": () => slab(30, 58, 16, 20, 4, 0.5) + slab(54, 44, 16, 34, 4),
  "bar-three": () => slab(22, 60, 14, 18, 4, 0.4) + slab(43, 48, 14, 30, 4, 0.7) + slab(64, 34, 14, 44, 4),
  "bar-four": () =>
    slab(18, 62, 12, 16, 3, 0.35) + slab(35, 52, 12, 26, 3, 0.55) +
    slab(52, 40, 12, 38, 3, 0.78) + slab(69, 28, 12, 50, 3),
  dot: () => `<circle cx="50" cy="50" r="12" fill="currentColor"/>`,
};

/* ==========================================================================
 * WARNA
 * ======================================================================== */
const VOID = [10, 13, 20]; // --bg situs
const hexToRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const css = ([r, g, b]) => `rgb(${r},${g},${b})`;

/* ==========================================================================
 * SATU KOTAK
 * Pelatnya gradien dari warna event; gambarnya ditumpuk di atasnya. Emoji
 * dikomposit sebagai gambar lewat sharp, bukan disisipkan sebagai SVG —
 * menyisipkan SVG asing ke dalam SVG lain menuntut penulisan ulang viewBox
 * dan id-nya, dan satu id yang bentrok merusak seluruh berkas tanpa bersuara.
 * ======================================================================== */
function plate(base, size, inner) {
  const top = mix(base, [255, 255, 255], 0.08);
  const bottom = mix(base, VOID, 0.58);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="${css(top)}"/><stop offset="1" stop-color="${css(bottom)}"/>
  </linearGradient></defs>
  <rect width="100" height="100" fill="url(#g)"/>${inner}
</svg>`;
}

async function renderTile(glyph, tintHex, size) {
  // "mono:HAR#b4283c" -> teks HAR dengan warna sendiri.
  const [name, ownTint] = glyph.split("#");
  const base = hexToRgb(ownTint ? `#${ownTint}` : tintHex);

  if (name.startsWith("mono:")) {
    const text = name.slice(5);
    const fs = text.length >= 3 ? 27 : text.length === 2 ? 37 : 48;
    const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const art = `<text x="50" y="50" dy="0.35em" text-anchor="middle" fill="rgba(255,255,255,0.94)" font-family="Helvetica, Arial, sans-serif" font-size="${fs}" font-weight="700" letter-spacing="${text.length >= 3 ? -1 : 0}">${esc}</text>`;
    return sharp(Buffer.from(plate(base, size, art)));
  }

  if (DRAWN[name]) {
    const art = `<g color="rgba(255,255,255,0.93)">${DRAWN[name]()}</g>`;
    return sharp(Buffer.from(plate(base, size, art)));
  }

  const cp = EMOJI[name];
  if (!cp) throw new Error(`glyph tidak dikenal: "${name}"`);

  // Emoji diperkecil ke 58% kotak supaya tepinya punya napas, lalu dipusatkan.
  const inner = Math.round(size * 0.58);
  const offset = Math.round((size - inner) / 2);
  const art = await sharp(readFileSync(`scripts/emoji/${cp}.svg`))
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp(Buffer.from(plate(base, size, ""))).composite([{ input: art, left: offset, top: offset }]);
}

/* ==========================================================================
 * BACA PAPAN DARI BERKAS DATA
 * Slug event ada di indentasi 4 spasi; slug market selalu argumen pertama
 * `market(`, dan glyph-nya di baris yang sama. Membacanya dari sini membuat
 * daftar gambar tak pernah melenceng dari datanya — dengan syarat tiap
 * pemanggilan `market(` tetap ditulis dalam satu baris.
 * ======================================================================== */
function readBoard() {
  const lines = readFileSync(SRC, "utf8").split("\n");
  const out = [];
  let current = null;
  let inEvents = false;
  for (const raw of lines) {
    if (raw.startsWith("export const events")) inEvents = true;
    if (!inEvents) continue;

    const ev = raw.match(/^ {4}slug: "([^"]+)"/);
    if (ev) {
      current = { slug: ev[1], tint: "#2f5cff", glyph: null, showMarketImages: true, markets: [] };
      out.push(current);
      continue;
    }
    if (!current) continue;

    const tint = raw.match(/^ {4}tint: "(#[0-9a-fA-F]{6})"/);
    if (tint) current.tint = tint[1];

    const g = raw.match(/^ {4}glyph: "([^"]+)"/);
    if (g) current.glyph = g[1];

    const sm = raw.match(/^ {4}showMarketImages: (true|false)/);
    if (sm) current.showMarketImages = sm[1] === "true";

    const mk = raw.match(/market\("([^"]+)"/);
    if (mk) {
      const mg = raw.match(/glyph: "([^"]+)"/);
      current.markets.push({ slug: mk[1], glyph: mg ? mg[1] : null });
    }
  }
  return out;
}

/* ==========================================================================
 * TULIS
 * ======================================================================== */
const board = readBoard();

// Glyph yang hilang dihentikan di sini, bukan dibiarkan jadi kotak polos yang
// baru ketahuan salah setelah dilihat orang.
const missing = [];
for (const e of board) {
  if (!e.glyph) missing.push(`event ${e.slug}`);
  if (!e.showMarketImages) continue;
  for (const m of e.markets) if (!m.glyph) missing.push(`market ${e.slug}/${m.slug}`);
}
if (missing.length) {
  console.error("glyph belum diisi:\n  " + missing.join("\n  "));
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
let count = 0;

for (const event of board) {
  await (await renderTile(event.glyph, event.tint, 128)).webp({ quality: 92 }).toFile(`${OUT}/${event.slug}.webp`);
  count++;

  // Event yang tidak memasang gambar baris tidak perlu berkas barisnya.
  if (!event.showMarketImages) continue;
  for (const m of event.markets) {
    await (await renderTile(m.glyph, event.tint, 96)).webp({ quality: 92 }).toFile(`${OUT}/${event.slug}--${m.slug}.webp`);
    count++;
  }
}

writeFileSync(
  `${OUT}/SOURCE.txt`,
  "Dibangkitkan oleh scripts/make-market-art.mjs dari medan `glyph` tiap event\n" +
    "dan market di src/lib/markets.ts. Jalankan ulang skripnya setelah menambah,\n" +
    "mengganti, atau menghapus slug maupun glyph.\n\n" +
    "Sebagian gambar memakai artwork Twemoji, (c) Twitter/X dan kontributornya,\n" +
    "berlisensi CC-BY 4.0 (https://creativecommons.org/licenses/by/4.0/).\n" +
    "Berkas aslinya di-vendor ke scripts/emoji/.\n",
);

console.log(`${count} gambar ditulis untuk ${board.length} event`);
