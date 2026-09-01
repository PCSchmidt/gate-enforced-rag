#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { answer, refuseFramework, refuseGitHubWrite, refuseLiveLlm, refuseMultiSource } from './answer.js'

function parseArgs(argv) {
  const args = argv.slice(2)
  if (args.includes('--github-write') || args.includes('--comment') || args.includes('--issue')) {
    refuseGitHubWrite('cli')
  }
  if (args.includes('--llm') || args.includes('--openai')) {
    refuseLiveLlm('cli')
  }
  if (args.includes('--live-haystack') || args.includes('--pip-haystack') || args.includes('--install-haystack')) {
    refuseFramework('haystack')
  }
  if (args.includes('--live-llamaindex') || args.includes('--pip-llamaindex') || args.includes('--install-llamaindex')) {
    refuseFramework('llamaindex')
  }
  if (args.includes('--multi-source') || args.includes('--federated')) refuseMultiSource()
  const rest = args.filter((arg) => ![
    '--github-write', '--comment', '--issue', '--llm', '--openai',
    '--haystack', '--llamaindex', '--multi-source', '--federated',
    '--live-haystack', '--pip-haystack', '--install-haystack',
    '--live-llamaindex', '--pip-llamaindex', '--install-llamaindex',
  ].includes(arg))
  return {
    input: rest.join(' '),
    haystack: args.includes('--haystack'),
    llamaindex: args.includes('--llamaindex'),
  }
}

function main() {
  const { input, haystack, llamaindex } = parseArgs(process.argv)
  let query = 'What is a gate pass?'
  if (input.endsWith('.json')) {
    const payload = JSON.parse(readFileSync(input, 'utf8'))
    query = payload.query || query
  } else if (input.trim()) {
    query = input.trim()
  }
  process.stdout.write(`${JSON.stringify(answer(query, { haystack, llamaindex }), null, 2)}\n`)
}

const invoked = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invoked) main()
