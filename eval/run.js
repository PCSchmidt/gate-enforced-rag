#!/usr/bin/env node
/**
 * Held-out gate eval for gate-enforced-rag Phase 4.
 *   npm run eval
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { answer, gateAnswer } from '../src/answer.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const DEFAULT_CASES = join(HERE, 'cases.json')

function verdictMatches(expected, actual) {
  return Array.isArray(expected) ? expected.includes(actual) : expected === actual
}

export function loadCatalog(path = DEFAULT_CASES) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function runEval(catalog, opts = {}) {
  const rows = []
  let catchHits = 0
  let catchN = 0
  let agreementHits = 0
  let actHits = 0

  for (const testCase of catalog.cases) {
    const gated = testCase.answer
      ? gateAnswer(testCase.answer)
      : answer(testCase.query, {
        now: '2026-09-01T12:00:00.000Z',
        haystack: testCase.haystack === true,
        llamaindex: testCase.llamaindex === true,
        multiSource: testCase.multi_source === true,
        observe: testCase.observe === true,
      })
    const agreed = verdictMatches(testCase.expect_verdict, gated.verdict)
      && gated.act === testCase.expect_act
    if (agreed) agreementHits += 1
    if (testCase.kind === 'bad') {
      catchN += 1
      if (gated.verdict === 'fail' || gated.verdict === 'warn') catchHits += 1
      if (gated.act === false) actHits += 1
    }
    rows.push({
      case_id: testCase.case_id,
      project: catalog.project,
      runtime: catalog.runtime,
      scores: {
        D3: testCase.kind === 'bad' && (gated.verdict === 'fail' || gated.verdict === 'warn') ? 10 : testCase.kind === 'bad' ? 0 : null,
      },
      gate_verdict: gated.verdict,
      act: gated.act,
      expected: testCase.expect_verdict,
      agreed,
      failure_mode: testCase.failure_mode,
    })
  }

  const n = catalog.cases.length
  const report = {
    project: catalog.project,
    runtime: catalog.runtime,
    rubric: catalog.rubric,
    generated_at: opts.now ?? new Date().toISOString(),
    golden_set_size: n,
    split: catalog.split,
    seed: null,
    model: 'mechanical-rag',
    metrics: {
      D3_gate_catch_rate: catchN ? catchHits / catchN : null,
      D3_n: catchN,
      verdict_agreement: n ? agreementHits / n : null,
      known_bad_no_act: catchN ? actHits / catchN : null,
    },
    target_gate_catch: catalog.target_gate_catch ?? 0.85,
    cases: rows,
    next: 'Phase 5: optional dsh plugin. Do not start red/blue. Do not download Qwen unless asked for jspace Phase 2.',
  }
  report.ok = (report.metrics.D3_gate_catch_rate ?? 0) >= report.target_gate_catch
    && report.metrics.verdict_agreement === 1
    && report.metrics.known_bad_no_act === 1
    && n >= 12
  return report
}

function main() {
  const report = runEval(loadCatalog())
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  if (!report.ok) process.exitCode = 1
}

const invoked = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invoked) main()
