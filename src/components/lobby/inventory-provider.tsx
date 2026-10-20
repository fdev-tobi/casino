"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/components/lobby/auth-provider";
import { catalogItems, initialDepositedInventory } from "@/lib/mock-data";
import type { DemoItem } from "@/types/lobby";

type InventoryContextValue = {
  items: DemoItem[];
  ready: boolean;
  deposit: (item: DemoItem) => void;
  depositMany: (items: readonly DemoItem[]) => void;
  removeByIds: (ids: readonly string[]) => void;
  catalog: readonly DemoItem[];
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

function storageKey(username: string) {
  // v2: empty default inventory (clears older demo-stocked inventories).
  return `adoptluck-inventory-v2:${username.toLowerCase()}`;
}

function makeInstance(item: DemoItem, salt: string): DemoItem {
  return {
    ...item,
    id: `${item.id}#${salt}`,
  };
}

function cloneItems(items: readonly DemoItem[]): DemoItem[] {
  const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return items.map((item, index) => makeInstance(item, `${stamp}-${index}`));
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<DemoItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setReady(true);
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey(user.username));
      if (raw) {
        const parsed = JSON.parse(raw) as DemoItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
          setReady(true);
          return;
        }
      }
    } catch {
      // ignore
    }

    const starter = cloneItems(initialDepositedInventory);
    setItems(starter);
    window.localStorage.setItem(storageKey(user.username), JSON.stringify(starter));
    setReady(true);
  }, [user]);

  const deposit = useCallback(
    (item: DemoItem) => {
      setItems((prev) => {
        const next = [makeInstance(item, `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`), ...prev];
        if (user) {
          window.localStorage.setItem(storageKey(user.username), JSON.stringify(next));
        }
        return next;
      });
    },
    [user],
  );

  const depositMany = useCallback(
    (incoming: readonly DemoItem[]) => {
      setItems((prev) => {
        const next = [...cloneItems(incoming), ...prev];
        if (user) {
          window.localStorage.setItem(storageKey(user.username), JSON.stringify(next));
        }
        return next;
      });
    },
    [user],
  );

  const removeByIds = useCallback(
    (ids: readonly string[]) => {
      const remove = new Set(ids);
      setItems((prev) => {
        const next = prev.filter((item) => !remove.has(item.id));
        if (user) {
          window.localStorage.setItem(storageKey(user.username), JSON.stringify(next));
        }
        return next;
      });
    },
    [user],
  );

  const value = useMemo(
    () => ({
      items,
      ready,
      deposit,
      depositMany,
      removeByIds,
      catalog: catalogItems,
    }),
    [items, ready, deposit, depositMany, removeByIds],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return ctx;
}
