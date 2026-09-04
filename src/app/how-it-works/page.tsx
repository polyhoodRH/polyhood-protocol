import type { Metadata } from "next";
import Link from "next/link";
import { brand, token } from "@/config/brand";
import { chain } from "@/config/chain";
import { BoltIcon, ScaleIcon, ShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "How it works",
  description: `How markets are priced, settled, and paid out on ${brand.name}.`,
};

const steps = [
  {
    n: "01",
    title: "A question gets a rule before it gets a price",
    body: "Every market ships with the exact source that decides it and the edge cases spelled out — what a tie does, what a revision does, what a cancellation does. If the rule cannot be written down plainly, the market does not open.",
  },
  {
    n: "02",
    title: "Two shares are minted against one dollar",
    body: "A dollar of collateral mints one Yes and one No. Together they are always worth exactly a dollar, so a price is just the market's honest read of the odds — 63¢ for Yes means the book thinks it happens 63% of the time.",
  },
  {
    n: "03",
    title: "The book is public while it trades",
    body: "Orders, fills, and the running price live on chain. You do not have to trust a screenshot of a chart: the same numbers are readable from the explorer by anyone who wants to check them.",
  },
  {
    n: "04",
    title: "Settlement pays one side, in full",
    body: "When the source publishes, the winning share redeems for a dollar and the losing share for nothing. There is no partial credit and no discretionary payout — the contract pays whoever holds the right share.",
  },
];

const pillars = [
  {
    icon: <ScaleIcon className="h-5 w-5 text-brand" />,
    title: "Resolution you can read",
    body: "The rule is on the market page, not in a support article. A market with an ambiguous source is voided at cost rather than settled on a judgement call.",
  },
  {
    icon: <ShieldIcon className="h-5 w-5 text-brand" />,
    title: "Collateral held by the contract",
    body: "Nothing routes through a desk. Collateral sits in the market contract until settlement, and redemption is a call anyone can make on their own behalf.",
  },
  {
    icon: <BoltIcon className="h-5 w-5 text-brand" />,
    title: `Settled on ${chain.name}`,
    body: `Blocks are cheap and quick enough that a five-minute market is worth running. Chain id ${chain.id}, native asset ${chain.currency.symbol}.`,
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <header className="py-8">
        <p className="text-[12px] uppercase tracking-wider text-brand">How it works</p>
        <h1 className="mt-2 max-w-2xl text-[30px] font-semibold leading-tight tracking-tight sm:text-[36px]">
          {brand.tagline}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          A prediction market turns a disagreement into a price. {brand.name} runs that price on
          {" "}{chain.name}, so the odds, the collateral, and the payout are all things you can check
          rather than things you are told.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.title} className="card p-4">
            {p.icon}
            <h2 className="mt-3 text-[15px] font-semibold">{p.title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{p.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-[20px] font-semibold tracking-tight">From question to payout</h2>
        <ol className="mt-4 space-y-3">
          {steps.map((s) => (
            <li key={s.n} className="card flex gap-4 p-4">
              <span className="num text-[13px] font-semibold text-brand">{s.n}</span>
              <div>
                <h3 className="text-[15px] font-semibold">{s.title}</h3>
                <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-ink-2">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="card mt-8 p-5">
        <h2 className="text-[18px] font-semibold tracking-tight">Where {token.ticker} fits</h2>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-ink-2">
          The token is not the collateral. Markets settle in the network asset; {token.ticker} is
          the claim on what the venue earns while they do. Fees taken at settlement flow back to
          the token rather than to a private book.
        </p>
        <Link href="/token" className="btn btn-brand mt-4">
          See the token
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="text-[20px] font-semibold tracking-tight">Questions worth asking first</h2>
        <div className="mt-4 space-y-2">
          <Faq
            q="What happens if the source never publishes?"
            a="The market voids and every share redeems at what it cost. A market that cannot be resolved is not settled on a guess."
          />
          <Faq
            q="Can a price go above a dollar?"
            a="No. Yes and No always sum to one dollar, so a share never trades above 100¢ — anything past that is an arbitrage the book closes immediately."
          />
          <Faq
            q="Do I need to hold the token to trade?"
            a={`No. Trading needs collateral and gas on ${chain.name}. ${token.ticker} is optional and separate from any position you take.`}
          />
          <Faq
            q="Is trading live right now?"
            a="Not yet. The board here is a static snapshot: prices are seeded, the order book is not connected, and connecting a wallet only proves the address is yours."
          />
        </div>
      </section>
    </>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="card group p-4">
      <summary className="cursor-pointer list-none text-[14.5px] font-medium marker:content-none">
        {q}
      </summary>
      <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-ink-2">{a}</p>
    </details>
  );
}
