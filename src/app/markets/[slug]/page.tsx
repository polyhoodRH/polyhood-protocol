import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  cents,
  eventBySlug,
  eventIcon,
  events,
  leadMarket,
  marketIcon,
  pct,
  spread,
  usd,
  type Market,
  type PolyEvent,
} from "@/lib/markets";
import { OrderPanel } from "@/components/OrderPanel";
import { ArrowDown, ArrowUp, ChevronLeft, Gauge, ScaleIcon } from "@/components/icons";

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = eventBySlug(slug);
  if (!event) return { title: "Market not found" };
  return { title: event.title, description: event.description };
}

/* Deret peluang. Bentuknya diturunkan dari slug supaya tiap event punya kurva
 * sendiri yang tetap sama di server dan di klien — bukan Math.random(), yang
 * membuat React mengeluh soal ketidakcocokan hidrasi.
 *
 * Jalannya dirunut mundur dari harga hari ini: langkah acak kecil ditambah
 * arah lambat, lalu titik terakhir dipaku ke nilai sebenarnya. Tanpa arah
 * lambat itu, langkah acak saling meniadakan dan garisnya keluar nyaris rata
 * — terbaca seperti pasar yang tidak pernah diperdagangkan. */
function series(slug: string, end: number, points = 40): number[] {
  let seed = 0;
  for (let i = 0; i < slug.length; i++) seed = (seed * 31 + slug.charCodeAt(i)) >>> 0;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // Arah keseluruhan: ke mana harga bergerak sepanjang jendela ini.
  const trend = (next() - 0.5) * 26;
  const out: number[] = [];
  let value = end;
  for (let i = points - 1; i >= 0; i--) {
    const step = (next() - 0.5) * 7;
    const pull = trend / points;
    value = Math.min(94, Math.max(6, value - step - pull));
    out.unshift(Math.round(value));
  }
  out[out.length - 1] = end;
  return out;
}

