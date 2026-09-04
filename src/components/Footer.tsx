import Link from "next/link";
import { brand, links, lock, token } from "@/config/brand";
import { chain } from "@/config/chain";
import { categories } from "@/lib/markets";
import { GithubIcon, HoodlockMark, Logo, XIcon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="shell py-10">
        <p className="text-[15px] text-ink-2">{brand.tagline}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_160px_160px]">
          <div>
            <h2 className="text-[12px] uppercase tracking-wider text-ink-3">Markets by category</h2>
            <ul className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
              {categories.map((c) => (
                <li key={c}>
                  <Link href={`/?c=${c}`} className="block text-[13.5px] text-ink hover:underline">
                    {c}
                  </Link>
                  <span className="text-[11.5px] text-ink-3">Odds &amp; volume</span>
                </li>
              ))}
            </ul>
          </div>

          <Column
            title="Product"
            items={[
              { label: "How it works", href: "/how-it-works" },
              { label: "Leaderboard", href: "/leaderboard" },
              { label: "Token", href: "/token" },
              { label: "Markets", href: "/" },
            ]}
          />

          <Column
            title="Network"
            items={[
              { label: chain.name, href: chain.explorer, external: true },
              { label: "Explorer", href: chain.explorer, external: true },
              ...(token.explorerUrl ? [{ label: "Contract", href: token.explorerUrl, external: true }] : []),
              ...(links.github ? [{ label: "Source", href: links.github, external: true }] : []),
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Link href={links.x} target="_blank" rel="noreferrer" className="text-ink-3 transition-colors hover:text-ink" aria-label="X">
              <XIcon className="h-4 w-4" />
            </Link>
            <Link href={links.github} target="_blank" rel="noreferrer" className="text-ink-3 transition-colors hover:text-ink" aria-label="GitHub">
              <GithubIcon className="h-4 w-4" />
            </Link>
            {/* Hoodlock memakai mark-nya sendiri: sebuah berkas gambar, jadi
             *  opasitasnya yang diredupkan — bukan warna teks. */}
            <Link href={lock.site} target="_blank" rel="noreferrer" className="opacity-55 transition-opacity hover:opacity-100" aria-label={lock.provider}>
              <HoodlockMark className="h-4 w-auto" />
            </Link>
          </div>

          <p className="flex items-center gap-2 text-[12.5px] text-ink-3 sm:ml-4">
            <Logo className="h-4 w-auto" />
            {brand.name} · {brand.domain}
          </p>

          <p className="text-[12.5px] text-ink-3 sm:ml-auto">
            {token.ticker} on {chain.name}
          </p>
        </div>

        <p className="mt-5 max-w-4xl text-[11.5px] leading-relaxed text-ink-3">
          {brand.name} is a prediction market. Positions can settle at zero, and a market that
          resolves against you pays nothing. Nothing here is investment advice, and no part of this
          site is an offer to sell a security. Check the contract address against a source you
          trust before you send anything to it.
        </p>
      </div>
    </footer>
  );
}

function Column({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h2 className="text-[12px] uppercase tracking-wider text-ink-3">{title}</h2>
      <ul className="mt-3 space-y-2.5">
        {items.map((i) => (
          <li key={i.label}>
            <Link
              href={i.href}
              target={i.external ? "_blank" : undefined}
              rel={i.external ? "noreferrer" : undefined}
              className="text-[13.5px] text-ink hover:underline"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
