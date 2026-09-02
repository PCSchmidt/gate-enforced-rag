/**
 * Phase 2 CI-safe adapters.
 * Same mechanical keyword retriever, Haystack / LlamaIndex pipeline shape.
 * Does not import haystack, llama-index, pip, or embeddings APIs.
 */

import { retrieve } from './retrieve.js'
import { routeRetrieve } from './router.js'

export const ADAPTERS = {
  mechanical: {
    id: 'mechanical-keyword',
    family: 'mechanical',
    pipeline: ['keyword_retriever', 'extractive_synth', 'evaluator_gate'],
  },
  haystack: {
    id: 'haystack-adapter',
    family: 'haystack',
    pipeline: ['document_store', 'keyword_retriever', 'prompt_builder', 'evaluator_gate'],
  },
  llamaindex: {
    id: 'llamaindex-adapter',
    family: 'llamaindex',
    pipeline: ['vector_store_proxy', 'retriever', 'response_synthesizer', 'evaluator_gate'],
  },
}

export function refuseLiveFramework(name = 'haystack') {
  const error = new Error(`${name} package refused: Phase 2 is a CI-safe adapter. pip/npm Haystack / LlamaIndex is out of scope.`)
  error.code = 'live_framework_refused'
  throw error
}

export function resolveAdapter(opts = {}) {
  if (opts.liveHaystack === true || opts.pipHaystack === true || opts.installHaystack === true) {
    refuseLiveFramework('haystack')
  }
  if (opts.liveLlamaindex === true || opts.pipLlamaindex === true || opts.installLlamaindex === true) {
    refuseLiveFramework('llamaindex')
  }
  if (opts.haystack === true && opts.llamaindex === true) {
    const error = new Error('Choose one adapter: haystack or llamaindex')
    error.code = 'adapter_conflict'
    throw error
  }
  if (opts.haystack === true) return ADAPTERS.haystack
  if (opts.llamaindex === true) return ADAPTERS.llamaindex
  return ADAPTERS.mechanical
}

export function retrieveWithAdapter(query, opts = {}) {
  const adapter = resolveAdapter(opts)
  const retrieval = opts.multiSource === true
    ? routeRetrieve(query, opts)
    : retrieve(query, opts)
  return {
    ...retrieval,
    adapter: adapter.id,
    family: adapter.family,
    pipeline: adapter.pipeline,
  }
}
