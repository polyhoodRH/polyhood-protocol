/* Parameter jaringan Robinhood Chain. Nilai-nilai ini bukan pilihan desain —
 * wallet menolak tersambung kalau chain id atau RPC-nya tidak persis. */
export const chain = {
  id: 4663,
  idHex: "0x1237",
  name: "Robinhood Chain",
  rpc: "https://rpc.mainnet.chain.robinhood.com",
  explorer: "https://robinhoodchain.blockscout.com",
  currency: { name: "Ether", symbol: "ETH", decimals: 18 },
} as const;
