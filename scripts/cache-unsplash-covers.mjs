import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(root, 'public', 'images', 'cached', 'unsplash')
const sourceFiles = [
  path.join(root, 'src', 'data', 'terrain.js'),
  path.join(root, 'src', 'data', 'climate.js'),
  path.join(root, 'src', 'data', 'placeImages.js'),
  path.join(root, 'src', 'data', 'culturalRoutes.js')
]

await mkdir(outputDir, { recursive: true })

const ids = new Set()
for (const file of sourceFiles) {
  const source = await readFile(file, 'utf8')
  for (const match of source.matchAll(/(?:image|cachedUnsplash)\('([^']+)'\)/g)) {
    if (match[1].startsWith('photo-')) ids.add(match[1])
  }
}

async function exists(file) {
  try {
    await stat(file)
    return true
  } catch {
    return false
  }
}

async function download(id) {
  const target = path.join(outputDir, `${id}.jpg`)
  if (await exists(target)) return { id, status: 'cached' }

  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=82`
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'WorldLens local cover cache/1.0'
    }
  })

  if (!response.ok) {
    throw new Error(`${id}: ${response.status} ${response.statusText}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  await writeFile(target, buffer)
  return { id, status: 'downloaded', bytes: buffer.length }
}

const failures = []
for (const id of [...ids].sort()) {
  try {
    const result = await download(id)
    console.log(`${result.status.padEnd(10)} ${id}${result.bytes ? ` ${result.bytes} bytes` : ''}`)
  } catch (error) {
    failures.push(error.message)
    console.warn(`failed     ${error.message}`)
  }
}

if (failures.length) {
  console.warn(`Cover cache finished with ${failures.length} failures.`)
  process.exitCode = 1
} else {
  console.log(`Cover cache ready: ${ids.size} Unsplash images.`)
}
