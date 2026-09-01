# AGENTS.md

## Read first

1. [README.md](README.md) and [STATUS.md](STATUS.md)
2. [CONTRACT.md](CONTRACT.md)
3. [portfolio-kit DATA_POLICY](https://github.com/PCSchmidt/portfolio-kit/blob/main/docs/DATA_POLICY.md)

## Do

- Keep answer JSON field names stable.
- Run `npm test` and `npm run eval` after retriever or gate changes.
- Use public / synthetic corpus snippets only.

## Do not

- Start redteam-blue-gate.
- Load Haystack, LlamaIndex, or a live LLM in Phase 1.
- Open GitHub issues or post webhooks.
- Put JPO / F-35 content in fixtures except as known-bad eval strings.
- Treat a generator self-score as a pass.
- Download Qwen / jacobian-lens (that is meridian-jspace Phase 2).
