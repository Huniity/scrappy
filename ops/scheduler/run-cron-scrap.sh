#!/usr/bin/env bash

set -Eeuo pipefail

SCHEDULE_MODE="${SCRAPER_SCHEDULE_MODE:-daily}"
SCHEDULE_TIME="${SCRAPER_SCHEDULE_TIME:-06:00}"
TIMEZONE="${SCRAPER_TIMEZONE:-Europe/Lisbon}"
INTERVAL_SECONDS="${SCRAPER_INTERVAL_SECONDS:-300}"
RUN_ON_START="${SCRAPER_RUN_ON_START:-false}"

run_scraper() {
	echo "[$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M:%S %Z')] Starting scheduled scraper run."
	if pnpm --filter @scrappy/scraper start; then
		echo "[$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M:%S %Z')] Scraper run finished successfully."
	else
	echo "[$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M:%S %Z')] Scraper run failed; scheduler will continue." >&2
	fi
}

run_every_interval() {
	if ! [[ "$INTERVAL_SECONDS" =~ ^[1-9][0-9]*$ ]]; then
		echo "SCRAPER_INTERVAL_SECONDS must be a positive integer" >&2
		exit 1
	fi

	if [[ "$RUN_ON_START" == "true" ]]; then
		run_scraper
	fi

	while true; do
		sleep "$INTERVAL_SECONDS"
		run_scraper
	done
}

run_daily() {
	if ! [[ "$SCHEDULE_TIME" =~ ^([01][0-9]|2[0-3]):[0-5][0-9]$ ]]; then
		echo "SCRAPER_SCHEDULE_TIME must use HH:MM format" >&2
		exit 1
	fi

	while true; do
		now="$(TZ="$TIMEZONE" date +%s)"
		today="$(TZ="$TIMEZONE" date +%F)"
	next_run="$(TZ="$TIMEZONE" date -d "$today $SCHEDULE_TIME" +%s)"

		if (( next_run <= now )); then
			tomorrow="$(TZ="$TIMEZONE" date -d "$today + 1 day" +%F)"
			next_run="$(TZ="$TIMEZONE" date -d "$tomorrow $SCHEDULE_TIME" +%s)"
		fi

		sleep_seconds=$((next_run - now))
		echo "[$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M:%S %Z')] Next scraper run at $(TZ="$TIMEZONE" date -d "@$next_run" '+%Y-%m-%d %H:%M:%S %Z')."
		sleep "$sleep_seconds"
		run_scraper
	done
}

case "$SCHEDULE_MODE" in
	interval)
		run_every_interval
		;;
	daily)
		run_daily
		;;
	*)
		echo "SCRAPER_SCHEDULE_MODE must be 'daily' or 'interval'" >&2
		exit 1
		;;
esac
