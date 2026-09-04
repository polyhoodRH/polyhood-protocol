/* Ikon garis 24×24, semuanya memakai `currentColor` supaya warnanya diatur
 * dari kelas induk. Logo Polyhood digambar sendiri di sini — kubah "hood"
 * dengan tiga batang naik di dalamnya: banyak hasil, satu yang menang. */

type P = { className?: string };

/** Mark Polyhood. Ini berkas gambar, bukan path inline: detail bulunya hilang
 *  kalau disederhanakan. Dipakai pada ukuran ≤ 32px, jadi `<img>` biasa —
 *  next/image merender kosong pada ikon sekecil ini. Aspeknya 433×512, maka
 *  pemanggil menentukan tinggi dan membiarkan lebarnya mengikuti. */
export function Logo({ className }: P) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo.webp" alt="" aria-hidden="true" className={className} />;
}

/** Mark Hoodlock, penyedia lock untuk project di Robinhood Chain. */
export function HoodlockMark({ className }: P) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/hoodlock-mark.webp" alt="" aria-hidden="true" className={className} />;
}

function stroke(d: string) {
  return function Icon({ className }: P) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
      </svg>
    );
  };
}

export const SearchIcon = stroke("M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M16.2 16.2 21 21");
export const ChevronRight = stroke("m9 5 7 7-7 7");
export const ChevronLeft = stroke("m15 5-7 7 7 7");
export const ChevronDown = stroke("m5 9 7 7 7-7");
export const BookmarkIcon = stroke("M6 4h12v17l-6-4-6 4z");
export const SlidersIcon = stroke("M4 7h9M17 7h3M4 17h3M11 17h9M15 4v6M7 14v6");
export const TrendIcon = stroke("m3 16 5-6 4 3 6-8M15 5h4v4");
export const FlameIcon = stroke("M12 3c3 4 6 5.5 6 9a6 6 0 0 1-12 0c0-2 1-3.2 2-4.5.4 1.6 1.2 2.3 2 2.5-.4-2.6 0-5.2 2-7");
export const WalletIcon = stroke("M3 8a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 12h3");
export const MenuIcon = stroke("M4 7h16M4 12h16M4 17h16");
export const CloseIcon = stroke("m6 6 12 12M18 6 6 18");
export const CheckIcon = stroke("m5 12 5 5 9-11");
export const CopyIcon = stroke("M9 9h10v10H9zM5 15V5h10");
export const LockIcon = stroke("M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3");
export const ShieldIcon = stroke("M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z");
export const ScaleIcon = stroke("M12 4v16M6 20h12M12 7 6 9l3 5 3-5zM12 7l6 2-3 5-3-5z");
export const BoltIcon = stroke("M13 3 5 14h6l-1 7 8-11h-6z");
export const ExternalIcon = stroke("M14 5h5v5M19 5l-8 8M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4");
export const ArrowUp = stroke("M12 19V6M6 11l6-6 6 6");
export const ArrowDown = stroke("M12 5v13M6 13l6 6 6-6");

export function XIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-6.07l-4.76-6.22L5.47 21H2.44l7.06-8.07L2.25 3h6.22l4.3 5.69zm-1.06 16.16h1.67L7.6 4.74H5.81z" />
    </svg>
  );
}

export function GithubIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 12 2" />
    </svg>
  );
}

export function DiscordIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M19.3 5.4A16 16 0 0 0 15.4 4l-.3.6a12 12 0 0 1 3.4 1.6 12.6 12.6 0 0 0-10.9 0A12 12 0 0 1 11 4.6L8.6 4a16 16 0 0 0-3.9 1.4C2.3 9 1.6 12.6 2 16.1a16 16 0 0 0 4.8 2.4l1-1.6a10 10 0 0 1-1.6-.8l.4-.3a11 11 0 0 0 9.4 0l.4.3a10 10 0 0 1-1.6.8l1 1.6a16 16 0 0 0 4.8-2.4c.4-4-.7-7.6-1.3-10.7M9 14c-.9 0-1.7-.9-1.7-2s.8-2 1.7-2 1.7.9 1.7 2-.8 2-1.7 2m6 0c-.9 0-1.7-.9-1.7-2s.8-2 1.7-2 1.7.9 1.7 2-.8 2-1.7 2" />
    </svg>
  );
}

/** Cincin peluang. Radius tetap 16 di viewBox 40, jadi kelilingnya 100.53 —
 *  strokeDasharray dihitung sekali di sini alih-alih ditebak di pemanggil. */
export function Gauge({ pct, size = 44, label }: { pct: number; size?: number; label?: string }) {
  // Label hanya muat kalau sangat pendek; yang lebih panjang dipotong jadi
  // penggalan kata dan lebih baik tidak ditampilkan sama sekali.
  const caption = label && label.length <= 7 ? label : undefined;
  const circumference = 2 * Math.PI * 16;
  const filled = (Math.min(100, Math.max(0, pct)) / 100) * circumference;
  const tone = pct >= 50 ? "var(--yes)" : "var(--no)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--surface-3)" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke={tone}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="num text-[12px] font-semibold text-ink">{pct}%</span>
        {caption ? <span className="mt-0.5 text-[8px] text-ink-3">{caption}</span> : null}
      </div>
    </div>
  );
}
