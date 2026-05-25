import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'

const args = process.argv.slice(2)

function fail(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

function normalizePathForMessage(filePath) {
  return filePath.replaceAll('\\', '/')
}

function buildMissingManifestHint(filePath) {
  const normalizedPath = normalizePathForMessage(filePath)

  if (normalizedPath.endsWith('supabase/recipe-images.actual.json')) {
    return 'Run npm.cmd run recipe-images:init-actual to create it.'
  }

  return 'Pass an existing manifest path, or run npm.cmd run recipe-images:template to print a seed-based template.'
}

function stripByteOrderMark(source) {
  return source.charCodeAt(0) === 0xfeff ? source.slice(1) : source
}

function readManifest(filePath) {
  let source

  try {
    source = stripByteOrderMark(readFileSync(filePath, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') {
      fail(
        `manifest file not found: ${filePath}\n${buildMissingManifestHint(filePath)}`,
      )
    }
    throw error
  }

  try {
    return JSON.parse(source)
  } catch (error) {
    if (error instanceof SyntaxError) {
      fail(`manifest file is not valid JSON: ${filePath}\n${error.message}`)
    }
    throw error
  }
}

function readOptionValue(optionName) {
  const inlineValues = args
    .filter((arg) => arg.startsWith(`${optionName}=`))
    .map((arg) => arg.slice(optionName.length + 1))
  const separateIndexes = args
    .map((arg, index) => (arg === optionName ? index : -1))
    .filter((index) => index >= 0)

  if (inlineValues.length + separateIndexes.length > 1) {
    fail(`${optionName} can only be specified once`)
  }

  if (inlineValues.length === 1) {
    if (!inlineValues[0]) fail(`${optionName} requires a value`)
    return inlineValues[0]
  }

  if (separateIndexes.length === 1) {
    const value = args[separateIndexes[0] + 1]
    if (!value || value.startsWith('--')) fail(`${optionName} requires a value`)
    return value
  }

  return null
}

function readPositionalArgs() {
  const positionalArgs = []

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]

    if (arg === '--output') {
      index++
      continue
    }

    if (arg === '--missing-output') {
      index++
      continue
    }

    if (arg === '--template-output') {
      index++
      continue
    }

    if (arg.startsWith('--output=')) continue
    if (arg.startsWith('--missing-output=')) continue
    if (arg.startsWith('--template-output=')) continue

    if (!arg.startsWith('--')) positionalArgs.push(arg)
  }

  return positionalArgs
}

const checkOnly = args.includes('--check')
const allowEmptyUrls = args.includes('--allow-empty')
const requireSeedRecipes = args.includes('--require-seed-recipes')
const printTemplate = args.includes('--print-template')
const checkGeneratedTemplate = args.includes('--check-generated-template')
const actualWorkflow = args.includes('--workflow')
const actualWorkflowJson = args.includes('--workflow-json')
const actualWorkflowSchema = args.includes('--workflow-schema')
const actualSourcesCheck = args.includes('--sources-check')
const actualWorkflowMode =
  actualWorkflow || actualWorkflowJson || actualWorkflowSchema
const reportOnly = args.includes('--report')
const listMissingImagesOnly = args.includes('--list-missing-images')
const missingMarkdown = args.includes('--missing-markdown')
const strict = args.includes('--strict')
const forceOutput = args.includes('--force')
const outputSqlPath = readOptionValue('--output')
const missingMarkdownOutputPath = readOptionValue('--missing-output')
const templateOutputPath = readOptionValue('--template-output')
const positionalArgs = readPositionalArgs()
const manifestPath = positionalArgs[0]
const seedRecipeFiles = [
  'supabase/migrations/002_seed_recipes.sql',
  'supabase/migrations/005_detailed_recipes.sql',
]
const actualManifestPath = 'supabase/recipe-images.actual.json'
const actualTodoPath = 'supabase/recipe-images.todo.md'
const actualMigrationPath = 'supabase/migrations/007_recipe_images.sql'
const actualSourcesPath = 'supabase/recipe-images.sources.json'
const actualWorkflowStatusValues = [
  'missing-actual-manifest',
  'blocked-by-errors',
  'collecting-image-urls',
  'needs-warning-review',
  'not-ready',
  'ready-to-generate-migration',
  'migration-outdated',
  'ready-to-apply-migration',
  'ready',
]
const actualWorkflowActionTypes = ['command', 'manual']

if (positionalArgs.length > 1) {
  fail(`Unexpected extra positional argument: ${positionalArgs[1]}`)
}

if (
  forceOutput &&
  !outputSqlPath &&
  !missingMarkdownOutputPath &&
  !templateOutputPath
) {
  fail('--force can only be used with --output, --missing-output, or --template-output')
}

if (missingMarkdown && !listMissingImagesOnly) {
  fail('--missing-markdown can only be used with --list-missing-images')
}

if (
  actualSourcesCheck &&
  (
    actualWorkflowMode ||
    checkOnly ||
    allowEmptyUrls ||
    requireSeedRecipes ||
    printTemplate ||
    checkGeneratedTemplate ||
    reportOnly ||
    listMissingImagesOnly ||
    missingMarkdown ||
    strict ||
    forceOutput ||
    outputSqlPath ||
    missingMarkdownOutputPath ||
    templateOutputPath ||
    manifestPath
  )
) {
  fail('--sources-check cannot be combined with other modes, output options, or a manifest path')
}

