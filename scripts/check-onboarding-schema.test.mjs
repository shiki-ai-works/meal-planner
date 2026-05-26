import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkerScript = resolve(projectRoot, 'scripts/check-onboarding-schema.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-onboarding-schema-'))
}

function writeFile(cwd, file, text) {
  const path = resolve(cwd, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

function writeValidFiles(cwd, overrides = {}) {
  writeFile(
    cwd,
    'src/lib/onboarding.ts',
    overrides.onboarding ??
      [
        "export type SelfCookFrequency = 'rarely' | 'sometimes' | 'often'",
        "export type PlanningGoal = 'balanced' | 'time_saving' | 'budget' | 'protein' | 'family'",
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/setup/OnboardingClient.tsx',
    overrides.client ??
      [
        "const selfCookFrequency = initialUser?.self_cook_frequency ?? 'sometimes'",
        "const planningGoal = initialUser?.planning_goal ?? 'balanced'",
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/(auth)/signup/page.tsx',
    overrides.signupPage ??
      [
        'function SignupPage() {',
        "  router.push('/setup')",
        '}',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/(main)/layout.tsx',
    overrides.mainLayout ??
      [
        "import { isUserOnboarded } from '@/lib/onboarding'",
        "const select = \"select('onboarding_completed_at')\"",
        'if (!isUserOnboarded(dbUser)) {',
        "  redirect('/setup')",
        '}',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/setup/page.tsx',
    overrides.setupPage ??
      [
        'function SetupPage() {',
        '  if (!isUserOnboarded(dbUser)) {',
        '    return <OnboardingClient />',
        '  }',
        "  redirect('/dashboard')",
        '}',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/lib/personas/index.ts',
    overrides.personas ??
      [
        "import type { PersonaId } from '@/types/database'",
        '',
        'export function isPersonaId(value: unknown): value is PersonaId {',
        "  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PERSONAS, value)",
        '}',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/types/database.ts',
    overrides.types ??
      [
        'export interface DbUser {',
        "  self_cook_frequency: 'rarely' | 'sometimes' | 'often'",
        "  planning_goal: 'balanced' | 'time_saving' | 'budget' | 'protein' | 'family'",
        '  onboarding_completed_at: string | null',
        '}',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/api/generate-plan/route.ts',
    overrides.generatePlanRoute ??
      [
        "import { isUserOnboarded } from '@/lib/onboarding'",
        "import { isPersonaId } from '@/lib/personas'",
        'interface RequestBody { personaId?: unknown }',
        "const select = 'id, onboarding_completed_at, self_cook_frequency, planning_goal'",
        'if (!isUserOnboarded(userRes.data)) {',
        "  return NextResponse.json({ error: '初回設定を完了してから献立を生成してください' }, { status: 428 })",
        '}',
        'if (body.personaId !== undefined && !isPersonaId(body.personaId)) {',
        "  return NextResponse.json({ error: 'personaId must be one of mei, arisa, tsuzuri, iris, cleio, or milra' }, { status: 400 })",
        '}',
        'generateWeekPlan({ personaId: body.personaId })',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/api/assign-recipe/route.ts',
    overrides.assignRecipeRoute ??
      [
        "import { isUserOnboarded } from '@/lib/onboarding'",
        "const select = 'onboarding_completed_at'",
        'if (!isUserOnboarded(profile)) {',
        "  return NextResponse.json({ error: '初回設定を完了してからレシピを割り当ててください' }, { status: 428 })",
        '}',
        'assignRecipeToWeek({ recipeId })',
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'src/app/api/weekly-locks/[id]/route.ts',
    overrides.weeklyLocksRoute ??
      [
        "import { isUserOnboarded } from '@/lib/onboarding'",
        "const select = 'onboarding_completed_at'",
        'if (!isUserOnboarded(dbUser)) {',
        "  return NextResponse.json({ error: '初回設定を完了してから毎週固定を編集してください' }, { status: 428 })",
        '}',
        "supabase.from('locked_meals').select('*')",
        '',
      ].join('\n'),
  )

  writeFile(
    cwd,
    'supabase/migrations/008_user_onboarding.sql',
    overrides.migration ??
      [
        'alter table public.users',
        "  add column if not exists self_cook_frequency text not null default 'sometimes'",
        "    check (self_cook_frequency in ('rarely', 'sometimes', 'often')),",
        "  add column if not exists planning_goal text not null default 'balanced'",
        "    check (planning_goal in ('balanced', 'time_saving', 'budget', 'protein', 'family')),",
        '  add column if not exists onboarding_completed_at timestamptz;',
        '',
      ].join('\n'),
  )
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
  assert(result.status === 0, `valid onboarding schema should pass\n${result.stderr}`)
  assert(
    result.stdout.includes('onboarding schema check passed'),
    'valid onboarding schema should print a pass message',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    migration: [
      'alter table public.users',
      "  add column if not exists self_cook_frequency text not null default 'sometimes'",
      "    check (self_cook_frequency in ('rarely', 'often')),",
      "  add column if not exists planning_goal text not null default 'balanced'",
      "    check (planning_goal in ('balanced', 'time_saving', 'budget', 'protein', 'family')),",
      '  add column if not exists onboarding_completed_at timestamptz;',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing migration option should fail')
  assert(
    result.stderr.includes('self_cook_frequency CHECK values mismatch'),
    'missing migration option failure should explain the mismatched CHECK values',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    types: [
      'export interface DbUser {',
      "  self_cook_frequency: 'rarely' | 'sometimes' | 'often'",
      "  planning_goal: 'balanced' | 'budget'",
      '  onboarding_completed_at: string | null',
      '}',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'DbUser union mismatch should fail')
  assert(
    result.stderr.includes('DbUser.planning_goal should use the onboarding union values'),
    'DbUser union mismatch failure should explain the field',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    generatePlanRoute: [
      "const select = 'id, self_cook_frequency, planning_goal'",
      "return NextResponse.json({ ok: true }, { status: 201 })",
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing generate-plan onboarding guard should fail')
  assert(
    result.stderr.includes('generate-plan route should check onboarding completion'),
    'missing generate-plan guard failure should explain the missing guard',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    assignRecipeRoute: [
      "const select = 'id'",
      'assignRecipeToWeek({ recipeId })',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing assign-recipe onboarding guard should fail')
  assert(
    result.stderr.includes('assign-recipe route should check onboarding completion'),
    'missing assign-recipe guard failure should explain the missing guard',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    weeklyLocksRoute: [
      "const select = 'id'",
      "supabase.from('locked_meals').select('*')",
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing weekly-locks onboarding guard should fail')
  assert(
    result.stderr.includes('weekly-locks route should check onboarding completion'),
    'missing weekly-locks guard failure should explain the missing guard',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    signupPage: [
      'function SignupPage() {',
      "  router.push('/dashboard')",
      '}',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'signup route mismatch should fail')
  assert(
    result.stderr.includes('signup should send new users to setup'),
    'signup route mismatch failure should explain the setup redirect',
  )
})

withTempWorkspace((cwd) => {
  writeValidFiles(cwd, {
    mainLayout: [
      "import { isUserOnboarded } from '@/lib/onboarding'",
      "const select = \"select('id')\"",
      'if (!isUserOnboarded(dbUser)) {',
      "  redirect('/dashboard')",
      '}',
      '',
    ].join('\n'),
  })

  const result = runChecker(cwd)
  assert(result.status === 1, 'missing main layout setup redirect should fail')
  assert(
    result.stderr.includes('main layout should select onboarding_completed_at'),
    'main layout route failure should explain the missing onboarding field',
  )
})

console.log('onboarding schema self-test passed')
