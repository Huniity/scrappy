FROM mongo:8.3.8-noble

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=10 \
    CMD ["mongosh", "--quiet", "--eval", "db.adminCommand({ ping: 1 }).ok"]
