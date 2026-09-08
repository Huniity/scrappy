setup:
	pnpm install
	docker compose -f docker/docker-compose.yml up -d

up:
	docker compose -f docker/docker-compose.yml up

rebuild-all:
	docker compose -f docker/docker-compose.yml up -d --build

rebuild-api:
	docker compose -f docker/docker-compose.yml up -d --build api

rebuild-worker:
	docker compose -f docker/docker-compose.yml up -d --build ingestion-worker

rebuild-next:
	docker compose -f docker/docker-compose.yml up -d --build next

rebuild-mongo:
	docker compose -f docker/docker-compose.yml up -d --build mongodb

rebuild-redis:
	docker compose -f docker/docker-compose.yml up -d --build redis

scraper:
	docker compose -f docker/docker-compose.yml --profile scheduled up -d --build

scheduler:
	docker compose -f docker/docker-compose.yml --profile scheduler up -d --build scheduler

scheduler-logs:
	docker compose -f docker/docker-compose.yml --profile scheduler logs -f scheduler

scraper-logs:
	docker compose -f docker/docker-compose.yml logs -f scraper

worker-logs:
	docker compose -f docker/docker-compose.yml logs -f ingestion-worker

web-logs:
	docker compose -f docker/docker-compose.yml logs -f next

mongo-logs:
	docker compose -f docker/docker-compose.yml logs -f mongodb

redis-logs:
	docker compose -f docker/docker-compose.yml logs -f redis
