import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(root, 'public', 'images', 'cached', 'special')

const covers = [
  {
    id: 'dead-sea',
    ext: 'jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dead_Sea_by_David_Shankbone.jpg?width=900'
  },
  {
    id: 'lake-baikal',
    ext: 'jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Baikal.A2001296.0420.250m-NASA.jpg?width=900'
  },
  {
    id: 'rocky-mountains',
    ext: 'jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Moraine_Lake_17092005.jpg?width=900'
  },
  {
    id: 'great-plains',
    ext: 'jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/High_Plains.jpg?width=900'
  },
  {
    id: 'gobi-desert',
    ext: 'jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gobi_Desert_dunes.jpg?width=900'
  },
  {
    id: 'arabian-desert',
    ext: 'jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rub_al_Khali_002.JPG?width=900'
  },
  {
    id: 'amazon-river',
    ext: 'jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Amazon-river-NASA.jpg?width=900'
  },
  {
    id: 'etna-volcano',
    ext: 'jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Catania-etna.JPG?width=900'
  },
  {
    id: 'japanese-archipelago',
    ext: 'jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/ISS039-E-12345_-_View_of_Japan.jpg?width=900'
  },
  {
    id: 'mariana-trench',
    ext: 'jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mariana_trench_location.jpg?width=900'
  },
  {
    id: 'mid-atlantic-ridge',
    ext: 'png',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mid-atlantic_ridge_map.png?width=900'
  },
  {
    id: 'australian-outback',
    ext: 'jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Australia%27s_Simpson_Desert_%28MODIS%29.jpg?width=900'
  }
]

await mkdir(outputDir, { recursive: true })

async function exists(file) {
  try {
    await stat(file)
    return true
  } catch {
    return false
  }
}

for (const cover of covers) {
  const target = path.join(outputDir, `${cover.id}.${cover.ext}`)
  if (await validImage(target)) {
    console.log(`cached     ${cover.id}`)
    continue
  }

  try {
    const buffer = await downloadWithFetch(cover)
    await writeFile(target, buffer)
  } catch {
    await downloadWithCurl(cover, target)
  }

  if (!(await validImage(target))) throw new Error(`${cover.id}: downloaded file is not an image`)
  const { size } = await stat(target)
  console.log(`downloaded ${cover.id} ${size} bytes`)
}

console.log(`Special cover cache ready: ${covers.length} images.`)

async function downloadWithFetch(cover) {
  const response = await fetch(cover.url, {
    headers: { 'User-Agent': 'WorldLens local special cover cache/1.0' }
  })
  if (!response.ok) throw new Error(`${cover.id}: ${response.status} ${response.statusText}`)
  return Buffer.from(await response.arrayBuffer())
}

async function downloadWithCurl(cover, target) {
  await unlink(target).catch(() => {})
  const result = spawnSync('curl.exe', [
    '-L',
    '--fail',
    '--retry',
    '2',
    '--connect-timeout',
    '30',
    '--max-time',
    '150',
    '-A',
    'WorldLens local special cover cache/1.0',
    '-o',
    target,
    cover.url
  ], { stdio: 'pipe' })
  if (result.status !== 0) {
    const detail = Buffer.concat([result.stdout || Buffer.alloc(0), result.stderr || Buffer.alloc(0)]).toString('utf8')
    throw new Error(`${cover.id}: curl failed with exit ${result.status}\n${detail}`)
  }
}

async function validImage(file) {
  if (!(await exists(file))) return false
  const buffer = await readFile(file)
  if (buffer.length < 4096) return false
  const jpg = buffer[0] === 0xff && buffer[1] === 0xd8
  const png = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
  return jpg || png
}
