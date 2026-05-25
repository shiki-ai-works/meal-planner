import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const recipeImageScript = resolve(
  projectRoot,
  'scripts/generate-recipe-image-sql.mjs',
)

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-recipe-images-'))
}

function runRecipeImageScript(cwd, args = []) {
  return spawnSync(process.execPath, [recipeImageScript, ...args], {
    cwd,
    encoding: 'utf8',
  })
}

function parseJson(stdout) {
  try {
    return JSON.parse(stdout)
  } catch (error) {
    fail(`stdout is not valid JSON: ${error.message}\n${stdout}`)
  }
}

function withTempWorkspace(run) {
  const cwd = makeTempWorkspace()

  try {
    run(cwd)
  } finally {
    rmSync(cwd, { force: true, recursive: true })
  }
}

function writeSeedMigrations(cwd) {
  const migrationsDir = resolve(cwd, 'supabase/migrations')
  mkdirSync(migrationsDir, { recursive: true })

  writeFileSync(
    resolve(migrationsDir, '002_seed_recipes.sql'),
    [
      'insert into public.recipes (name) values',
      "  ('Breakfast Rice');",
      '',
    ].join('\n'),
    'utf8',
  )
  writeFileSync(
    resolve(migrationsDir, '005_detailed_recipes.sql'),
    [
      'insert into public.recipes (name) values',
      "  ('Dinner Soup');",
      '',
    ].join('\n'),
    'utf8',
  )
}

function writeActualManifest(cwd, recipes = [
  {
    name: 'Breakfast Rice',
    image_urls: ['https://images.local/breakfast-rice.jpg'],
  },
  {
    name: 'Dinner Soup',
    image_urls: ['https://images.local/dinner-soup.jpg'],
  },
]) {
  const supabaseDir = resolve(cwd, 'supabase')
  mkdirSync(supabaseDir, { recursive: true })
  writeFileSync(
    resolve(supabaseDir, 'recipe-images.actual.json'),
    JSON.stringify({ recipes }, null, 2),
    'utf8',
  )
}

function writeMigrationSql(cwd, content = '-- intentionally stale recipe image SQL\n') {
  const migrationsDir = resolve(cwd, 'supabase/migrations')
  mkdirSync(migrationsDir, { recursive: true })
  writeFileSync(
    resolve(migrationsDir, '007_recipe_images.sql'),
    content,
    'utf8',
  )
}

function writeSourceNotes(cwd, sources = [
  {
    recipe: 'Breakfast Rice',
    image_url: 'https://images.local/breakfast-rice.jpg',
    source_page_url: 'https://sources.local/breakfast-rice',
    author: 'Test Author',
    license: 'CC0 1.0',
    fit: 'exact',
  },
  {
    recipe: 'Dinner Soup',
    image_url: 'https://images.local/dinner-soup.jpg',
    source_page_url: 'https://sources.local/dinner-soup',
    author: 'Test Author',
    license: 'CC BY 4.0',
    fit: 'close',
  },
]) {
  const supabaseDir = resolve(cwd, 'supabase')
  mkdirSync(supabaseDir, { recursive: true })
  writeFileSync(
    resolve(supabaseDir, 'recipe-images.sources.json'),
    JSON.stringify({ schemaVersion: 1, sources }, null, 2),
    'utf8',
  )
}

function readWorkflowJson(cwd) {
  const result = runRecipeImageScript(cwd, ['--workflow-json'])
  assert(result.status === 0, 'workflow JSON should pass')
  assert(result.stderr === '', 'workflow JSON should not warn')
  const workflow = parseJson(result.stdout)

  assertWorkflowMatchesSchema(workflow, readWorkflowSchema(cwd))
  return workflow
}

function readWorkflowSchema(cwd) {
  const result = runRecipeImageScript(cwd, ['--workflow-schema'])
  assert(result.status === 0, 'workflow schema should pass')
  assert(result.stderr === '', 'workflow schema should not warn')
  return parseJson(result.stdout)
}

function assertFileStateMatchesSchema(fileState, label) {
  assert(typeof fileState?.path === 'string', `${label}.path should be a string`)
  assert(
    fileState.status === 'present' || fileState.status === 'missing',
    `${label}.status should be present or missing`,
  )
  assert(typeof fileState.exists === 'boolean', `${label}.exists should be boolean`)
}

