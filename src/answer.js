/**
 * Mechanical single-source RAG + Phase 2 CI-safe adapters.
 * Extractive synthesis + Evaluator gate before delivery.
 * Does not pip-install Haystack / LlamaIndex or call an LLM.
 */

import { resolveAdapter, retrieveWithAdapter } from './adapters.js'
import { FORBIDDEN, STUB } from './corpus.js'

export { refuseLiveFramework } from './adapters.js'

export const ANSWER_SCHEMA = 'gate-enforced-rag.answer.v1'

export function refuseGitHubWrite(action = 'write') {
  const error = new Error(`GitHub ${action} refused: gate-enforced-rag is local retrieval only`)
  error.code = 'github_write_refused'
  throw error
}

export function refuseLiveLlm(action = 'llm') {
  const error = new Error(`Live ${action} refused: Phase 2 adapters stay extractive. Live LLM is out of scope.`)
  error.code = 'live_llm_refused'
  throw error
}

export function refuseFramework(name = 'haystack') {
  const error = new Error(`${name} package refused: Phase 2 is a CI-safe adapter. pip/npm Haystack / LlamaIndex is out of scope.`)
  error.code = 'framework_refused'
  throw error
}

export function refuseMultiSource() {
  const error = new Error('Multi-source / federated RAG refused: Phase 1 is a single public corpus')
  error.code = 'multi_source_refused'
  throw error
}

export function synthesize(query, retrieval, opts = {}) {
  const adapter = opts.adapter || resolveAdapter(opts)
  const hits = retrieval?.hits || []
  const citations = hits.map((hit) => ({
    id: hit.id,
    path: hit.path,
    title: hit.title,
    quote: String(hit.text || '').slice(0, 180),
    score: hit.score,
  }))
  const text = hits.length
    ? hits.map((hit) => `${hit.text} [${hit.id}]`).join('\n\n')
    : ''
  return {
    schema: ANSWER_SCHEMA,
    model: 'mechanical-rag',
    backend: adapter.id,
    adapter: adapter.id,
    family: adapter.family,
    pipeline: adapter.pipeline,
    observed_at: opts.now ?? new Date().toISOString(),
    query: String(query || ''),
    retrieved_n: retrieval?.retrieved_n ?? hits.length,
    max_score: retrieval?.max_score ?? 0,
    text,
    citations,
    live_llm: false,
    live_haystack: false,
    live_llamaindex: false,
    haystack: adapter.family === 'haystack',
    llamaindex: adapter.family === 'llamaindex',
    github_write: false,
    webhook_posted: false,
    multi_source: false,
    federated: false,
  }
}

export function gateAnswer(report) {
  const issues = []
  const blob = JSON.stringify(report || {})
  const citationIds = new Set((report?.citations || []).map((row) => row.id))

  if (report?.schema !== ANSWER_SCHEMA) {
    issues.push({ severity: 'high', code: 'bad_schema', message: 'Answer schema mismatch' })
  }
  if (report?.github_write || report?.comments_posted || report?.issues_opened) {
    issues.push({ severity: 'high', code: 'github_write', message: 'RAG must not write to GitHub' })
  }
  if (report?.webhook_posted) {
    issues.push({ severity: 'high', code: 'webhook_posted', message: 'RAG must not post webhooks' })
  }
  if (report?.live_llm || report?.backend === 'openai' || report?.backend === 'llm') {
    issues.push({ severity: 'high', code: 'live_llm', message: 'Must not call a live LLM' })
  }
  if (report?.live_haystack || report?.live_llamaindex || report?.backend === 'haystack' || report?.backend === 'llamaindex') {
    issues.push({ severity: 'high', code: 'framework', message: 'Live Haystack / LlamaIndex packages are refused' })
  }
  if (report?.haystack && report?.backend !== 'haystack-adapter') {
    issues.push({ severity: 'high', code: 'framework', message: 'haystack flag requires haystack-adapter backend' })
  }
  if (report?.llamaindex && report?.backend !== 'llamaindex-adapter') {
    issues.push({ severity: 'high', code: 'framework', message: 'llamaindex flag requires llamaindex-adapter backend' })
  }
  if (report?.multi_source || report?.federated) {
    issues.push({ severity: 'high', code: 'multi_source', message: 'Phase 1 is single-source only' })
  }
  if (report?.generator_self_score != null || report?.self_score != null) {
    issues.push({ severity: 'high', code: 'self_grade', message: 'Generator self-score is not a gate pass' })
  }
  if (FORBIDDEN.test(blob)) {
    issues.push({ severity: 'high', code: 'extra_entity', message: 'Program token in query or answer' })
  }
  if (STUB.test(blob)) {
    issues.push({ severity: 'high', code: 'stub_as_done', message: 'Stub language in answer' })
  }
  if (!(report?.retrieved_n > 0) || !(report?.max_score > 0)) {
    issues.push({ severity: 'high', code: 'empty_retrieval', message: 'No corpus hits for query' })
  } else if ((report.max_score || 0) < 0.34) {
    issues.push({ severity: 'medium', code: 'weak_retrieval', message: 'Retrieval score too low to ship' })
  }
  if ((report?.retrieved_n > 0) && !(report?.citations || []).length) {
    issues.push({ severity: 'high', code: 'missing_citation', message: 'Retrieved hits shipped without citations' })
  }
  if ((report?.citations || []).some((row) => !row.id || !row.quote)) {
    issues.push({ severity: 'high', code: 'missing_citation', message: 'Citation missing id or quote' })
  }
  if (report?.text && (report.citations || []).length) {
    const claimed = [...String(report.text).matchAll(/\[([a-z0-9-]+)\]/g)].map((row) => row[1])
    if (claimed.some((id) => !citationIds.has(id))) {
      issues.push({ severity: 'high', code: 'uncited_claim', message: 'Answer cites a document that was not retrieved' })
    }
  }

  const highIssue = issues.some((row) => row.severity === 'high')
  const warnIssue = issues.some((row) => row.severity === 'medium')
  const verdict = highIssue ? 'fail' : warnIssue ? 'warn' : 'pass'
  const act = verdict === 'pass'
  return {
    ...report,
    issues,
    verdict,
    act,
    delivered: act,
  }
}

export function answer(query, opts = {}) {
  if (opts.post === true || opts.githubWrite === true || opts.comment === true || opts.issue === true) {
    refuseGitHubWrite('rag')
  }
  if (opts.llm === true || opts.openai === true || opts.liveLlm === true) {
    refuseLiveLlm()
  }
  if (opts.multiSource === true || opts.federated === true) refuseMultiSource()
  const adapter = resolveAdapter(opts)
  const retrieval = retrieveWithAdapter(query, opts)
  return gateAnswer(synthesize(query, retrieval, { ...opts, adapter }))
}
