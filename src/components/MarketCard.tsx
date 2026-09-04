import Link from "next/link";
import type { Market, PolyEvent, Team } from "@/lib/markets";
import { eventIcon, leadMarket, marketIcon, pct, usd } from "@/lib/markets";
import { BookmarkIcon, Gauge } from "@/components/icons";

/* Satu kartu event. Empat bentuk berbagi kepala dan kaki yang sama; yang
 * berbeda cuma badannya, jadi tinggi kartu tetap rata di dalam grid.
 *
 * Gambar dipasang lewat <img> biasa, bukan next/image: semuanya ≤ 40px dan
 * next/image merender kosong pada ikon sekecil itu. */
export function MarketCard({ event }: { event: PolyEvent }) {
  return (
    <article className="card card-hover flex h-full flex-col p-3">
      <Head event={event} />

      <div className="mt-3 flex-1">
        {event.format === "grouped" ? <GroupedBody event={event} /> : null}
        {event.format === "game" ? <GameBody event={event} /> : null}
        {event.format === "binary" || event.format === "updown" ? <SidesBody event={event} /> : null}
      </div>

      <Foot event={event} />
    </article>
  );
}

/** Gambar event/market. Selalu persegi dan dipotong `cover`, jadi satu baris
 *  tidak pernah bergeser hanya karena gambarnya beda aspek. */
function Art({ src, size, radius = 8 }: { src: string; size: number; radius?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className="shrink-0 object-cover"
      style={{ width: size, height: size, borderRadius: radius }}
    />
  );
}

function Head({ event }: { event: PolyEvent }) {
  // Cincin hanya untuk kartu bersisi tunggal. Pada kartu berhasil-banyak,
  // satu cincin di kepala akan mengaku mewakili seluruh baris — padahal tidak.
  const single = event.format === "binary" || event.format === "updown";
  const lead = leadMarket(event);

  return (
    <div className="flex items-start gap-2.5">
      <Art src={eventIcon(event)} size={36} />

      <h3 className="flex-1 text-[14px] font-medium leading-[1.35] text-ink">
        <Link href={`/markets/${event.slug}`} className="hover:underline">
          {event.title}
        </Link>
      </h3>

      {single ? <Gauge pct={pct(lead.outcomePrices[0])} /> : null}
    </div>
  );
}

function GroupedBody({ event }: { event: PolyEvent }) {
  // Maksimal empat baris di kartu. Sisanya dihitung, bukan disembunyikan
  // diam-diam — kartu memberi tahu ada berapa hasil lain di halaman event.
  const shown = event.markets.slice(0, 4);
  const rest = event.markets.length - shown.length;

  return (
    <div className="space-y-1">
      {shown.map((m) => (
        <div key={m.slug} className="flex items-center gap-2">
          {event.showMarketImages ? <Art src={marketIcon(event, m)} size={20} radius={5} /> : null}
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">{m.groupItemTitle}</span>
          <span className="num w-9 text-right text-[13px] font-semibold text-ink">
            {pct(m.outcomePrices[0])}%
          </span>
          <button type="button" className="chip-yes">{m.outcomes[0]}</button>
          <button type="button" className="chip-no">{m.outcomes[1]}</button>
        </div>
      ))}
      {rest > 0 ? (
        <Link
          href={`/markets/${event.slug}`}
          className="block pt-0.5 text-[12px] text-ink-3 hover:text-ink-2"
        >
          +{rest} more outcome{rest > 1 ? "s" : ""}
        </Link>
      ) : null}
    </div>
  );
}

function SidesBody({ event }: { event: PolyEvent }) {
  const m = event.markets[0];
  return (
    <div className="flex items-center gap-2">
      <button type="button" className="side side-yes">{m.outcomes[0]}</button>
      <button type="button" className="side side-no">{m.outcomes[1]}</button>
    </div>
  );
}

function GameBody({ event }: { event: PolyEvent }) {
  const teams = event.teams ?? [];
  return (
    <div>
      <div className="space-y-1.5">
        {event.markets.slice(0, 2).map((m, i) => (
          <TeamRow key={m.slug} event={event} market={m} team={teams[i]} />
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        {event.markets.slice(0, 2).map((m, i) => (
          <button
            key={m.slug}
            type="button"
            className="side side-team truncate"
            style={{ "--tint": teams[i]?.tint ?? event.tint } as React.CSSProperties}
          >
            {teams[i]?.short ?? m.groupItemTitle}
          </button>
        ))}
      </div>
    </div>
  );
}

function TeamRow({ event, market, team }: { event: PolyEvent; market: Market; team?: Team }) {
  return (
    <div className="flex items-center gap-2">
      {event.showMarketImages ? <Art src={marketIcon(event, market)} size={20} radius={5} /> : null}
      {team?.score !== undefined ? (
        <span className="num w-4 text-[13px] text-ink-3">{team.score}</span>
      ) : null}
      <span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">{market.groupItemTitle}</span>
      <span className="num text-[13px] font-semibold text-ink">{pct(market.outcomePrices[0])}%</span>
    </div>
  );
}

function Foot({ event }: { event: PolyEvent }) {
  const trailing = event.tags[0] ?? event.category;

  return (
    <div className="mt-3 flex items-center gap-2 overflow-hidden whitespace-nowrap pt-2 text-[12px] text-ink-3">
      {event.live && event.period ? (
        <span className="flex shrink-0 items-center gap-1.5 font-medium text-live">
          <span className="dot-live" />
          {event.period}
        </span>
      ) : null}
      <span className="num shrink-0">{usd(event.volume)} Vol.</span>
      <span className="shrink-0" aria-hidden="true">·</span>
      <span className="min-w-0 truncate">{trailing}</span>
      <button
        type="button"
        className="ml-auto shrink-0 text-ink-3 transition-colors hover:text-ink"
        aria-label="Save market"
      >
        <BookmarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
