import { brand } from "@/config/brand";

export function StatusBanner() {
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="w-full rounded-lg border border-primary bg-primary/10 p-4">
        <div className="text-lg font-semibold text-primary">
          All {brand.name.toUpperCase()} systems are online! Deposit & Withdraw now!
        </div>
        <p className="font-medium text-primary/80">
          Thank you for your patience & support! Join the lobby and play.
        </p>
      </div>
    </div>
  );
}
