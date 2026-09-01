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
  if (args.includes('--haystack')) refuseFramework('haystack')
  if (args.includes('--llamaindex')) refuseFramework('llamaindex')
  if (args.includes('--multi-source') || args.includes('--federated')) refuseMultiSource()
  const rest = args.filter((arg) => ![
    '--github-write', '--comment', '--issue', '--llm', '--openai',
    '--haystack', '--llamaindex', '--multi-source', '--federated',
  ].includes(arg))
  return { input: rest.join(' ') }
}

function main() {
  const { input } = parseArgs(process.argv)
  let query = 'What is a gate pass?'
  if (input.endsWith('.json')) {
    const payload = JSON.parse(readFileSync(input, 'utf8'))
    query = payload.query || query
  } else if (input.trim()) {
    query = input.trim()
  }
  process.stdout.write(`${JSON.stringify(answer(query), null, 2)}\n`)
}

const invoked = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invoked) main()
