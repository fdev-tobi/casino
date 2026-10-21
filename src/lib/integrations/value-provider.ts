import "server-only";

/**
 * Value-system boundary.
 *
 * Current product mode: DISPLAY ONLY.
 * Valuations may be shown in the UI; they must not settle deposits, withdrawals,
 * buys, sells, or wagers until a later stage explicitly enables settlement.
 */
export type ProviderResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: "unavailable" | "upstream_error" | "not_found"; message: string } };

export type ItemValuation = {
  externalId: string;
  name: string | null;
  amount: number | null;
  rarity: string | null;
  imageUrl: string | null;
  unitLabel: string;
  asOf: string | null;
  disclaimer: string;
  /** Always true for the current stage — keeps settlement callers honest later. */
  displayOnly: true;
};

export type DisplayCatalog = {
  providerId: string;
  sourceLabel: string;
  sourceUrl: string | null;
  unitLabel: string;
  asOf: string | null;
  disclaimer: string;
  items: ItemValuation[];
};

export interface ValueProvider {
  readonly id: string;
  /** Display-only lookup by catalog / external id. */
  getItemValuation(externalId: string): Promise<ProviderResult<ItemValuation>>;
  /** Full display catalog for lobby grids and attribution. */
  getDisplayCatalog(): Promise<ProviderResult<DisplayCatalog>>;
}

type SnapshotFile = {
  providerId: string;
  sourceLabel: string;
  sourceUrl?: string;
  unitLabel: string;
  asOf: string | null;
  disclaimer: string;
  items: Array<{
    id: string;
    name: string;
    amount: number;
    rarity?: string | null;
    imageUrl?: string | null;
  }>;
};

const DISPLAY_DISCLAIMER =
  "Display only. Not used for deposits, withdrawals, buys, sells, or wagers.";

async function loadSnapshot(): Promise<SnapshotFile> {
  const mod = await import("@/data/display-values.snapshot.json");
  return mod.default as SnapshotFile;
}


function toValuation(
  item: {
    id: string;
    name: string;
    amount: number;
    rarity?: string | null;
    imageUrl?: string | null;
  },
  meta: Pick<SnapshotFile, "unitLabel" | "asOf" | "disclaimer">,
): ItemValuation {
  return {
    externalId: item.id,
    name: item.name,
    amount: item.amount,
    rarity: item.rarity ?? null,
    imageUrl: item.imageUrl ?? null,
    unitLabel: meta.unitLabel,
    asOf: meta.asOf,
    disclaimer: meta.disclaimer || DISPLAY_DISCLAIMER,
    displayOnly: true,
  };
}

/**
 * Local snapshot provider shaped for an Elvebredd-style display list.
 * Optional ELVEBREDD_DISPLAY_FEED_URL replaces the snapshot when set to an
 * authorized JSON feed (same shape as the snapshot file).
 */
const displayProvider: ValueProvider = {
  id: "elvebredd-display",
  async getDisplayCatalog() {
    try {
      const feedUrl = process.env.ELVEBREDD_DISPLAY_FEED_URL?.trim();
      let snapshot: SnapshotFile;

      if (feedUrl) {
        const response = await fetch(feedUrl, {
          headers: { Accept: "application/json" },
          next: { revalidate: 300 },
        });
        if (!response.ok) {
          return {
            ok: false as const,
            error: {
              code: "upstream_error" as const,
              message: `Display feed returned ${response.status}.`,
            },
          };
        }
        snapshot = (await response.json()) as SnapshotFile;
      } else {
        snapshot = await loadSnapshot();
      }

      const items = snapshot.items.map((item) => toValuation(item, snapshot));
      return {
        ok: true as const,
        data: {
          providerId: snapshot.providerId || "elvebredd-display",
          sourceLabel: snapshot.sourceLabel || "Display value catalog",
          sourceUrl: snapshot.sourceUrl ?? "https://amverse.co/values",
          unitLabel: snapshot.unitLabel || "value",
          asOf: snapshot.asOf,
          disclaimer: snapshot.disclaimer || DISPLAY_DISCLAIMER,
          items,
        },
      };
    } catch {
      return {
        ok: false as const,
        error: {
          code: "unavailable" as const,
          message: "Display value catalog could not be loaded.",
        },
      };
    }
  },
  async getItemValuation(externalId: string) {
    const catalog = await this.getDisplayCatalog();
    if (!catalog.ok) {
      return catalog;
    }
    const hit = catalog.data.items.find((item) => item.externalId === externalId);
    if (!hit) {
      return {
        ok: false as const,
        error: { code: "not_found" as const, message: `No display value for ${externalId}.` },
      };
    }
    return { ok: true as const, data: hit };
  },
};

const mockProvider: ValueProvider = {
  id: "mock",
  async getItemValuation() {
    return {
      ok: true,
      data: {
        externalId: "mock",
        name: null,
        amount: null,
        rarity: null,
        imageUrl: null,
        unitLabel: "demo units",
        asOf: null,
        disclaimer: DISPLAY_DISCLAIMER,
        displayOnly: true,
      },
    };
  },
  async getDisplayCatalog() {
    return {
      ok: true,
      data: {
        providerId: "mock",
        sourceLabel: "Mock display catalog",
        sourceUrl: null,
        unitLabel: "demo units",
        asOf: null,
        disclaimer: DISPLAY_DISCLAIMER,
        items: [],
      },
    };
  },
};

export function getValueProvider(): ValueProvider {
  const mode = process.env.VALUE_PROVIDER?.trim().toLowerCase();
  if (mode === "mock") {
    return mockProvider;
  }
  // Default: display catalog (snapshot or authorized feed).
  return displayProvider;
}
