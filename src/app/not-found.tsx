import Link from "next/link";
import { brand } from "@/config/brand";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="num text-[13px] text-brand">404</p>
      <h1 className="mt-2 text-[26px] font-semibold tracking-tight">No market at that address</h1>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-2">
        The page you asked for is not part of {brand.name}. It may have settled and been archived,
        or the link may simply be wrong.
      </p>
      <Link href="/" className="btn btn-brand mt-5">
        Back to the board
      </Link>
    </div>
  );
}