if (missingMarkdownOutputPath && (!listMissingImagesOnly || !missingMarkdown)) {
  fail('--missing-output can only be used with --list-missing-images --missing-markdown')
}

if (
  [actualWorkflow, actualWorkflowJson, actualWorkflowSchema].filter(Boolean)
    .length > 1
) {
  fail('--workflow modes cannot be used together')
}

if (
  actualWorkflowMode &&
  (
    checkOnly ||
    allowEmptyUrls ||
    requireSeedRecipes ||
    printTemplate ||
    checkGeneratedTemplate ||
    reportOnly ||
    listMissingImagesOnly ||
    missingMarkdown ||
    strict ||
    forceOutput ||
    outputSqlPath ||
    missingMarkdownOutputPath ||
    templateOutputPath
  )
) {
  fail('--workflow modes cannot be combined with other modes or output options')
}

if (outputSqlPath && missingMarkdownOutputPath) {
  fail('--output and --missing-output cannot be used together')
}

if (templateOutputPath && (outputSqlPath || missingMarkdownOutputPath)) {
  fail('--template-output cannot be used with --output or --missing-output')
}

if (
  outputSqlPath &&
  (
    checkOnly ||
    printTemplate ||
    checkGeneratedTemplate ||
    reportOnly ||
    listMissingImagesOnly
  )
) {
  fail('--output can only be used when generating SQL')
}

if (
  templateOutputPath &&
  (
    checkOnly ||
    printTemplate ||
    checkGeneratedTemplate ||
    reportOnly ||
    listMissingImagesOnly ||
    strict ||
    allowEmptyUrls ||
    requireSeedRecipes
  )
) {
  fail('--template-output cannot be used with check, report, strict, or seed validation modes')
}

if (printTemplate) {
  if (manifestPath) {
    fail('--print-template does not accept a manifest path')
  }

  console.log(formatJson(buildTemplateManifest()))
  process.exit(0)
}

if (templateOutputPath) {
  if (manifestPath) {
    fail('--template-output does not accept a manifest path')
  }

  const writtenPath = writeTextFile(
    templateOutputPath,
    formatJson(buildTemplateManifest()),
    { force: forceOutput },
  )
  console.log(`OK: wrote template manifest to ${writtenPath}`)
  process.exit(0)
}

if (actualWorkflowMode) {
  if (manifestPath) {
    fail('--workflow modes do not accept a manifest path')
  }

  if (actualWorkflowSchema) {
    process.stdout.write(formatJson(buildActualWorkflowSchema()))
  } else if (actualWorkflowJson) {
    const workflow = buildActualWorkflow()
    process.stdout.write(formatJson(workflow))
  } else {
    const workflow = buildActualWorkflow()
    printActualWorkflow(workflow)
  }

  process.exit(0)
}

if (actualSourcesCheck) {
  runActualSourcesCheck()
  process.exit(0)
}

if (!manifestPath) {
  console.error(
    'Usage: node scripts/generate-recipe-image-sql.mjs <manifest.json> [--check] [--report] [--list-missing-images] [--missing-markdown] [--missing-output <file>] [--allow-empty] [--require-seed-recipes] [--check-generated-template] [--strict] [--output <file>] [--force]\n       node scripts/generate-recipe-image-sql.mjs --print-template\n       node scripts/generate-recipe-image-sql.mjs --template-output <file> [--force]\n       node scripts/generate-recipe-image-sql.mjs --workflow\n       node scripts/generate-recipe-image-sql.mjs --workflow-json\n       node scripts/generate-recipe-image-sql.mjs --workflow-schema\n       node scripts/generate-recipe-image-sql.mjs --sources-check',
  )
  process.exit(1)
}

if (allowEmptyUrls && !checkOnly && !reportOnly && !listMissingImagesOnly) {
  fail('--allow-empty can only be used with --check, --report, or --list-missing-images')
}

if (strict && allowEmptyUrls) {
  fail('--strict cannot be used with --allow-empty')
}

const manifest = readManifest(manifestPath)

if (!Array.isArray(manifest.recipes)) {
  fail('manifest.recipes must be an array')
}

function validateUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function validateManifest(recipes, { allowEmptyUrls = false } = {}) {
  const errors = []
  const warnings = []
  const seenNames = new Set()
  const recipeNames = []
  const missingImageRecipeNames = []
  let emptyUrlCount = 0
  let recipeWithUrlCount = 0
  let totalUrlCount = 0
  let invalidUrlCount = 0
  let duplicateUrlCount = 0
  let exampleUrlCount = 0

  recipes.forEach((recipe, index) => {
    const label = `recipes[${index}]`
    const name = typeof recipe?.name === 'string' ? recipe.name.trim() : ''

    if (!name) {
      errors.push(`${label}.name must be a non-empty string`)
    } else if (seenNames.has(name)) {
      errors.push(`${label}.name is duplicated: ${name}`)
    } else {
      seenNames.add(name)
      recipeNames.push(name)
    }

    if (!Array.isArray(recipe?.image_urls)) {
      errors.push(`${label}.image_urls must be an array`)
      return
    }

    const urls = []
    const seenUrls = new Set()

    recipe.image_urls.forEach((url, urlIndex) => {
      if (typeof url !== 'string') {
        errors.push(`${label}.image_urls[${urlIndex}] must be a string`)
        return
      }
      const trimmed = url.trim()
      if (trimmed.length > 0) urls.push(trimmed)
    })

    if (urls.length === 0) {
      const message = `${label}.image_urls must contain at least one non-empty URL`
      if (name) missingImageRecipeNames.push(name)
      if (allowEmptyUrls) emptyUrlCount++
      else errors.push(message)
    } else {
      recipeWithUrlCount++
      totalUrlCount += urls.length
    }

    urls.forEach((url) => {
      if (!validateUrl(url)) {
        invalidUrlCount++
        errors.push(`${label}.image_urls has an invalid URL: ${url}`)
      }
      if (seenUrls.has(url)) {
        duplicateUrlCount++
        warnings.push(`${label}.image_urls contains a duplicate URL: ${url}`)
      }
      if (url.includes('example.com')) {
        exampleUrlCount++
        warnings.push(`${label}.image_urls still uses example.com: ${url}`)
      }
      seenUrls.add(url)
    })
  })

  if (allowEmptyUrls && emptyUrlCount > 0) {
    warnings.push(
      `${emptyUrlCount} recipe image mapping(s) have empty image_urls because --allow-empty is enabled`,
    )
  }

  return {
    errors,
    warnings,
    recipeCount: seenNames.size,
    recipeNames,
    missingImageRecipeNames,
    emptyUrlCount,
    recipeWithUrlCount,
    totalUrlCount,
    invalidUrlCount,
    duplicateUrlCount,
    exampleUrlCount,
  }
}

function sourceKey(recipeName, imageUrl) {
  return `${recipeName}\n${imageUrl}`
}

function validateSourceNotes(actualRecipes, sourceNotes) {
  const errors = []
  const warnings = []
  const actualUrlKeys = new Set()
  const actualEntries = []

  for (const recipe of actualRecipes) {
    const recipeName = typeof recipe?.name === 'string' ? recipe.name.trim() : ''
    if (!recipeName || !Array.isArray(recipe?.image_urls)) continue

    for (const imageUrl of recipe.image_urls) {
      if (typeof imageUrl !== 'string') continue
      const trimmedUrl = imageUrl.trim()
      if (!trimmedUrl) continue

      const key = sourceKey(recipeName, trimmedUrl)
      actualUrlKeys.add(key)
      actualEntries.push({ key, recipeName, imageUrl: trimmedUrl })
    }
  }

  if (sourceNotes?.schemaVersion !== 1) {
    errors.push('sources.schemaVersion must be 1')
  }

  if (!Array.isArray(sourceNotes?.sources)) {
    errors.push('sources.sources must be an array')
    return {
      errors,
      warnings,
      sourceCount: 0,
      expectedUrlCount: actualEntries.length,
      placeholderAttributionCount: 0,
      placeholderAttributionRecipes: [],
    }
  }

  const seenKeys = new Set()
  const allowedFits = new Set(['exact', 'close', 'representative'])
  let placeholderAttributionCount = 0
  const placeholderAttributionRecipes = []

  sourceNotes.sources.forEach((source, index) => {
    const label = `sources[${index}]`
    const recipeName =
      typeof source?.recipe === 'string' ? source.recipe.trim() : ''
    const imageUrl =
      typeof source?.image_url === 'string' ? source.image_url.trim() : ''
    const sourcePageUrl =
      typeof source?.source_page_url === 'string'
        ? source.source_page_url.trim()
        : ''
    const author = typeof source?.author === 'string' ? source.author.trim() : ''
    const license = typeof source?.license === 'string' ? source.license.trim() : ''
    const fit = typeof source?.fit === 'string' ? source.fit.trim() : ''

    if (!recipeName) errors.push(`${label}.recipe must be a non-empty string`)
    if (!imageUrl) errors.push(`${label}.image_url must be a non-empty string`)
    else if (!validateUrl(imageUrl)) {
      errors.push(`${label}.image_url must be an http(s) URL: ${imageUrl}`)
    }
    if (!sourcePageUrl) {
      errors.push(`${label}.source_page_url must be a non-empty string`)
    } else if (!validateUrl(sourcePageUrl)) {
      errors.push(`${label}.source_page_url must be an http(s) URL: ${sourcePageUrl}`)
    }
    if (!author) errors.push(`${label}.author must be a non-empty string`)
    if (!license) errors.push(`${label}.license must be a non-empty string`)
    if (!allowedFits.has(fit)) {
      errors.push(`${label}.fit must be one of: ${Array.from(allowedFits).join(', ')}`)
    }

    if (author.startsWith('See ') || license.startsWith('See ')) {
      placeholderAttributionCount++
      if (recipeName) placeholderAttributionRecipes.push(recipeName)
    }

    if (!recipeName || !imageUrl) return

    const key = sourceKey(recipeName, imageUrl)
    if (seenKeys.has(key)) {
      errors.push(`${label} duplicates source note for recipe/image_url: ${recipeName}`)
    }
    seenKeys.add(key)

    if (!actualUrlKeys.has(key)) {
      errors.push(`${label} does not match an image_url in ${actualManifestPath}: ${recipeName}`)
    }
  })

  for (const entry of actualEntries) {
    if (!seenKeys.has(entry.key)) {
      errors.push(
        `missing source note for image_url in ${actualManifestPath}: ${entry.recipeName}`,
      )
    }
  }

  if (placeholderAttributionCount > 0) {
    warnings.push(
      `${placeholderAttributionCount} source note(s) still ask the reviewer to inspect the source page for attribution/license details: ${formatNameList(placeholderAttributionRecipes)}`,
    )
  }

  return {
    errors,
    warnings,
    sourceCount: sourceNotes.sources.length,
    expectedUrlCount: actualEntries.length,
    placeholderAttributionCount,
    placeholderAttributionRecipes,
  }
}

