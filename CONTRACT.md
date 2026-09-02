# CONTRACT.md

**Project:** gate-enforced-rag
**Owner:** Chris Schmidt
**Date:** 2026-09-01
**Reliability layer:** Meridian contracts via [portfolio-kit](https://github.com/PCSchmidt/portfolio-kit) 0.1.0

---

## Scope

Turn a **query** against public fixture silos into a user-facing answer that **cannot ship** until an independent Evaluator gate passes. Phase 1 is **mechanical** extractive RAG (keyword retrieve + cited snippets). Phase 2 adds **CI-safe Haystack / LlamaIndex adapters**. Phase 3 adds a **local multi-silo router** with fail-closed contradiction handling. It does not pip-install RAG frameworks, call an LLM, scrape Wikipedia / arXiv, or post GitHub.

### In scope

- Answer schema `gate-enforced-rag.answer.v1`
- Synthetic `contracts` + `ops` corpora paraphrased from portfolio-kit
- Keyword retriever + extractive synthesis with citations
- Haystack / LlamaIndex pipeline-shaped adapters (`haystack-adapter`, `llamaindex-adapter`)
- Local multi-silo router (`--multi-source`) with contradiction fail-closed
- Fail closed on GitHub writes, webhooks, live LLM, live Haystack / LlamaIndex packages, and federated remotes
- Portfolio-kit D3 on known-bad answers
- Public / unclassified fixtures only

### Out of scope

- JPO / F-35 / employer program data except as known-bad eval strings
- Replacing Claude Code / Cursor / Copilot
- Live Wikipedia / arXiv federation
- Observability + federated eval set *(Phase 4
- Multi-source router + contradiction resolution *(Phase 3)*
- dsh tool / plugin expose *(Phase 5)*
- redteam-blue-gate
- HardPowerIntelligence
- meridian-jspace Phase 2 (Qwen / jacobian-lens)

---

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node 20+ stdlib |
| Reliability | Mechanical gate + portfolio-kit verdict shape |
| Models | None (`mechanical-rag`; adapters stay extractive) |
| Deploy | Local `npm test` / `npm run eval` |

---

## Acceptance criteria

1. Happy path works against SPEC.md
2. `npm test` and `npm run eval` exit 0
3. Known-bad answers never `act` / `delivered`
4. Eval table uses portfolio-kit D3
5. Data policy grep is cleanfederated` / `--github-write` fail closed
7. `--haystack` / `--llamaindex` select CI-safe adapters that still gate before delivery
8. `--multi-source` is a local router; unresolved contradictions never `act`fail closed
7. `--haystack` / `--llamaindex` select CI-safe adapters that still gate before delivery

---

- Phase 1–3 doraints
2
- Phase 1 does not require GPU, embeddings APIs, or Python RAG frameworks.
- Windows host via Git Bash.
