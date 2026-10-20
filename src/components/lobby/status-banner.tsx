import { brand } from "@/config/brand";

export function StatusBanner() {
  return (
    <div className="px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
      <div className="w-full rounded-lg border border-primary bg-primary/10 p-3 sm:p-4">
        <div className="text-sm font-semibold text-primary sm:text-lg">
          All {brand.name.toUpperCase()} systems are online! Deposit & Withdraw now!
        </div>
        <p className="mt-1 text-sm font-medium text-primary/80 sm:text-base">
          Thank you for your patience & support! Join the lobby and play.
        </p>
      </div>
    </div>
  );
}
