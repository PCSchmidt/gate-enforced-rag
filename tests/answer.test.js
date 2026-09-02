import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  answer,
  gateAnswer,
  refuseFederated,
  refuseFramework,
  refuseGitHubWrite,
  refuseLiveLlm,
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

test('CI-safe haystack and llamaindex adapters still gate before delivery', () => {
  const haystack = answer('What is a gate pass?', { haystack: true, now: '2026-09-01T12:00:00.000Z' })
  assert.equal(haystack.backend, 'haystack-adapter')
  assert.equal(haystack.family, 'haystack')
  assert.equal(haystack.verdict, 'pass')
  assert.equal(haystack.act, true)
  assert.equal(haystack.live_haystack, false)
  assert.deepEqual(haystack.pipeline.slice(-1), ['evaluator_gate'])
  assert.ok(haystack.citations.some((row) => row.id === 'gate-contract'))

  const llama = answer('Must user-facing answers cite retrieved snippets?', { llamaindex: true })
  assert.equal(llama.backend, 'llamaindex-adapter')
  assert.equal(llama.family, 'llamaindex')
  assert.equal(llama.verdict, 'pass')
  assert.equal(llama.live_llamaindex, false)
})

test('F-35 query never acts', () => {
  const report = answer('F-35 overlay')
  assert.equal(report.verdict, 'fail')
  assert.equal(report.act, false)
  assert.equal(report.delivered, false)
  assert.ok(report.issues.some((row) => row.code === 'extra_entity'))
})

test('local multi-source router ships cited answers and fail-closes contradictions', () => {
  const report = answer('What public NOTAM stand-ins are allowed unclassified?', {
    multiSource: true,
    now: '2026-09-01T12:00:00.000Z',
  })
  assert.equal(report.verdict, 'pass')
  assert.equal(report.act, true)
  assert.equal(report.multi_source, true)
  assert.equal(report.federated, false)
  assert.ok(report.silos.includes('contracts'))
  assert.ok(report.silos.includes('ops'))
  assert.ok(report.citations.some((row) => row.id === 'notam-standin'))
  assert.equal(report.contradictions.length, 0)

  const clash = answer('Is a generator scoring its own work an independent evaluator pass?', {
    multiSource: true,
  })
  assert.equal(clash.verdict, 'fail')
  assert.equal(clash.act, false)
  assert.ok(clash.issues.some((row) => row.code === 'contradiction'))
  assert.ok(clash.contradictions.length >= 1)
})

test('GitHub writes, live LLM, live packages, and federated fail closed', () => {
  assert.throws(() => answer('What is a gate pass?', { githubWrite: true }), /local retrieval only/)
  assert.throws(() => answer('What is a gate pass?', { llm: true }), /Live LLM is out of scope/)
  assert.throws(() => answer('What is a gate pass?', { liveHaystack: true }), /CI-safe adapter/)
  assert.throws(() => answer('What is a gate pass?', { pipLlamaindex: true }), /CI-safe adapter/)
  assert.throws(() => answer('What is a gate pass?', { haystack: true, llamaindex: true }), /Choose one adapter/)
  assert.throws(() => answer('What is a gate pass?', { federated: true }), /local multi-silo only/)
  assert.throws(() => refuseGitHubWrite('rag'), /local retrieval only/)
  assert.throws(() => refuseLiveLlm(), /Live LLM is out of scope/)
  assert.throws(() => refuseFramework('llamaindex'), /CI-safe adapter/)
  assert.throws(() => refuseFederated(), /local multi-silo only/)

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
