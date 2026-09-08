PHONY: up rebuild-all rebuild-api rebuild-worker rebuild-next rebuild-mongo rebuild-redis scraper scheduler scheduler-logs scraper-logs worker-logs web-logs mongo-logs redis-logs

help:
	@echo "Makefile commands:"
	@echo "  up                 - Start all services defined in docker-compose.yml"
	@echo "  rebuild-all        - Rebuild and start all services"
	@echo "  rebuild-api        - Rebuild and start the API service"
	@echo "  rebuild-worker     - Rebuild and start the ingestion worker service"
	@echo "  rebuild-next       - Rebuild and start the Next.js service"
	@echo "  rebuild-mongo      - Rebuild and start the MongoDB service"
	@echo "  rebuild-redis      - Rebuild and start the Redis service"
	@echo "  scraper            - Start the scraper service with scheduled profile"
	@echo "  scheduler          - Start the scheduler service with scheduler profile"
	@echo "  scheduler-logs     - View logs for the scheduler service"
	@echo "  scraper-logs       - View logs for the scraper service"
	@echo "  worker-logs        - View logs for the ingestion worker service"
	@echo "  web-logs           - View logs for the Next.js service"
	@echo "  mongo-logs         - View logs for the MongoDB service"
	@echo "  redis-logs         - View logs for the Redis service"

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
