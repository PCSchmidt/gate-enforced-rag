# gate-enforced-rag

A RAG pipeline whose user-facing answer cannot ship until a Meridian-style Evaluator gate passes.

**Status:** Phase 4 — local JSON observability

Built on Meridian’s gate + independent Evaluator contracts. Phase 1 is keyword retrieve + extractive citations over one public corpus. Phase 2 adds pipeline-shaped Haystack / LlamaIndex adapters. Phase 3 routes across local `contracts` + `ops` silos and fails closed on claim contradictions. Phase 4 attaches a local JSON trace on `--observe`. It does not pip-install RAG packages, call an LLM, scrape Wikipedia / arXiv, or export OTEL.

## Relation to Meridian

The Evaluator is a post-generation / pre-delivery component. Corrections memory records rejected answers. Lifecycle hooks (`before_llm` / `before_tool` / `on_exit`) are the intended gate checkpoints.

## Shared contracts

- [GATE_CONTRACT.md](https://github.com/PCSchmidt/portfolio-kit/blob/main/docs/GATE_CONTRACT.md)
- [EVAL_RUBRIC_TEMPLATE.md](https://github.com/PCSchmidt/portfolio-kit/blob/main/docs/EVAL_RUBRIC_TEMPLATE.md)
- [MEMORY_SCHEMA.md](https://github.com/PCSchmidt/portfolio-kit/blob/main/docs/MEMORY_SCHEMA.md)
- [DATA_POLICY.md](https://github.com/PCSchmidt/portfolio-kit/blob/main/docs/DATA_POLICY.md)

## Architecture

```mermaid
flowchart LR
    Q[Query] --> A[Adapter]
    A --> R[Keyword retriever]
    R --> Syn[Extractive synthesis]
    Syn --> Gate[Evaluator gate]
    Gate -->|pass| Out[User answer + citations]
    Gate -->|fail| Mem[Issues / no delivery]
```

Adapters (`mechanical-keyword`, `haystack-adapter`, `llamaindex-adapter`) share retrieve + gate. `--multi-source` merges local silos. `--observe` records retrieve / synthesize / evaluator_gate spans as local JSON. Live Haystack / LlamaIndex packages, live Wikipedia / arXiv federation, and OTEL export are refused.

## Develop

```sh
npm test
npm run eval
npm run answer -- --haystack fixtures/query-stub.json
npm run answer -- --llamaindex fixtures/query-stub.json
npm run answer -- --multi-source fixtures/query-stub.json
npm run answer -- --observe fixtures/query-stub.json
```

Requires Node.js 20+. No dependencies, no network, no GPU. `--llm`, `--openai`, `--live-haystack`, `--pip-haystack`, `--install-haystack`, `--live-llamaindex`, `--pip-llamaindex`, `--install-llamaindex`, `--federated`, `--wikipedia`, `--arxiv`, `--otel`, `--prometheus`, `--jaeger`, `--datadog`, `--github-write`, `--comment`, and `--issue` are refused. `--haystack` and `--llamaindex` select CI-safe adapters. `--multi-source` is a local router. `--observe` is a local JSON trace.

## Planned phases

1. Single-source RAG over one public corpus *(shipped; includes the Evaluator gate)*
2. Haystack / LlamaIndex adapter, still gated before delivery *(shipped; CI-safe)*
3. Multi-source router + contradiction resolution *(shipped; local silos)*
4. Observability *(this increment; local JSON traces)*
5. Optional expose as a dsh tool / plugin

## Public / unclassified data only

No JPO / F-35 / internal document dumps. Cite sources in `fixtures/SOURCES.md` when added.

## Current tree

```
CONTRACT.md
SPEC.md
src/answer.js
src/adapters.js
src/router.js
src/observe.js
src/retrieve.js
src/corpus.js
eval/cases.json
fixtures/corpus/
tests/
```
