export function normalizeLng(lng) {
  return ((lng + 540) % 360) - 180
}

export function haversineKm(a, b) {
  const toRad = (value) => (value * Math.PI) / 180
  const radius = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(normalizeLng(b.lng - a.lng))
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * radius * Math.asin(Math.sqrt(x))
}

export function formatCoordinate(value, type) {
  const abs = Math.abs(value).toFixed(2)
  if (type === 'lat') return `${abs}°${value >= 0 ? 'N' : 'S'}`
  return `${abs}°${value >= 0 ? 'E' : 'W'}`
}