function formatNameList(values, { limit = 12 } = {}) {
  if (values.length <= limit) return values.join(', ')

  return `${values.slice(0, limit).join(', ')} (+${values.length - limit} more)`
}

function runActualSourcesCheck() {
  const actualManifest = readManifest(actualManifestPath)
  if (!Array.isArray(actualManifest.recipes)) {
    fail('manifest.recipes must be an array')
  }

  const sourceNotes = readManifest(actualSourcesPath)
  const validation = validateManifest(actualManifest.recipes)
  const seedValidation = validateSeedRecipeCoverage(
    validation.recipeNames,
    loadSeedRecipeNames(),
  )
  const sourceValidation = validateSourceNotes(actualManifest.recipes, sourceNotes)
  const errors = [
    ...validation.errors,
    ...seedValidation.errors,
    ...sourceValidation.errors,
  ]
  const warnings = [...validation.warnings, ...sourceValidation.warnings]

  for (const warning of warnings) {
    console.error(`Warning: ${warning}`)
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`Error: ${error}`)
    }
    process.exit(1)
  }

  console.log(
    `OK: source notes cover ${sourceValidation.expectedUrlCount} recipe image URL(s) from ${actualManifestPath}`,
  )
  console.log(
    `OK: checked ${sourceValidation.sourceCount} source note(s) in ${actualSourcesPath}`,
  )
}

function sqlStringValue(value) {
  return value.replaceAll("''", "'")
}

function extractInsertedRecipeNames(sql, filePath) {
  const names = []
  const rowStartPattern = /^[ \t]*\('((?:''|[^'])*)'/gm

  for (const match of sql.matchAll(rowStartPattern)) {
    names.push(sqlStringValue(match[1]))
  }

  if (names.length === 0) {
    throw new Error(`No recipe insert rows found in ${filePath}`)
  }

  return names
}

function loadSeedRecipeNames() {
  const names = []

  for (const filePath of seedRecipeFiles) {
    const sql = readFileSync(filePath, 'utf8')
    names.push(...extractInsertedRecipeNames(sql, filePath))
  }

  return names
}

function buildTemplateManifest() {
  return {
    recipes: loadSeedRecipeNames().map((name) => ({
      name,
      image_urls: [],
    })),
  }
}

function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function validateSeedRecipeCoverage(manifestNames, seedNames) {
  const errors = []
  const seenSeedNames = new Set()
  const duplicateSeedNames = new Set()

  for (const name of seedNames) {
    if (seenSeedNames.has(name)) duplicateSeedNames.add(name)
    seenSeedNames.add(name)
  }

  for (const name of duplicateSeedNames) {
    errors.push(`seed recipe name is duplicated: ${name}`)
  }

  const manifestSet = new Set(manifestNames)
  const seedSet = new Set(seedNames)
  const missingNames = seedNames.filter((name) => !manifestSet.has(name))
  const extraNames = manifestNames.filter((name) => !seedSet.has(name))

  for (const name of missingNames) {
    errors.push(`manifest is missing seeded recipe: ${name}`)
  }

  for (const name of extraNames) {
    errors.push(`manifest includes recipe not found in seed migrations: ${name}`)
  }

  return {
    errors,
    seedRecipeCount: seedSet.size,
  }
}

function sqlString(value) {
  return String(value).replaceAll("'", "''")
}

function sqlArray(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return 'null'
  const values = urls
    .filter((url) => typeof url === 'string' && url.trim().length > 0)
    .map((url) => `'${sqlString(url.trim())}'`)
  if (values.length === 0) return 'null'
  return `array[${values.join(', ')}]`
}

function buildRecipeImageSql(recipes) {
  const rows = recipes
    .filter((recipe) => recipe?.name && Array.isArray(recipe.image_urls))
    .map(
      (recipe) =>
        `  ('${sqlString(recipe.name.trim())}', ${sqlArray(recipe.image_urls)})`,
    )

  if (rows.length === 0) {
    throw new Error('No recipes with name and image_urls found')
  }

  return `-- Generated by scripts/generate-recipe-image-sql.mjs
-- Review before running in Supabase SQL Editor.
-- Rows with status = 'missing' did not match a recipe in public.recipes.

with image_map(name, image_urls) as (
  values
${rows.join(',\n')}
),
updated as (
  update public.recipes r
  set image_urls = image_map.image_urls
  from image_map
  where r.name = image_map.name
  returning r.name, r.image_urls
)
select
  image_map.name,
  case when updated.name is null then 'missing' else 'updated' end as status,
  updated.image_urls
from image_map
left join updated on updated.name = image_map.name
order by image_map.name;
`
}

