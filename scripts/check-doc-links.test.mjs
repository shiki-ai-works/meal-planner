import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkerScript = resolve(projectRoot, 'scripts/check-doc-links.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-doc-links-'))
}

function writeRequiredDocs(cwd, overrides = {}) {
  const defaults = {
    'README.md': [
      '[Portfolio](PORTFOLIO.md)',
      '[Roadmap](ROADMAP.md#now)',
      '[Guide](docs/guide.md)',
      '![Shot](public/portfolio/shot.jpg)',
      '![Root shot](/portfolio/root-shot.jpg)',
      '[External](https://example.com)',
      '[Route](/demo)',
      '```md',
      '[Ignored](missing-in-code-block.md)',
      '```',
    ].join('\n'),
    'PORTFOLIO.md': '[Readme](README.md)\n',
    'ROADMAP.md': '[Progress](progress/PROGRESS_001.md)\n',
    'NEXT_CHAT_HANDOFF.md': '[Deployment](DEPLOYMENT.md)\n',
    'DEPLOYMENT.md': '[Readme](README.md)\n',
  }

  for (const [path, content] of Object.entries({ ...defaults, ...overrides })) {
    writeFileSync(resolve(cwd, path), content)
  }
}

function writeSupportFiles(cwd) {
  mkdirSync(resolve(cwd, 'docs'), { recursive: true })
  mkdirSync(resolve(cwd, 'progress'), { recursive: true })
  mkdirSync(resolve(cwd, 'public/portfolio'), { recursive: true })
  writeFileSync(resolve(cwd, 'docs/guide.md'), '# Guide\n')
  writeFileSync(resolve(cwd, 'progress/PROGRESS_001.md'), '# Progress\n')
  writeFileSync(resolve(cwd, 'public/portfolio/shot.jpg'), 'fake jpg for link check\n')
  writeFileSync(resolve(cwd, 'public/portfolio/root-shot.jpg'), 'fake jpg for link check\n')
}

function runChecker(cwd) {
  return spawnSync(process.execPath, [checkerScript], {
    cwd,
    encoding: 'utf8',
  })
}

function withTempWorkspace(run) {
  const cwd = makeTempWorkspace()

  try {
    run(cwd)
  } finally {
    rmSync(cwd, { force: true, recursive: true })
  }
}

withTempWorkspace((cwd) => {
  writeRequiredDocs(cwd)
  writeSupportFiles(cwd)

  const result = runChecker(cwd)
  assert(result.status === 0, `valid docs should pass\n${result.stderr}`)
  assert(
    result.stdout.includes('documentation links check passed'),
    'valid docs should print a success summary',
  )
})

withTempWorkspace((cwd) => {
  writeRequiredDocs(cwd, {
    'README.md': '[Missing](docs/missing.md)\n',
  })
  writeSupportFiles(cwd)

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing local link should fail')
  assert(
    result.stderr.includes('references missing local target'),
    'missing local link failure should explain the target',
  )
})

withTempWorkspace((cwd) => {
  writeRequiredDocs(cwd, {
    'README.md': '[Route](/demo)\n[External](https://example.com)\n',
  })
  writeSupportFiles(cwd)

  const result = runChecker(cwd)
  assert(result.status === 0, `route and external links should be skipped\n${result.stderr}`)
})

console.log('documentation links self-test passed')
