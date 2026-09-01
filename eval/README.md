# eval/

Held-out gate table for mechanical RAG answers (portfolio-kit D3).

```sh
npm test
npm run eval
```

- No network, no GitHub writes, no LLM, no pip Haystack / LlamaIndex
- Cases: [cases.json](cases.json) (`GER-001`–`GER-020`)
- Known-bad answers must not `act` / `delivered`
- `--haystack` / `--llamaindex` are CI-safe adapters; live-package flags fail closed