function writeTextFile(filePath, content, { force = false } = {}) {
  const absolutePath = resolve(filePath)

  if (existsSync(absolutePath) && !force) {
    fail(`${filePath} already exists. Pass --force to overwrite it.`)
  }

  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content, 'utf8')
  return absolutePath
}

function formatReadiness(value) {
  return value ? 'yes' : 'no'
}

function buildWorkflowFileState(filePath) {
  const exists = existsSync(filePath)

  return {
    path: normalizePathForMessage(filePath),
    status: exists ? 'present' : 'missing',
    exists,
  }
}

function formatFileStatus(filePath) {
  const file = buildWorkflowFileState(filePath)
  return `${file.status} (${file.path})`
}

function formatActualMigrationSync({ hasMigration, isReady, recipes }) {
  if (!isReady) {
    return hasMigration ? 'present; actual manifest is not ready' : 'not ready'
  }

  if (!hasMigration) {
    return 'missing'
  }

  const currentSql = stripByteOrderMark(readFileSync(actualMigrationPath, 'utf8'))
  return currentSql === buildRecipeImageSql(recipes) ? 'current' : 'outdated'
}

function printNextActions(actions) {
  console.log('- next actions:')
  for (const action of actions) {
    console.log(`  - ${action}`)
  }
}

function buildCommandAction(id, command, details = {}) {
  const { label = `run ${command}`, ...rest } = details

  return {
    id,
    type: 'command',
    label,
    command,
    ...rest,
  }
}

function buildPathDetails(filePath) {
  const path = normalizePathForMessage(filePath)

  return {
    path,
    paths: [path],
  }
}

function buildPathsDetails(filePaths) {
  const paths = filePaths.map((filePath) => normalizePathForMessage(filePath))

  return {
    path: paths[0],
    paths,
  }
}

function buildManualAction(id, label, details = {}) {
  return {
    id,
    type: 'manual',
    label,
    ...details,
  }
}

function formatActionLabels(actionItems) {
  return actionItems.map((action) => action.label)
}

function buildActualWorkflowNextActionItems({
  hasTodo,
  hasMigration,
  hasSources,
  isReady,
  migrationSync,
  validation,
}) {
  const actions = []

  if (validation.errors.length > 0) {
    actions.push(
      buildCommandAction(
        'inspect-actual-report-errors',
        'npm.cmd run recipe-images:actual-report',
        buildPathDetails(actualManifestPath),
      ),
    )
    actions.push(
      buildManualAction(
        'fix-actual-report-errors',
        'fix the listed errors',
        buildPathDetails(actualManifestPath),
      ),
    )
  }
  if (validation.emptyUrlCount > 0) {
    if (!hasTodo) {
      actions.push(
        buildCommandAction(
          'create-actual-todo',
          'npm.cmd run recipe-images:actual-todo',
          buildPathDetails(actualTodoPath),
        ),
      )
    }
    actions.push(
      buildManualAction(
        'fill-image-urls',
        `fill image_urls for ${validation.emptyUrlCount} recipe mapping(s)`,
        {
          count: validation.emptyUrlCount,
          ...buildPathDetails(actualManifestPath),
        },
      ),
    )
  }
  if (validation.warnings.length > 0 && validation.emptyUrlCount === 0) {
    actions.push(
      buildCommandAction(
        'inspect-actual-report-warnings',
        'npm.cmd run recipe-images:actual-report',
        buildPathDetails(actualManifestPath),
      ),
    )
    actions.push(
      buildManualAction(
        'resolve-actual-report-warnings',
        'resolve warnings',
        buildPathDetails(actualManifestPath),
      ),
    )
  }
  if (actions.length === 0 && migrationSync === 'missing') {
    actions.push(
      buildCommandAction(
        'check-actual-manifest',
        'npm.cmd run recipe-images:actual-check',
        buildPathDetails(actualManifestPath),
      ),
    )
    actions.push(...buildSourceNoteActions(hasSources))
    actions.push(
      buildCommandAction(
        'generate-actual-migration',
        'npm.cmd run recipe-images:actual-migration',
        buildPathDetails(actualMigrationPath),
      ),
    )
  } else if (actions.length === 0 && migrationSync === 'outdated') {
    actions.push(
      buildCommandAction(
        'check-actual-manifest',
        'npm.cmd run recipe-images:actual-check',
        buildPathDetails(actualManifestPath),
      ),
    )
    actions.push(...buildSourceNoteActions(hasSources))
    actions.push(
      buildCommandAction(
        'regenerate-actual-migration',
        'npm.cmd run recipe-images:actual-migration -- --force',
        buildPathDetails(actualMigrationPath),
      ),
    )
  } else if (actions.length === 0) {
    actions.push(
      buildCommandAction(
        'check-actual-manifest',
        'npm.cmd run recipe-images:actual-check',
        buildPathDetails(actualManifestPath),
      ),
    )
    actions.push(...buildSourceNoteActions(hasSources))
    actions.push(
      buildManualAction(
        'apply-actual-migration',
        'review/apply supabase/migrations/007_recipe_images.sql in Supabase SQL Editor',
        buildPathDetails(actualMigrationPath),
      ),
    )
  }

  if (hasMigration && !isReady) {
    actions.push(
      buildManualAction(
        'wait-to-regenerate-migration',
        'regenerate migration only after actual-check passes',
        buildPathDetails(actualMigrationPath),
      ),
    )
  }

  return actions
}

