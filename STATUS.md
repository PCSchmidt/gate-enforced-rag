# Status

**Phase:** 5 — dsh-shaped local plugin expose
**Date:** 2026-09-04
**Family handoff:** [portfolio-kit docs/STATUS.md](https://github.com/PCSchmidt/portfolio-kit/blob/main/docs/STATUS.md)

## Done

- CONTRACT/SPEC + synthetic public corpus
- Keyword retrieve + extractive cited answer (`src/answer.js`)
- Evaluator gate before delivery (`act` / `delivered`)
- CI-safe Haystack / LlamaIndex adapters (`src/adapters.js`)
- Local multi-silo router (`src/router.js`) over `contracts` + `ops`
- Local JSON traces (`src/observe.js`) on `--observe`
- dsh-shaped plugin service and tool (`src/plugin.js`, `index.js`)
- Fail closed on GitHub writes, live LLM, live Haystack / LlamaIndex packages, federated remotes, unresolved contradictions, live OTEL
- Eval `GER-001`–`GER-028`
- Plugin contract tests

## Last measured

2026-09-04: plugin syntax checks passed; Phase 4 baseline was `npm test` 10/10; D3 catch 1.0 (n=18); agreement 1.0; known-bad never `act`; golden set 28. Phase 5 adds local `name` + `apply(ctx)` service coverage; final suite pending.

## Not done

- Live dsh runtime installation/check (optional; not required for the bundle)
- Live Wikipedia / arXiv federation (still refused)

**Next:** meridian-jspace Phase 2 (optional live Qwen) or RAG Phase 6. Do not start red/blue. Do not download Qwen unless asked.
