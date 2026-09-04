/* Penemuan wallet EIP-6963 + sambungan EIP-1193, tanpa dependensi.
 * Wallet EVM mengumumkan dirinya lewat event `eip6963:announceProvider`;
 * kita minta pengumuman ulang lewat `eip6963:requestProvider`. */

import { chain } from "@/config/chain";

export type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: never[]) => void) => void;
  removeListener?: (event: string, handler: (...args: never[]) => void) => void;
};

export type WalletInfo = { uuid: string; name: string; icon: string; rdns: string };
export type WalletDetail = { info: WalletInfo; provider: Eip1193Provider };

const found = new Map<string, WalletDetail>();
const subscribers = new Set<() => void>();

function announce(event: Event) {
  const detail = (event as CustomEvent<WalletDetail>).detail;
  if (!detail?.info?.uuid || found.has(detail.info.uuid)) return;
  found.set(detail.info.uuid, detail);
  subscribers.forEach((fn) => fn());
}

let listening = false;

/** Mulai mendengarkan pengumuman wallet; kembalikan fungsi berhenti. */
export function watchWallets(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  subscribers.add(onChange);
  if (!listening) {
    listening = true;
    window.addEventListener("eip6963:announceProvider", announce);
  }
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  return () => {
    subscribers.delete(onChange);
  };
}

export function wallets(): WalletDetail[] {
  return [...found.values()];
}

/** Checksum EIP-55. Alamat huruf kecil terbaca seperti data mentah. */
export async function checksum(address: string): Promise<string> {
  const lower = address.toLowerCase().replace(/^0x/, "");
  const hash = await keccak(lower);
  let out = "0x";
  for (let i = 0; i < lower.length; i++) {
    out += parseInt(hash[i], 16) >= 8 ? lower[i].toUpperCase() : lower[i];
  }
  return out;
}

export function short(address: string, lead = 6) {
  return address.length > lead + 6 ? `${address.slice(0, lead)}…${address.slice(-4)}` : address;
}

/** Panggilan baca langsung ke RPC publik — tidak perlu wallet. */
export async function rpc(method: string, params: unknown[] = []) {
  const res = await fetch(chain.rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message ?? "RPC call failed");
  return json.result;
}

/** Pastikan wallet berada di Robinhood Chain; tawarkan menambah jaringannya
 *  kalau wallet belum mengenalnya (kode 4902). */
export async function ensureChain(provider: Eip1193Provider) {
  const current = (await provider.request({ method: "eth_chainId" })) as string;
  if (current?.toLowerCase() === chain.idHex.toLowerCase()) return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chain.idHex }],
    });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code !== 4902) throw err;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chain.idHex,
          chainName: chain.name,
          nativeCurrency: chain.currency,
          rpcUrls: [chain.rpc],
          blockExplorerUrls: [chain.explorer],
        },
      ],
    });
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chain.idHex }],
    });
  }
}

export function formatBalance(wei: string, places = 5) {
  const value = BigInt(wei || "0");
  const whole = value / 10n ** 18n;
  const frac = (value % 10n ** 18n).toString().padStart(18, "0").slice(0, places);
  return `${whole}.${frac}`;
}

/* -- keccak-256 -------------------------------------------------------------
 * Dibutuhkan hanya untuk checksum alamat. Ditulis langsung supaya halaman ini
 * tidak menyeret pustaka kripto sebesar beberapa ratus kilobyte. */

const RC = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];
const ROT = [
  0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14,
];
const MASK = (1n << 64n) - 1n;

const rotl = (x: bigint, n: number) =>
  n === 0 ? x : ((x << BigInt(n)) | (x >> BigInt(64 - n))) & MASK;

function permute(state: bigint[]) {
  for (let round = 0; round < 24; round++) {
    const c: bigint[] = [];
    for (let x = 0; x < 5; x++) {
      c[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
    }
    for (let x = 0; x < 5; x++) {
      const d = c[(x + 4) % 5] ^ rotl(c[(x + 1) % 5], 1);
      for (let y = 0; y < 25; y += 5) state[x + y] ^= d;
    }
    const b: bigint[] = new Array(25).fill(0n);
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        b[y + ((2 * x + 3 * y) % 5) * 5] = rotl(state[x + y * 5], ROT[x + y * 5]);
      }
    }
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 25; y += 5) {
        state[x + y] = b[x + y] ^ (~b[((x + 1) % 5) + y] & b[((x + 2) % 5) + y]);
      }
    }
    state[0] ^= RC[round];
  }
}

/** keccak-256 atas string ASCII, hasil hex tanpa awalan 0x. */
async function keccak(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const rate = 136;
  const padded = new Uint8Array(Math.ceil((bytes.length + 1) / rate) * rate);
  padded.set(bytes);
  padded[bytes.length] = 0x01;
  padded[padded.length - 1] |= 0x80;

  const state: bigint[] = new Array(25).fill(0n);
  for (let offset = 0; offset < padded.length; offset += rate) {
    for (let i = 0; i < rate / 8; i++) {
      let lane = 0n;
      for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(padded[offset + i * 8 + b]);
      state[i] ^= lane;
    }
    permute(state);
  }

  let out = "";
  for (let i = 0; i < 4; i++) {
    let lane = state[i];
    for (let b = 0; b < 8; b++) {
      out += (lane & 0xffn).toString(16).padStart(2, "0");
      lane >>= 8n;
    }
  }
  return out;
}
