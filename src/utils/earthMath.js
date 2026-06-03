import * as THREE from 'three'
import { normalizeLng } from './geo'

export function latLngToVector3(lat, lng, radius = 2) {
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lng + 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

export function vector3ToLatLng(vector) {
  const radius = vector.length()
  const lat = 90 - THREE.MathUtils.radToDeg(Math.acos(vector.y / radius))
  const lng = normalizeLng(THREE.MathUtils.radToDeg(Math.atan2(vector.z, -vector.x)) - 180)
  return { lat, lng }
}
