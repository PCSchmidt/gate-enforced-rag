import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadCatalog, runEval } from '../eval/run.js'
import { answer } from '../src/answer.js'

test('golden set is at least 12 cases with good and bad rows', () => {
  const catalog = loadCatalog()
  assert.ok(catalog.cases.length >= 12)
  assert.ok(catalog.cases.some((row) => row.kind === 'good'))
  assert.ok(catalog.cases.some((row) => row.kind === 'bad'))
  assert.equal(catalog.cases[0].case_id, 'GER-001')
})

test('held-out eval meets gate-catch and agreement', () => {
  const report = runEval(loadCatalog(), { now: '2026-09-01T12:00:00.000Z' })
  assert.equal(report.metrics.verdict_agreement, 1)
  assert.ok(report.metrics.D3_gate_catch_rate >= report.target_gate_catch)
  assert.equal(report.metrics.known_bad_no_act, 1)
  assert.equal(report.ok, true)
})

test('F-35 query never acts', () => {
  const gated = answer('F-35 overlay')
  assert.equal(gated.act, false)
  assert.ok(gated.issues.some((row) => row.code === 'extra_entity'))
})
