import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkerScript = resolve(projectRoot, 'scripts/check-migration-docs.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-migration-docs-'))
}

function writeFile(cwd, file, text) {
  const path = resolve(cwd, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

function writeMigrationFiles(cwd) {
  for (const name of [
    '001_initial_schema.sql',
    '002_seed_recipes.sql',
    '004_user_targets.sql',
  ]) {
    writeFile(cwd, `supabase/migrations/${name}`, '-- migration\n')
  }
}

function validDoc() {
  return [
    'Supabase SQL Editor で `supabase/migrations` を番号順に適用します。',
    '',
    '```text',
    '001_initial_schema.sql',
    '002_seed_recipes.sql',
    '004_user_targets.sql',
    '```',
    '',
    '`003` は過去に別途適用済みとして扱われています。',
    '',
  ].join('\n')
}

function writeValidFiles(cwd, overrides = {}) {
  writeMigrationFiles(cwd)
  writeFile(cwd, 'README.md', overrides.readme ?? validDoc())
  writeFile(cwd, 'DEPLOYMENT.md', overrides.deployment ?? validDoc())
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
  writeValidFiles(cwd)

  const result = runChecker(cwd)
  assert(result.status === 0, `valid migration docs should pass\n${result.stderr}`)
  assert(
    result.stdout.includes('migration docs check passed'),
    'valid migration docs should print a pass message',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    readme: [
      'Supabase SQL Editor で適用します。',
      '001_initial_schema.sql',
      '004_user_targets.sql',
      '`003` は過去に別途適用済みとして扱われています。',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing migration in README should fail')
  assert(
    result.stderr.includes('README.md should list 002_seed_recipes.sql'),
    'missing migration failure should explain the missing filename',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    deployment: [
      'Supabase SQL Editor で適用します。',
      '002_seed_recipes.sql',
      '001_initial_schema.sql',
      '004_user_targets.sql',
      '`003` は過去に別途適用済みとして扱われています。',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'out-of-order migrations should fail')
  assert(
    result.stderr.includes('DEPLOYMENT.md should list migrations in numeric order'),
    'out-of-order migration failure should explain the ordering rule',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    readme: [
      'Supabase SQL Editor で適用します。',
      '001_initial_schema.sql',
      '002_seed_recipes.sql',
      '004_user_targets.sql',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing migration gap explanation should fail')
  assert(
    result.stderr.includes('README.md should explain missing migration number 003'),
    'missing gap explanation failure should mention the missing number',
  )
})

console.log('migration docs self-test passed')