function assertActionItemMatchesSchema(action, index, schema) {
  const actionTypes = schema.definitions.WorkflowActionItem.fields.type

  for (const key of schema.definitions.WorkflowActionItem.required) {
    assert(action[key] != null, `nextActionItems[${index}].${key} should exist`)
  }

  assert(typeof action.id === 'string', `nextActionItems[${index}].id should be string`)
  assert(
    actionTypes.includes(action.type),
    `nextActionItems[${index}].type should be documented`,
  )
  assert(
    typeof action.label === 'string',
    `nextActionItems[${index}].label should be string`,
  )
  if (action.command != null) {
    assert(
      typeof action.command === 'string',
      `nextActionItems[${index}].command should be string`,
    )
  }
  if (action.path != null) {
    assert(
      typeof action.path === 'string',
      `nextActionItems[${index}].path should be string`,
    )
  }
  if (action.paths != null) {
    assert(
      Array.isArray(action.paths) &&
        action.paths.every((path) => typeof path === 'string'),
      `nextActionItems[${index}].paths should be string[]`,
    )
  }
  if (action.count != null) {
    assert(
      typeof action.count === 'number',
      `nextActionItems[${index}].count should be number`,
    )
  }
}

function assertWorkflowMatchesSchema(workflow, schema) {
  const expectedFields = Object.keys(schema.fields)

  for (const key of expectedFields) {
    assert(key in workflow, `workflow should include ${key}`)
  }

  assert(
    workflow.schemaVersion === schema.schemaVersion,
    'workflow schemaVersion should match schema',
  )
  assert(
    schema.fields.status.values.includes(workflow.status),
    'workflow status should be documented by schema',
  )
  for (const key of Object.keys(schema.fields.files.fields)) {
    assertFileStateMatchesSchema(workflow.files[key], `files.${key}`)
  }
  assert(
    workflow.summary === null || typeof workflow.summary === 'object',
    'workflow summary should be object or null',
  )
  assert(Array.isArray(workflow.nextActionItems), 'nextActionItems should be array')
  workflow.nextActionItems.forEach((action, index) => {
    assertActionItemMatchesSchema(action, index, schema)
  })
  assert(Array.isArray(workflow.nextActions), 'nextActions should be array')
  assert(
    workflow.nextActions.join('\n') ===
      workflow.nextActionItems.map((action) => action.label).join('\n'),
    'nextActions should be derived from nextActionItems labels',
  )
}

withTempWorkspace((cwd) => {
  const schema = readWorkflowSchema(cwd)
  assert(schema.schemaVersion === 1, 'workflow schema version should be 1')
  assert(
    schema.command === 'npm.cmd run --silent recipe-images:workflow:json',
    'workflow schema should document JSON command',
  )
  assert(
    schema.fields.status.values.includes('missing-actual-manifest'),
    'workflow schema should list status values',
  )
  assert(
    schema.definitions.WorkflowActionItem.fields.type.includes('command'),
    'workflow schema should list command action type',
  )
  assert(
    schema.definitions.WorkflowActionItem.optional.includes('paths'),
    'workflow schema should document paths metadata',
  )
  assert(
    schema.fields.files.fields.sourceNotes === 'WorkflowFileState',
    'workflow schema should document source notes file state',
  )
})

withTempWorkspace((cwd) => {
  const result = runRecipeImageScript(cwd, ['--workflow-json'])
  assert(result.status === 0, 'missing actual manifest workflow JSON should pass')
  assert(result.stderr === '', 'missing actual manifest workflow JSON should not warn')

  const workflow = parseJson(result.stdout)
  assertWorkflowMatchesSchema(workflow, readWorkflowSchema(cwd))
  assert(workflow.schemaVersion === 1, 'workflow JSON schema version should be 1')
  assert(
    workflow.status === 'missing-actual-manifest',
    'missing actual manifest should expose status',
  )
  assert(workflow.summary === null, 'missing actual manifest summary should be null')
  assert(
    workflow.files.actualManifest.status === 'missing',
    'missing actual manifest should be reported',
  )
  assert(
    workflow.nextActions[0] === 'run npm.cmd run recipe-images:init-actual',
    'missing actual manifest should suggest init-actual first',
  )
  assert(
    workflow.nextActions.join('\n') ===
      workflow.nextActionItems.map((action) => action.label).join('\n'),
    'missing actual manifest string actions should match structured labels',
  )
  assert(
    workflow.nextActionItems[0].id === 'create-actual-manifest',
    'missing actual manifest should expose structured init action',
  )
  assert(
    workflow.nextActionItems[0].command === 'npm.cmd run recipe-images:init-actual',
    'structured init action should expose command',
  )
  assert(
    workflow.nextActionItems[0].path === 'supabase/recipe-images.actual.json',
    'structured init action should expose target path',
  )
  assert(
    workflow.nextActionItems[2].paths.includes('supabase/migrations/007_recipe_images.sql'),
    'rerun workflow action should expose watched paths',
  )
  assert(
    workflow.nextActionItems[2].paths.includes('supabase/recipe-images.sources.json'),
    'rerun workflow action should expose source notes path',
  )
})