function buildSourceNoteActions(hasSources) {
  if (!hasSources) {
    return [
      buildManualAction(
        'create-image-source-notes',
        'create recipe image source notes before applying migration',
        buildPathDetails(actualSourcesPath),
      ),
    ]
  }

  return [
    buildCommandAction(
      'check-image-sources',
      'npm.cmd run recipe-images:sources-check',
      buildPathsDetails([actualSourcesPath, actualManifestPath]),
    ),
  ]
}

function buildActualWorkflowStatus({
  hasActualManifest,
  isReady,
  migrationSync,
  validation,
}) {
  if (!hasActualManifest) return 'missing-actual-manifest'
  if (validation.errors.length > 0) return 'blocked-by-errors'
  if (validation.emptyUrlCount > 0) return 'collecting-image-urls'
  if (validation.warnings.length > 0) return 'needs-warning-review'
  if (!isReady) return 'not-ready'
  if (migrationSync === 'missing') return 'ready-to-generate-migration'
  if (migrationSync === 'outdated') return 'migration-outdated'
  if (migrationSync === 'current') return 'ready-to-apply-migration'
  return 'ready'
}

function buildActualWorkflowSchema() {
  return {
    schemaVersion: 1,
    command: 'npm.cmd run --silent recipe-images:workflow:json',
    fields: {
      schemaVersion: {
        type: 'number',
        description: 'workflow JSON schema version',
      },
      status: {
        type: 'string',
        values: actualWorkflowStatusValues,
      },
      files: {
        type: 'object',
        fields: {
          actualManifest: 'WorkflowFileState',
          todoChecklist: 'WorkflowFileState',
          migrationSql: 'WorkflowFileState',
          sourceNotes: 'WorkflowFileState',
        },
      },
      summary: {
        type: ['object', 'null'],
        nullWhen: 'actual manifest is missing',
        fields: {
          recipes: 'number',
          seededRecipesExpected: 'number',
          recipesWithImageUrls: 'number',
          recipesMissingImageUrls: 'number',
          totalImageUrls: 'number',
          warnings: 'number',
          errors: 'number',
          readyForActualMigration: 'boolean',
          migrationSync: 'string',
        },
      },
      nextActionItems: {
        type: 'array',
        item: 'WorkflowActionItem',
      },
      nextActions: {
        type: 'array',
        item: 'string',
        derivedFrom: 'nextActionItems[].label',
      },
    },
    definitions: {
      WorkflowFileState: {
        type: 'object',
        fields: {
          path: 'string',
          status: ['present', 'missing'],
          exists: 'boolean',
        },
      },
      WorkflowActionItem: {
        type: 'object',
        required: ['id', 'type', 'label'],
        optional: ['command', 'path', 'paths', 'count'],
        fields: {
          id: 'string',
          type: actualWorkflowActionTypes,
          label: 'string',
          command: 'string',
          path: 'string',
          paths: 'string[]',
          count: 'number',
        },
      },
    },
  }
}

