# Compose scheduler

The scheduler is a long-running Compose service that runs the scraper without
depending on a host cron daemon, `systemd`, or `sudo`.

The production default is one run every day at `06:00` in
`Europe/Lisbon`:

```sh
docker compose -f docker/docker-compose.yml --profile scheduler up -d --build scheduler
```

Follow its logs with:

```sh
make scheduler-logs
```

For a temporary five-minute test that starts immediately:

```sh
SCRAPER_SCHEDULE_MODE=interval \
SCRAPER_INTERVAL_SECONDS=300 \
SCRAPER_RUN_ON_START=true \
docker compose -f docker/docker-compose.yml --profile scheduler \
  up -d --build --force-recreate scheduler
```

Restore the production daily schedule by recreating the service without the
test environment variables:

```sh
docker compose -f docker/docker-compose.yml --profile scheduler \
  up -d --build --force-recreate scheduler
```
