/* eslint-disable @typescript-eslint/no-require-imports */

const os = require('node:os')
const { syncBuiltinESMExports } = require('node:module')

os.hostname = () => process.env.VERCEL_ASCII_HOSTNAME || 'codex-local'
syncBuiltinESMExports()
