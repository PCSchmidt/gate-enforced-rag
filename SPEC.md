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
- [x] `--llm` / `--openai` / `--multi-source` / `--federated` fail closed
- [x] Eval cases `GER-001`–`GER-016` cover good answers and known-bad reports

**Out of scope for this feature:** live LLM, federated silos.

## Feature: CI-safe Haystack / LlamaIndex adapters

**Gate:** evaluated
**Acceptance:**

- [x] `--haystack` and `--llamaindex` select a pipeline-shaped adapter over the same keyword retriever
- [x] Adapter answers still emit `gate-enforced-rag.answer.v1` and pass the Evaluator before `act`
- [x] `--live-haystack` / `--pip-haystack` / `--install-haystack` and LlamaIndex equivalents fail closed
- [x] No `haystack` / `llama-index` package is imported
- [x] Eval cases `GER-017`–`GER-020` cover adapter pass and live-package fail

**Out of scope for this feature:** pip install, embeddings APIs, multi-source router.
