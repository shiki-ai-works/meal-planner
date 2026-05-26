import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = {
  onboarding: 'src/lib/onboarding.ts',
  client: 'src/app/setup/OnboardingClient.tsx',
  signupPage: 'src/app/(auth)/signup/page.tsx',
  mainLayout: 'src/app/(main)/layout.tsx',
  setupPage: 'src/app/setup/page.tsx',
  generatePlanRoute: 'src/app/api/generate-plan/route.ts',
  assignRecipeRoute: 'src/app/api/assign-recipe/route.ts',
  weeklyLocksRoute: 'src/app/api/weekly-locks/[id]/route.ts',
  personas: 'src/lib/personas/index.ts',
  types: 'src/types/database.ts',
  migration: 'supabase/migrations/008_user_onboarding.sql',
}

function readProjectFile(file) {
  const path = resolve(file)
  if (!existsSync(path)) {
    throw new Error(`Required file does not exist: ${file}`)
  }
  return readFileSync(path, 'utf8')
}

function extractStringUnion(source, typeName) {
  const match = new RegExp(`export type ${typeName}\\s*=\\s*([^\\n]+)`).exec(source)
  if (!match) {
    throw new Error(`Could not find ${typeName} in src/lib/onboarding.ts`)
  }

  const values = [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1])
  if (values.length === 0) {
    throw new Error(`${typeName} does not contain any string literal values`)
  }

  return values
}

function extractCheckValues(sql, columnName) {
  const match = new RegExp(`${columnName}\\s+in\\s*\\(([^)]+)\\)`, 'i').exec(sql)
  if (!match) {
    throw new Error(`Could not find ${columnName} CHECK values in 008_user_onboarding.sql`)
  }

  const values = [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1])
  if (values.length === 0) {
    throw new Error(`${columnName} CHECK constraint does not contain any values`)
  }

  return values
}

function assertSameSet(name, actual, expected) {
  const actualSorted = [...actual].sort()
  const expectedSorted = [...expected].sort()

  if (actualSorted.join('|') !== expectedSorted.join('|')) {
    throw new Error(
      `${name} mismatch: expected [${expectedSorted.join(', ')}], got [${actualSorted.join(', ')}]`,
    )
  }
}

function assertIncludes(text, needle, message) {
  if (!text.includes(needle)) {
    throw new Error(message)
  }
}

function assertBefore(text, first, second, message) {
  const firstIndex = text.indexOf(first)
  const secondIndex = text.indexOf(second)

  if (firstIndex === -1 || secondIndex === -1 || firstIndex > secondIndex) {
    throw new Error(message)
  }
}

function assertDbUserUnion(types, fieldName, expectedValues) {
  const escapedValues = expectedValues.map((value) => `'${value}'`).join(' | ')
  assertIncludes(
    types,
    `${fieldName}: ${escapedValues}`,
    `DbUser.${fieldName} should use the onboarding union values`,
  )
}

