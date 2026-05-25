import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkerScript = resolve(projectRoot, 'scripts/check-doc-mojibake.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-doc-mojibake-'))
}

function runChecker(cwd, docs) {
  return spawnSync(process.execPath, [checkerScript, ...docs], {
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
  writeFileSync(resolve(cwd, 'clean.md'), '# 日本語の文書\n\n意味が読める状態です。\n')

  const result = runChecker(cwd, ['clean.md'])
  assert(result.status === 0, `clean Japanese document should pass\n${result.stderr}`)
  assert(
    result.stdout.includes('documentation mojibake check passed: 1 file(s)'),
    'clean document should print checked file count',
  )
})

withTempWorkspace((cwd) => {
  writeFileSync(resolve(cwd, 'broken.md'), '# 繝昴・繝医ヵ繧ｩ繝ｪ繧ｪ\n')

  const result = runChecker(cwd, ['broken.md'])
  assert(result.status === 1, 'mojibake document should fail')
  assert(
    result.stderr.includes('Possible mojibake detected'),
    'mojibake failure should explain the issue',
  )
  assert(
    result.stderr.includes('broken.md:1'),
    'mojibake failure should include file and line',
  )
})

withTempWorkspace((cwd) => {
  const result = runChecker(cwd, ['missing.md'])
  assert(result.status === 1, 'missing document should fail')
  assert(
    result.stderr.includes('Documentation file does not exist'),
    'missing document failure should explain the missing file',
  )
})

console.log('documentation mojibake self-test passed')
