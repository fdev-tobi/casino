# Adopt Luck

Demonstration lobby inspired by the public feature structure of [chroma.gg](https://www.chroma.gg/), restyled with Adopt Luck branding.

This is a front-end prototype with mock data. It does not take payments, place wagers, move inventory, or connect to a live value service.

## Modes

- `/` — CoinFlip lobby (stats, Create, History, Join/View match list)
- `/jackpot` — JackPot wheel, timer, entries, Join
- `/upgrader` — Live wins, chance dial, item search/sort, Upgrade
- `/race` — Prize pool countdown and standings
- `/leaderboard` — Wins / profit table

Shared shell: logo header, status banner, Login placeholder, Games menu, Chat panel, legal links.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run typecheck
npm run build
```

No environment variables are required for this stage.

## Branding

- `src/config/brand.ts` — name, colors, theme tokens
- `public/brand/wordmark-transparent.png` — header/footer wordmark
- `public/brand/mark-transparent.png` — favicon mark

## Deploy on Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, import the project as Next.js.
3. Build command: `npm run build`. Install: `npm install`.
4. Leave env vars empty for this stage.
5. Deploy and confirm the URL in the Vercel dashboard before calling it live.

## Value system

See [docs/value-system-integration.md](docs/value-system-integration.md). The mock provider remains the only integration boundary for a later authorized connection.