function main() {
  const onboarding = readProjectFile(files.onboarding)
  const client = readProjectFile(files.client)
  const signupPage = readProjectFile(files.signupPage)
  const mainLayout = readProjectFile(files.mainLayout)
  const setupPage = readProjectFile(files.setupPage)
  const generatePlanRoute = readProjectFile(files.generatePlanRoute)
  const assignRecipeRoute = readProjectFile(files.assignRecipeRoute)
  const weeklyLocksRoute = readProjectFile(files.weeklyLocksRoute)
  const personas = readProjectFile(files.personas)
  const types = readProjectFile(files.types)
  const migration = readProjectFile(files.migration)

  const selfCookValues = extractStringUnion(onboarding, 'SelfCookFrequency')
  const planningGoalValues = extractStringUnion(onboarding, 'PlanningGoal')

  assertSameSet(
    'self_cook_frequency CHECK values',
    extractCheckValues(migration, 'self_cook_frequency'),
    selfCookValues,
  )
  assertSameSet(
    'planning_goal CHECK values',
    extractCheckValues(migration, 'planning_goal'),
    planningGoalValues,
  )

  assertIncludes(
    migration,
    "self_cook_frequency text not null default 'sometimes'",
    'self_cook_frequency should have the expected default in migration 008',
  )
  assertIncludes(
    migration,
    "planning_goal text not null default 'balanced'",
    'planning_goal should have the expected default in migration 008',
  )
  assertIncludes(
    migration,
    'onboarding_completed_at timestamptz',
    'onboarding_completed_at should be added by migration 008',
  )

  assertDbUserUnion(types, 'self_cook_frequency', selfCookValues)
  assertDbUserUnion(types, 'planning_goal', planningGoalValues)
  assertIncludes(
    types,
    'onboarding_completed_at: string | null',
    'DbUser should expose onboarding_completed_at as nullable string',
  )
  assertIncludes(
    client,
    "initialUser?.self_cook_frequency ?? 'sometimes'",
    'onboarding defaults should use the migration default for self_cook_frequency',
  )
  assertIncludes(
    client,
    "initialUser?.planning_goal ?? 'balanced'",
    'onboarding defaults should use the migration default for planning_goal',
  )
  assertIncludes(
    signupPage,
    "router.push('/setup')",
    'signup should send new users to setup after account creation',
  )
  assertIncludes(
    mainLayout,
    'isUserOnboarded',
    'main layout should check onboarding completion before rendering protected pages',
  )
  assertIncludes(
    mainLayout,
    "select('onboarding_completed_at')",
    'main layout should select onboarding_completed_at for the setup redirect',
  )
  assertIncludes(
    mainLayout,
    "redirect('/setup')",
    'main layout should redirect incomplete onboarding users to setup',
  )
  assertIncludes(
    setupPage,
    'OnboardingClient',
    'setup page should show the onboarding form to incomplete users',
  )
  assertIncludes(
    setupPage,
    '!isUserOnboarded(dbUser)',
    'setup page should branch on incomplete onboarding users',
  )
  assertIncludes(
    setupPage,
    "redirect('/dashboard')",
    'setup page should redirect onboarded users to dashboard',
  )
  assertIncludes(
    generatePlanRoute,
    'isUserOnboarded',
    'generate-plan route should check onboarding completion before generating a plan',
  )
  assertIncludes(
    generatePlanRoute,
    'onboarding_completed_at',
    'generate-plan route should select onboarding_completed_at for the completion guard',
  )
  assertIncludes(
    generatePlanRoute,
    '初回設定を完了してから献立を生成してください',
    'generate-plan route should explain that onboarding is required',
  )
  assertIncludes(
    generatePlanRoute,
    'status: 428',
    'generate-plan route should use a precondition status when onboarding is incomplete',
  )
  assertIncludes(
    personas,
    'export function isPersonaId(value: unknown): value is PersonaId',
    'personas should expose a runtime personaId guard',
  )
  assertIncludes(
    personas,
    'Object.prototype.hasOwnProperty.call(PERSONAS, value)',
    'personaId guard should only accept own PERSONAS keys',
  )
  assertIncludes(
    generatePlanRoute,
    'personaId?: unknown',
    'generate-plan route should treat request personaId as untrusted input',
  )
  assertIncludes(
    generatePlanRoute,
    'isPersonaId(body.personaId)',
    'generate-plan route should validate personaId before generation',
  )
  assertIncludes(
    generatePlanRoute,
    'personaId must be one of',
    'generate-plan route should explain invalid personaId values',
  )
  assertBefore(
    generatePlanRoute,
    'isPersonaId(body.personaId)',
    'generateWeekPlan({',
    'generate-plan route should validate personaId before calling generateWeekPlan',
  )
  assertIncludes(
    assignRecipeRoute,
    'isUserOnboarded',
    'assign-recipe route should check onboarding completion before mutating plans',
  )
  assertIncludes(
    assignRecipeRoute,
    'onboarding_completed_at',
    'assign-recipe route should select onboarding_completed_at for the completion guard',
  )
  assertIncludes(
    assignRecipeRoute,
    '初回設定を完了してからレシピを割り当ててください',
    'assign-recipe route should explain that onboarding is required',
  )
  assertIncludes(
    assignRecipeRoute,
    'status: 428',
    'assign-recipe route should use a precondition status when onboarding is incomplete',
  )
  assertBefore(
    assignRecipeRoute,
    'isUserOnboarded(profile)',
    'assignRecipeToWeek({',
    'assign-recipe route should validate onboarding before assigning a recipe',
  )
  assertIncludes(
    weeklyLocksRoute,
    'isUserOnboarded',
    'weekly-locks route should check onboarding completion before mutating locks',
  )
  assertIncludes(
    weeklyLocksRoute,
    'onboarding_completed_at',
    'weekly-locks route should select onboarding_completed_at for the completion guard',
  )
  assertIncludes(
    weeklyLocksRoute,
    '初回設定を完了してから毎週固定を編集してください',
    'weekly-locks route should explain that onboarding is required',
  )
  assertIncludes(
    weeklyLocksRoute,
    'status: 428',
    'weekly-locks route should use a precondition status when onboarding is incomplete',
  )
  assertBefore(
    weeklyLocksRoute,
    'isUserOnboarded(dbUser)',
    ".from('locked_meals')",
    'weekly-locks route should validate onboarding before touching locked_meals',
  )

  console.log('onboarding schema check passed')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
