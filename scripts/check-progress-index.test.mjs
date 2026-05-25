import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkerScript = resolve(projectRoot, 'scripts/check-progress-index.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-progress-index-'))
}

function runChecker(cwd) {
  return spawnSync(process.execPath, [checkerScript], {
    cwd,
    encoding: 'utf8',
  })
}

function writeProgress(cwd, id, heading = `# ${id}`) {
  writeFileSync(resolve(cwd, 'progress', `${id}.md`), `${heading}\n\nprogress note\n`)
}

function writeRoadmap(cwd, latestId, linkedId = latestId) {
  writeFileSync(
    resolve(cwd, 'ROADMAP.md'),
    [
      '# ROADMAP',
      '',
      `**最終更新:** 2026-05-26 (${latestId} 時点)`,
      '',
      '## 関連ドキュメント',
      '',
      `- [${linkedId}](progress/${linkedId}.md)`,
      '',
    ].join('\n'),
  )
}

function withTempWorkspace(run) {
  const cwd = makeTempWorkspace()

  try {
    mkdirSync(resolve(cwd, 'progress'))
    run(cwd)
  } finally {
    rmSync(cwd, { force: true, recursive: true })
  }
}

withTempWorkspace((cwd) => {
  writeProgress(cwd, 'PROGRESS_001')
  writeProgress(cwd, 'PROGRESS_002')
  writeFileSync(resolve(cwd, 'progress', 'PROGRESS_01_2.md'), '# PROGRESS_01_2\n')
  writeRoadmap(cwd, 'PROGRESS_002')

  const result = runChecker(cwd)
  assert(result.status === 0, `valid progress index should pass\n${result.stderr}`)
  assert(
    result.stdout.includes('progress index check passed: latest PROGRESS_002'),
    'valid progress index should print latest note',
  )
  assert(
    result.stdout.includes('nonstandard progress note(s) ignored'),
    'nonstandard progress notes should be ignored and reported',
  )
})

withTempWorkspace((cwd) => {
  writeProgress(cwd, 'PROGRESS_001')
  writeProgress(cwd, 'PROGRESS_002')
  writeRoadmap(cwd, 'PROGRESS_002', 'PROGRESS_001')

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing latest roadmap link should fail')
  assert(
    result.stderr.includes('ROADMAP.md should link to progress/PROGRESS_002.md'),
    'missing latest roadmap link failure should explain the missing link',
  )
})

withTempWorkspace((cwd) => {
  writeProgress(cwd, 'PROGRESS_001')
  writeProgress(cwd, 'PROGRESS_002', '# Wrong heading')
  writeRoadmap(cwd, 'PROGRESS_002')

  const result = runChecker(cwd)
  assert(result.status === 1, 'latest note heading mismatch should fail')
  assert(
    result.stderr.includes('PROGRESS_002.md should start with "# PROGRESS_002"'),
    'heading mismatch failure should explain the expected heading',
  )
})

console.log('progress index self-test passed')
