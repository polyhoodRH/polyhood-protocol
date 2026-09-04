"use client";

import { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { chain } from "@/config/chain";
import { cents, spread, type PolyEvent } from "@/lib/markets";

/* Panel taruh posisi. Ini papan kertas: tidak ada transaksi yang dikirim, dan
 * panel mengatakannya apa adanya alih-alih memperagakan pesanan yang berhasil.
 *
 * Harga yang dipakai adalah sisi buku yang benar-benar akan Anda bayar —
 * membeli mengambil ask, bukan harga terakhir. Memakai lastTradePrice di sini
 * akan menjanjikan payout yang lebih besar daripada yang bisa diisi. */
export function OrderPanel({ event }: { event: PolyEvent }) {
  const w = useWallet();
  const [pick, setPick] = useState(0);
  const [side, setSide] = useState<0 | 1>(0);
  const [amount, setAmount] = useState("25");

  const market = event.markets[pick] ?? event.markets[0];
  // Membeli sisi pertama membayar ask-nya; membeli sisi kedua membayar
  // 1 dikurangi bid sisi pertama — dua sisi selalu berjumlah satu dolar.
  const price = side === 0 ? market.bestAsk : 1 - market.bestBid;
  const spend = Number(amount);
  const valid = Number.isFinite(spend) && spend > 0 && price > 0;
  const shares = valid ? spend / price : 0;

  return (
    <div className="card sticky top-28 p-4">
      <div className="flex items-center gap-2">
        {market.outcomes.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setSide(i as 0 | 1)}
            className={`side ${
              side === i ? (i === 0 ? "side-yes" : "side-no") : "bg-surface-2 text-ink-2"
            }`}
          >
            {label} {cents(i === 0 ? market.bestAsk : 1 - market.bestBid)}
          </button>
        ))}
      </div>

      {event.markets.length > 1 ? (
        <div className="mt-3">
          <label className="text-[12px] text-ink-3" htmlFor="outcome">
            Outcome
          </label>
          <select
            id="outcome"
            value={pick}
            onChange={(e) => setPick(Number(e.target.value))}
            className="mt-1 h-9 w-full rounded-lg bg-surface-2 px-2.5 text-[13.5px] text-ink outline-none focus:ring-1 focus:ring-line-strong"
          >
            {event.markets.map((m, i) => (
              <option key={m.slug} value={i}>
                {m.groupItemTitle} — {cents(m.lastTradePrice)}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="mt-3">
        <label className="text-[12px] text-ink-3" htmlFor="amount">
          Amount
        </label>
        <div className="mt-1 flex h-10 items-center rounded-lg bg-surface-2 px-3">
          <span className="text-[15px] text-ink-3">$</span>
          <input
            id="amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            className="num w-full bg-transparent px-1 text-[15px] text-ink outline-none"
          />
        </div>
        <div className="mt-2 flex gap-1.5">
          {[10, 25, 100, 500].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(String(v))}
              className="num flex-1 rounded-md bg-surface-2 py-1.5 text-[12px] text-ink-2 transition-colors hover:text-ink"
            >
              ${v}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-4 space-y-2 border-t border-line pt-3 text-[13px]">
        <Row term="Price per share" value={cents(price)} />
        <Row term="Spread" value={spread(market)} />
        <Row term="Shares" value={valid ? shares.toFixed(1) : "—"} />
        <Row term="Payout if correct" value={valid ? `$${shares.toFixed(2)}` : "—"} strong />
      </dl>

      {!market.acceptingOrders ? (
        <button type="button" className="btn btn-line mt-4 w-full" disabled>
          Not accepting orders
        </button>
      ) : w.connected && !w.onChain ? (
        <button type="button" onClick={w.switchNetwork} className="btn btn-brand mt-4 w-full" disabled={w.busy}>
          Switch to {chain.name}
        </button>
      ) : w.connected ? (
        <button type="button" className="btn btn-brand mt-4 w-full" disabled>
          Trading opens at launch
        </button>
      ) : (
        <button type="button" onClick={w.open} className="btn btn-brand mt-4 w-full" disabled={w.busy}>
          {w.busy ? "Connecting…" : "Connect to trade"}
        </button>
      )}

      <p className="mt-3 text-[11.5px] leading-relaxed text-ink-3">
        Prices on this board are a static snapshot and the order book is not live yet. Connecting a
        wallet proves the address is yours — it approves no spending and moves nothing.
      </p>
    </div>
  );
}

function Row({ term, value, strong }: { term: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-2">{term}</dt>
      <dd className={`num ${strong ? "font-semibold text-brand" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
