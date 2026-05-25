import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkerScript = resolve(projectRoot, 'scripts/check-portfolio-assets.mjs')
const jpegBytes = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(16)])
const pngBytes = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(16),
])

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-portfolio-assets-'))
}

function writePortfolioWorkspace(cwd, { readmeTarget, portfolioTarget, files }) {
  mkdirSync(resolve(cwd, 'public/portfolio'), { recursive: true })
  writeFileSync(resolve(cwd, 'README.md'), `![README preview](${readmeTarget})\n`)
  writeFileSync(resolve(cwd, 'PORTFOLIO.md'), `![Portfolio preview](${portfolioTarget})\n`)

  for (const [path, bytes] of Object.entries(files)) {
    writeFileSync(resolve(cwd, path), bytes)
  }
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
  writePortfolioWorkspace(cwd, {
    readmeTarget: 'public/portfolio/readme.jpg',
    portfolioTarget: '/portfolio/case-study.png',
    files: {
      'public/portfolio/readme.jpg': jpegBytes,
      'public/portfolio/case-study.png': pngBytes,
    },
  })

  const result = runChecker(cwd)
  assert(result.status === 0, `valid image references should pass\n${result.stderr}`)
  assert(
    result.stdout.includes('2 reference(s), 2 image file(s)'),
    'valid image references should print checked counts',
  )
})

withTempWorkspace((cwd) => {
  writePortfolioWorkspace(cwd, {
    readmeTarget: 'public/portfolio/readme.jpg',
    portfolioTarget: 'public/portfolio/missing.jpg',
    files: {
      'public/portfolio/readme.jpg': jpegBytes,
    },
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing image should fail')
  assert(
    result.stderr.includes('references missing portfolio image'),
    'missing image failure should explain the missing reference',
  )
})

withTempWorkspace((cwd) => {
  writePortfolioWorkspace(cwd, {
    readmeTarget: 'public/portfolio/readme.png',
    portfolioTarget: 'public/portfolio/case-study.jpg',
    files: {
      'public/portfolio/readme.png': jpegBytes,
      'public/portfolio/case-study.jpg': jpegBytes,
    },
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'extension/content mismatch should fail')
  assert(
    result.stderr.includes('.png extension does not match its content'),
    'mismatch failure should explain the extension/content problem',
  )
})

console.log('portfolio assets self-test passed')
