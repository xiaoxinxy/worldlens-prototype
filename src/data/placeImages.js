import { wikiCover, wikiImages } from './wikiImageManifest.js'

const local = (slug, name) => `/images/places/${slug}-${name}.jpg`
const cachedUnsplash = (id) => `/images/cached/unsplash/${id}.jpg`
const special = (id, ext = 'jpg') => `/images/cached/special/${id}.${ext}`
const wikiCountry = (id, index) => `/images/wiki/country/${String(id).toLowerCase()}-${index}.jpg`
const wikiDetail = (id, key) => `/images/wiki/detail/${String(id).toLowerCase()}-${key}.jpg`

const sectionKeys = ['geography', 'history', 'architecture', 'food', 'festival', 'lifestyle']
const sectionTitles = ['地理环境', '历史文明', '建筑艺术', '饮食生活', '节庆信仰', '社会日常']

const detailSet = (cover, geography, history, food, festival, architecture, lifestyle) => ({
  cover,
  geography,
  history,
  food,
  festival,
  architecture,
  lifestyle
})

const generalDetailPool = [
  cachedUnsplash('photo-1500530855697-b586d89ba3ee'),
  cachedUnsplash('photo-1494526585095-c41746248156'),
  cachedUnsplash('photo-1516026672322-bc52d61a55d5'),
  cachedUnsplash('photo-1500534314209-a25ddb2bd429'),
  cachedUnsplash('photo-1506744038136-46273834b3fb'),
  cachedUnsplash('photo-1507525428034-b723cf961d3e'),
  cachedUnsplash('photo-1533105079780-92b9be482077'),
  cachedUnsplash('photo-1544551763-46a013bb70d5'),
  cachedUnsplash('photo-1512343879784-a960bf40e7f2'),
  cachedUnsplash('photo-1528127269322-539801943592'),
  cachedUnsplash('photo-1500382017468-9049fed747ef'),
  cachedUnsplash('photo-1441974231531-c6227db76b6e'),
  cachedUnsplash('photo-1517783999520-f068d7431a60'),
  special('dead-sea'),
  special('amazon-river'),
  special('rocky-mountains'),
  special('japanese-archipelago'),
  special('great-plains'),
  special('gobi-desert'),
  special('arabian-desert'),
  '/images/wiki/ocean/black-sea-1.jpg',
  '/images/wiki/ocean/bering-sea-1.jpg',
  '/images/wiki/country/ata-1.jpg'
]

const oceanDetailPool = [
  cachedUnsplash('photo-1507525428034-b723cf961d3e'),
  cachedUnsplash('photo-1500375592092-40eb2168fd21'),
  cachedUnsplash('photo-1533105079780-92b9be482077'),
  cachedUnsplash('photo-1544551763-46a013bb70d5'),
  cachedUnsplash('photo-1512343879784-a960bf40e7f2'),
  cachedUnsplash('photo-1528127269322-539801943592'),
  cachedUnsplash('photo-1518509562904-e7ef99cdcc86'),
  cachedUnsplash('photo-1514890547357-a9ee288728e0'),
  cachedUnsplash('photo-1565967511849-76a60a516170'),
  cachedUnsplash('photo-1602216056096-3b40cc0c9944'),
  special('dead-sea'),
  special('amazon-river'),
  special('mariana-trench'),
  special('mid-atlantic-ridge', 'png')
]

const makeDetailSet = (cover, offset = 0, pool = generalDetailPool) => {
  const choices = uniqueImages(pool.filter((image) => image !== cover))
  const sections = Array.from({ length: 6 }, (_, index) => choices[(offset + index) % choices.length])
  return detailSet(cover, sections[0], sections[1], sections[2], sections[3], sections[4], sections[5])
}

