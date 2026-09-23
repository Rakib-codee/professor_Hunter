# Professor Hunter

Helps international students applying for master's/PhD programs in China (mainly CSC Type B) find suitable supervisors, draft a personalised acceptance-letter request email, and track replies. We never send email on anyone's behalf.

Internal planning docs (plan, backlog, product spec) are kept out of this repository.

## Stack

Next.js (App Router, TypeScript) · Tailwind + shadcn/ui · Supabase (Postgres, Auth, RLS) · Vercel · Vitest + Playwright · Zod.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase values; keep LLM_PROVIDER=mock locally
npm run dev
```

`.env.local` is gitignored. Never commit real keys.

## Scripts

| Command                                         | Purpose                                      |
| ----------------------------------------------- | -------------------------------------------- |
| `npm run dev`                                   | Dev server                                   |
| `npm run check`                                 | lint + typecheck + format check + unit tests |
| `npm run test` / `test:watch` / `test:coverage` | Vitest                                       |
| `npm run format`                                | Prettier                                     |

## Data

`research_tags.json` at the repo root is tracked. `professor_hunter_dataset_v4.csv` (real professor emails, internal notes) is **not** committed — keep it locally at the repo root; the data of record is the Supabase `professors` table. Import rules live in `lib/import/`.
