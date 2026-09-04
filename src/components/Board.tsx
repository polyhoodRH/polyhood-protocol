"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { categories, events, isLive, type Category } from "@/lib/markets";
import { MarketCard } from "@/components/MarketCard";
import { BookmarkIcon, SearchIcon, SlidersIcon } from "@/components/icons";

type Filter = Category | "All" | "Live";

export function Board() {
  // Penyaring dibaca dari URL, jadi tautan kategori di header dan footer
  // benar-benar membuka papan yang tersaring — bukan anchor yang tidak ada.
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("c");
  const filter: Filter =
    raw === "Live" ? "Live" : (categories as string[]).includes(raw ?? "") ? (raw as Category) : "All";

  const [query, setQuery] = useState("");

  function setFilter(next: Filter) {
    router.replace(next === "All" ? "/" : `/?c=${encodeURIComponent(next)}`, { scroll: false });
  }

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (filter === "Live" && !isLive(e)) return false;
      if (filter !== "All" && filter !== "Live" && e.category !== filter) return false;
      if (!q) return true;
      // Cari juga di label tiap baris: "Cut 25 bps" ada di market, bukan di
      // judul event, dan orang mengetiknya untuk mencari event itu.
      return (
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.markets.some((m) => m.groupItemTitle.toLowerCase().includes(q))
      );
    });
  }, [filter, query]);

  // Kategori yang tidak punya satu pun pasar di seed ini tidak ditampilkan
  // sebagai pil — pil yang selalu memberi hasil kosong hanya bikin ragu.
  const live = useMemo(
    () => categories.filter((c) => events.some((e) => e.category === c)),
    [],
  );

  return (
    <section id="markets" className="mt-6">
      <div className="flex items-center gap-3">
        <h2 className="text-[18px] font-semibold tracking-tight">All markets</h2>
        <div className="ml-auto flex items-center gap-1">
          <label className="relative hidden sm:block">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter"
              aria-label="Filter markets"
              className="h-8 w-40 rounded-lg bg-surface pl-8 pr-2 text-[13px] outline-none placeholder:text-ink-3 focus:w-56 focus:ring-1 focus:ring-line-strong"
              style={{ transition: "width 0.18s ease" }}
            />
          </label>
          <button type="button" className="btn btn-ghost h-8 px-2" aria-label="Sort and filter">
            <SlidersIcon className="h-4 w-4" />
          </button>
          <button type="button" className="btn btn-ghost h-8 px-2" aria-label="Saved markets">
            <BookmarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rail mt-3 flex items-center gap-1.5 pb-1">
        <Pill label="All" on={filter === "All"} onClick={() => setFilter("All")} />
        <Pill label="Live" on={filter === "Live"} onClick={() => setFilter("Live")} />
        {live.map((c) => (
          <Pill key={c} label={c} on={filter === c} onClick={() => setFilter(c)} />
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="card mt-4 p-8 text-center text-[13.5px] text-ink-2">
          No market matches that. Clear the filter to see the whole board.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((e) => (
            <MarketCard key={e.slug} event={e} />
          ))}
        </div>
      )}
    </section>
  );
}

function Pill({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`pill shrink-0 ${on ? "pill-on" : ""}`} aria-pressed={on}>
      {label}
    </button>
  );
}
