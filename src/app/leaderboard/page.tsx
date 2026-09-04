import type { Metadata } from "next";
import { boardStats, leaders, usd } from "@/lib/markets";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Realised profit, traded volume, and hit rate across settled markets.",
};

export default function LeaderboardPage() {
  return (
    <>
      <header className="py-6">
        <h1 className="text-[28px] font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-2">
          Ranked by realised profit on settled markets. Open positions are excluded — a position
          only counts once the market it belongs to has paid out.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat term="Open markets" value={boardStats.openMarkets.toLocaleString("en-US")} />
        <Stat term="Volume, 24h" value={usd(boardStats.volume24h)} />
        <Stat term="Markets settled" value={boardStats.settled.toLocaleString("en-US")} />
        <Stat term="Traders" value={boardStats.traders.toLocaleString("en-US")} />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="rail">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-line text-[11.5px] uppercase tracking-wider text-ink-3">
                <th scope="col" className="px-4 py-3 font-medium">#</th>
                <th scope="col" className="px-4 py-3 font-medium">Address</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Profit</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Volume</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Hit rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leaders.map((l) => (
                <tr key={l.handle} className="transition-colors hover:bg-surface-2">
                  <td className="num px-4 py-3 text-[13px] text-ink-3">{l.rank}</td>
                  <td className="num px-4 py-3 text-[13.5px] text-ink">{l.handle}</td>
                  <td className="num px-4 py-3 text-right text-[13.5px] font-semibold text-yes">
                    +{usd(l.profit)}
                  </td>
                  <td className="num px-4 py-3 text-right text-[13.5px] text-ink-2">{usd(l.volume)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="num inline-flex items-center gap-2 text-[13px] text-ink-2">
                      <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-surface-3 sm:block">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${l.hit}%`, background: "var(--brand)" }}
                        />
                      </span>
                      {l.hit}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
        These rows are seed data for the board layout. Once markets settle on chain, the table is
        built from settlement events and every row can be checked against the explorer.
      </p>
    </>
  );
}

function Stat({ term, value }: { term: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-[11.5px] uppercase tracking-wider text-ink-3">{term}</p>
      <p className="num mt-1.5 text-[22px] font-semibold tracking-tight">{value}</p>
    </div>
  );
}
