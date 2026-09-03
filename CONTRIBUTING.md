# Contributing

Contracts live in [portfolio-kit](https://github.com/PCSchmidt/portfolio-kit).

```sh
npm test
npm run eval
npm run answer
```

Tests and eval must stay green. Do not require network, GPU, pip Haystack / LlamaIndex, or an LLM in CI. `--haystack` and `--llamaindex` are CI-safe adapters. `--multi-source` is local silos only. `--observe` is a local JSON trace. Do not post GitHub comments from this repo.
