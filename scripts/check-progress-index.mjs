import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const progressDir = resolve('progress')
const roadmapPath = resolve('ROADMAP.md')
const progressNamePattern = /^PROGRESS_(\d+)\.md$/

function readText(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Required file does not exist: ${filePath}`)
  }
  if (!statSync(filePath).isFile()) {
    throw new Error(`Required path is not a file: ${filePath}`)
  }
  return readFileSync(filePath, 'utf8')
}

function numberedProgressNotes() {
  if (!existsSync(progressDir)) {
    throw new Error(`Progress directory does not exist: ${progressDir}`)
  }

  const notes = []
  let ignored = 0

  for (const name of readdirSync(progressDir)) {
    const match = progressNamePattern.exec(name)
    if (!match) {
      if (name.startsWith('PROGRESS_') && name.endsWith('.md')) ignored += 1
      continue
    }

    notes.push({
      name,
      id: name.replace(/\.md$/, ''),
      number: Number(match[1]),
      path: join(progressDir, name),
    })
  }

  if (notes.length === 0) {
    throw new Error('No numbered progress notes found in progress/')
  }

  notes.sort((a, b) => a.number - b.number || a.name.localeCompare(b.name))
  return { ignored, notes }
}

function assertLatestHeading(latest) {
  const text = readText(latest.path)
  const firstLine = text.split(/\r?\n/, 1)[0]
  const expectedHeading = `# ${latest.id}`

  if (firstLine !== expectedHeading) {
    throw new Error(`${latest.name} should start with "${expectedHeading}" but starts with "${firstLine}"`)
  }
}

function assertRoadmapReferencesLatest(latest) {
  const roadmap = readText(roadmapPath)
  const lines = roadmap.split(/\r?\n/)
  const finalUpdateLine = lines.find((line) => line.startsWith('**最終更新:**'))

  if (!finalUpdateLine) {
    throw new Error('ROADMAP.md is missing a final update line')
  }
  if (!finalUpdateLine.includes(latest.id)) {
    throw new Error(`ROADMAP.md final update should mention ${latest.id}`)
  }
  if (!roadmap.includes(`progress/${latest.name}`)) {
    throw new Error(`ROADMAP.md should link to progress/${latest.name}`)
  }
}

function main() {
  const { ignored, notes } = numberedProgressNotes()
  const latest = notes.at(-1)

  assertLatestHeading(latest)
  assertRoadmapReferencesLatest(latest)

  const ignoredSuffix = ignored > 0 ? `, ${ignored} nonstandard progress note(s) ignored` : ''
  console.log(`progress index check passed: latest ${latest.id}, ${notes.length} numbered note(s)${ignoredSuffix}`)
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
