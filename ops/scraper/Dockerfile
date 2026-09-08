FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

# Crawlee uses `ps` to inspect the running process tree.
RUN apt-get update \
    && apt-get install -y --no-install-recommends procps \
    && rm -rf /var/lib/apt/lists/*

# The scraper can fall back to Playwright for dynamic event pages.
RUN ./node_modules/.bin/playwright install --with-deps --only-shell chromium

COPY apps/scraper ./apps/scraper
COPY apps/shared ./apps/shared
COPY apps/ingestion/queue.ts ./apps/ingestion/queue.ts

ENV NODE_ENV=production

CMD ["npm", "run", "scraper"]
