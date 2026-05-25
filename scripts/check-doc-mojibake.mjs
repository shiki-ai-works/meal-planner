import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const defaultDocs = [
  'README.md',
  'PORTFOLIO.md',
  'ROADMAP.md',
  'NEXT_CHAT_HANDOFF.md',
  'DEPLOYMENT.md',
]

const mojibakeFragments = [
  '繝',
  '縺',
  '蜈',
  '譁',
  '逕',
  '蛻',
  '迪',
  '譬',
  '蝗',
  '雋',
  '荳',
  '隕',
  '螳',
  '豈',
  '邱',
  '窶',
  '笆',
  '笨',
]

function progressDocs() {
  const progressDir = resolve('progress')
  if (!existsSync(progressDir)) return []

  return readdirSync(progressDir)
    .filter((name) => /^PROGRESS_\d+\.md$/.test(name))
    .map((name) => `progress/${name}`)
}

function docsToCheck() {
  const args = process.argv.slice(2)
  return args.length > 0 ? args : [...defaultDocs, ...progressDocs()]
}

function lineNumberAt(text, index) {
  let line = 1
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1
  }
  return line
}

function findMojibake(text) {
  const findings = []

  for (const fragment of mojibakeFragments) {
    let index = text.indexOf(fragment)
    while (index !== -1) {
      findings.push({
        fragment,
        line: lineNumberAt(text, index),
      })
      index = text.indexOf(fragment, index + fragment.length)
    }
  }

  return findings.sort((a, b) => a.line - b.line || a.fragment.localeCompare(b.fragment))
}

let checked = 0

for (const doc of docsToCheck()) {
  const docPath = resolve(doc)
  if (!existsSync(docPath)) {
    throw new Error(`Documentation file does not exist: ${doc}`)
  }
  if (!statSync(docPath).isFile()) {
    throw new Error(`Documentation path is not a file: ${doc}`)
  }

  checked += 1
  const text = readFileSync(docPath, 'utf8')
  const findings = findMojibake(text)
  if (findings.length > 0) {
    const preview = findings
      .slice(0, 8)
      .map((finding) => `${doc}:${finding.line} contains "${finding.fragment}"`)
      .join('\n')
    throw new Error(`Possible mojibake detected in ${doc}\n${preview}`)
  }
}

console.log(`documentation mojibake check passed: ${checked} file(s)`)
