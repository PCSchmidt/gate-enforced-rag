# eval/

Held-out gate table for mechanical RAG answers (portfolio-kit D3).

```sh
npm test
npm run eval
```

- No network, no GitHub writes, no LLM, no pip Haystack / LlamaIndex
- Cases: [cases.json](cases.json) (`GER-001`–`GER-028`)
- Known-bad answers must not `act` / `delivered`
- `--haystack` / `--llamaindex` are CI-safe adapters; live-package flags fail closed
- `--multi-source` is a local router; `--federated` fails closed
- `--observe` is a local JSON trace; `--otel` fails closed
