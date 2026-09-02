/**
 * Phase 3 local multi-silo router.
 * Retrieves per public fixture silo, merges hits, fail-closes on claim contradictions.
 * Does not scrape Wikipedia / arXiv or call federated remotes.
 */

import { SILOS } from './corpus.js'
import { retrieve } from './retrieve.js'

export function refuseFederated(action = 'federated') {
  const error = new Error(`${action} refused: Phase 3 is local multi-silo only. Live Wikipedia / arXiv federation is out of scope.`)
  error.code = 'federated_refused'
  throw error
}

export function findContradictions(hits) {
  const byTopic = new Map()
  for (const hit of hits || []) {
    for (const claim of hit.claims || []) {
      const topic = String(claim.topic || '')
      if (!topic) continue
      const rows = byTopic.get(topic) || []
      rows.push({
        silo: hit.silo || 'contracts',
        id: hit.id,
        value: claim.value,
      })
      byTopic.set(topic, rows)
    }
  }
  const contradictions = []
  for (const [topic, rows] of byTopic.entries()) {
    const values = [...new Set(rows.map((row) => String(row.value)))]
    if (values.length > 1) {
      contradictions.push({ topic, values, sources: rows })
    }
  }
  return contradictions
}

export function routeRetrieve(query, opts = {}) {
  if (opts.federated === true || opts.liveSilos === true || opts.wikipedia === true || opts.arxiv === true) {
    refuseFederated()
  }
  const silos = opts.silos || SILOS
  const perSiloK = opts.perSiloK ?? 2
  const k = opts.k ?? 4
  const hits = []
  const used = []
  for (const silo of silos) {
    const retrieval = retrieve(query, { ...opts, corpus: silo.docs, k: perSiloK })
    if (!retrieval.retrieved_n) continue
    used.push(silo.id)
    for (const hit of retrieval.hits) {
      hits.push({ ...hit, silo: silo.id })
    }
  }
  hits.sort((a, b) => b.score - a.score)
  const seen = new Set()
  const merged = []
  for (const hit of hits) {
    if (seen.has(hit.id)) continue
    seen.add(hit.id)
    merged.push(hit)
    if (merged.length >= k) break
  }
  return {
    query: String(query || ''),
    backend: 'mechanical-keyword',
    hits: merged,
    retrieved_n: merged.length,
    max_score: merged[0]?.score ?? 0,
    silos: used,
    multi_source: true,
    federated: false,
    contradictions: findContradictions(merged),
  }
}
