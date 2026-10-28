# gate-enforced-rag: Evidence Notes

Companion to gate-enforced-rag.md. Labels: Confirmed, Ran it, Per the docs, My reading, Ask the author, Author says. Paths are repository-relative. Probes ran in a scratch copy outside the repository (Node.js 24.19.0); nothing was written in the clone, and `git status` in the clone shows no changes.

## E1 Fact sheet

| Fact | Value | Label |
| --- | --- | --- |
| Name, address, licence | gate-enforced-rag; github.com/PCSchmidt/gate-enforced-rag; MIT (LICENSE file present, copyright 2026 Chris Schmidt) | Confirmed |
| Kind | Reliability experiment: mechanical (no model) RAG with a delivery gate | Confirmed |
| Status | Phase 5 of 5 shipped; package version 0.1.0; STATUS.md dated 2026-09-04 | Confirmed |
| Language, size | JavaScript ES modules, Node 20+; about 1,370 lines across src, tests, eval | Confirmed |
| Tests | 12 (node:test), 12 pass, 0 fail, 0 skipped | Ran it |
| Eval | 28 cases; D3 gate-catch 1.0 (n=18); verdict agreement 1.0; known-bad no-act 1.0; `ok: true` | Ran it |
| Commits | 8, all by one author, 2026-08-19 to 2026-09-04 | Confirmed |
| Repo metadata | public, 0 stars, 0 forks, last push 2026-09-28 (GitHub API metadata only) | Confirmed |
| CI | One workflow, runs `npm test` and `npm run eval` on push and PR; the five most recent runs concluded success (run list, metadata only) | Confirmed (workflow), Per the docs (results) |
| Needs | Node 20+; no installs, network, GPU, paid service | Confirmed |
| Deployed | No | Confirmed (nothing in repo suggests otherwise) |
| Related | Meridian (README: built on its gate and Evaluator contracts), portfolio-kit (shared contracts, external repo, not read) | Per the docs |

## E2 Reading and running log

Read: README, STATUS, SPEC, CONTRACT, AGENTS, CONTRIBUTING, TECHNICAL_OVERVIEW, gates.yaml, package.json, .gitignore, workflow, eval/README, eval/run.js, first part of eval/cases.json plus a parsed summary of all cases, fixtures/SOURCES.md, query-stub, all of src/, index.js, tests/eval.test.js, and the first part of tests/answer.test.js (test titles listed for the rest).

Not read: portfolio-kit (external), the GitHub-hosted contract documents it links, the remaining fixture notes as files (their text is embedded in src/corpus.js, which was read), the second half of tests/answer.test.js beyond titles. No .env files exist in the tree; none read.

Ran (scratch copy of tracked files): `node --test tests/*.test.js` (12 pass); `node eval/run.js` three times, output minus the timestamp identical each time (same hash); the sample command with and without `--multi-source`; a refusal call. Ran it.

Final state: `git status --short` in the clone printed nothing.

## E3 Claims check

| ID | Claim (source) | Check | Verdict |
| --- | --- | --- | --- |
| CL-01 | npm test 12/12 (STATUS) | Ran it | Supported (L2) |
| CL-02 | D3 catch 1.0 (n=18), agreement 1.0, no-act 1.0, golden set 28 (STATUS) | Ran it | Supported (L2) |
| CL-03 | No pip RAG packages, no LLM, no network (README) | Source read: no imports beyond node:fs/path/url/test/assert | Supported (L3 by reading) |
| CL-04 | Adapters are "pipeline-shaped" Haystack and LlamaIndex adapters (README) | adapters.js returns a label and stage-name list; retrieval is the same function | Supported but easy to misread; they are labels |
| CL-05 | "independent Evaluator" (README, overview) | gateAnswer is a function in the same module, run on the report the same module builds | Partly: separation by code, not an independent agent |
| CL-06 | "held-out" eval (cases.json split, overview) | Cases and gate were developed in the same repo; order not recoverable (one commit per phase) | Unsupported as an outside-held-out claim; label only |
| CL-07 | Corpus text: pass needs "overall at least 7.0" (fixtures) | No score or 7.0 exists in code; gate is a checklist | Contradicted for the code (the text is about the Meridian evaluator) |
| CL-08 | Known-bad answers never act (README, overview) | 18 cases; probes of other bad inputs | Partly: holds for covered cases; evasions in E4 |
| CL-09 | gates.yaml description "Phase 2" | Stale vs Phase 5 | Doc drift |

## E4 Rule attacks (scratch copy, probe scripts not saved in the repo)

