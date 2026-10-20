import { NextResponse } from "next/server";

import { getValueProvider } from "@/lib/integrations/value-provider";

/**
 * Public read API for DISPLAY-ONLY valuations.
 * Do not use these amounts to settle balances or wagers.
 */
export async function GET() {
  const provider = getValueProvider();
  const result = await provider.getDisplayCatalog();

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        purpose: "display_only",
      },
      { status: result.error.code === "not_found" ? 404 : 503 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      purpose: "display_only",
      catalog: result.data,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
