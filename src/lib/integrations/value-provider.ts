import "server-only";

/**
 * Future value-system boundary. Stage-one lobby pages use local mock data only.
 * Do not invent provider endpoints or credentials until an authorized method exists.
 */
export type ProviderResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: "unavailable" | "upstream_error" | "not_found"; message: string } };

export type ItemValuation = {
  amount: number | null;
  unitLabel: string;
  asOf: string | null;
  disclaimer: string;
};

export interface ValueProvider {
  readonly id: string;
  getItemValuation(externalId: string): Promise<ProviderResult<ItemValuation>>;
}

const mockProvider: ValueProvider = {
  id: "mock",
  async getItemValuation() {
    return {
      ok: true,
      data: {
        amount: null,
        unitLabel: "demo units",
        asOf: null,
        disclaimer:
          "Demonstration figure from the mock value provider. It is not a verified price, trade value, or balance.",
      },
    };
  },
};

export function getValueProvider(): ValueProvider {
  return mockProvider;
}
