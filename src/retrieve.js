/**
 * Keyword retriever over one public corpus.
 * Phase 1 does not call Haystack, LlamaIndex, or embeddings APIs.
 */

import { DEFAULT_CORPUS, tokenize } from './corpus.js'

export function scoreDoc(queryTokens, doc) {
  if (!queryTokens.length) return 0
  const bag = new Set(tokenize(`${doc.title || ''} ${doc.text || ''}`))
  let hits = 0
  for (const token of queryTokens) {
    if (bag.has(token)) hits += 1
  }
  return hits / queryTokens.length
}

export function retrieve(query, opts = {}) {
  const corpus = opts.corpus || DEFAULT_CORPUS
  const k = opts.k ?? 3
  const queryTokens = tokenize(query)
  const ranked = corpus
    .map((doc) => ({
      id: doc.id,
      path: doc.path,
      title: doc.title,
      text: doc.text,
      score: scoreDoc(queryTokens, doc),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
  return {
    query: String(query || ''),
    backend: 'mechanical-keyword',
    hits: ranked,
    retrieved_n: ranked.length,
    max_score: ranked[0]?.score ?? 0,
  }
}
