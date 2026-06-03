export const wikiImageManifest = {
  country: {
    AIA: [
      '/images/wiki/country/aia-1.jpg',
      '/images/wiki/country/aia-2.jpg'
    ],
    ARG: [
      '/images/wiki/country/arg-1.jpg',
      '/images/wiki/country/arg-2.jpg',
      '/images/wiki/country/arg-3.jpg'
    ],
    ATA: [
      '/images/wiki/country/ata-1.jpg'
    ],
    CHE: [
      '/images/wiki/country/che-1.jpg'
    ],
    CHN: [
      '/images/wiki/country/chn-1.jpg',
      '/images/wiki/country/chn-2.jpg',
      '/images/wiki/country/chn-3.jpg'
    ],
    CYP: [
      '/images/wiki/country/cyp-1.jpg'
    ],
    GMB: [
      '/images/wiki/country/gmb-1.jpg',
      '/images/wiki/country/gmb-2.jpg',
      '/images/wiki/country/gmb-3.jpg'
    ],
    GTM: [
      '/images/wiki/country/gtm-1.jpg',
      '/images/wiki/country/gtm-2.jpg',
      '/images/wiki/country/gtm-3.jpg'
    ],
    GUM: [
      '/images/wiki/country/gum-1.jpg'
    ],
    HKG: [
      '/images/wiki/country/hkg-1.jpg'
    ],
    KOR: [
      '/images/wiki/country/kor-1.jpg',
      '/images/wiki/country/kor-2.jpg',
      '/images/wiki/country/kor-3.jpg'
    ],
    LAO: [
      '/images/wiki/country/lao-1.jpg',
      '/images/wiki/country/lao-2.jpg'
    ],
    MEX: [
      '/images/wiki/country/mex-1.jpg',
      '/images/wiki/country/mex-2.jpg',
      '/images/wiki/country/mex-3.jpg'
    ],
    MWI: [
      '/images/wiki/country/mwi-1.jpg'
    ],
    MYS: [
      '/images/wiki/country/mys-1.jpg'
    ],
    OMN: [
      '/images/wiki/country/omn-1.jpg',
      '/images/wiki/country/omn-2.jpg',
      '/images/wiki/country/omn-3.jpg'
    ],
    PCN: [
      '/images/wiki/country/pcn-1.jpg'
    ],
    REU: [
      '/images/wiki/country/reu-1.jpg'
    ]
  },
  dynamic: {
    eurasian: [
      '/images/wiki/dynamic/eurasian-1.png'
    ],
    pacific: [
      '/images/cached/special/mariana-trench.jpg'
    ],
    'indo-australian': [
      '/images/cached/unsplash/photo-1544735716-392fe2489ffa.jpg'
    ],
    african: [
      '/images/cached/unsplash/photo-1493246507139-91e8fad9978e.jpg'
    ],
    'north-american': [
      '/images/cached/special/rocky-mountains.jpg'
    ],
    'south-american': [
      '/images/cached/unsplash/photo-1526392060635-9d6019884377.jpg'
    ],
    antarctic: [
      '/images/places/antarctica-cover.jpg'
    ],
    fuji: [
      '/images/wiki/dynamic/fuji-1.jpg'
    ],
    kilimanjaro: [
      '/images/wiki/dynamic/kilimanjaro-1.jpg'
    ],
    etna: [
      '/images/wiki/dynamic/etna-1.jpg'
    ],
    'mauna-loa': [
      '/images/wiki/dynamic/mauna-loa-1.jpg'
    ],
    yellowstone: [
      '/images/wiki/dynamic/yellowstone-1.jpg'
    ],
    toba: [
      '/images/wiki/dynamic/toba-1.jpg'
    ]
  }
}

export function wikiImages(kind, id) {
  return wikiImageManifest?.[kind]?.[id] || []
}

export function wikiCover(kind, id) {
  return wikiImages(kind, id)[0] || ''
}