| Probe | Result |
| --- | --- |
| Empty query | fail, empty_retrieval |
| "zzzz" | fail, empty_retrieval |
| "F-35 overlay", "f35 overlay" | fail, extra_entity |
| "jpo gate" | fail, extra_entity |
| "F 35 gate" (space) | pass, act true (evades FORBIDDEN regex) |
| "F" + U+2011 + "35 gate" | pass, act true |
| "TODO gate" | fail, stub_as_done |
| "gate pizza banana kiwi" | warn, weak_retrieval (max 0.25) |
| "Who won the world cup? gate" | warn (0.2) |
| "capital france gate" | warn (0.333 < 0.34) |
| Long query with 2 matching words of 8 | warn (0.25) |
| "gate" alone | pass (score 1.0, 2 notes) |
| "Is the gate pass for a parking garage?" | pass, act true (0.5): relevance not checked |
| "Can a generator pass the gate?" | pass |
| Default query with multiSource | fail, contradiction (the myth note is retrieved); designed, GER-022 expects it |
| Report with self_score set | fail, self_grade |
| Report text with a citation id not retrieved | fail, uncited_claim |
| Hand-built report, text "invented claim [gate-contract]", quote "x" | pass: only ids compared; this report cannot come from synthesize |
| Options llm, federated, githubWrite, liveOtel, liveHaystack | each throws a coded error |
| haystack and llamaindex together | throws adapter_conflict |
| Same query twice with fixed `now` | byte-identical |

Confirmed by running. Note that the gate reads flags the same program sets (live_llm false is hard-coded in synthesize), so the flag checks are tested only by hand-built reports (My reading).

## E5 Code map

src/answer.js: schema, refusals, synthesize, gateAnswer (about twenty issue codes), answer. src/retrieve.js: tokenise-and-score, top k (default 3). src/corpus.js: STOP words, tokenize (length over 2, lower-case, split on non-alphanumerics, no stemming), FORBIDDEN `\b(f-?35|jpo|itar|cui)\b`, STUB regex, the six notes, SILOS. src/adapters.js: three adapter descriptors; resolveAdapter. src/router.js: routeRetrieve (2 per silo, 4 total, dedupe by id), findContradictions (groups hand-attached claim labels). src/observe.js: spans retrieve, synthesize, evaluator_gate; traceIssues. src/plugin.js and index.js: name, apply(ctx), tool, createService. src/run.js: command-line parsing; refusal flags. eval/run.js: eval runner. Warn threshold 0.34 is in answer.js. Entry point: src/run.js.

## E6 Model call sites

None. `model: 'mechanical-rag'` is a literal. No network calls in the tree (Confirmed by reading). No cost.

## E7 Tests and CI

12 tests: cited query ships; adapters still gate; F-35 never acts; multi-source router and contradiction fail-closed; refusals; observe traces and live telemetry refusal; empty retrieval and missing citation fail closed; plugin exposes service; plugin keeps rejected answers non-deliverable; and three in eval.test.js (golden set size, eval thresholds, F-35). Three spot-checked tests assert real outputs of the pipeline (verdict, fields, citations), but were written alongside the code. Coverage not measured. CI runs both scripts on Ubuntu with Node 20; runs observed as success via API metadata.

Eval composition (parsed from cases.json): 10 good (4 plain, 2 adapter, 2 multi-source with adapter variants, 2 observe); 18 bad, of which 3 go through the pipeline by query (GER-007, 008, 022) and 15 are hand-built report objects given to gateAnswer. D3 counts verdict fail or warn as caught. A never-deliver baseline would also score 1.0 on D3 (My reading).

## E8 Plan versus results, history

Eight commits, one per phase: Phase 0 on 2026-08-19, Phases 1 to 5 on 2026-09-01 through 2026-09-04, then a docs commit. No protocol file separate from CONTRACT/SPEC; acceptance criteria are checked in SPEC.md. Plan-before-results order cannot be shown. Commit credits by tool: none present in any commit message. AGENTS.md is a generic agent-instruction file that names no builder. One out-of-scope line in CONTRACT.md names other products; it is not a builder credit and the guide does not name them. Ask the author which tools were used.

## E9 Gates and approvals

gates.yaml defines three gates (confirmed human approval, tests_passing, evaluated). No gate output files (for example CONFIRMED_GATE.json) are committed, so approvals cannot be checked from the repository.

## E10 Environment

No lockfile and no dependencies; Node range `>=20`; ran on 24.19.0. Results do not depend on package versions.

## E11 Security and privacy

No secrets found in tracked files by reading; .gitignore excludes .env files. No outside services. Data is invented. FORBIDDEN filter is the only content control and is evadable (E4).

