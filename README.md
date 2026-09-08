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
