import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const e2eScript = resolve(projectRoot, 'scripts/e2e-public-flow.mjs')

function fail(message) {
  console.error(`Test failed: ${message}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function formatResult(result) {
  return [
    `status: ${result.status}`,
    `stdout:\n${result.stdout}`,
    `stderr:\n${result.stderr}`,
  ].join('\n')
}

function makeTempWorkspace() {
  return mkdtempSync(resolve(tmpdir(), 'meal-planner-e2e-public-'))
}

function runE2e(cwd, env = {}) {
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, [e2eScript], {
      cwd,
      env: {
        ...process.env,
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('close', (status) => {
      resolvePromise({ status, stdout, stderr })
    })
  })
}

function withTempWorkspace(run) {
  const cwd = makeTempWorkspace()

  return Promise.resolve()
    .then(() => run(cwd))
    .finally(() => {
      rmSync(cwd, { force: true, recursive: true })
    })
}

function routeBody(path) {
  const pathname = new URL(path, 'http://fixture.local').pathname

  if (pathname === '/api/setup-status') {
    return JSON.stringify({
      diagnosticSchemaVersion: 1,
      ok: true,
    })
  }

  const bodies = {
    '/setup': 'Supabase 公開前に確認する案内 画像クレジット',
    '/demo': 'DEMO PREVIEW 公開情報 完全栄養ランダム献立達人',
    '/legal': '公開前に確認しておくこと 利用規約 プライバシー',
    '/legal/terms': '利用規約と注意書き アレルギー 画像と第三者コンテンツ',
    '/legal/privacy': 'プライバシーポリシー Supabase 削除と問い合わせ',
    '/legal/attributions': '画像クレジット commons.wikimedia.org 納豆ご飯',
    '/signup': '新規登録 利用規約 プライバシーポリシー',
  }

  return bodies[pathname] ?? null
}

function startFixtureServer() {
  const server = createServer((request, response) => {
    const body = routeBody(request.url)

    if (body == null) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      response.end('not found')
      return
    }

    response.writeHead(200, {
      'content-type': request.url === '/api/setup-status'
        ? 'application/json; charset=utf-8'
        : 'text/html; charset=utf-8',
    })
    response.end(body)
  })

  return new Promise((resolvePromise, reject) => {
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolvePromise({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((resolveClose) => server.close(resolveClose)),
      })
    })
  })
}

await withTempWorkspace(async (cwd) => {
  const result = await runE2e(cwd)

  assert(result.status === 1, 'local E2E should fail without a production build')
  assert(
    result.stderr.includes('Missing production build: .next/BUILD_ID'),
    'missing build error should mention .next/BUILD_ID',
  )
  assert(
    result.stderr.includes('npm.cmd run build'),
    'missing build error should suggest npm.cmd run build',
  )
  assert(
    result.stderr.includes('npm.cmd run release:check'),
    'missing build error should suggest release:check',
  )
})

await withTempWorkspace(async (cwd) => {
  const server = await startFixtureServer()

  try {
    const result = await runE2e(cwd, { E2E_BASE_URL: server.baseUrl })

    assert(
      result.status === 0,
      `external E2E should not require local build output\n${formatResult(result)}`,
    )
    assert(
      result.stdout.includes('public E2E flow passed'),
      'external E2E should pass against the fixture server',
    )
  } finally {
    await server.close()
  }
})

console.log('public E2E self-test passed')