export const placeImages = {
  CHN: {
    cover: local('china', 'cover'),
    geography: local('china', 'gallery-2'),
    history: local('china', 'gallery-1'),
    food: local('china', 'gallery-4'),
    festival: local('china', 'gallery-4'),
    architecture: local('china', 'gallery-1'),
    lifestyle: local('china', 'gallery-3')
  },
  JPN: {
    cover: local('japan', 'cover'),
    geography: local('japan', 'gallery-3'),
    history: local('japan', 'gallery-2'),
    food: local('japan', 'gallery-4'),
    festival: local('japan', 'gallery-1'),
    architecture: local('japan', 'gallery-2'),
    lifestyle: local('japan', 'gallery-3')
  },
  IND: {
    cover: local('india', 'cover'),
    geography: local('india', 'gallery-1'),
    history: local('india', 'gallery-4'),
    food: local('india', 'gallery-3'),
    festival: local('india', 'gallery-2'),
    architecture: local('india', 'cover'),
    lifestyle: local('india', 'gallery-3')
  },
  FRA: {
    cover: local('france', 'cover'),
    geography: local('france', 'gallery-4'),
    history: local('france', 'gallery-1'),
    food: local('france', 'gallery-3'),
    festival: local('france', 'gallery-2'),
    architecture: local('france', 'gallery-2'),
    lifestyle: local('france', 'gallery-1')
  },
  GBR: {
    cover: local('united-kingdom', 'cover'),
    geography: local('united-kingdom', 'gallery-2'),
    history: local('united-kingdom', 'gallery-3'),
    food: local('united-kingdom', 'gallery-4'),
    festival: local('united-kingdom', 'gallery-1'),
    architecture: local('united-kingdom', 'gallery-3'),
    lifestyle: local('united-kingdom', 'gallery-1')
  },
  USA: {
    cover: local('usa', 'cover'),
    geography: local('usa', 'gallery-2'),
    history: local('usa', 'gallery-1'),
    food: local('usa', 'gallery-3'),
    festival: local('usa', 'gallery-4'),
    architecture: local('usa', 'gallery-1'),
    lifestyle: local('usa', 'gallery-3')
  },
  ITA: {
    cover: local('italy', 'cover'),
    geography: local('italy', 'gallery-3'),
    history: local('italy', 'gallery-1'),
    food: local('italy', 'gallery-4'),
    festival: local('italy', 'gallery-2'),
    architecture: local('italy', 'gallery-1'),
    lifestyle: local('italy', 'gallery-2')
  },
  BRA: {
    cover: local('brazil', 'cover'),
    geography: local('brazil', 'gallery-2'),
    history: local('brazil', 'gallery-1'),
    food: local('brazil', 'gallery-4'),
    festival: local('brazil', 'gallery-3'),
    architecture: local('brazil', 'gallery-1'),
    lifestyle: local('brazil', 'gallery-3')
  },
  AUS: {
    cover: local('australia', 'cover'),
    geography: local('australia', 'gallery-3'),
    history: local('australia', 'gallery-4'),
    food: local('australia', 'gallery-1'),
    festival: local('australia', 'gallery-4'),
    architecture: local('australia', 'cover'),
    lifestyle: local('australia', 'gallery-2')
  },
  EGY: {
    cover: local('egypt', 'cover'),
    geography: local('egypt', 'gallery-2'),
    history: local('egypt', 'gallery-1'),
    food: local('egypt', 'gallery-3'),
    festival: local('egypt', 'gallery-4'),
    architecture: local('egypt', 'gallery-1'),
    lifestyle: local('egypt', 'gallery-3')
  },
  ZAF: {
    cover: local('south-africa', 'cover'),
    geography: local('south-africa', 'gallery-1'),
    history: local('south-africa', 'gallery-4'),
    food: local('south-africa', 'gallery-3'),
    festival: local('south-africa', 'gallery-3'),
    architecture: local('south-africa', 'gallery-4'),
    lifestyle: local('south-africa', 'gallery-3')
  },
  DEU: {
    cover: cachedUnsplash('photo-1467269204594-9661b134dd2b'),
    geography: cachedUnsplash('photo-1449452198679-05c7fd30f416'),
    history: cachedUnsplash('photo-1467269204594-9661b134dd2b'),
    food: cachedUnsplash('photo-1551782450-a2132b4ba21d'),
    architecture: cachedUnsplash('photo-1467269204594-9661b134dd2b'),
    lifestyle: cachedUnsplash('photo-1560969184-10fe8719e047')
  },
  RUS: {
    cover: cachedUnsplash('photo-1513326738677-b964603b136d'),
    geography: cachedUnsplash('photo-1500534314209-a25ddb2bd429'),
    history: cachedUnsplash('photo-1513326738677-b964603b136d'),
    architecture: cachedUnsplash('photo-1513326738677-b964603b136d')
  },
  TUR: {
    cover: cachedUnsplash('photo-1541432901042-2d8bd64b4a9b'),
    geography: cachedUnsplash('photo-1500530855697-b586d89ba3ee'),
    history: cachedUnsplash('photo-1541432901042-2d8bd64b4a9b'),
    food: cachedUnsplash('photo-1555939594-58d7cb561ad1'),
    festival: cachedUnsplash('photo-1524231757912-21f4fe3a7200'),
    architecture: cachedUnsplash('photo-1541432901042-2d8bd64b4a9b'),
    lifestyle: cachedUnsplash('photo-1524231757912-21f4fe3a7200')
  },
  ESP: {
    cover: cachedUnsplash('photo-1543783207-ec64e4d95325'),
    geography: cachedUnsplash('photo-1507525428034-b723cf961d3e'),
    history: cachedUnsplash('photo-1543783207-ec64e4d95325'),
    food: cachedUnsplash('photo-1515443961218-a51367888e4b'),
    architecture: cachedUnsplash('photo-1543783207-ec64e4d95325')
  },
  KOR: {
    cover: '/images/wiki/country/kor-1.jpg',
    geography: '/images/wiki/country/kor-2.jpg',
    history: '/images/wiki/country/kor-3.jpg',
    food: cachedUnsplash('photo-1498654896293-37aacf113fd9'),
    architecture: '/images/wiki/country/kor-2.jpg',
    lifestyle: '/images/wiki/country/kor-3.jpg'
  },
  asia: { cover: cachedUnsplash('photo-1500530855697-b586d89ba3ee') },
  europe: { cover: cachedUnsplash('photo-1494526585095-c41746248156') },
  africa: { cover: cachedUnsplash('photo-1516026672322-bc52d61a55d5') },
  'north-america': { cover: cachedUnsplash('photo-1500534314209-a25ddb2bd429') },
  'south-america': { cover: cachedUnsplash('photo-1506744038136-46273834b3fb') },
  oceania: { cover: cachedUnsplash('photo-1507525428034-b723cf961d3e') },
  'pacific-ocean': {
    cover: local('pacific-ocean', 'cover'),
    geography: local('pacific-ocean', 'gallery-1'),
    history: local('pacific-ocean', 'gallery-2'),
    architecture: local('pacific-ocean', 'gallery-3'),
    lifestyle: local('pacific-ocean', 'gallery-4')
  },
  'atlantic-ocean': {
    cover: local('atlantic-ocean', 'cover'),
    geography: local('atlantic-ocean', 'gallery-1'),
    history: local('atlantic-ocean', 'gallery-2'),
    architecture: local('atlantic-ocean', 'gallery-3'),
    lifestyle: local('atlantic-ocean', 'gallery-4')
  },
  'indian-ocean': {
    cover: local('indian-ocean', 'cover'),
    geography: local('indian-ocean', 'gallery-1'),
    history: local('indian-ocean', 'gallery-2'),
    architecture: local('indian-ocean', 'gallery-3'),
    lifestyle: local('indian-ocean', 'gallery-4')
  },
  'arctic-ocean': {
    cover: local('arctic-region', 'cover'),
    geography: local('arctic-region', 'gallery-1'),
    history: local('arctic-region', 'gallery-2'),
    architecture: local('arctic-region', 'gallery-3'),
    lifestyle: local('arctic-region', 'gallery-4')
  },
  'antarctica-continent': {
    cover: local('antarctica', 'cover'),
    geography: local('antarctica', 'gallery-1'),
    history: local('antarctica', 'gallery-2'),
    architecture: local('antarctica', 'gallery-3'),
    lifestyle: local('antarctica', 'gallery-4')
  },
  'arctic-circle': {
    cover: local('arctic-region', 'gallery-1'),
    geography: local('arctic-region', 'gallery-2'),
    history: local('arctic-region', 'gallery-2'),
    architecture: local('arctic-region', 'gallery-3'),
    lifestyle: local('arctic-region', 'gallery-4')
  },
  'southern-ocean': {
    cover: local('antarctica', 'gallery-3'),
    geography: local('antarctica', 'gallery-3'),
    history: local('antarctica', 'cover')
  },
  'mediterranean-sea': {
    cover: cachedUnsplash('photo-1533105079780-92b9be482077'),
    geography: cachedUnsplash('photo-1533105079780-92b9be482077'),
    history: cachedUnsplash('photo-1529260830199-42c24126f198'),
    lifestyle: cachedUnsplash('photo-1516483638261-f4dbaf036963')
  },
  'caribbean-sea': {
    cover: cachedUnsplash('photo-1500375592092-40eb2168fd21'),
    geography: cachedUnsplash('photo-1500375592092-40eb2168fd21'),
    lifestyle: cachedUnsplash('photo-1507525428034-b723cf961d3e')
  },
  'red-sea': {
    cover: cachedUnsplash('photo-1544551763-46a013bb70d5'),
    geography: cachedUnsplash('photo-1544551763-46a013bb70d5')
  },
  'black-sea': {
    cover: '/images/wiki/ocean/black-sea-1.jpg',
    geography: '/images/wiki/ocean/black-sea-1.jpg'
  },
  'south-china-sea': {
    cover: cachedUnsplash('photo-1528127269322-539801943592'),
    geography: cachedUnsplash('photo-1528127269322-539801943592')
  },
  'baltic-sea': {
    cover: cachedUnsplash('photo-1467269204594-9661b134dd2b'),
    geography: cachedUnsplash('photo-1500375592092-40eb2168fd21')
  },
  'arabian-sea': {
    cover: cachedUnsplash('photo-1512343879784-a960bf40e7f2'),
    geography: cachedUnsplash('photo-1512343879784-a960bf40e7f2')
  },
  'bering-sea': {
    cover: '/images/wiki/ocean/bering-sea-1.jpg',
    geography: '/images/wiki/ocean/bering-sea-1.jpg'
  }
}

