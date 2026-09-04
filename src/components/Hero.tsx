import Link from "next/link";
import { brand } from "@/config/brand";
import { eventBySlug, eventIcon, hotTopics, marketIcon, pct, usd } from "@/lib/markets";
import { ChevronRight, FlameIcon, Logo } from "@/components/icons";

/* Kurva peluang. Titik-titiknya seed tetap, bukan acak: nilai acak berubah
 * tiap render di server dan klien, dan React mengeluh soal ketidakcocokan. */
const SERIES_A = [46, 47, 45, 48, 50, 49, 52, 51, 53, 52, 54, 55, 54, 54];
const SERIES_B = [54, 53, 55, 52, 50, 51, 48, 49, 47, 48, 46, 45, 46, 45];

function path(values: number[], w = 560, h = 190, pad = 10) {
  const lo = 34;
  const hi = 66;
  const step = (w - pad * 2) / (values.length - 1);
  return values
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + (1 - (v - lo) / (hi - lo)) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function Hero() {
  const featured = eventBySlug("chamber-control");
  if (!featured) return null;

  const [lead, second] = featured.markets;

  return (
    <section className="grid gap-3 lg:grid-cols-[1fr_320px]">
      {/* Pasar unggulan */}
      <div className="card flex flex-col p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={eventIcon(featured)}
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0">
            <p className="text-[12px] text-ink-3">
              {featured.category} · Closes {featured.endDate}
            </p>
            <h1 className="mt-0.5 text-[22px] font-semibold leading-tight tracking-tight sm:text-[26px]">
              <Link href={`/markets/${featured.slug}`} className="hover:underline">
                {featured.title}
              </Link>
            </h1>
          </div>
        </div>

        <div className="mt-4 grid flex-1 gap-4 sm:grid-cols-[252px_1fr]">
          <div className="space-y-2">
            {featured.markets.map((m) => (
              <div key={m.slug} className="flex items-center gap-2">
                {featured.showMarketImages ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={marketIcon(featured, m)}
                    alt=""
                    aria-hidden="true"
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0 rounded-[5px] object-cover"
                  />
                ) : null}
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">{m.groupItemTitle}</span>
                <span className="num w-9 text-right text-[13px] font-semibold text-ink">
                  {pct(m.outcomePrices[0])}%
                </span>
                <button type="button" className="chip-yes">{m.outcomes[0]}</button>
                <button type="button" className="chip-no">{m.outcomes[1]}</button>
              </div>
            ))}
            <p className="num pt-1 text-[12px] text-ink-3">{usd(featured.volume)} Vol.</p>
          </div>

          {/* Grafik memanjang mengisi sisa tinggi kartu supaya kartu ini tidak
           *  menyisakan ruang kosong saat kolom kanan lebih tinggi. Sumbunya
           *  diregangkan bebas, jadi setiap garis dipasang non-scaling-stroke
           *  supaya ketebalannya tidak ikut melar. */}
          <figure className="relative flex min-w-0 flex-col justify-center">
            <svg
              viewBox="0 0 560 190"
              preserveAspectRatio="none"
              className="w-full flex-1 min-h-[190px] max-h-[360px]"
              role="img"
              aria-label="Probability over time"
            >
              {[0, 1, 2, 3].map((i) => (
                <line
                  key={i}
                  x1="10"
                  x2="550"
                  y1={10 + i * 56.6}
                  y2={10 + i * 56.6}
                  stroke="var(--border)"
                  strokeDasharray="3 5"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path d={path(SERIES_A)} fill="none" stroke="var(--yes)" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d={path(SERIES_B)} fill="none" stroke="var(--no)" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <figcaption className="mt-1 flex items-center gap-4 text-[12px]">
              <span className="flex items-center gap-1.5 text-ink-2">
                <span className="h-0.5 w-3 rounded" style={{ background: "var(--yes)" }} />
                {lead.groupItemTitle}{" "}
                <span className="num font-semibold text-ink">{pct(lead.outcomePrices[0])}%</span>
              </span>
              <span className="flex items-center gap-1.5 text-ink-2">
                <span className="h-0.5 w-3 rounded" style={{ background: "var(--no)" }} />
                {second.groupItemTitle}{" "}
                <span className="num font-semibold text-ink">{pct(second.outcomePrices[0])}%</span>
              </span>
              <span className="num ml-auto hidden items-center gap-1.5 text-ink-3 sm:flex">
                <Logo className="h-3.5 w-auto" />
                {brand.name}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Kolom kanan */}
      <div className="flex flex-col gap-3">
        <Promo
          title="Every market settles on chain"
          body="Shares redeem one-for-one. No desk decides your payout."
          cta="How it works"
          href="/how-it-works"
        />
        <Promo
          title={`Hold ${brand.name}`}
          body="Settlement fees flow back to the token."
          cta="See the token"
          href="/token"
          accent
        />

        <div className="card flex-1 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Hot topics</h2>
            <ChevronRight className="h-4 w-4 text-ink-3" />
          </div>
          <ul className="mt-3 space-y-0.5">
            {hotTopics.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/markets/${t.slug}`}
                  className="flex items-center gap-3 rounded-md px-1.5 py-2 transition-colors hover:bg-surface-2"
                >
                  <span className="num w-3 text-[12px] text-ink-3">{t.rank}</span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{t.label}</span>
                  <span className="num text-[12px] text-ink-2">{usd(t.flow)} today</span>
                  <FlameIcon className="h-3.5 w-3.5 text-live" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Promo({
  title,
  body,
  cta,
  href,
  accent,
}: {
  title: string;
  body: string;
  cta: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <div
      className="card p-3.5"
      style={accent ? { background: "linear-gradient(135deg, var(--surface) 0%, rgba(47,92,255,0.12) 100%)" } : undefined}
    >
      <h2 className="text-[14px] font-semibold">{title}</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">{body}</p>
      <Link href={href} className={`btn mt-2.5 h-8 text-[13px] ${accent ? "btn-brand" : "btn-line"}`}>
        {cta}
      </Link>
    </div>
  );
}