function curve(values: number[], w = 700, h = 240, pad = 12) {
  const step = (w - pad * 2) / (values.length - 1);
  return values
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + (1 - v / 100) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = eventBySlug(slug);
  if (!event) notFound();

  const lead = leadMarket(event);
  const points = series(event.slug, pct(lead.outcomePrices[0]));
  const related = events.filter((e) => e.category === event.category && e.slug !== event.slug).slice(0, 3);

  return (
    <>
      <Link href="/" className="inline-flex items-center gap-1 py-2 text-[13px] text-ink-2 hover:text-ink">
        <ChevronLeft className="h-4 w-4" />
        All markets
      </Link>

      <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_336px]">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={eventIcon(event)}
              alt=""
              aria-hidden="true"
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="text-[12px] text-ink-3">
                {event.category} · {usd(event.volume)} Vol. · Closes {event.endDate}
              </p>
              <h1 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight sm:text-[28px]">
                {event.title}
              </h1>
            </div>
            <div className="ml-auto hidden shrink-0 sm:block">
              <Gauge pct={pct(lead.outcomePrices[0])} size={56} />
            </div>
          </div>

          <figure className="card mt-4 p-3">
            <svg viewBox="0 0 700 240" className="h-[240px] w-full" role="img" aria-label={`${lead.groupItemTitle} probability over time`}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map((v) => {
                const y = 12 + (1 - v / 100) * 216;
                return (
                  <g key={v}>
                    <line x1="12" x2="688" y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 6" />
                    <text x="692" y={y + 3} fontSize="9" fill="var(--text-3)" textAnchor="start">
                      {v}
                    </text>
                  </g>
                );
              })}
              <path d={`${curve(points)} L688 228 L12 228 Z`} fill="url(#fill)" stroke="none" />
              <path d={curve(points)} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <figcaption className="mt-1 flex items-center gap-2 px-1 text-[12px] text-ink-3">
              <span className="text-ink-2">{lead.groupItemTitle}</span>
              <span className="num font-semibold text-ink">{pct(lead.outcomePrices[0])}%</span>
              <Drift value={lead.oneDayPriceChange} />
              <span className="ml-auto">Snapshot · not a live feed</span>
            </figcaption>
          </figure>

          <div className="card mt-4 p-4">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold">
              <ScaleIcon className="h-4 w-4 text-brand" />
              How this resolves
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">{event.description}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Fact term="Resolution source" value={event.resolutionSource} />
              <Fact term="Closes" value={event.endDate} />
              <Fact term="24h volume" value={usd(event.volume24hr)} />
              <Fact term="Liquidity" value={usd(event.liquidity)} />
            </dl>
            {event.negRisk ? (
              <p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">
                Outcomes here are mutually exclusive — exactly one settles yes, so the prices below
                add up to about a dollar. Holding No on every outcome is the same bet as holding
                nothing at all.
              </p>
            ) : null}
          </div>

          <div className="card mt-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 pb-3">
              <h2 className="text-[15px] font-semibold">
                {event.markets.length > 1 ? "Outcomes" : "Order book"}
              </h2>
              <span className="text-[12px] text-ink-3">
                {event.markets.length} market{event.markets.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="rail">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-y border-line text-[11px] uppercase tracking-wider text-ink-3">
                    <th scope="col" className="px-4 py-2 font-medium">Outcome</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Bid</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Ask</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Spread</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">24h</th>
                    <th scope="col" className="px-4 py-2 text-right font-medium">Trade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {event.markets.map((m) => (
                    <Row key={m.slug} event={event} market={m} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {related.length > 0 ? (
            <div className="mt-4">
              <h2 className="text-[15px] font-semibold">More in {event.category}</h2>
              <ul className="mt-3 space-y-2">
                {related.map((e) => (
                  <li key={e.slug}>
                    <Link href={`/markets/${e.slug}`} className="card card-hover flex items-center gap-3 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={eventIcon(e)}
                        alt=""
                        aria-hidden="true"
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 rounded-lg object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-[13.5px]">{e.title}</span>
                      <span className="num shrink-0 text-[12px] text-ink-3">{usd(e.volume)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div>
          <OrderPanel event={event} />
        </div>
      </div>
    </>
  );
}

function Row({ event, market }: { event: PolyEvent; market: Market }) {
  return (
    <tr className="transition-colors hover:bg-surface-2">
      <td className="px-4 py-2.5">
        <span className="flex items-center gap-2.5">
          {event.showMarketImages ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={marketIcon(event, market)}
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 rounded-md object-cover"
            />
          ) : null}
          <span className="text-[13.5px] text-ink">{market.groupItemTitle}</span>
        </span>
      </td>
      <td className="num px-3 py-2.5 text-right text-[13px] text-ink-2">{cents(market.bestBid)}</td>
      <td className="num px-3 py-2.5 text-right text-[13px] text-ink-2">{cents(market.bestAsk)}</td>
      <td className="num px-3 py-2.5 text-right text-[13px] text-ink-3">{spread(market)}</td>
      <td className="px-3 py-2.5 text-right">
        <Drift value={market.oneDayPriceChange} />
      </td>
      <td className="px-4 py-2.5">
        <span className="flex items-center justify-end gap-1.5">
          <button type="button" className="chip-yes">{market.outcomes[0]}</button>
          <button type="button" className="chip-no">{market.outcomes[1]}</button>
        </span>
      </td>
    </tr>
  );
}

/** Perubahan harga 24 jam, dalam sen. Nol tidak digambar: panah yang tak
 *  bergerak lebih berisik daripada berguna di tabel sepanjang ini. */
function Drift({ value }: { value: number }) {
  if (!value) return <span className="num text-[12px] text-ink-3">—</span>;
  const up = value > 0;
  return (
    <span
      className="num inline-flex items-center justify-end gap-0.5 text-[12px]"
      style={{ color: up ? "var(--yes)" : "var(--no)" }}
    >
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(Math.round(value * 100))}¢
    </span>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2.5">
      <dt className="text-[11.5px] uppercase tracking-wider text-ink-3">{term}</dt>
      <dd className="mt-0.5 text-[13.5px] leading-snug text-ink">{value}</dd>
    </div>
  );
}
