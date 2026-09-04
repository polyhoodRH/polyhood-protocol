"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brand, nav } from "@/config/brand";
import { categories } from "@/lib/markets";
import { WalletButton } from "@/components/WalletButton";
import {
  BoltIcon,
  ChevronRight,
  CloseIcon,
  Logo,
  MenuIcon,
  SearchIcon,
  TrendIcon,
} from "@/components/icons";

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
      <div className="shell flex h-14 items-center gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={brand.name}>
          <Logo className="h-6 w-auto" />
          <span className="text-[17px] font-semibold tracking-tight">{brand.name}</span>
        </Link>

        <form
          className="relative hidden min-w-0 flex-1 md:block"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            placeholder="Search markets"
            aria-label="Search markets"
            className="h-9 w-full rounded-lg bg-surface pl-9 pr-9 text-[14px] text-ink outline-none placeholder:text-ink-3 focus:ring-1 focus:ring-line-strong"
          />
          <kbd className="num pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-3">
            /
          </kbd>
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = item.href === path;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`btn btn-ghost h-8 px-3 text-[13px] ${active ? "text-ink" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <WalletButton />
          <button
            type="button"
            className="btn btn-ghost h-9 px-2 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Rel kategori. Menggulir mendatar di layar sempit alih-alih membungkus
       *  jadi dua baris — dua baris membuat tinggi header goyang saat navigasi. */}
      <div className="shell rail flex h-11 items-center gap-1 border-t border-line/60">
        <RailLink href="/" icon={<TrendIcon className="h-4 w-4" />} label="Trending" active={path === "/"} />
        <RailLink href="/?c=Live" icon={<BoltIcon className="h-4 w-4" />} label="Live" />
        <span className="mx-1 h-4 w-px shrink-0 bg-line" aria-hidden="true" />
        {categories.map((c) => (
          <RailLink key={c} href={`/?c=${c}`} label={c} />
        ))}
        <ChevronRight className="ml-1 h-4 w-4 shrink-0 text-ink-3" />
      </div>

      {open ? (
        <div className="border-t border-line bg-bg-raised lg:hidden">
          <div className="shell flex flex-col py-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-2.5 text-[14px] text-ink-2"
              >
                {item.label}
                <ChevronRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function RailLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors ${
        active ? "font-medium text-ink" : "text-ink-2 hover:text-ink"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
