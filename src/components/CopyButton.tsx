"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

/** Tombol salin. Kalau clipboard ditolak browser, tombolnya mengatakan gagal
 *  alih-alih memperagakan centang untuk teks yang tidak pernah tersalin. */
export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [state, setState] = useState<"idle" | "ok" | "bad">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 1600);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <button
      type="button"
      className="btn btn-line h-8 shrink-0 px-3 text-[12.5px]"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setState("ok");
        } catch {
          setState("bad");
        }
      }}
    >
      {state === "ok" ? <CheckIcon className="h-3.5 w-3.5 text-yes" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {state === "ok" ? "Copied" : state === "bad" ? "Blocked" : label}
    </button>
  );
}
