import { brand } from "@/config/brand";

export function StatusBanner() {
  return (
    <div className="border-b border-primary/40 bg-primary/10 px-4 py-2.5 text-center text-sm">
      <p className="font-semibold text-primary">
        All {brand.name} systems are online · Demo mode only
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
        No deposits, withdrawals, or live wagers. Values are mock demonstration data.
      </p>
    </div>
  );
}
