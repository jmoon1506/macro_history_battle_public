# Macro History Battle

A web app that ranks historical polities (civilizations, empires, nations) using Elo ratings across two dimensions:

- **Quality of Life** — How well did people actually live?
- **Darwinian Fitness** — How successful was the polity at surviving and expanding?

Polities are matched in head-to-head "duels" on specific topics, evaluated by an LLM judge, and ranked on a live leaderboard. Each duel record includes the full reasoning behind the verdict.

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router (hash routing for static hosting)

## Data

Leaderboard and duel data are fetched at runtime from public GitHub Gists.
