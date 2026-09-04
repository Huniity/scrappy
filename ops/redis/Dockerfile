FROM redis:8.10.0-alpine

CMD ["redis-server", "--appendonly", "yes"]

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=10 \
    CMD ["redis-cli", "ping"]
