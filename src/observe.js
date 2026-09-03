/**
 * Phase 4 local mechanical observability.
 * JSON spans on the answer; no OTEL, Prometheus, Jaeger, or network export.
 */

export const TRACE_SCHEMA = 'gate-enforced-rag.trace.v1'
export const REQUIRED_SPANS = ['retrieve', 'synthesize', 'evaluator_gate']
export const PRE_GATE_SPANS = ['retrieve', 'synthesize']

export function refuseLiveTelemetry(action = 'otel') {
  const error = new Error(`${action} refused: Phase 4 is a local JSON trace. Live OTEL / Prometheus / Jaeger export is out of scope.`)
  error.code = 'live_telemetry_refused'
  throw error
}

export function retrieveSpan(retrieval = {}) {
  return {
    name: 'retrieve',
    status: (retrieval.retrieved_n || 0) > 0 ? 'ok' : 'empty',
    retrieved_n: retrieval.retrieved_n ?? 0,
    max_score: retrieval.max_score ?? 0,
    silos: retrieval.silos || ['contracts'],
  }
}

export function synthesizeSpan(report = {}) {
  const n = (report.citations || []).length
  return {
    name: 'synthesize',
    status: n > 0 ? 'ok' : 'missing_citation',
    citations_n: n,
  }
}

export function gateSpan(report = {}) {
  return {
    name: 'evaluator_gate',
    status: report.verdict || 'unknown',
    act: report.act === true,
    issues_n: (report.issues || []).length,
  }
}

export function buildTrace(retrieval, report) {
  return {
    schema: TRACE_SCHEMA,
    exporter: 'local-json',
    live_otel: false,
    spans: [retrieveSpan(retrieval), synthesizeSpan(report)],
  }
}

export function completeTrace(report) {
  const prior = report?.trace?.spans || []
  const withoutGate = prior.filter((span) => span.name !== 'evaluator_gate')
  return {
    schema: TRACE_SCHEMA,
    exporter: report?.trace?.exporter || 'local-json',
    live_otel: false,
    spans: [...withoutGate, gateSpan(report)],
  }
}

export function traceIssues(report) {
  const issues = []
  if (report?.live_otel || report?.prometheus || report?.jaeger || report?.datadog || report?.trace?.live_otel) {
    issues.push({ severity: 'high', code: 'live_telemetry', message: 'Live OTEL / Prometheus / Jaeger export is refused' })
  }
  if (report?.trace?.exporter && report.trace.exporter !== 'local-json') {
    issues.push({ severity: 'high', code: 'live_telemetry', message: 'Trace exporter must be local-json' })
  }
  const needsTrace = report?.observe === true || Boolean(report?.trace)
  if (!needsTrace) return issues
  const names = new Set((report?.trace?.spans || []).map((span) => span.name))
  if (report?.trace?.schema !== TRACE_SCHEMA) {
    issues.push({ severity: 'high', code: 'bad_trace', message: 'Trace schema mismatch' })
  }
  const required = names.has('evaluator_gate') || report?.verdict != null
    ? REQUIRED_SPANS
    : PRE_GATE_SPANS
  if (required.some((name) => !names.has(name))) {
    issues.push({ severity: 'high', code: 'incomplete_trace', message: 'Trace missing retrieve, synthesize, or evaluator_gate span' })
  }
  return issues
}
