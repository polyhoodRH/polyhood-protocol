"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { chain } from "@/config/chain";
import {
  checksum,
  ensureChain,
  formatBalance,
  rpc,
  watchWallets,
  wallets,
  type Eip1193Provider,
  type WalletDetail,
} from "@/lib/wallet";

export type LogLine = { at: string; text: string; tone?: "ok" | "bad" };

/** Wallet terakhir yang dipakai, supaya sambungan bertahan setelah refresh.
 *  Yang disimpan cuma rdns-nya — bukan alamat, bukan apa pun yang rahasia. */
const REMEMBER_KEY = "polyhood:wallet";

type WalletState = {
  available: WalletDetail[];
  account: string | null;
  balance: string | null;
  chainId: string | null;
  onChain: boolean;
  connected: boolean;
  picking: boolean;
  busy: boolean;
  log: LogLine[];
  notice: string | null;
  dismissNotice: () => void;
  clearLog: () => void;
  open: () => void;
  connect: (detail: WalletDetail) => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
  dismiss: () => void;
};

const Ctx = createContext<WalletState | null>(null);

export function useWallet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [available, setAvailable] = useState<WalletDetail[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const provider = useRef<Eip1193Provider | null>(null);
  /** Pelepas listener wallet sebelumnya. Tanpa ini, ganti wallet menumpuk
   *  handler dan satu peristiwa terproses berkali-kali. */
  const detach = useRef<(() => void) | null>(null);
  const restored = useRef(false);

  const say = useCallback((text: string, tone?: "ok" | "bad") => {
    const at = new Date().toTimeString().slice(0, 8);
    setLog((prev) => [...prev.slice(-40), { at, text, tone }]);
  }, []);

  const refreshBalance = useCallback(async (addr: string) => {
    try {
      const wei = (await rpc("eth_getBalance", [addr, "latest"])) as string;
      setBalance(formatBalance(wei));
    } catch {
      setBalance(null);
    }
  }, []);

  const clear = useCallback(() => {
    detach.current?.();
    detach.current = null;
    provider.current = null;
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setPicking(false);
    try {
      window.localStorage.removeItem(REMEMBER_KEY);
    } catch {
      /* mode privat: abaikan */
    }
  }, []);

  /** Pasang listener wallet dan simpan cara melepasnya. */
  const attach = useCallback(
    (p: Eip1193Provider) => {
      detach.current?.();

      const onAccounts = async (next: string[]) => {
        if (!next?.length) {
          clear();
          say("wallet disconnected", "bad");
          return;
        }
        const swapped = await checksum(next[0]);
        setAccount(swapped);
        say(`account switched to ${swapped}`);
        void refreshBalance(swapped);
      };

      const onChainChanged = (id: string) => {
        setChainId(id);
        const right = id?.toLowerCase() === chain.idHex.toLowerCase();
        say(
          right ? `back on ${chain.name}` : `wrong network (${id}) — switch to ${chain.name}`,
          right ? "ok" : "bad",
        );
      };

      p.on?.("accountsChanged", onAccounts as never);
      p.on?.("chainChanged", onChainChanged as never);

      detach.current = () => {
        p.removeListener?.("accountsChanged", onAccounts as never);
        p.removeListener?.("chainChanged", onChainChanged as never);
      };
    },
    [clear, refreshBalance, say],
  );

  useEffect(() => {
    const stop = watchWallets(() => setAvailable(wallets()));
    setAvailable(wallets());
    return stop;
  }, []);

  /** Sambung ulang diam-diam setelah refresh: `eth_accounts` tidak memunculkan
   *  popup, jadi hanya berhasil kalau izinnya memang masih berlaku. */
  useEffect(() => {
    if (restored.current || available.length === 0) return;

    let remembered: string | null = null;
    try {
      remembered = window.localStorage.getItem(REMEMBER_KEY);
    } catch {
      return;
    }
    if (!remembered) return;

    const match = available.find((d) => d.info.rdns === remembered);
    if (!match) return;
    restored.current = true;

    (async () => {
      try {
        const accounts = (await match.provider.request({ method: "eth_accounts" })) as string[];
        if (!accounts?.length) return;
        const addr = await checksum(accounts[0]);
        const id = (await match.provider.request({ method: "eth_chainId" })) as string;

        provider.current = match.provider;
        attach(match.provider);
        setAccount(addr);
        setChainId(id);
        say(`reconnected ${addr} via ${match.info.name}`, "ok");
        void refreshBalance(addr);
      } catch {
        /* izin sudah dicabut; biarkan terputus */
      }
    })();
  }, [available, attach, refreshBalance, say]);

  const connect = useCallback(
    async (detail: WalletDetail) => {
      setBusy(true);
      say(`connecting via ${detail.info.name}…`);
      try {
        const accounts = (await detail.provider.request({
          method: "eth_requestAccounts",
        })) as string[];
        if (!accounts?.length) throw new Error("No account was returned.");

        const addr = await checksum(accounts[0]);
        provider.current = detail.provider;
        attach(detail.provider);
        setAccount(addr);
        setPicking(false);

        try {
          window.localStorage.setItem(REMEMBER_KEY, detail.info.rdns);
        } catch {
          /* mode privat: sambungan tetap jalan, cuma tidak diingat */
        }

        await ensureChain(detail.provider);
        const id = (await detail.provider.request({ method: "eth_chainId" })) as string;
        setChainId(id);

        say(`connected ${addr} on ${chain.name}`, "ok");
        await refreshBalance(addr);
      } catch (err) {
        const code = (err as { code?: number })?.code;
        const message =
          code === 4001
            ? "connection rejected in the wallet"
            : (err as Error)?.message || "could not connect";
        say(message, "bad");
        // Alamat mungkin sudah didapat sebelum pindah jaringan gagal —
        // biarkan tersambung supaya tombol "Switch network" bisa dipakai.
        if (!provider.current) clear();
      } finally {
        setBusy(false);
      }
    },
    [attach, clear, refreshBalance, say],
  );

  const switchNetwork = useCallback(async () => {
    const p = provider.current;
    if (!p) return;
    setBusy(true);
    try {
      await ensureChain(p);
      const id = (await p.request({ method: "eth_chainId" })) as string;
      setChainId(id);
      say(`switched to ${chain.name}`, "ok");
      if (account) void refreshBalance(account);
    } catch (err) {
      const code = (err as { code?: number })?.code;
      say(
        code === 4001 ? "network switch rejected in the wallet" : "could not switch network",
        "bad",
      );
    } finally {
      setBusy(false);
    }
  }, [account, refreshBalance, say]);

  const open = useCallback(() => {
    if (available.length === 1) {
      void connect(available[0]);
      return;
    }
    setPicking(true);
    if (available.length === 0) say("no EVM wallet detected in this browser", "bad");
  }, [available, connect, say]);

  const disconnect = useCallback(async () => {
    const p = provider.current;
    clear();
    restored.current = true;

    // `wallet_revokePermissions` belum ada di banyak wallet (Phantom salah
    // satunya). Kalau gagal, izinnya tetap tersimpan di wallet — dan itu harus
    // dikatakan apa adanya, bukan didiamkan seolah sudah tercabut.
    let revoked = false;
    try {
      await p?.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
      revoked = true;
    } catch {
      revoked = false;
    }

    if (revoked) {
      setNotice(null);
      say("disconnected and permission revoked", "ok");
    } else {
      setNotice(
        "Disconnected here, but your wallet still lists this site as connected — that is why reconnecting asks for no confirmation. To revoke it fully, remove this site under connected sites in your wallet's settings.",
      );
      say("disconnected locally; the wallet still trusts this site", "bad");
    }
  }, [clear, say]);

  const onChain = chainId?.toLowerCase() === chain.idHex.toLowerCase();

  return (
    <Ctx.Provider
      value={{
        available,
        account,
        balance,
        chainId,
        onChain,
        connected: Boolean(account),
        picking,
        busy,
        log,
        notice,
        dismissNotice: () => setNotice(null),
        clearLog: () => setLog([]),
        open,
        connect,
        disconnect,
        switchNetwork,
        dismiss: () => setPicking(false),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