const detailPlaceImages = {
  CHN: detailSet(wikiDetail('chn', 'cover'), wikiDetail('chn', 'geography'), wikiDetail('chn', 'history'), wikiDetail('chn', 'food'), wikiDetail('chn', 'festival'), wikiCountry('chn', 2), local('china', 'gallery-3')),
  USA: detailSet(wikiDetail('usa', 'cover'), wikiDetail('usa', 'geography'), wikiDetail('usa', 'history'), cachedUnsplash('photo-1551782450-a2132b4ba21d'), cachedUnsplash('photo-1518509562904-e7ef99cdcc86'), cachedUnsplash('photo-1525874684015-58379d421a52'), cachedUnsplash('photo-1501927023255-9063be98970c')),
  JPN: detailSet(wikiDetail('jpn', 'cover'), wikiDetail('jpn', 'geography'), wikiDetail('jpn', 'history'), wikiDetail('jpn', 'food'), wikiDetail('jpn', 'festival'), wikiDetail('jpn', 'architecture'), wikiDetail('jpn', 'lifestyle')),
  GBR: detailSet(wikiDetail('gbr', 'cover'), cachedUnsplash('photo-1505761671935-60b3a7427bad'), wikiCountry('gbr', 2), cachedUnsplash('photo-1515443961218-a51367888e4b'), cachedUnsplash('photo-1501927023255-9063be98970c'), cachedUnsplash('photo-1494526585095-c41746248156'), cachedUnsplash('photo-1516483638261-f4dbaf036963')),
  FRA: detailSet(local('france', 'cover'), cachedUnsplash('photo-1516483638261-f4dbaf036963'), local('france', 'gallery-1'), cachedUnsplash('photo-1515443961218-a51367888e4b'), cachedUnsplash('photo-1529260830199-42c24126f198'), cachedUnsplash('photo-1533105079780-92b9be482077'), cachedUnsplash('photo-1578301978693-85fa9c0320b9')),
  DEU: detailSet(cachedUnsplash('photo-1467269204594-9661b134dd2b'), cachedUnsplash('photo-1449452198679-05c7fd30f416'), cachedUnsplash('photo-1525874684015-58379d421a52'), cachedUnsplash('photo-1551782450-a2132b4ba21d'), cachedUnsplash('photo-1501927023255-9063be98970c'), cachedUnsplash('photo-1560969184-10fe8719e047'), cachedUnsplash('photo-1516483638261-f4dbaf036963')),
  RUS: detailSet(cachedUnsplash('photo-1513326738677-b964603b136d'), special('lake-baikal'), cachedUnsplash('photo-1525874684015-58379d421a52'), cachedUnsplash('photo-1549893072-4bc678117f45'), cachedUnsplash('photo-1580060839134-75a5edca2e99'), cachedUnsplash('photo-1566552881560-0be862a7c445'), cachedUnsplash('photo-1483664852095-d6cc6870702d')),
  ITA: detailSet(cachedUnsplash('photo-1514890547357-a9ee288728e0'), cachedUnsplash('photo-1533105079780-92b9be482077'), cachedUnsplash('photo-1543783207-ec64e4d95325'), cachedUnsplash('photo-1548013146-72479768bada'), cachedUnsplash('photo-1524231757912-21f4fe3a7200'), cachedUnsplash('photo-1529260830199-42c24126f198'), cachedUnsplash('photo-1565967511849-76a60a516170')),
  ESP: detailSet(cachedUnsplash('photo-1543783207-ec64e4d95325'), cachedUnsplash('photo-1507525428034-b723cf961d3e'), cachedUnsplash('photo-1525874684015-58379d421a52'), cachedUnsplash('photo-1515443961218-a51367888e4b'), cachedUnsplash('photo-1529260830199-42c24126f198'), cachedUnsplash('photo-1566552881560-0be862a7c445'), cachedUnsplash('photo-1516483638261-f4dbaf036963')),
  IND: detailSet(cachedUnsplash('photo-1548013146-72479768bada'), cachedUnsplash('photo-1500530855697-b586d89ba3ee'), cachedUnsplash('photo-1524492412937-b28074a5d7da'), cachedUnsplash('photo-1555993539-1732b0258235'), cachedUnsplash('photo-1545569341-9eb8b30979d9'), cachedUnsplash('photo-1544735716-392fe2489ffa'), cachedUnsplash('photo-1602216056096-3b40cc0c9944')),
  KOR: detailSet('/images/wiki/country/kor-1.jpg', '/images/wiki/country/kor-2.jpg', '/images/wiki/country/kor-3.jpg', cachedUnsplash('photo-1498654896293-37aacf113fd9'), cachedUnsplash('photo-1545569341-9eb8b30979d9'), cachedUnsplash('photo-1560969184-10fe8719e047'), cachedUnsplash('photo-1501927023255-9063be98970c')),
  AUS: detailSet(local('australia', 'gallery-2'), cachedUnsplash('photo-1544551763-46a013bb70d5'), special('australian-outback'), cachedUnsplash('photo-1518509562904-e7ef99cdcc86'), cachedUnsplash('photo-1590766940554-634a7ed41450'), cachedUnsplash('photo-1525874684015-58379d421a52'), cachedUnsplash('photo-1507525428034-b723cf961d3e')),
  BRA: detailSet(cachedUnsplash('photo-1580060839134-75a5edca2e99'), special('amazon-river'), cachedUnsplash('photo-1500375592092-40eb2168fd21'), cachedUnsplash('photo-1549893072-4bc678117f45'), cachedUnsplash('photo-1518509562904-e7ef99cdcc86'), cachedUnsplash('photo-1526392060635-9d6019884377'), cachedUnsplash('photo-1516483638261-f4dbaf036963')),
  EGY: detailSet(cachedUnsplash('photo-1525874684015-58379d421a52'), special('amazon-river'), cachedUnsplash('photo-1548013146-72479768bada'), cachedUnsplash('photo-1549893072-4bc678117f45'), cachedUnsplash('photo-1501927023255-9063be98970c'), cachedUnsplash('photo-1524492412937-b28074a5d7da'), cachedUnsplash('photo-1512343879784-a960bf40e7f2')),
  TUR: detailSet(cachedUnsplash('photo-1541432901042-2d8bd64b4a9b'), cachedUnsplash('photo-1500530855697-b586d89ba3ee'), cachedUnsplash('photo-1525874684015-58379d421a52'), cachedUnsplash('photo-1555939594-58d7cb561ad1'), cachedUnsplash('photo-1524231757912-21f4fe3a7200'), cachedUnsplash('photo-1566552881560-0be862a7c445'), cachedUnsplash('photo-1512343879784-a960bf40e7f2')),
  ZAF: detailSet(cachedUnsplash('photo-1516026672322-bc52d61a55d5'), cachedUnsplash('photo-1580060839134-75a5edca2e99'), cachedUnsplash('photo-1521150932951-303a95503ed3'), cachedUnsplash('photo-1555993539-1732b0258235'), cachedUnsplash('photo-1590766940554-634a7ed41450'), cachedUnsplash('photo-1566552881560-0be862a7c445'), cachedUnsplash('photo-1516483638261-f4dbaf036963')),
  asia: makeDetailSet(cachedUnsplash('photo-1500530855697-b586d89ba3ee'), 0),
  europe: makeDetailSet(cachedUnsplash('photo-1494526585095-c41746248156'), 2),
  africa: makeDetailSet(cachedUnsplash('photo-1516026672322-bc52d61a55d5'), 4),
  'north-america': makeDetailSet(cachedUnsplash('photo-1500534314209-a25ddb2bd429'), 6),
  'south-america': makeDetailSet(cachedUnsplash('photo-1506744038136-46273834b3fb'), 8),
  oceania: makeDetailSet(cachedUnsplash('photo-1507525428034-b723cf961d3e'), 10),
  'antarctica-continent': makeDetailSet('/images/wiki/country/ata-1.jpg', 12),
  'arctic-circle': makeDetailSet(cachedUnsplash('photo-1517783999520-f068d7431a60'), 14),
  'pacific-ocean': makeDetailSet(cachedUnsplash('photo-1500375592092-40eb2168fd21'), 0, oceanDetailPool),
  'atlantic-ocean': detailSet(
    cachedUnsplash('photo-1512343879784-a960bf40e7f2'),
    cachedUnsplash('photo-1500375592092-40eb2168fd21'),
    cachedUnsplash('photo-1533105079780-92b9be482077'),
    cachedUnsplash('photo-1544551763-46a013bb70d5'),
    cachedUnsplash('photo-1507525428034-b723cf961d3e'),
    cachedUnsplash('photo-1514890547357-a9ee288728e0'),
    cachedUnsplash('photo-1528127269322-539801943592')
  ),
  'indian-ocean': makeDetailSet(cachedUnsplash('photo-1518509562904-e7ef99cdcc86'), 1, oceanDetailPool),
  'arctic-ocean': makeDetailSet(cachedUnsplash('photo-1483664852095-d6cc6870702d'), 2, oceanDetailPool),
  'southern-ocean': makeDetailSet(local('antarctica', 'gallery-3'), 3, oceanDetailPool),
  'mediterranean-sea': makeDetailSet(cachedUnsplash('photo-1533105079780-92b9be482077'), 4, oceanDetailPool),
  'caribbean-sea': makeDetailSet(cachedUnsplash('photo-1501927023255-9063be98970c'), 5, oceanDetailPool),
  'red-sea': makeDetailSet(cachedUnsplash('photo-1544551763-46a013bb70d5'), 6, oceanDetailPool),
  'black-sea': makeDetailSet('/images/wiki/ocean/black-sea-1.jpg', 7, oceanDetailPool),
  'south-china-sea': makeDetailSet(cachedUnsplash('photo-1528127269322-539801943592'), 8, oceanDetailPool),
  'baltic-sea': makeDetailSet(cachedUnsplash('photo-1467269204594-9661b134dd2b'), 9, oceanDetailPool),
  'arabian-sea': makeDetailSet('/images/wiki/country/omn-1.jpg', 10, oceanDetailPool),
  'bering-sea': makeDetailSet('/images/wiki/ocean/bering-sea-1.jpg', 11, oceanDetailPool)
}

