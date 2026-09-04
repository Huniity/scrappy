FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

# The scraper can fall back to Playwright for dynamic event pages.
RUN ./node_modules/.bin/playwright install --with-deps chromium

COPY apps ./apps

ENV NODE_ENV=production

CMD ["npm", "run", "scraper"]
