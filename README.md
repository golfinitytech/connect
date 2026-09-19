# Golfinity Connect

Monorepo for the Golfinity Connect mobile app and backend.

## Stack

- `apps/mobile`: React Native (Expo + TypeScript)
- `apps/api`: NestJS + Prisma
- Database: MySQL 8
- Cache/realtime support: Redis

## Requirements

- Node.js `>= 20.19.4`
- npm `>= 10`
- Docker (for MySQL + Redis)

If Node is not preinstalled, a local runtime can be used:

```bash
export PATH="/home/smartdigital/.local/node/bin:$PATH"
```

## Project Structure

- `apps/mobile`: mobile client scaffold with tab navigation and core screens
- `apps/api`: backend scaffold with Prisma schema and seed script
- `packages/types`: shared domain types
- `packages/ui-tokens`: shared design tokens

## Quick Start

1. Copy API env file:

```bash
cp apps/api/.env.example apps/api/.env
```

Create mobile env file:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

2. Start infra:

```bash
docker compose up -d
```

3. Install dependencies (already done in this environment):

```bash
npm install
```

4. Generate Prisma client and run migration:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

5. Seed sample data:

```bash
npm -w apps/api run prisma:seed
```

6. Run backend:

```bash
npm run dev:api
```

7. Run mobile app:

```bash
npm run dev:mobile
```

Optional web preview:

```bash
CI=1 npm -w apps/mobile run web
```

Note: web preview may fail in headless Linux environments missing GUI system libraries required by React Native DevTools. Mobile build files are still generated correctly.

## API Endpoints (MVP)

- `GET /api` health
- `GET /api/db-health` database health
- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/rounds`
- `GET /api/rounds/:id`
- `PUT /api/rounds/:id/holes/:holeNumber`
- `PATCH /api/rounds/:id/finish`
- `GET /api/menu?category=Drinks`
- `POST /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `GET /api/leaderboard/live`

Swagger docs available at `http://localhost:3000/api/docs`.

## Next Build Steps

1. Add auth and user sessions.
2. Add websocket gateway for live leaderboard and order updates.
3. Connect mobile screens to API via React Query.
4. Implement full round flow and scoring forms matching design files.
5. Add tests for rounds/orders services.

## Current Mobile Flows

- Home now navigates to New Round setup.
- New Round flow includes:
  - course search and selection
  - tee box selection
  - game mode selection
  - continue to player selection
- Player Selection flow includes:
  - user search
  - up to 4 flight members
  - start round API call
- Round Scoring flow includes:
  - per-hole strokes + putts input
  - fairway hit + GIR capture
  - next/previous hole navigation
  - save hole score API call
- Scorecard flow includes:
  - per-hole matrix by player
  - front/back/total summaries
  - finish round API call
- Round Summary screen implemented with key metrics + reorder CTA
- Order Status screen implemented with timeline progression + summary
- Hole Map screen implemented with 2D/3D toggle placeholder + return to score

## Development Seed Data

Seed now includes full demo data matching design scenarios:

- 6 users with avatars
- 3 courses with hero images and full 18-hole setup each
- 2 events with imagery
- 7 F&B menu items across drinks/snacks/meals with images
- multiple rounds (finished + in-progress)
- hole-by-hole score data for scorecard/summary
- 2 orders with status timeline logs

After changing schema:

```bash
npm -w apps/api run prisma:migrate -- --name <migration_name>
npm -w apps/api run prisma:seed
```
# golfinity-connect
