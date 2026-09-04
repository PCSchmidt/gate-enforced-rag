import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  answer,
  gateAnswer,
  refuseFederated,
  refuseFramework,
  refuseGitHubWrite,
  refuseLiveLlm,
  refuseLiveTelemetry,
} from '../src/answer.js'
import { apply, name, tool } from '../src/plugin.js'

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

test('local observe traces retrieve, synthesize, and gate; live OTEL fails closed', () => {
  const report = answer('What is a gate pass?', { observe: true, now: '2026-09-01T12:00:00.000Z' })
  assert.equal(report.verdict, 'pass')
  assert.equal(report.act, true)
  assert.equal(report.observe, true)
  assert.equal(report.live_otel, false)
  assert.equal(report.trace.schema, 'gate-enforced-rag.trace.v1')
  assert.equal(report.trace.exporter, 'local-json')
  assert.deepEqual(report.trace.spans.map((span) => span.name), ['retrieve', 'synthesize', 'evaluator_gate'])
  assert.equal(report.trace.spans.at(-1).status, 'pass')

  const quiet = answer('What is a gate pass?')
  assert.equal(quiet.verdict, 'pass')
  assert.equal(quiet.trace, undefined)

  assert.throws(() => answer('What is a gate pass?', { liveOtel: true }), /local JSON trace/)
  assert.throws(() => refuseLiveTelemetry(), /local JSON trace/)

  const incomplete = gateAnswer({
    schema: 'gate-enforced-rag.answer.v1',
    backend: 'mechanical-keyword',
    retrieved_n: 1,
    max_score: 1,
    text: 'A gate is a checkpoint. [gate-contract]',
    citations: [{ id: 'gate-contract', quote: 'A gate is a checkpoint.' }],
    github_write: false,
    live_llm: false,
    observe: true,
    live_otel: false,
    trace: {
      schema: 'gate-enforced-rag.trace.v1',
      exporter: 'local-json',
      live_otel: false,
      spans: [{ name: 'retrieve', status: 'ok' }],
    },
  })
  assert.equal(incomplete.verdict, 'fail')
  assert.equal(incomplete.act, false)
  assert.ok(incomplete.issues.some((row) => row.code === 'incomplete_trace'))
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

test('dsh-shaped plugin exposes the gated answer service', () => {
  const emitted = []
  const registered = []
  const provided = []
  const ctx = {
    emit: (event, payload) => emitted.push({ event, payload }),
    provide: (key, service) => provided.push({ key, service }),
    registerTool: (definition, handler) => registered.push({ definition, handler }),
    logger: { info() {} },
  }
  const service = apply(ctx)
  assert.equal(name, 'gate-enforced-rag')
  assert.equal(service.name, name)
  assert.equal(provided[0].key, 'gateEnforcedRag')
  assert.equal(registered[0].definition, tool)
  const report = registered[0].handler('What is a gate pass?')
  assert.equal(report.verdict, 'pass')
  assert.equal(report.act, true)
  assert.equal(emitted[0].event, 'rag.answer')
})

test('dsh-shaped plugin keeps rejected answers non-deliverable', () => {
  const registered = []
  const service = apply({
    registerTool: (definition, handler) => registered.push({ definition, handler }),
    logger: { info() {} },
  })
  const report = service.answer('How do I use GitHub to write an issue?')
  const toolReport = registered[0].handler('How do I use GitHub to write an issue?')
  assert.equal(report.verdict, 'fail')
  assert.equal(report.act, false)
  assert.equal(report.delivered, false)
  assert.equal(toolReport.verdict, 'fail')
  assert.equal(toolReport.act, false)
  assert.equal(toolReport.delivered, false)
})
