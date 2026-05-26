import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const migrationsDir = 'supabase/migrations'
const docs = ['README.md', 'DEPLOYMENT.md']
const migrationNamePattern = /^(\d{3})_.+\.sql$/

function readProjectFile(file) {
  const path = resolve(file)
  if (!existsSync(path)) {
    throw new Error(`Required file does not exist: ${file}`)
  }

  return readFileSync(path, 'utf8')
}

function listMigrationFiles() {
  const dir = resolve(migrationsDir)
  if (!existsSync(dir)) {
    throw new Error(`Migrations directory does not exist: ${migrationsDir}`)
  }
  if (!statSync(dir).isDirectory()) {
    throw new Error(`Migrations path is not a directory: ${migrationsDir}`)
  }

  const migrations = readdirSync(dir)
    .map((name) => {
      const match = migrationNamePattern.exec(name)
      if (!match) return null

      return {
        name,
        number: Number(match[1]),
        path: join(migrationsDir, name),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.number - b.number || a.name.localeCompare(b.name))

  if (migrations.length === 0) {
    throw new Error(`No numbered migration files found in ${migrationsDir}`)
  }

  return migrations
}

function missingMigrationNumbers(migrations) {
  const numbers = new Set(migrations.map((migration) => migration.number))
  const first = migrations[0].number
  const last = migrations.at(-1).number
  const missing = []

  for (let number = first; number <= last; number += 1) {
    if (!numbers.has(number)) missing.push(String(number).padStart(3, '0'))
  }

  return missing
}

function assertDocMentionsMigrations(file, text, migrations) {
  for (const migration of migrations) {
    if (!text.includes(migration.name)) {
      throw new Error(`${file} should list ${migration.name}`)
    }
  }
}

function assertDocMigrationOrder(file, text, migrations) {
  let previousIndex = -1

  for (const migration of migrations) {
    const index = text.indexOf(migration.name)
    if (index === -1) continue

    if (index < previousIndex) {
      throw new Error(`${file} should list migrations in numeric order`)
    }

    previousIndex = index
  }
}

function assertDocMentionsGaps(file, text, missingNumbers) {
  for (const missingNumber of missingNumbers) {
    if (!text.includes(missingNumber)) {
      throw new Error(
        `${file} should explain missing migration number ${missingNumber}`,
      )
    }
  }
}

function assertDocMentionsSqlEditor(file, text) {
  if (!text.includes('SQL Editor')) {
    throw new Error(`${file} should mention Supabase SQL Editor`)
  }
}

function main() {
  const migrations = listMigrationFiles()
  const missingNumbers = missingMigrationNumbers(migrations)

  for (const doc of docs) {
    const text = readProjectFile(doc)

    assertDocMentionsMigrations(doc, text, migrations)
    assertDocMigrationOrder(doc, text, migrations)
    assertDocMentionsGaps(doc, text, missingNumbers)
    assertDocMentionsSqlEditor(doc, text)
  }

  console.log(
    `migration docs check passed: ${migrations.length} migration file(s), ${missingNumbers.length} gap(s) documented`,
  )
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
