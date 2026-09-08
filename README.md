# scrappy
Event scraper for Municípios de Portugal

## Development

Install the Git hooks after cloning:

```sh
corepack enable
pnpm install
```

The pre-commit hook checks staged C# formatting, and the pre-push hook verifies a
Release build. Run the same checks manually with `pnpm precommit` and
`pnpm prepush`.

## Documentation

- [Arquitetura e fluxo de dados](docs/ARCHITECTURE.md)
- [Pipeline de scraping](docs/SCRAPING.md)
- [Referência da API](docs/API_REFERENCE.md)
