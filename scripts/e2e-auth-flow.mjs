import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const port = process.env.E2E_PORT ?? '3211'
const externalBaseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, '')
const baseUrl = externalBaseUrl ?? `http://127.0.0.1:${port}`
const buildIdPath = '.next/BUILD_ID'
const authMode = process.env.E2E_AUTH_MODE ?? 'login'
const cleanupEnabled = process.env.E2E_AUTH_CLEANUP !== '0'

let serverProcess = null

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `${name} is required for auth E2E. Put it in .env.local or the CI environment; do not commit credentials.`,
    )
  }
  return value
}

function assertAuthMode() {
  if (authMode === 'login' || authMode === 'signup') return

  throw new Error('E2E_AUTH_MODE must be either login or signup')
}

function assertLocalBuildExists() {
  if (existsSync(buildIdPath)) return

  throw new Error(
    [
      `Missing production build: ${buildIdPath}`,
      'Run npm.cmd run build before npm.cmd run e2e:auth.',
      'For an already deployed target, set E2E_BASE_URL.',
    ].join('\n'),
  )
}

async function waitForServer() {
  const startedAt = Date.now()
  const timeoutMs = 30_000

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/setup-status`, {
        redirect: 'manual',
      })
      if (response.status < 500) return
    } catch {
      // Server is still starting.
    }
    await sleep(500)
  }

  throw new Error(`Timed out waiting for ${baseUrl}`)
}

function getMondayISO(d) {
  const dayIdx = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - dayIdx)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const day = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getStorageKey(supabaseUrl) {
  const host = new URL(supabaseUrl).hostname
  return `sb-${host.split('.')[0]}-auth-token`
}

function buildCookieHeader(supabaseUrl, session) {
  const storageKey = getStorageKey(supabaseUrl)
  const encoded = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
  return `${storageKey}=base64-${encoded}`
}

function mealPlanHasReason(mealPlan) {
  const week = mealPlan?.plan
  if (!week || typeof week !== 'object') return false

  return Object.values(week).some((day) => {
    if (!day || typeof day !== 'object') return false
    return ['breakfast_reason', 'lunch_reason', 'dinner_reason'].some(
      (key) => typeof day[key] === 'string' && day[key].trim().length > 0,
    )
  })
}

async function appFetch(path, cookieHeader, init = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'text/html, application/json',
      Cookie: cookieHeader,
      ...(init.headers ?? {}),
    },
  })
}

async function authenticate(supabase, email, password) {
  if (authMode === 'signup') {
    const signup = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: 'E2E user' },
      },
    })

    if (signup.error && !signup.error.message.includes('already registered')) {
      throw new Error(`Supabase signup failed: ${signup.error.message}`)
    }
    if (signup.data.session) {
      return signup.data.session
    }
  }

  const login = await supabase.auth.signInWithPassword({ email, password })
  if (login.error || !login.data.session) {
    throw new Error(
      `Supabase login failed: ${login.error?.message ?? 'missing session'}`,
    )
  }
  return login.data.session
}

async function requireOk(response, label) {
  if (response.ok) return

  const body = await response.text().catch(() => '')
  throw new Error(`${label} returned ${response.status}: ${body.slice(0, 240)}`)
}

async function upsertOnboardingProfile(supabase, userId) {
  const { error } = await supabase.from('users').upsert(
    {
      id: userId,
      display_name: 'E2E user',
      default_servings: 2,
      disliked_ingredients: ['パクチー'],
      allergic_ingredients: [],
      selected_persona: 'mei',
      self_cook_frequency: 'sometimes',
      planning_goal: 'balanced',
      onboarding_completed_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (error) {
    throw new Error(`Failed to save onboarding profile: ${error.message}`)
  }
}

async function pickRecipe(supabase) {
  const dinner = await supabase
    .from('recipes')
    .select('id, name, meal_type')
    .eq('meal_type', 'dinner')
    .limit(1)
    .maybeSingle()

  if (dinner.error) {
    throw new Error(`Failed to load dinner recipe: ${dinner.error.message}`)
  }
  if (dinner.data) return dinner.data

  const anyRecipe = await supabase
    .from('recipes')
    .select('id, name, meal_type')
    .limit(1)
    .maybeSingle()

  if (anyRecipe.error || !anyRecipe.data) {
    throw new Error(
      `Failed to load any recipe: ${anyRecipe.error?.message ?? 'no recipes found'}`,
    )
  }

  return anyRecipe.data
}

async function main() {
  assertAuthMode()
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const email = requireEnv('E2E_AUTH_EMAIL')
  const password = requireEnv('E2E_AUTH_PASSWORD')

  if (!externalBaseUrl) {
    assertLocalBuildExists()

    if (process.platform === 'win32') {
      serverProcess = spawn(
        'cmd.exe',
        ['/d', '/s', '/c', `npm.cmd run start -- --port ${port} --hostname 127.0.0.1`],
        {
          cwd: process.cwd(),
          env: process.env,
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      )
    } else {
      serverProcess = spawn(
        'npm',
        ['run', 'start', '--', '--port', port, '--hostname', '127.0.0.1'],
        {
          cwd: process.cwd(),
          env: process.env,
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      )
    }

    serverProcess.stdout.on('data', (chunk) => process.stdout.write(chunk))
    serverProcess.stderr.on('data', (chunk) => process.stderr.write(chunk))
    await waitForServer()
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
    },
  })
  const session = await authenticate(supabase, email, password)
  const userId = session.user.id
  const cookieHeader = buildCookieHeader(supabaseUrl, session)
  const weekStartDate = getMondayISO(new Date())

  await upsertOnboardingProfile(supabase, userId)
  console.log('ok onboarding profile')

  const generate = await appFetch('/api/generate-plan', cookieHeader, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personaId: 'mei', weekStartDate }),
  })
  await requireOk(generate, 'POST /api/generate-plan')
  if (generate.headers.get('cache-control') !== 'no-store') {
    throw new Error('POST /api/generate-plan did not return Cache-Control: no-store')
  }
  const generated = await generate.json()
  if (!generated.mealPlan?.id) {
    throw new Error('POST /api/generate-plan did not return mealPlan.id')
  }
  if (!mealPlanHasReason(generated.mealPlan)) {
    throw new Error('POST /api/generate-plan did not return meal reasons')
  }
  console.log('ok generate plan')

  const recipe = await pickRecipe(supabase)
  const assign = await appFetch('/api/assign-recipe', cookieHeader, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipeId: recipe.id,
      weekStartDate,
      dayOfWeek: 0,
      mealType: 'dinner',
      locked: true,
    }),
  })
  await requireOk(assign, 'POST /api/assign-recipe')
  if (assign.headers.get('cache-control') !== 'no-store') {
    throw new Error('POST /api/assign-recipe did not return Cache-Control: no-store')
  }
  console.log('ok lock one meal')

  const inventoryName = `E2E テスト卵 ${Date.now()}`
  const inventoryInsert = await supabase
    .from('inventory')
    .insert({
      user_id: userId,
      ingredient_name: inventoryName,
      amount: 2,
      unit: '個',
      expiry_date: null,
    })
    .select('id')
    .single()

  if (inventoryInsert.error || !inventoryInsert.data) {
    throw new Error(
      `Failed to insert inventory: ${inventoryInsert.error?.message ?? 'missing row'}`,
    )
  }
  console.log('ok add inventory')

  const shopping = await appFetch('/shopping', cookieHeader)
  await requireOk(shopping, 'GET /shopping')
  const shoppingHtml = await shopping.text()
  if (!shoppingHtml.includes('買い物リスト')) {
    throw new Error('GET /shopping did not render the shopping page')
  }
  console.log('ok shopping page')

  const exported = await appFetch('/api/user-data/export', cookieHeader, {
    headers: { Accept: 'application/json' },
  })
  await requireOk(exported, 'GET /api/user-data/export')
  if (exported.headers.get('cache-control') !== 'no-store') {
    throw new Error('GET /api/user-data/export did not return Cache-Control: no-store')
  }
  if (!exported.headers.get('content-disposition')?.includes('attachment')) {
    throw new Error('GET /api/user-data/export did not return an attachment filename')
  }
  const exportedJson = await exported.json()
  if (exportedJson.account?.id !== userId || !exportedJson.data?.profile) {
    throw new Error('GET /api/user-data/export did not include the current user data')
  }
  console.log('ok data export')

  await supabase.auth.signOut()
  const relogin = await supabase.auth.signInWithPassword({ email, password })
  if (relogin.error || !relogin.data.session) {
    throw new Error(
      `Supabase relogin failed: ${relogin.error?.message ?? 'missing session'}`,
    )
  }

  const [profile, plan, inventory] = await Promise.all([
    supabase
      .from('users')
      .select('onboarding_completed_at')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartDate)
      .maybeSingle(),
    supabase
      .from('inventory')
      .select('id')
      .eq('id', inventoryInsert.data.id)
      .maybeSingle(),
  ])

  if (profile.error || !profile.data?.onboarding_completed_at) {
    throw new Error(
      `Saved onboarding profile was not found after relogin: ${
        profile.error?.message ?? 'missing onboarding_completed_at'
      }`,
    )
  }
  if (plan.error || !plan.data?.id) {
    throw new Error(
      `Saved meal plan was not found after relogin: ${
        plan.error?.message ?? 'missing meal plan'
      }`,
    )
  }
  if (inventory.error || !inventory.data?.id) {
    throw new Error(
      `Saved inventory was not found after relogin: ${
        inventory.error?.message ?? 'missing inventory'
      }`,
    )
  }
  console.log('ok relogin persistence')

  if (cleanupEnabled) {
    const cleanup = await supabase
      .from('inventory')
      .delete()
      .eq('id', inventoryInsert.data.id)

    if (cleanup.error) {
      console.warn(`warning: failed to cleanup inventory row: ${cleanup.error.message}`)
    } else {
      console.log('ok cleanup')
    }
  }

  console.log('auth E2E flow passed')
}

main()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => {
    if (serverProcess) {
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/pid', String(serverProcess.pid), '/t', '/f'], {
          stdio: 'ignore',
        })
      } else {
        serverProcess.kill()
      }
      process.exit(process.exitCode ?? 0)
    }
  })
