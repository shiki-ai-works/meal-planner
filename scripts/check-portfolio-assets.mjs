import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const docs = ['README.md', 'PORTFOLIO.md']
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const jpegSignature = Buffer.from([0xff, 0xd8, 0xff])

function markdownImageTargets(markdown) {
  const targets = []
  const imagePattern = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  let match

  while ((match = imagePattern.exec(markdown)) != null) {
    targets.push(match[1])
  }

  return targets
}

function normalizePortfolioTarget(target) {
  if (target.startsWith('public/portfolio/')) return target
  if (target.startsWith('/portfolio/')) return `public${target}`
  return null
}

function assertSupportedImageFile(target, sourceDoc) {
  const absolutePath = resolve(target)
  let stats

  try {
    stats = statSync(absolutePath)
  } catch {
    throw new Error(`${sourceDoc} references missing portfolio image: ${target}`)
  }

  if (!stats.isFile()) {
    throw new Error(`${sourceDoc} references a non-file portfolio path: ${target}`)
  }
  if (stats.size <= pngSignature.length) {
    throw new Error(`${sourceDoc} references an empty portfolio image: ${target}`)
  }

  const bytes = readFileSync(absolutePath)
  const isPng = bytes.subarray(0, pngSignature.length).equals(pngSignature)
  const isJpeg = bytes.subarray(0, jpegSignature.length).equals(jpegSignature)
  const expectsPng = /\.png$/i.test(target)
  const expectsJpeg = /\.jpe?g$/i.test(target)

  if (!expectsPng && !expectsJpeg) {
    throw new Error(`${sourceDoc} references an unsupported portfolio image: ${target}`)
  }
  if (expectsPng && !isPng) {
    throw new Error(`${sourceDoc} references a portfolio image whose .png extension does not match its content: ${target}`)
  }
  if (expectsJpeg && !isJpeg) {
    throw new Error(`${sourceDoc} references a portfolio image whose .jpg extension does not match its content: ${target}`)
  }
}

const checked = []

for (const doc of docs) {
  const markdown = readFileSync(resolve(doc), 'utf8')
  const targets = markdownImageTargets(markdown)
    .map(normalizePortfolioTarget)
    .filter(Boolean)

  if (targets.length === 0) {
    throw new Error(`${doc} does not reference any portfolio images`)
  }

  for (const target of targets) {
    assertSupportedImageFile(target, doc)
    checked.push(`${doc} -> ${target}`)
  }
}

const uniqueCount = new Set(checked.map((entry) => entry.split(' -> ')[1])).size
console.log(`portfolio assets check passed: ${checked.length} reference(s), ${uniqueCount} image file(s)`)
