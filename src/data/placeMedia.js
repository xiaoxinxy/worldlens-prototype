import { coverForPlace, galleryForPlace, sectionImageForPlace } from './placeImages.js'

const geoBySlug = {
  china: { geoFeatureId: 'CHN', boundaryType: '国家' },
  japan: { geoFeatureId: 'JPN', boundaryType: '国家' },
  india: { geoFeatureId: 'IND', boundaryType: '国家' },
  france: { geoFeatureId: 'FRA', boundaryType: '国家' },
  italy: { geoFeatureId: 'ITA', boundaryType: '国家' },
  'united-kingdom': { geoFeatureId: 'GBR', boundaryType: '国家' },
  taiwan: { geoFeatureId: 'CHN', boundaryType: '国家' },
  egypt: { geoFeatureId: 'EGY', boundaryType: '国家' },
  'south-africa': { geoFeatureId: 'ZAF', boundaryType: '国家' },
  'united-states': { geoFeatureId: 'USA', boundaryType: '国家' },
  brazil: { geoFeatureId: 'BRA', boundaryType: '国家' },
  australia: { geoFeatureId: 'AUS', boundaryType: '国家' },
  'pacific-ocean': { geoFeatureId: 'pacific-ocean', boundaryType: '大洋' },
  'atlantic-ocean': { geoFeatureId: 'atlantic-ocean', boundaryType: '大洋' },
  'indian-ocean': { geoFeatureId: 'indian-ocean', boundaryType: '大洋' },
  'arctic-region': { geoFeatureId: 'arctic-ocean', boundaryType: '极地' },
  antarctica: { geoFeatureId: 'antarctica-continent', boundaryType: '极地' }
}

function normalizedPlace(place) {
  const geo = geoBySlug[place.slug] || {}
  return {
    ...place,
    ...geo,
    geoFeatureId: place.geoFeatureId || geo.geoFeatureId || place.name,
    boundaryType: place.boundaryType || geo.boundaryType || place.type
  }
}

export function enhancePlace(place) {
  const base = normalizedPlace(place)
  const coverImage = base.coverImage && !isFlagImage(base.coverImage)
    ? base.coverImage
    : coverForPlace(base)
  const sectionImages = {
    geography: base.sectionImages?.geography || sectionImageForPlace(base, 'geography'),
    history: base.sectionImages?.history || sectionImageForPlace(base, 'history'),
    food: base.sectionImages?.food || sectionImageForPlace(base, 'food'),
    festival: base.sectionImages?.festival || sectionImageForPlace(base, 'festival'),
    architecture: base.sectionImages?.architecture || sectionImageForPlace(base, 'architecture'),
    lifestyle: base.sectionImages?.lifestyle || sectionImageForPlace(base, 'lifestyle')
  }
  const gallery = (base.gallery || []).filter((item) => item.image && !isFlagImage(item.image))
  return {
    ...base,
    coverImage,
    sectionImages,
    gallery: gallery.length ? gallery : galleryForPlace({ ...base, coverImage })
  }
}

export function enhancePlaces(places) {
  return places.map(enhancePlace)
}

export function withRegionMedia(place) {
  return enhancePlace(place)
}

function isFlagImage(url = '') {
  return /flagcdn\.com|\/flags?\//i.test(url)
}
