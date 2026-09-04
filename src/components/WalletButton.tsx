"use client";

import { useEffect, useState } from "react";
import { chain } from "@/config/chain";
import { useWallet } from "@/components/WalletProvider";
import { short } from "@/lib/wallet";
import { CloseIcon, WalletIcon } from "@/components/icons";

/** Tombol sambung di header, plus lembar pemilih wallet.
 *  Sesi wallet di sini hanya identitas — tidak ada dana yang berpindah. */
export function WalletButton() {
  const w = useWallet();
  const [menu, setMenu] = useState(false);

  // Tutup menu akun begitu sambungan putus, supaya tidak ada panel
  // menggantung yang menunjuk alamat yang sudah tidak ada.
  useEffect(() => {
    if (!w.connected) setMenu(false);
  }, [w.connected]);

  if (!w.connected) {
    return (
      <>
        <button type="button" onClick={w.open} className="btn btn-brand" disabled={w.busy}>
          <WalletIcon className="h-4 w-4" />
          {w.busy ? "Connecting…" : "Connect"}
        </button>
        {w.picking ? <Picker /> : null}
      </>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenu((v) => !v)}
        className="btn btn-line num text-[13px]"
        aria-expanded={menu}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: w.onChain ? "var(--yes)" : "var(--no)" }}
        />
        {short(w.account ?? "", 6)}
      </button>

      {menu ? (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-line-strong bg-surface p-3 shadow-2xl shadow-black/50">
          <p className="text-[11px] uppercase tracking-wider text-ink-3">Account</p>
          <p className="num mt-1 break-all text-[12px] text-ink">{w.account}</p>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-[12px]">
            <span className="text-ink-2">Balance</span>
            <span className="num text-ink">
              {w.balance ? `${w.balance} ${chain.currency.symbol}` : "—"}
            </span>
          </div>

          {!w.onChain ? (
            <button type="button" onClick={w.switchNetwork} className="btn btn-brand mt-3 w-full" disabled={w.busy}>
              Switch to {chain.name}
            </button>
          ) : (
            <p className="mt-3 text-[12px] text-ink-2">Connected on {chain.name}.</p>
          )}

          <button
            type="button"
            onClick={() => {
              void w.disconnect();
            }}
            className="btn btn-line mt-2 w-full"
          >
            Disconnect
          </button>

          {w.notice ? (
            <p className="mt-2 text-[11px] leading-relaxed text-ink-3">{w.notice}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Picker() {
  const w = useWallet();
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl border border-line-strong bg-surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Connect a wallet</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-2">
              Signing in proves the address is yours. It moves nothing and approves no spending.
            </p>
          </div>
          <button type="button" onClick={w.dismiss} className="btn btn-ghost h-8 px-2" aria-label="Close">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {w.available.length === 0 ? (
            <p className="rounded-lg bg-surface-2 px-3 py-4 text-[13px] leading-relaxed text-ink-2">
              No EVM wallet announced itself in this browser. Install one, then reopen this panel —
              {" "}{chain.name} is added automatically on the first connection.
            </p>
          ) : (
            w.available.map((d) => (
              <button
                key={d.info.uuid}
                type="button"
                onClick={() => void w.connect(d)}
                disabled={w.busy}
                className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-left transition-colors hover:border-line-strong disabled:opacity-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.info.icon} alt="" className="h-6 w-6 rounded" />
                <span className="text-[14px] font-medium">{d.info.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
