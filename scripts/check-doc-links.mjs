import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const defaultDocs = [
  'README.md',
  'PORTFOLIO.md',
  'ROADMAP.md',
  'NEXT_CHAT_HANDOFF.md',
  'DEPLOYMENT.md',
]

const docs = process.argv.slice(2)
const docsToCheck = docs.length > 0 ? docs : defaultDocs
const externalTargetPattern = /^(?:https?:|mailto:|tel:|data:|app:|javascript:)/i

function stripFencedCodeBlocks(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, '')
}

function extractHref(rawTarget) {
  const trimmed = rawTarget.trim()
  if (trimmed.startsWith('<')) {
    const closingIndex = trimmed.indexOf('>')
    return closingIndex === -1 ? trimmed.slice(1) : trimmed.slice(1, closingIndex)
  }
  return trimmed.split(/\s+/)[0]
}

function markdownLinkTargets(markdown) {
  const targets = []
  const linkPattern = /!?\[[^\]]*]\(([^)]+)\)/g
  let match

  while ((match = linkPattern.exec(stripFencedCodeBlocks(markdown))) != null) {
    targets.push(extractHref(match[1]))
  }

  return targets
}

function withoutFragment(target) {
  const hashIndex = target.indexOf('#')
  return hashIndex === -1 ? target : target.slice(0, hashIndex)
}

function decodeTarget(target) {
  try {
    return decodeURIComponent(target)
  } catch {
    return target
  }
}

function targetToPath(target, sourceDoc) {
  if (!target || target.startsWith('#') || externalTargetPattern.test(target)) return null

  const pathOnly = decodeTarget(withoutFragment(target))
  if (!pathOnly) return null

  if (pathOnly.startsWith('/portfolio/')) return resolve(`public${pathOnly}`)
  if (pathOnly.startsWith('/')) return null

  return resolve(dirname(sourceDoc), pathOnly)
}

function assertLocalTargetExists(target, sourceDoc) {
  const targetPath = targetToPath(target, sourceDoc)
  if (!targetPath) return false

  if (!existsSync(targetPath)) {
    throw new Error(`${sourceDoc} references missing local target: ${target}`)
  }

  const stats = statSync(targetPath)
  if (!stats.isFile() && !stats.isDirectory()) {
    throw new Error(`${sourceDoc} references an unsupported local target: ${target}`)
  }

  return true
}

let checked = 0

for (const doc of docsToCheck) {
  const docPath = resolve(doc)
  if (!existsSync(docPath)) {
    throw new Error(`Documentation file does not exist: ${doc}`)
  }

  const markdown = readFileSync(docPath, 'utf8')
  for (const target of markdownLinkTargets(markdown)) {
    if (assertLocalTargetExists(target, docPath)) checked += 1
  }
}

console.log(`documentation links check passed: ${checked} local target(s)`)