withTempWorkspace((cwd) => {
  writeSeedMigrations(cwd)
  writeActualManifest(cwd, [
    {
      name: 'Breakfast Rice',
      image_urls: ['https://images.local/breakfast-rice.jpg'],
    },
    {
      name: 'Dinner Soup',
      image_urls: [],
    },
  ])

  const workflow = readWorkflowJson(cwd)
  assert(
    workflow.status === 'collecting-image-urls',
    'empty image URLs should expose collecting status',
  )
  assert(
    workflow.summary.recipesMissingImageUrls === 1,
    'collecting status should report missing image URL count',
  )
  assert(
    workflow.nextActionItems.some((action) => action.id === 'fill-image-urls'),
    'collecting status should expose structured fill action',
  )
  assert(
    workflow.nextActionItems.find((action) => action.id === 'fill-image-urls').path ===
      'supabase/recipe-images.actual.json',
    'fill action should expose actual manifest path',
  )
})

withTempWorkspace((cwd) => {
  writeSeedMigrations(cwd)
  writeActualManifest(cwd, [
    {
      name: 'Breakfast Rice',
      image_urls: ['https://example.com/breakfast-rice.jpg'],
    },
    {
      name: 'Dinner Soup',
      image_urls: ['https://images.local/dinner-soup.jpg'],
    },
  ])

  const workflow = readWorkflowJson(cwd)
  assert(
    workflow.status === 'needs-warning-review',
    'warning-only manifest should expose warning-review status',
  )
  assert(workflow.summary.warnings === 1, 'warning-review status should report warnings')
})

withTempWorkspace((cwd) => {
  writeSeedMigrations(cwd)
  writeActualManifest(cwd, [
    {
      name: 'Breakfast Rice',
      image_urls: ['https://images.local/breakfast-rice.jpg'],
    },
    {
      name: 'Extra Recipe',
      image_urls: ['https://images.local/extra-recipe.jpg'],
    },
  ])

  const workflow = readWorkflowJson(cwd)
  assert(
    workflow.status === 'blocked-by-errors',
    'seed coverage errors should expose blocked status',
  )
  assert(workflow.summary.errors > 0, 'blocked status should report errors')
})

withTempWorkspace((cwd) => {
  writeSeedMigrations(cwd)
  writeActualManifest(cwd)

  const result = runRecipeImageScript(cwd, ['--workflow-json'])
  assert(result.status === 0, 'ready actual manifest workflow JSON should pass')
  assert(result.stderr === '', 'ready actual manifest workflow JSON should not warn')
  assert(
    !result.stdout.startsWith('- recipes:'),
    'workflow JSON should not include human-readable summary lines',
  )

  const workflow = parseJson(result.stdout)
  assertWorkflowMatchesSchema(workflow, readWorkflowSchema(cwd))
  assert(
    workflow.status === 'ready-to-generate-migration',
    'ready actual manifest without migration should expose status',
  )
  assert(workflow.summary.recipes === 2, 'workflow summary should count recipes')
  assert(
    workflow.summary.readyForActualMigration === true,
    'ready actual manifest should be migration-ready',
  )
  assert(
    workflow.summary.migrationSync === 'missing',
    'ready actual manifest without migration should report missing sync',
  )
  assert(
    workflow.nextActions.includes('run npm.cmd run recipe-images:actual-migration'),
    'ready actual manifest should suggest actual migration generation',
  )
  assert(
    workflow.nextActionItems.some(
      (action) =>
        action.id === 'generate-actual-migration' &&
        action.command === 'npm.cmd run recipe-images:actual-migration',
    ),
    'ready actual manifest should expose structured migration generation action',
  )
  assert(
    workflow.nextActionItems.find((action) => action.id === 'generate-actual-migration')
      .path === 'supabase/migrations/007_recipe_images.sql',
    'migration generation action should expose migration path',
  )
})

withTempWorkspace((cwd) => {
  writeSeedMigrations(cwd)
  writeActualManifest(cwd)
  writeMigrationSql(cwd)

  const workflow = readWorkflowJson(cwd)
  assert(
    workflow.status === 'migration-outdated',
    'stale migration should expose outdated status',
  )
  assert(
    workflow.summary.migrationSync === 'outdated',
    'stale migration should report outdated sync',
  )
})

