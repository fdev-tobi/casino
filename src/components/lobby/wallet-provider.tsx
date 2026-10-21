"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type WalletContextValue = {
  walletOpen: boolean;
  openWallet: () => void;
  setWalletOpen: (open: boolean) => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletOpen, setWalletOpen] = useState(false);
  const openWallet = useCallback(() => setWalletOpen(true), []);
  const value = useMemo(
    () => ({ walletOpen, openWallet, setWalletOpen }),
    [walletOpen, openWallet],
  );
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
