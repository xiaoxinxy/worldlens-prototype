import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbDir = path.resolve(__dirname, '../../data/db')

async function ensureDb() {
  await fs.mkdir(dbDir, { recursive: true })
}

export async function readCollection(name, fallback = []) {
  await ensureDb()
  const file = path.join(dbDir, `${name}.json`)
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'))
  } catch {
    await fs.writeFile(file, JSON.stringify(fallback, null, 2))
    return fallback
  }
}

export async function writeCollection(name, value) {
  await ensureDb()
  const file = path.join(dbDir, `${name}.json`)
  await fs.writeFile(file, JSON.stringify(value, null, 2))
  return value
}