## E12 Shortcomings register

| # | Shortcoming | Severity | Disclosed? | Options | Recommendation |
| --- | --- | --- | --- | --- | --- |
| 1 | No relevance check; off-topic cited answer ships | High | No | A: require key question terms in cited quotes; B: model-based relevance judge; C: document it | A, then evaluate B later; small effort, high payoff |
| 2 | Forbidden-word filter evaded by spacing or other hyphens | Medium | Not as a limit | A: normalise text then match; B: a maintained term list; C: leave | A; small, medium |
| 3 | "Independent" evaluator is a same-process function; flags self-reported | Medium | Partly | A: document; B: verify against retrieval data not report flags | A now, B in a v2 |
| 4 | Adapters are labels | Low | Partly ("CI-safe") | A: rename; B: real optional adapter | A |
| 5 | Contradictions come from hand labels | Low | No | A: document; B: automatic claim extraction | A |
| 6 | 15 of 18 bad cases bypass the pipeline; eval written with the gate | Medium | No | A: add pipeline-level bad cases; B: second author or later-frozen cases | A |
| 7 | Citation text and quote not compared | Low | No | Compare quote to note text | small |
| 8 | Stale gates.yaml description and corpus 7.0 text | Low | No | Update | small |

## E13 Method detail

Score = |distinct query tokens found in the note's token set| / |query tokens|. Query tokens are not de-duplicated before the division, so repeated words count each time in the denominator and in the loop (My reading from code: the loop iterates the token array). Tokens: lower-case, split on non-alphanumerics, length over 2, minus 30 stop words. Sorting is by score descending (stable), so ties keep corpus order. Complexity is linear in notes times query length. Warn threshold: 0.34, undocumented.

## E14 Discrepancies

README and STATUS agree on phase and counts. SPEC feature 1 lists GER-001 to 016 while later features extend to 028 (consistent). gates.yaml says Phase 2. Corpus evaluator note mentions 7.0 pass mark absent from code. TECHNICAL_OVERVIEW calls the eval "held-out" and the evaluator "independent" (see CL-05, CL-06).

## E15 Production readiness

Placement: Works locally. Clean start: yes. Gate blocks bad change in CI: yes for tests/eval. Quality measured: no. Safe failure: partly (fail closed, no timeouts needed). Human review: no. Versioned prompts: not applicable. Logs: optional local trace only. Data and secrets: partly. Missing for deployable: real retrieval, model behind the gate, hosting, sign-in, monitoring, rollback, cost limits, runbook.

## E16 Review dispositions

Not yet reviewed by an outside reader; plain-language and accuracy passes pending.

## E17 Completeness and backlog

Promised versus built: Phases 1 to 5 done and tested; live dsh check not done (optional per STATUS); live Wikipedia/arXiv refused by design; Phase 6 undecided. Backlog order: relevance check and tests; filter fix; run gate on real model output; doc drift fixes. Milestone 1 exit test: the parking-garage question returns warn or fail.

## Diagram sources

Images are rendered PNGs (gate-enforced-rag-parts, -learned-vs-rules, -results). The results chart counts: 10 good (all shipped), 3 bad by query (all stopped), 15 bad hand-built (all stopped); total 28, matching E7.

## Revision log (v2 revision after reader check)

Previous text archived as gate-enforced-rag.v1draft.md (5,628 words); revised guide is about 4,360 words (plain wc -w).

1. Opening cut to a short story with a plain-words start; status, caveats and the relevance gap moved after what the program does.
2. Gate, verdict, evaluator, adapter, router and silo defined at first use.
3. CI, JSON, BM25, MLOps and README written as SHORT (Full Name) with a gloss; Forward Deployed AI Engineer glossed.
4. JPO, F-35 and dsh no longer named (forbidden-name filter and "outside plugin host" described generically); the defense paragraph reduced to one sentence of interest only.
5. Edge-case table replaced by prose (E4 probes unchanged and still the source).
6. Relevance gap stated once in the opening, then referenced back; testing chapter shows the parking-garage example as that gap.
7. Models chapter folded into Methods; "Real use" rewritten as short prose; shortcomings reduced to three, the rest left to E12.
8. Most "In short" closers removed (kept in three chapters where they add a verdict).
9. Recruiter table trimmed to four rows; Q&A reduced to a short list; Phase 2 and portfolio internals dropped from the body.
10. Results chapter explains catch rate and agreement in plain sentences; caveats grouped in one paragraph.

Images unchanged: no label or number changed, and each was viewed with no clipped or overlapping text. No tool is named as builder; no local paths or secrets in the guide. Not published.
