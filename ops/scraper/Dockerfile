# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/scraper/package.json apps/scraper/package.json
COPY apps/ingestion/package.json apps/ingestion/package.json
COPY apps/shared/package.json apps/shared/package.json

RUN --mount=type=cache,id=scrappy-pnpm,target=/root/.local/share/pnpm/store \
    --mount=type=cache,id=scrappy-pnpm-metadata,target=/root/.cache/pnpm \
    pnpm install --frozen-lockfile --filter @scrappy/scraper...

# Crawlee uses `ps` to inspect the running process tree.
RUN apt-get update \
    && apt-get install -y --no-install-recommends procps \
    && rm -rf /var/lib/apt/lists/*

# The scraper can fall back to Playwright for dynamic event pages.
RUN pnpm --filter @scrappy/scraper exec playwright install --with-deps --only-shell chromium

COPY apps/scraper ./apps/scraper
COPY apps/shared ./apps/shared
COPY apps/ingestion/queue.ts ./apps/ingestion/queue.ts

ENV NODE_ENV=production

CMD ["pnpm", "--filter", "@scrappy/scraper", "start"]
