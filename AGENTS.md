<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- OBSIDIANGIT_WORKFLOW_START -->
## #obsidiangit workflow

When the user includes `#obsidiangit`, treat it as permission to preserve project context and publish the active software project to its own GitHub repository, not only to the Obsidian vault.

- First inspect `git status --short --branch`, `git remote -v`, and the relevant diff.
- Do not stage ignored secrets such as `.env.local`, service role keys, or local-only manifests.
- Commit only the intended project files, then push to the repository configured as the active project remote.
- Keep the existing Obsidian vault workflow separate unless the user also asks to save a note there.
<!-- OBSIDIANGIT_WORKFLOW_END -->
