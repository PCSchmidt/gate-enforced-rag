# Status

**Phase:** 4 — local JSON observability
**Date:** 2026-09-03
**Family handoff:** [portfolio-kit docs/STATUS.md](https://github.com/PCSchmidt/portfolio-kit/blob/main/docs/STATUS.md)

## Done

- CONTRACT/SPEC + synthetic public corpus
- Keyword retrieve + extractive cited answer (`src/answer.js`)
- Evaluator gate before delivery (`act` / `delivered`)
- CI-safe Haystack / LlamaIndex adapters (`src/adapters.js`)
- Local multi-silo router (`src/router.js`) over `contracts` + `ops`
- Local JSON traces (`src/observe.js`) on `--observe`
- Fail closed on GitHub writes, live LLM, live Haystack / LlamaIndex packages, federated remotes, unresolved contradictions, live OTEL
- Eval `GER-001`–`GER-028`

## Last measured

2026-09-03: syntax checks passed; `npm test` 10/10; D3 catch 1.0 (n=18); agreement 1.0; known-bad never `act`; golden set 28. `--observe` emits retrieve/synthesize/evaluator_gate spans; live telemetry and incomplete traces fail closed.

## Not done

- dsh tool / plugin expose (Phase 5)
- Live Wikipedia / arXiv federation (still refused)

**Next:** meridian-jspace Phase 2 (optional live Qwen) or RAG Phase 5. Do not start red/blue. Do not download Qwen unless asked.
