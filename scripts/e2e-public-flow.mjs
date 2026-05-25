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
    checks.push(['/signup', ['新規登録', '利用規約', 'プライバシーポリシー']])
  }

  for (const [path, expectedTexts] of checks) {
    await checkPage(path, expectedTexts)
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
