import { Avatar } from "@/components/lobby/avatar";
import { ValueGem } from "@/components/lobby/value-gem";
import { leaderboard } from "@/lib/mock-data";

export function LeaderboardPanel() {
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Illustrative standings for the presentation lobby. Wins and profit are mock figures.
        </p>
      </div>
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[3rem_1fr_5rem_6rem] gap-2 border-b border-border px-4 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground sm:grid-cols-[3rem_1fr_6rem_7rem]">
          <span>#</span>
          <span>Player</span>
          <span className="text-right">Wins</span>
          <span className="text-right">Profit</span>
        </div>
        <ul>
          {leaderboard.map((row) => (
            <li
              key={row.player.id}
              className="grid grid-cols-[3rem_1fr_5rem_6rem] items-center gap-2 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[3rem_1fr_6rem_7rem]"
            >
              <span className="font-mono text-sm text-primary">#{row.rank}</span>
              <span className="flex min-w-0 items-center gap-2">
                <Avatar player={row.player} size="sm" />
                <span className="truncate text-sm font-semibold">{row.player.name}</span>
              </span>
              <span className="text-right font-mono text-sm">{row.wins}</span>
              <span className="text-right">
                <ValueGem amount={row.profit} className="justify-end" />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
