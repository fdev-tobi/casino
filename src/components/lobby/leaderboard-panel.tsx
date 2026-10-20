import { Avatar } from "@/components/lobby/avatar";
import { ValueGem } from "@/components/lobby/value-gem";
import { leaderboard } from "@/lib/mock-data";

export function LeaderboardPanel() {
  return (
    <div className="flex w-full flex-col gap-3 px-4 pt-3 pb-32">
      <div>
        <h1 className="text-xl font-semibold">Leaderboard</h1>
        <p className="mt-1 text-sm text-white/50">
          Illustrative standings for the presentation lobby. Wins and profit are mock figures.
        </p>
      </div>
      <section className="overflow-hidden rounded border bg-card">
        <div className="grid grid-cols-[3rem_1fr_5rem_6rem] gap-2 border-b px-4 py-2 text-xs font-semibold tracking-wide uppercase text-white/50 sm:grid-cols-[3rem_1fr_6rem_7rem]">
          <span>#</span>
          <span>Player</span>
          <span className="text-right">Wins</span>
          <span className="text-right">Profit</span>
        </div>
        <ul>
          {leaderboard.map((row) => (
            <li
              key={row.player.id}
              className="grid grid-cols-[3rem_1fr_5rem_6rem] items-center gap-2 border-b border-border px-4 py-2 last:border-b-0 sm:grid-cols-[3rem_1fr_6rem_7rem]"
            >
              <span className="text-sm text-primary">#{row.rank}</span>
              <span className="flex min-w-0 items-center gap-2">
                <Avatar player={row.player} size="sm" />
                <span className="truncate text-sm font-medium">{row.player.name}</span>
              </span>
              <span className="text-right text-sm tabular-nums">{row.wins}</span>
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
