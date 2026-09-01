# eval/

Held-out gate table for mechanical RAG answers (portfolio-kit D3).

```sh
npm test
npm run eval
```

- No network, no GitHub writes, no LLM, no Haystack / LlamaIndex
- Cases: [cases.json](cases.json) (`GER-001`–`GER-016`)
- Known-bad answers must not `act` / `delivered`
- Live-LLM / framework / federated flags fail closed until later phases