function buildActualWorkflow() {
  const hasActualManifest = existsSync(actualManifestPath)
  const hasTodo = existsSync(actualTodoPath)
  const hasMigration = existsSync(actualMigrationPath)
  const hasSources = existsSync(actualSourcesPath)
  const files = {
    actualManifest: buildWorkflowFileState(actualManifestPath),
    todoChecklist: buildWorkflowFileState(actualTodoPath),
    migrationSql: buildWorkflowFileState(actualMigrationPath),
    sourceNotes: buildWorkflowFileState(actualSourcesPath),
  }

  if (!hasActualManifest) {
    const nextActionItems = [
      buildCommandAction(
        'create-actual-manifest',
        'npm.cmd run recipe-images:init-actual',
        buildPathDetails(actualManifestPath),
      ),
      buildManualAction(
        'fill-image-urls',
        'fill image_urls in supabase/recipe-images.actual.json',
        buildPathDetails(actualManifestPath),
      ),
      buildCommandAction(
        'rerun-workflow',
        'npm.cmd run recipe-images:workflow',
        {
          label: 'run npm.cmd run recipe-images:workflow again',
          paths: [
            normalizePathForMessage(actualManifestPath),
            normalizePathForMessage(actualTodoPath),
            normalizePathForMessage(actualMigrationPath),
            normalizePathForMessage(actualSourcesPath),
          ],
        },
      ),
    ]

    return {
      schemaVersion: 1,
      status: buildActualWorkflowStatus({
        hasActualManifest,
        isReady: false,
        migrationSync: 'missing',
        validation: { errors: [], warnings: [], emptyUrlCount: 0 },
      }),
      files,
      summary: null,
      nextActionItems,
      nextActions: formatActionLabels(nextActionItems),
    }
  }

  const manifest = readManifest(actualManifestPath)

  if (!Array.isArray(manifest.recipes)) {
    fail('manifest.recipes must be an array')
  }

  const validation = validateManifest(manifest.recipes, { allowEmptyUrls: true })
  const seedValidation = validateSeedRecipeCoverage(
    validation.recipeNames,
    loadSeedRecipeNames(),
  )
  validation.errors.push(...seedValidation.errors)

  const isReady =
    validation.errors.length === 0 &&
    validation.warnings.length === 0 &&
    validation.emptyUrlCount === 0 &&
    validation.recipeCount === seedValidation.seedRecipeCount

  const migrationSync = formatActualMigrationSync({
    hasMigration,
    isReady,
    recipes: manifest.recipes,
  })
  const status = buildActualWorkflowStatus({
    hasActualManifest,
    isReady,
    migrationSync,
    validation,
  })
  const nextActionItems = buildActualWorkflowNextActionItems({
    hasTodo,
    hasMigration,
    hasSources,
    isReady,
    migrationSync,
    validation,
  })

  return {
    schemaVersion: 1,
    status,
    files,
    summary: {
      recipes: validation.recipeCount,
      seededRecipesExpected: seedValidation.seedRecipeCount,
      recipesWithImageUrls: validation.recipeWithUrlCount,
      recipesMissingImageUrls: validation.emptyUrlCount,
      totalImageUrls: validation.totalUrlCount,
      warnings: validation.warnings.length,
      errors: validation.errors.length,
      readyForActualMigration: isReady,
      migrationSync,
    },
    nextActionItems,
    nextActions: formatActionLabels(nextActionItems),
  }
}

function printActualWorkflow(workflow = buildActualWorkflow()) {
  console.log('Recipe image actual workflow')
  console.log(`- status: ${workflow.status}`)
  console.log(`- actual manifest: ${formatFileStatus(actualManifestPath)}`)
  console.log(`- todo checklist: ${formatFileStatus(actualTodoPath)}`)
  console.log(`- migration SQL: ${formatFileStatus(actualMigrationPath)}`)
  console.log(`- source notes: ${formatFileStatus(actualSourcesPath)}`)

  if (!workflow.summary) {
    printNextActions(workflow.nextActions)
    return
  }

  console.log(`- recipes: ${workflow.summary.recipes}`)
  console.log(`- seeded recipes expected: ${workflow.summary.seededRecipesExpected}`)
  console.log(`- recipes with image URLs: ${workflow.summary.recipesWithImageUrls}`)
  console.log(`- recipes missing image URLs: ${workflow.summary.recipesMissingImageUrls}`)
  console.log(`- total image URLs: ${workflow.summary.totalImageUrls}`)
  console.log(`- warnings: ${workflow.summary.warnings}`)
  console.log(`- errors: ${workflow.summary.errors}`)
  console.log(
    `- ready for recipe-images:actual-migration: ${formatReadiness(workflow.summary.readyForActualMigration)}`,
  )
  console.log(`- migration sync: ${workflow.summary.migrationSync}`)

  printNextActions(workflow.nextActions)
}

function buildReportNextActions({
  manifestPath,
  validation,
  isStrictReady,
}) {
  if (isStrictReady) {
    return [`run npm.cmd run recipe-images:migration -- ${manifestPath}`]
  }

  const actions = []

  if (validation.errors.length > 0) {
    actions.push('fix the errors listed below')
  }
  if (validation.emptyUrlCount > 0) {
    actions.push(
      `fill image_urls for ${validation.emptyUrlCount} recipe mapping(s)`,
    )
  }
  if (validation.exampleUrlCount > 0) {
    actions.push(
      `replace ${validation.exampleUrlCount} example.com image URL(s)`,
    )
  }
  if (validation.invalidUrlCount > 0) {
    actions.push(`fix ${validation.invalidUrlCount} invalid image URL(s)`)
  }
  if (validation.duplicateUrlCount > 0) {
    actions.push(`remove ${validation.duplicateUrlCount} duplicate image URL(s)`)
  }
  if (validation.warnings.length > 0 && actions.length === 0) {
    actions.push('resolve the warnings listed below')
  }

  return actions
}

function printManifestReport({
  manifestPath,
  validation,
  seedRecipeCount,
  requireSeedRecipes,
}) {
  const isStrictReady =
    validation.errors.length === 0 &&
    validation.warnings.length === 0 &&
    validation.emptyUrlCount === 0 &&
    (!requireSeedRecipes || validation.recipeCount === seedRecipeCount)

  console.log(`Recipe image manifest report: ${manifestPath}`)
  console.log(`- recipes: ${validation.recipeCount}`)
  if (requireSeedRecipes) {
    console.log(`- seeded recipes expected: ${seedRecipeCount}`)
  }
  console.log(`- recipes with image URLs: ${validation.recipeWithUrlCount}`)
  console.log(`- recipes missing image URLs: ${validation.emptyUrlCount}`)
  console.log(`- total image URLs: ${validation.totalUrlCount}`)
  console.log(`- example.com URLs: ${validation.exampleUrlCount}`)
  console.log(`- duplicate URLs: ${validation.duplicateUrlCount}`)
  console.log(`- invalid URLs: ${validation.invalidUrlCount}`)
  console.log(`- warnings: ${validation.warnings.length}`)
  console.log(`- errors: ${validation.errors.length}`)
  console.log(`- ready for recipe-images:migration: ${formatReadiness(isStrictReady)}`)
  console.log('- next actions:')
  for (const action of buildReportNextActions({
    manifestPath,
    validation,
    isStrictReady,
  })) {
    console.log(`  - ${action}`)
  }
}

