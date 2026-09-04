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
- [x] `--llm` / `--openai` / `--federated` fail closed
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

**Out of scope for this feature:** pip install, embeddings APIs, live Wikipedia / arXiv federation.

## Feature: Local multi-silo router

**Gate:** evaluated
**Acceptance:**

- [x] `--multi-source` retrieves from local `contracts` + `ops` silos and cites hits
- [x] Unresolved claim contradictions fail closed (`act` false)
- [x] `--federated` / `--wikipedia` / `--arxiv` fail closed
- [x] Single-source GER-001–004 still pass without `--multi-source`
- [x] Eval cases `GER-021`–`GER-024` cover router pass, contradiction fail, federated fail

**Out of scope for this feature:** live remote silos, live OTEL export.

## Feature: Local JSON observability

**Gate:** evaluated
**Acceptance:**

- [x] `--observe` attaches `gate-enforced-rag.trace.v1` with retrieve, synthesize, and evaluator_gate spans
- [x] Default answers still pass without a trace
- [x] `--otel` / `--prometheus` / `--jaeger` / `--datadog` fail closed
- [x] Incomplete traces and `live_otel` never `act`
- [x] Eval cases `GER-025`–`GER-028` cover observe pass, live telemetry fail, incomplete trace fail

**Out of scope for this feature:** Jaeger dashboards, federated remote eval, dsh plugin (Phase 5).

## Feature: dsh-shaped local plugin expose

**Gate:** evaluated
**Acceptance:**

- [x] `index.js` exports `name` and `apply(ctx)` without requiring dsh or network dependencies
- [x] `apply(ctx)` provides `gateEnforcedRag` and optionally registers `gate-enforced-rag.answer`
- [x] Plugin answers use the existing Evaluator gate and preserve `act` / `delivered` fail-closed behavior
- [x] Plugin emits `rag.answer` when a context emitter is available

**Out of scope for this feature:** live dsh installation, remote tools, GitHub writes, and live model calls.
