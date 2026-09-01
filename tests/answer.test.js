import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  answer,
  gateAnswer,
  refuseFramework,
  refuseGitHubWrite,
  refuseLiveLlm,
  refuseMultiSource,
} from '../src/answer.js'

test('cited gate-contract query ships', () => {
  const report = answer('What is a gate pass?', { now: '2026-09-01T12:00:00.000Z' })
  assert.equal(report.schema, 'gate-enforced-rag.answer.v1')
  assert.equal(report.backend, 'mechanical-keyword')
  assert.equal(report.verdict, 'pass')
  assert.equal(report.act, true)
  assert.equal(report.delivered, true)
  assert.equal(report.live_llm, false)
  assert.equal(report.haystack, false)
  assert.ok(report.retrieved_n >= 1)
  assert.ok(report.citations.some((row) => row.id === 'gate-contract'))
  assert.match(report.text, /\[gate-contract\]/)
})

test('F-35 query never acts', () => {
  const report = answer('F-35 overlay')
  assert.equal(report.verdict, 'fail')
  assert.equal(report.act, false)
  assert.equal(report.delivered, false)
  assert.ok(report.issues.some((row) => row.code === 'extra_entity'))
})

test('GitHub writes, live LLM, Haystack, and federated fail closed', () => {
  assert.throws(() => answer('What is a gate pass?', { githubWrite: true }), /local retrieval only/)
  assert.throws(() => answer('What is a gate pass?', { llm: true }), /Phase 2/)
  assert.throws(() => answer('What is a gate pass?', { haystack: true }), /Phase 2/)
  assert.throws(() => answer('What is a gate pass?', { multiSource: true }), /single public corpus/)
  assert.throws(() => refuseGitHubWrite('rag'), /local retrieval only/)
  assert.throws(() => refuseLiveLlm(), /Phase 2/)
  assert.throws(() => refuseFramework('llamaindex'), /Phase 2/)
  assert.throws(() => refuseMultiSource(), /single public corpus/)

  const gh = gateAnswer({
    schema: 'gate-enforced-rag.answer.v1',
    backend: 'mechanical-keyword',
    retrieved_n: 1,
    max_score: 1,
    text: 'A gate is a checkpoint. [gate-contract]',
    citations: [{ id: 'gate-contract', quote: 'A gate is a checkpoint.' }],
    github_write: true,
    live_llm: false,
  })
  assert.equal(gh.verdict, 'fail')
  assert.equal(gh.act, false)

  const live = gateAnswer({
    schema: 'gate-enforced-rag.answer.v1',
    backend: 'openai',
    live_llm: true,
    retrieved_n: 1,
    max_score: 1,
    text: 'A gate is a checkpoint. [gate-contract]',
    citations: [{ id: 'gate-contract', quote: 'A gate is a checkpoint.' }],
    github_write: false,
  })
  assert.equal(live.verdict, 'fail')
})

test('empty retrieval and missing citations fail closed', () => {
  const empty = answer('zzzz-unknown-token')
  assert.equal(empty.verdict, 'fail')
  assert.ok(empty.issues.some((row) => row.code === 'empty_retrieval'))
  assert.equal(empty.act, false)

  const uncited = gateAnswer({
    schema: 'gate-enforced-rag.answer.v1',
    backend: 'mechanical-keyword',
    retrieved_n: 1,
    max_score: 1,
    text: 'A gate is a checkpoint.',
    citations: [],
    github_write: false,
    live_llm: false,
  })
  assert.equal(uncited.verdict, 'fail')
  assert.ok(uncited.issues.some((row) => row.code === 'missing_citation'))
})
