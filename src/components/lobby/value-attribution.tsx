"use client";

import { useDisplayValues } from "@/components/lobby/display-values-provider";

export function ValueAttribution() {
  const { ready, sourceLabel, sourceUrl, asOf, disclaimer } = useDisplayValues();

  if (!ready) {
    return null;
  }

  const asOfLabel = asOf
    ? new Date(asOf).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <div className="rounded border border-border bg-card/60 px-4 py-3 text-xs text-white/55">
      <p className="font-semibold text-white/75">
        Display values
        {sourceLabel ? (
          <>
            {" · "}
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                {sourceLabel}
              </a>
            ) : (
              sourceLabel
            )}
          </>
        ) : null}
        {asOfLabel ? ` · as of ${asOfLabel}` : null}
      </p>
      <p className="mt-1 leading-5">{disclaimer}</p>
    </div>
  );
}
