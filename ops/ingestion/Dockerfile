FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY apps ./apps

CMD ["npm", "run", "worker"]
