# CONTRACT.md

**Project:** gate-enforced-rag
**Owner:** Chris Schmidt
**Date:** 2026-09-01
**Reliability layer:** Meridian contracts via [portfolio-kit](https://github.com/PCSchmidt/portfolio-kit) 0.1.0

---

## Scope

Turn a **query** against one public corpus into a user-facing answer that **cannot ship** until an independent Evaluator gate passes. Phase 1 is **mechanical** extractive RAG (keyword retrieve + cited snippets). It does not load Haystack, LlamaIndex, or an LLM, and it does not post GitHub.

### In scope

- Answer schema `gate-enforced-rag.answer.v1`
- Single synthetic corpus paraphrased from portfolio-kit
- Keyword retriever + extractive synthesis with citations
- Fail closed on GitHub writes, webhooks, live LLM, Haystack / LlamaIndex, and federated multi-source
- Portfolio-kit D3 on known-bad answers
- Public / unclassified fixtures only

### Out of scope

- JPO / F-35 / employer program data except as known-bad eval strings
- Replacing Claude Code / Cursor / Copilot
- Haystack / LlamaIndex adapters *(Phase 2)*
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
| Models | None in Phase 1 (`mechanical-rag`) |
| Deploy | Local `npm test` / `npm run eval` |

---

## Acceptance criteria

1. Happy path works against SPEC.md
2. `npm test` and `npm run eval` exit 0
3. Known-bad answers never `act` / `delivered`
4. Eval table uses portfolio-kit D3
5. Data policy grep is clean
6. `--llm` / `--haystack` / `--llamaindex` / `--multi-source` / `--github-write` fail closed

---

## Known constraints

- Phase 1 does not require GPU, embeddings APIs, or Python RAG frameworks.
- Windows host via Git Bash.
