import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const port = process.env.E2E_PORT ?? '3210'
const externalBaseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, '')
const baseUrl = externalBaseUrl ?? `http://127.0.0.1:${port}`
const buildIdPath = '.next/BUILD_ID'

let serverProcess = null

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

async function fetchText(path) {
  const response = await fetch(`${baseUrl}${path}`)
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`)
  }
  return text
}

async function fetchSetupStatus() {
  const response = await fetch(`${baseUrl}/api/setup-status`, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`/api/setup-status returned ${response.status}`)
  }
  return response.json()
}

function assertIncludes(text, needle, path) {
  if (!text.includes(needle)) {
    throw new Error(`${path} did not include expected text: ${needle}`)
  }
}

function assertRedirectStatus(response, path) {
  if ([301, 302, 303, 307, 308].includes(response.status)) return

  throw new Error(`${path} returned ${response.status}, expected a redirect`)
}

function assertLocalBuildExists() {
  if (existsSync(buildIdPath)) return

  throw new Error(
    [
      `Missing production build: ${buildIdPath}`,
      'Run npm.cmd run build before npm.cmd run e2e:public:run.',
      'Alternatively, run npm.cmd run e2e:public or npm.cmd run release:check.',
    ].join('\n'),
  )
}

async function checkPage(path, expectedTexts) {
  const text = await fetchText(path)
  for (const expected of expectedTexts) {
    assertIncludes(text, expected, path)
  }
  console.log(`ok ${path}`)
}

function expectedApiHeaders(path, expectedHeaders = {}) {
  const headers = { ...expectedHeaders }

  if (
    path === '/api/generate-plan' ||
    path === '/api/assign-recipe' ||
    path.startsWith('/api/weekly-locks/') ||
    path.startsWith('/api/user-data/')
  ) {
    headers['cache-control'] ??= 'no-store'
  }

  return headers
}

async function checkApiStatus(path, init, expectedStatus, expectedText, expectedHeaders) {
  const response = await fetch(`${baseUrl}${path}`, init)
  const text = await response.text()

  if (response.status !== expectedStatus) {
    throw new Error(`${path} returned ${response.status}, expected ${expectedStatus}`)
  }

  if (expectedText) {
    assertIncludes(text, expectedText, path)
  }

  for (const [name, expectedValue] of Object.entries(
    expectedApiHeaders(path, expectedHeaders),
  )) {
    const actualValue = response.headers.get(name)
    if (actualValue !== expectedValue) {
      throw new Error(
        `${path} returned ${name}: ${actualValue ?? '<missing>'}, expected ${expectedValue}`,
      )
    }
  }

  console.log(`ok ${init?.method ?? 'GET'} ${path} ${expectedStatus}`)
}

async function checkRedirect(path, expectedPathname) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' })
  assertRedirectStatus(response, path)

  const location = response.headers.get('location')
  if (!location) {
    throw new Error(`${path} redirected without a location header`)
  }

  const actualPathname = new URL(location, baseUrl).pathname
  if (actualPathname !== expectedPathname) {
    throw new Error(
      `${path} redirected to ${actualPathname}, expected ${expectedPathname}`,
    )
  }

  console.log(`ok ${path} -> ${expectedPathname}`)
}

async function main() {
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

  const setupStatus = await fetchSetupStatus()
  if (setupStatus.diagnosticSchemaVersion !== 1) {
    throw new Error('/api/setup-status returned an unexpected schema version')
  }
  console.log('ok /api/setup-status')

  const checks = [
    ['/setup', ['Supabase', '公開前に確認する案内', '画像クレジット']],
    ['/demo', ['DEMO PREVIEW', '公開情報', '完全栄養ランダム献立達人']],
    ['/demo?section=shopping', ['DEMO PREVIEW', '公開情報', '完全栄養ランダム献立達人']],
    ['/demo?recipe=demo-natto-rice', ['DEMO PREVIEW', '公開情報', '完全栄養ランダム献立達人']],
    ['/legal', ['公開前に確認しておくこと', '利用規約', 'プライバシー']],
    ['/legal/terms', ['利用規約と注意書き', 'アレルギー', '画像と第三者コンテンツ']],
    ['/legal/privacy', ['プライバシーポリシー', 'Supabase', '削除と問い合わせ']],
    ['/legal/attributions', ['画像クレジット', 'commons.wikimedia.org', '納豆ご飯']],
  ]

  if (setupStatus.ok) {
    checks.push(['/login', ['ログイン', 'メールアドレス', '新規登録']])
    checks.push(['/signup', ['新規登録', '利用規約', 'プライバシーポリシー']])
  }

  for (const [path, expectedTexts] of checks) {
    await checkPage(path, expectedTexts)
  }

  if (setupStatus.ok) {
    await checkRedirect('/dashboard', '/login')
    await checkApiStatus(
      '/api/generate-plan',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weekStartDate: '2026-01-05' }),
      },
      401,
      'Unauthorized',
    )
    await checkApiStatus(
      '/api/assign-recipe',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: 'demo-natto-rice',
          weekStartDate: '2026-01-05',
          dayOfWeek: 0,
          mealType: 'dinner',
        }),
      },
      401,
      'Unauthorized',
    )
    await checkApiStatus(
      '/api/weekly-locks/public-e2e-lock',
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isEatingOut: true }),
      },
      401,
      'Unauthorized',
    )
    await checkApiStatus(
      '/api/weekly-locks/public-e2e-lock',
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      },
      401,
      'Unauthorized',
    )
    await checkApiStatus(
      '/api/user-data/export',
      {
        headers: {
          Accept: 'application/json',
        },
      },
      401,
      'Unauthorized',
    )
    await checkApiStatus(
      '/api/user-data/delete',
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      },
      400,
      '削除確認ヘッダーが必要です',
    )
    await checkApiStatus(
      '/api/user-data/delete',
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'x-meal-planner-delete-confirmation': 'delete-confirmed',
        },
      },
      401,
      'Unauthorized',
    )
  }

  console.log('public E2E flow passed')
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
