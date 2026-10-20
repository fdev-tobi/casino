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

export type DisplayValueItem = {
  externalId: string;
  name: string | null;
  amount: number | null;
  rarity: string | null;
  imageUrl: string | null;
};

export type DisplayCatalogState = {
  ready: boolean;
  providerId: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
  unitLabel: string;
  asOf: string | null;
  disclaimer: string;
  byId: Map<string, DisplayValueItem>;
  items: DisplayValueItem[];
  getAmount: (externalId: string | undefined, fallback?: number) => number;
  getItem: (externalId: string | undefined) => DisplayValueItem | undefined;
  sumAmounts: (entries: Array<{ id?: string; value: number }>) => number;
};

const DEFAULT_DISCLAIMER =
  "Display only. Not used for deposits, withdrawals, buys, sells, or wagers.";

const DisplayValuesContext = createContext<DisplayCatalogState | null>(null);

export function DisplayValuesProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [unitLabel, setUnitLabel] = useState("value");
  const [asOf, setAsOf] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER);
  const [items, setItems] = useState<DisplayValueItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/display-values", { cache: "no-store" });
        const json = (await response.json()) as {
          ok: boolean;
          catalog?: {
            providerId: string;
            sourceLabel: string;
            sourceUrl: string | null;
            unitLabel: string;
            asOf: string | null;
            disclaimer: string;
            items: Array<{
              externalId: string;
              name: string | null;
              amount: number | null;
              rarity?: string | null;
              imageUrl?: string | null;
            }>;
          };
        };
        if (cancelled || !json.ok || !json.catalog) {
          if (!cancelled) setReady(true);
          return;
        }
        setProviderId(json.catalog.providerId);
        setSourceLabel(json.catalog.sourceLabel);
        setSourceUrl(json.catalog.sourceUrl);
        setUnitLabel(json.catalog.unitLabel);
        setAsOf(json.catalog.asOf);
        setDisclaimer(json.catalog.disclaimer || DEFAULT_DISCLAIMER);
        setItems(
          json.catalog.items.map((item) => ({
            externalId: item.externalId,
            name: item.name,
            amount: item.amount,
            rarity: item.rarity ?? null,
            imageUrl: item.imageUrl ?? null,
          })),
        );
      } catch {
        // Fall back to embedded mock amounts via getAmount fallbacks.
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = useMemo(() => {
    const map = new Map<string, DisplayValueItem>();
    for (const item of items) {
      map.set(item.externalId, item);
    }
    return map;
  }, [items]);

  const getAmount = useCallback(
    (externalId: string | undefined, fallback = 0) => {
      if (!externalId) return fallback;
      const amount = byId.get(externalId)?.amount;
      return typeof amount === "number" ? amount : fallback;
    },
    [byId],
  );

  const getItem = useCallback(
    (externalId: string | undefined) => {
      if (!externalId) return undefined;
      return byId.get(externalId);
    },
    [byId],
  );

  const sumAmounts = useCallback(
    (entries: Array<{ id?: string; value: number }>) =>
      entries.reduce((sum, entry) => sum + getAmount(entry.id, entry.value), 0),
    [getAmount],
  );

  const value = useMemo(
    () => ({
      ready,
      providerId,
      sourceLabel,
      sourceUrl,
      unitLabel,
      asOf,
      disclaimer,
      byId,
      items,
      getAmount,
      getItem,
      sumAmounts,
    }),
    [
      ready,
      providerId,
      sourceLabel,
      sourceUrl,
      unitLabel,
      asOf,
      disclaimer,
      byId,
      items,
      getAmount,
      getItem,
      sumAmounts,
    ],
  );

  return <DisplayValuesContext.Provider value={value}>{children}</DisplayValuesContext.Provider>;
}

export function useDisplayValues() {
  const ctx = useContext(DisplayValuesContext);
  if (!ctx) {
    throw new Error("useDisplayValues must be used within DisplayValuesProvider");
  }
  return ctx;
}
