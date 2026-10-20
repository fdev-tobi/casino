export function formatValue(amount: number): string {
  if (amount >= 1000) {
    const compact = amount / 1000;
    return `${compact % 1 === 0 ? compact.toFixed(0) : compact.toFixed(2)}K`;
  }
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function formatRange(min: number, max: number): string {
  return `${formatValue(min)} - ${formatValue(max)}`;
}

export function formatClock(totalSeconds: number): { d: string; h: string; m: string; s: string } {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { d: pad(days), h: pad(hours), m: pad(minutes), s: pad(seconds) };
}
