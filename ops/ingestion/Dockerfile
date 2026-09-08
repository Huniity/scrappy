# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/ingestion/package.json apps/ingestion/package.json
COPY apps/shared/package.json apps/shared/package.json

RUN --mount=type=cache,id=scrappy-pnpm,target=/root/.local/share/pnpm/store \
    --mount=type=cache,id=scrappy-pnpm-metadata,target=/root/.cache/pnpm \
    pnpm install --frozen-lockfile --filter @scrappy/ingestion...

COPY apps/ingestion ./apps/ingestion
COPY apps/shared ./apps/shared

CMD ["pnpm", "--filter", "@scrappy/ingestion", "start"]
