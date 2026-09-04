import type { Metadata } from "next";
import Link from "next/link";
import { brand, links, lock, token } from "@/config/brand";
import { chain } from "@/config/chain";
import { CopyButton } from "@/components/CopyButton";
import { ExternalIcon, LockIcon, XIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: `${token.ticker}`,
  description: `${token.ticker} on ${chain.name} — supply, contract address, and lock proof.`,
};

const allocation = [
  { label: "Circulating from launch", pct: 90, note: "Sold into the open market at launch. No private round, no vesting cliff." },
  { label: "Venue treasury", pct: 6, note: "Settlement infrastructure, oracle costs, and market seeding." },
  { label: "Liquidity reserve", pct: 4, note: "Held back to deepen the book if a market needs it." },
];

export default function TokenPage() {
  return (
    <>
      <header className="py-8">
        <p className="text-[12px] uppercase tracking-wider text-brand">Token</p>
        <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-tight sm:text-[36px]">
          {token.ticker}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          {token.name} is the claim on what {brand.name} earns. Markets settle in the network
          asset; the token collects the fee taken at settlement. It is not collateral, and holding
          it is not required to take a position.
        </p>
      </header>

      {/* Kartu kontrak. Selama CA masih placeholder tidak ada tautan explorer
       *  yang dipasang — tautan itu hanya akan menuju entah ke mana. */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[15px] font-semibold">Contract address</h2>
          {token.isPlaceholder ? null : (
            <span className="rounded-full px-2.5 py-1 text-[11.5px]" style={{ background: "var(--yes-soft)", color: "var(--yes)" }}>
              Live on {chain.name}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-surface-2 p-3">
          <code className="num min-w-0 flex-1 break-all text-[13px] text-ink">{token.address}</code>
          <CopyButton value={token.address} />
          {token.explorerUrl ? (
            <Link href={token.explorerUrl} target="_blank" rel="noreferrer" className="btn btn-line h-8 px-3 text-[12.5px]">
              <ExternalIcon className="h-3.5 w-3.5" />
              Explorer
            </Link>
          ) : null}
        </div>

        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">
          {token.isPlaceholder
            ? "The address above is a placeholder. Until the real one is published here and on the project's X account, treat any address you are sent as fake."
            : "Check this address against the project's X account before you send anything to it. An address posted anywhere else is not ours."}
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Fact term="Name" value={token.name} />
        <Fact term="Symbol" value={token.ticker} />
        <Fact term="Network" value={chain.name} />
        <Fact term="Decimals" value={String(token.decimals)} />
        <Fact term="Buy / sell tax" value={token.taxLabel} />
      </div>

      <section className="mt-8 grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="card p-5">
          <h2 className="text-[18px] font-semibold tracking-tight">Supply</h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-2">
            One mint, no follow-on issuance. The split below is the whole schedule — there is no
            unlock calendar to track because there is nothing on a cliff.
          </p>
          <ul className="mt-4 space-y-3">
            {allocation.map((a) => (
              <li key={a.label}>
                <div className="flex items-baseline gap-3">
                  <span className="flex-1 text-[13.5px] text-ink">{a.label}</span>
                  <span className="num text-[13.5px] font-semibold">{a.pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <span className="block h-full rounded-full" style={{ width: `${a.pct}%`, background: "var(--brand)" }} />
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">{a.note}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          {/* Lock. Tautan Hoodlock hanya muncul kalau id kontraknya sudah ada. */}
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold">
              <LockIcon className="h-4 w-4 text-brand" />
              Locked with {lock.provider}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
              {lock.isSet
                ? `The treasury and liquidity reserve are held in a ${lock.provider} contract. The proof page shows the amount, the schedule, and every release that has cleared.`
                : `The lock contract is not published yet. When it is, the proof page here shows the amount, the schedule, and every release that has cleared — with nothing to take on trust.`}
            </p>
            {lock.url ? (
              <Link href={lock.url} target="_blank" rel="noreferrer" className="btn btn-brand mt-4 w-full">
                <ExternalIcon className="h-4 w-4" />
                View lock proof
              </Link>
            ) : (
              <span className="btn btn-line mt-4 w-full cursor-not-allowed opacity-55">
                Proof link pending
              </span>
            )}
            <Link
              href={lock.site}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-center text-[12px] text-ink-3 hover:text-ink-2"
            >
              {lock.provider.toLowerCase()}.tech
            </Link>
          </div>

          <div className="card p-5">
            <h2 className="text-[15px] font-semibold">Announcements</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
              The contract address and the lock proof are announced in one place only.
            </p>
            <Link href={links.x} target="_blank" rel="noreferrer" className="btn btn-line mt-4 w-full">
              <XIcon className="h-3.5 w-3.5" />
              @{links.x.split("/").pop()}
            </Link>
          </div>
        </div>
      </section>

      <section className="card mt-8 p-5">
        <h2 className="text-[18px] font-semibold tracking-tight">Network parameters</h2>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-ink-2">
          These are not design choices. A wallet refuses to connect if the chain id or the RPC does
          not match exactly.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Fact term="Chain" value={chain.name} />
          <Fact term="Chain id" value={`${chain.id} · ${chain.idHex}`} />
          <Fact term="Native asset" value={chain.currency.symbol} />
          <Fact term="Explorer" value={chain.explorer.replace(/^https:\/\//, "")} />
        </dl>
      </section>

      <p className="mt-6 max-w-3xl text-[12px] leading-relaxed text-ink-3">
        Holding {token.ticker} is not a share, a note, or a claim on anyone&apos;s balance sheet, and
        nothing on this page is investment advice. Fee revenue depends on markets actually trading —
        if they do not, the token collects nothing.
      </p>
    </>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="card p-4">
      <dt className="text-[11.5px] uppercase tracking-wider text-ink-3">{term}</dt>
      <dd className="num mt-1 text-[14px] text-ink">{value}</dd>
    </div>
  );
}
