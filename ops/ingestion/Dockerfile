FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY apps/ingestion ./apps/ingestion
COPY apps/shared ./apps/shared

CMD ["npm", "run", "worker"]