export function imageSetForPlace(place = {}) {
  const explicit = explicitImagesForPlace(place)
  const detail = detailImagesForPlace(place)
  const manifestImages = wikiImagesForPlace(place)
  return {
    ...explicit,
    ...detail,
    cover: detail.cover || explicit.cover || manifestImages[0] || ''
  }
}

export function coverForPlace(place = {}) {
  return imageSetForPlace(place).cover || ''
}

export function sectionImageForPlace(place = {}, key) {
  const set = imageSetForPlace(place)
  return set[key] || set.cover || ''
}

export function galleryForPlace(place = {}) {
  const set = imageSetForPlace(place)
  return [
    ...sectionKeys.map((key) => set[key]),
    ...wikiImagesForPlace(place),
    set.cover
  ]
    .filter(Boolean)
    .filter((image, index, images) => images.indexOf(image) === index)
    .slice(0, 6)
    .map((image, index) => ({
      title: sectionTitles[index] || '地方记忆',
      desc: place.intro,
      image
    }))
}

function explicitImagesForPlace(place = {}) {
  const id = String(place.geoFeatureId || '').trim()
  const slug = String(place.slug || '').trim()
  return placeImages[id] || placeImages[slug] || {}
}

function detailImagesForPlace(place = {}) {
  const id = String(place.geoFeatureId || '').trim()
  const upperId = id.toUpperCase()
  const slug = String(place.slug || '').trim()
  return detailPlaceImages[id] || detailPlaceImages[upperId] || detailPlaceImages[slug] || {}
}

function wikiImagesForPlace(place = {}) {
  const id = String(place.geoFeatureId || '').trim().toUpperCase()
  const slug = String(place.slug || '').trim()
  return id ? wikiImages('country', id) : [wikiCover('place', slug)].filter(Boolean)
}

function fallbackCoverForPlace(place = {}) {
  const id = String(place.geoFeatureId || place.slug || place.name || place.continent || 'world')
  return /^[A-Z]{3}$/.test(id) ? wikiCover('country', id) : ''
}

function uniqueImages(values) {
  return [...new Set(values.filter(Boolean))]
}
