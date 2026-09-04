/**
 * Cordis-shaped local dsh bundle for gate-enforced-rag.
 * No dsh runtime, network, LLM, or remote telemetry is required.
 */

import { answer } from './answer.js'

export const name = 'gate-enforced-rag'

export const tool = {
  name: 'gate-enforced-rag.answer',
  description: 'Answer a public or synthetic corpus query only after the Evaluator gate passes.',
  input: {
    type: 'object',
    required: ['query'],
    properties: {
      query: { type: 'string' },
      multiSource: { type: 'boolean' },
      observe: { type: 'boolean' },
    },
  },
}

export function createService(ctx = {}) {
  const service = {
    name,
    tool,
    answer: (query, options = {}) => {
      const report = answer(query, options)
      ctx.emit?.('rag.answer', report)
      return report
    },
  }
  return service
}

export function apply(ctx = {}) {
  const service = createService(ctx)
  if (typeof ctx.provide === 'function') ctx.provide('gateEnforcedRag', service)
  else ctx.gateEnforcedRag = service
  if (typeof ctx.registerTool === 'function') ctx.registerTool(tool, service.answer)
  if (ctx.logger && typeof ctx.logger.info === 'function') {
    ctx.logger.info(`[${name}] plugin loaded`)
  }
  return service
}