function buildMissingImageMarkdown({ manifestPath, validation }) {
  const lines = [
    '# Recipe Image URL Checklist',
    '',
    `Source: \`${manifestPath}\``,
    `Missing image URLs: ${validation.missingImageRecipeNames.length}`,
    '',
  ]

  if (validation.missingImageRecipeNames.length === 0) {
    lines.push('All recipe image mappings have image URLs.')
    return `${lines.join('\n')}\n`
  }

  for (const name of validation.missingImageRecipeNames) {
    lines.push(`- [ ] ${name}`)
  }

  return `${lines.join('\n')}\n`
}

function printMissingImageMarkdown({ manifestPath, validation }) {
  process.stdout.write(buildMissingImageMarkdown({ manifestPath, validation }))
}

function printMissingImageList({ manifestPath, validation, asMarkdown }) {
  if (asMarkdown) {
    printMissingImageMarkdown({ manifestPath, validation })
    return
  }

  if (validation.missingImageRecipeNames.length === 0) {
    console.log(`OK: no recipe image mappings are missing image URLs in ${manifestPath}`)
    return
  }

  console.log(`Recipe image mappings missing image URLs: ${manifestPath}`)
  console.log(`- count: ${validation.missingImageRecipeNames.length}`)
  for (const name of validation.missingImageRecipeNames) {
    console.log(`- ${name}`)
  }
}

if (checkGeneratedTemplate) {
  const expectedManifest = buildTemplateManifest()
  if (formatJson(manifest) !== formatJson(expectedManifest)) {
    console.error(
      `Error: ${manifestPath} does not match the generated seed template`,
    )
    console.error(
      'Run npm.cmd run recipe-images:template and update the template file if seed recipes changed.',
    )
    process.exit(1)
  }

  console.log(
    `OK: ${manifestPath} matches generated seed template for ${expectedManifest.recipes.length} seeded recipe(s)`,
  )
  process.exit(0)
}

const validation = validateManifest(manifest.recipes, { allowEmptyUrls })
let seedRecipeCount = null

if (requireSeedRecipes) {
  const seedValidation = validateSeedRecipeCoverage(
    validation.recipeNames,
    loadSeedRecipeNames(),
  )
  seedRecipeCount = seedValidation.seedRecipeCount
  validation.errors.push(...seedValidation.errors)
}

if (strict) {
  validation.errors.push(
    ...validation.warnings.map(
      (warning) => `strict mode rejects warning: ${warning}`,
    ),
  )
  validation.warnings = []
}

if (reportOnly) {
  printManifestReport({
    manifestPath,
    validation,
    seedRecipeCount,
    requireSeedRecipes,
  })

  for (const warning of validation.warnings) {
    console.error(`Warning: ${warning}`)
  }

  if (validation.errors.length > 0) {
    for (const error of validation.errors) {
      console.error(`Error: ${error}`)
    }
    process.exit(1)
  }

  process.exit(0)
}

if (listMissingImagesOnly) {
  if (missingMarkdownOutputPath) {
    const writtenPath = writeTextFile(
      missingMarkdownOutputPath,
      buildMissingImageMarkdown({ manifestPath, validation }),
      { force: forceOutput },
    )
    console.log(`OK: wrote missing image checklist to ${writtenPath}`)
  } else {
    printMissingImageList({
      manifestPath,
      validation,
      asMarkdown: missingMarkdown,
    })
  }

  if (validation.errors.length > 0) {
    for (const error of validation.errors) {
      console.error(`Error: ${error}`)
    }
    process.exit(1)
  }

  process.exit(0)
}

for (const warning of validation.warnings) {
  console.error(`Warning: ${warning}`)
}

if (validation.errors.length > 0) {
  for (const error of validation.errors) {
    console.error(`Error: ${error}`)
  }
  process.exit(1)
}

if (checkOnly) {
  if (requireSeedRecipes) {
    console.log(
      `OK: manifest covers ${seedRecipeCount} seeded recipe(s) from ${seedRecipeFiles.join(', ')}`,
    )
  }
  console.log(
    `OK: ${validation.recipeCount} recipe image mapping(s) are valid in ${manifestPath}`,
  )
  process.exit(0)
}

const sql = buildRecipeImageSql(manifest.recipes)

if (outputSqlPath) {
  const writtenPath = writeTextFile(outputSqlPath, sql, { force: forceOutput })
  console.log(`OK: wrote SQL to ${writtenPath}`)
} else {
  process.stdout.write(sql)
}
