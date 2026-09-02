# Fixture sources

Phase 1–3 use **synthetic public corpora** paraphrased from portfolio-kit contracts. No Wikipedia scrape, no pip Haystack / LlamaIndex, no LLM, no program-of-record trees.

| File | Source | Retrieved |
|------|--------|-----------|
| [corpus/gate-contract.md](corpus/gate-contract.md) | [portfolio-kit GATE_CONTRACT.md](https://github.com/PCSchmidt/portfolio-kit/blob/main/docs/GATE_CONTRACT.md) (paraphrase) | 2026-09-01 |
| [corpus/data-policy.md](corpus/data-policy.md) | [portfolio-kit DATA_POLICY.md](https://github.com/PCSchmidt/portfolio-kit/blob/main/docs/DATA_POLICY.md) (paraphrase) | 2026-09-01 |
| [corpus/evaluator.md](corpus/evaluator.md) | GATE_CONTRACT Evaluator section (paraphrase) | 2026-09-01 |
| [corpus/citations.md](corpus/citations.md) | Synthetic citation rule for this repo | 2026-09-01 |
| [query-stub.json](query-stub.json) | Synthetic CLI payload | 2026-09-01 |
| [corpus/ops/notam-standin.md](corpus/ops/notam-standin.md) | DATA_POLICY allowed-stand-in paraphrase | 2026-09-01 |
| [corpus/ops/self-grade-myth.md](corpus/ops/self-grade-myth.md) | Synthetic contradiction fixture (known-bad claim) | 2026-09-01 |

Known-bad strings (`F-35`, `TODO`) exist only as gate-catch tokens in [eval/cases.json](../eval/cases.json).