withTempWorkspace((cwd) => {
  writeSeedMigrations(cwd)
  writeActualManifest(cwd)
  writeSourceNotes(cwd)

  const migrationResult = runRecipeImageScript(cwd, [
    '--strict',
    '--require-seed-recipes',
    '--output',
    'supabase/migrations/007_recipe_images.sql',
    'supabase/recipe-images.actual.json',
  ])
  assert(migrationResult.status === 0, 'actual migration generation should pass')

  const workflow = readWorkflowJson(cwd)
  assert(
    workflow.status === 'ready-to-apply-migration',
    'current migration should expose apply-ready status',
  )
  assert(
    workflow.summary.migrationSync === 'current',
    'current migration should report current sync',
  )
  assert(
    workflow.nextActionItems.some((action) => action.id === 'apply-actual-migration'),
    'current migration should expose structured apply action',
  )
  assert(
    workflow.nextActionItems.some((action) => action.id === 'check-image-sources'),
    'current migration should expose source notes check action when source notes exist',
  )
  assert(
    workflow.nextActionItems.find((action) => action.id === 'check-image-sources')
      .paths.includes('supabase/recipe-images.actual.json'),
    'source notes check action should expose actual manifest path',
  )
  assert(
    workflow.nextActionItems.find((action) => action.id === 'apply-actual-migration')
      .path === 'supabase/migrations/007_recipe_images.sql',
    'apply action should expose migration path',
  )
})

withTempWorkspace((cwd) => {
  writeSeedMigrations(cwd)
  writeActualManifest(cwd)
  writeSourceNotes(cwd, [
    {
      recipe: 'Breakfast Rice',
      image_url: 'https://images.local/breakfast-rice.jpg',
      source_page_url: 'https://sources.local/breakfast-rice',
      author: 'See source page',
      license: 'See source page',
      fit: 'exact',
    },
    {
      recipe: 'Dinner Soup',
      image_url: 'https://images.local/dinner-soup.jpg',
      source_page_url: 'https://sources.local/dinner-soup',
      author: 'Test Author',
      license: 'CC BY 4.0',
      fit: 'close',
    },
  ])

  const result = runRecipeImageScript(cwd, ['--sources-check'])
  assert(result.status === 0, 'placeholder attribution warning should not fail source notes check')
  assert(
    result.stderr.includes('Breakfast Rice'),
    'placeholder attribution warning should name the recipe to review',
  )
})

withTempWorkspace((cwd) => {
  writeSeedMigrations(cwd)
  writeActualManifest(cwd)
  writeSourceNotes(cwd)

  const result = runRecipeImageScript(cwd, ['--sources-check'])
  assert(result.status === 0, 'source notes check should pass')
  assert(result.stderr === '', 'source notes check should not warn for complete notes')
  assert(
    result.stdout.includes('OK: source notes cover 2 recipe image URL(s)'),
    'source notes check should report coverage',
  )
})

withTempWorkspace((cwd) => {
  writeSeedMigrations(cwd)
  writeActualManifest(cwd)
  writeSourceNotes(cwd, [
    {
      recipe: 'Breakfast Rice',
      image_url: 'https://images.local/breakfast-rice.jpg',
      source_page_url: 'https://sources.local/breakfast-rice',
      author: 'Test Author',
      license: 'CC0 1.0',
      fit: 'exact',
    },
  ])

  const result = runRecipeImageScript(cwd, ['--sources-check'])
  assert(result.status === 1, 'source notes check should fail when a URL lacks a source note')
  assert(
    result.stderr.includes('missing source note for image_url'),
    'source notes check should explain missing notes',
  )
})

withTempWorkspace((cwd) => {
  writeSeedMigrations(cwd)
  writeActualManifest(cwd)

  const result = runRecipeImageScript(cwd, ['--workflow'])
  assert(result.status === 0, 'human workflow should pass for ready manifest')
  assert(
    result.stdout.startsWith('Recipe image actual workflow\n'),
    'human workflow should start with its heading',
  )
  assert(
    result.stdout.includes('- status: ready-to-generate-migration'),
    'human workflow should include status',
  )
  assert(result.stdout.includes('- recipes: 2'), 'human workflow should include summary')
  assert(
    result.stdout.includes('- migration sync: missing'),
    'human workflow should include migration sync',
  )
})

withTempWorkspace((cwd) => {
  const result = runRecipeImageScript(cwd, ['--workflow', '--workflow-json'])
  assert(result.status === 1, 'workflow modes should be mutually exclusive')
  assert(
    result.stderr.includes('--workflow modes cannot be used together'),
    'mutually exclusive workflow modes should explain the conflict',
  )
})

console.log('recipe image workflow self-test passed')
