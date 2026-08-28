up:
	docker compose -f docker/docker-compose.yml up

rebuild:
	docker compose -f docker/docker-compose.yml up -d --build api ingestion-worker