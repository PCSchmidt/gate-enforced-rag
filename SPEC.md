# SPEC.md

Features as `##` headings, in priority order.

## Feature: Mechanical single-source RAG

**Gate:** evaluated
**Acceptance:**

- [x] `answer` emits `gate-enforced-rag.answer.v1`
- [x] Keyword retrieve over one public corpus
- [x] Extractive synthesis cites retrieved document ids
- [x] `act` / `delivered` true only after Evaluator `pass`
- [x] `--github-write` / `--comment` / `--issue` fail closed
- [x] `--llm` / `--openai` / `--haystack` / `--llamaindex` / `--multi-source` / `--federated` fail closed
- [x] Eval cases `GER-001`–`GER-016` cover good answers and known-bad reports

**Out of scope for this feature:** Haystack, LlamaIndex, live LLM, federated silos.
