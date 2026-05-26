<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- PRODUCTIZATION_GUIDANCE_START -->
## Productization guidance

The user is not assuming prior professional product-development experience. When working on this project, proactively suggest missing productization needs as they become relevant instead of waiting for the user to ask.

- Explain unfamiliar IT or product terms briefly when they appear.
- Separate suggestions into practical priority levels such as required now, important soon, later, and risks.
- Prefer concrete artifacts when helpful: templates, checklists, logs, README updates, backlog items, privacy notes, release checks, and operational rules.
- Treat the user as the product owner and learning partner; avoid assuming they already know standard industry practices.
<!-- PRODUCTIZATION_GUIDANCE_END -->

<!-- NEXTCHAT_WORKFLOW_START -->
## #nextchat workflow

When the user includes `#nextchat`, preserve the current session context for the next chat.

- Update `NEXT_CHAT_HANDOFF.md` with a concise Japanese handoff.
- Include: current project state, decisions made, implemented changes, verification results, known gaps, and suggested next actions.
- Explain unfamiliar IT/product terms briefly inside the handoff when useful.
- Do not include secrets, access tokens, `.env.local` values, private account IDs, or raw sensitive logs.
- Do not commit or push unless the user also includes `#obsidiangit` or explicitly asks for Git publication.
- Keep Obsidian vault preservation separate unless the user explicitly asks to save or publish a note there.
<!-- NEXTCHAT_WORKFLOW_END -->

<!-- OBSIDIANGIT_WORKFLOW_START -->
## #obsidiangit workflow

When the user includes `#obsidiangit`, treat it as permission to preserve project context and publish the active software project to its own GitHub repository, not only to the Obsidian vault.

- First inspect `git status --short --branch`, `git remote -v`, and the relevant diff.
- Do not stage ignored secrets such as `.env.local`, service role keys, or local-only manifests.
- Commit only the intended project files, then push to the repository configured as the active project remote.
- Keep the existing Obsidian vault workflow separate unless the user also asks to save a note there.
<!-- OBSIDIANGIT_WORKFLOW_END -->
