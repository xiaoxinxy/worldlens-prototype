<template>
  <div ref="stageRef" class="earth-stage">
    <div class="space-backdrop"></div>
    <div class="space-drift"></div>
    <div class="scene-vignette"></div>

    <Transition name="loading-fade">
      <div v-if="isLoading" class="earth-loader">
        <span></span>
        <small>校准轨道</small>
      </div>
    </Transition>

    <div v-if="coordinateReadout" class="coordinate-readout">
      {{ coordinateReadout }}
    </div>

    <div v-if="hoverLabel.text" class="globe-hover-label" :style="{ left: `${hoverLabel.x}px`, top: `${hoverLabel.y}px` }">
      {{ hoverLabel.text }}
    </div>

    <div class="layer-switcher glass-card">
      <button :class="{ active: layersVisible.countries }" @click="toggleLayer('countries')">国家边界</button>
      <button :class="{ active: layersVisible.continents }" @click="toggleLayer('continents')">大洲轮廓</button>
      <button :class="{ active: layersVisible.oceans }" @click="toggleLayer('oceans')">大洋区域</button>
      <button :class="{ active: layersVisible.terrain }" @click="toggleLayer('terrain')">地形地貌</button>
      <button v-if="HOTSPOTS_LAYER_ENABLED" :class="{ active: layersVisible.hotspots }" @click="toggleLayer('hotspots')">文化热点</button>
      <button :class="{ active: layersVisible.climate }" @click="toggleLayer('climate')">气候系统</button>
    </div>

    <button v-if="isFocused" class="free-explore-btn" @click="releaseFocus">
      返回自由探索
    </button>

    <Transition name="loading-fade">
      <div v-if="debugVisible" class="debug-panel glass-card" @click.stop>
        <div class="debug-header">
          <span>调试面板</span>
          <button class="debug-close" @click="debugVisible = false">×</button>
        </div>
        <div class="debug-body">
          <div class="debug-row"><span>lat / lng</span><span>{{ debugCoords }}</span></div>
          <div class="debug-row"><span>selectedFeature</span><span>{{ props.activeFeature?.name || '-' }}</span></div>
          <div class="debug-row"><span>geoFeatureId</span><span>{{ props.activeFeature?.geoFeatureId || '-' }}</span></div>
          <div class="debug-row"><span>type</span><span>{{ props.activeFeature?.type || '-' }}</span></div>
          <div class="debug-row"><span>continent</span><span>{{ props.activeFeature?.continent || '-' }}</span></div>
          <div class="debug-row"><span>highlight IDs</span><span>{{ (props.activeFeature?.highlightFeatureIds || []).join(', ') || '-' }}</span></div>
          <div class="debug-row"><span>matchLayer</span><span>{{ props.activeFeature?.matchLayer || '-' }}</span></div>
          <div class="debug-row"><span>matchMethod</span><span>{{ props.activeFeature?.matchMethod || '-' }}</span></div>
          <div class="debug-row"><span>raycasterTarget</span><span>earth mesh</span></div>
          <div class="debug-row"><span>isFocused</span><span>{{ isFocused }}</span></div>
          <div class="debug-row"><span>cameraAnimating</span><span>{{ cameraAnimating }}</span></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  ConeGeometry,
  DirectionalLight,
  DoubleSide,
  FogExp2,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  LineLoop,
  LinearFilter,
  LinearMipmapLinearFilter,
  LoadingManager,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  MOUSE,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { latLngToVector3, vector3ToLatLng } from '../utils/earthMath'
import { formatCoordinate } from '../utils/geo'
import { featureRings, findFeatureAt, loadGeoLayers } from '../utils/geoLookup'

const props = defineProps({
  places: { type: Array, default: () => [] },
  activeFeature: { type: Object, default: null },
  focusPlace: { type: Object, default: null },
  focusCommand: { type: Object, default: null },
  freeFocusToken: { type: Number, default: 0 },
  routeMode: { type: Boolean, default: false },
  activeRoute: { type: Object, default: null },
  activeRouteNodeIndex: { type: Number, default: -1 },
  terrainMode: { type: Boolean, default: false },
  terrainFeatures: { type: Array, default: () => [] },
  activeTerrainFeature: { type: Object, default: null },
  terrainTectonicsMode: { type: Boolean, default: false },
  climateMode: { type: Boolean, default: false },
  climateZones: { type: Array, default: () => [] },
  activeClimateZone: { type: Object, default: null },
  cosmosMode: { type: Boolean, default: false },
  cosmosState: { type: Object, default: () => ({}) },
  oceanMode: { type: Boolean, default: false },
  oceanFeatures: { type: Array, default: () => [] },
  oceanLayer: { type: String, default: 'depth' },
  oceanOverlays: { type: Object, default: () => ({}) },
  activeOceanFeature: { type: Object, default: null },
  earthDynamicMode: { type: Boolean, default: false },
  dynamicLayer: { type: String, default: 'plates' },
  earthquakeEvents: { type: Array, default: () => [] },
  volcanoFeatures: { type: Array, default: () => [] },
  plateFeatures: { type: Array, default: () => [] },
  activeDynamicFeature: { type: Object, default: null }
})

const emit = defineEmits([
  'globe-click',
  'marker-select',
  'route-node-select',
  'terrain-select',
  'climate-select',
  'cosmos-polar-select',
  'ocean-select',
  'dynamic-select'
])
const stageRef = ref(null)
const isLoading = ref(true)
const coordinateReadout = ref('')
const isFocused = ref(false)
const cameraAnimating = ref(false)
const hoverLabel = reactive({ text: '', x: 0, y: 0 })
const debugVisible = ref(false)
const debugCoords = ref('')
const HOTSPOTS_LAYER_ENABLED = false
const layersVisible = reactive({
  countries: false,
  continents: false,
  oceans: false,
  terrain: false,
  climate: false,
  hotspots: false
})

function onDebugKey(e) {
  if (e.key === 'd' || e.key === 'D') {
    debugVisible.value = !debugVisible.value
  }
  if (e.key === 'Escape') {
    releaseFocus()
  }
}

let renderer
let scene
let camera
let controls
let earth
let earthGroup
let sunLight
let nightLights
let clouds
let atmosphere
let markerGroup
let terrainGroup
let terrainReliefOverlay
let tectonicsGroup
let climateGroup
let cosmosGroup
let cosmosOverlay
let cosmosGuideGroup
let cosmosSubsolarMarker
let cosmosSubsolarLine
let cosmosTerminatorLine
let cosmosMoonGroup
let cosmosMoon
let cosmosMoonLine
let cosmosTideGroup
let cosmosTidePatches = []
let routeGroup
let oceanGroup
let oceanOverlayGroup
let dynamicGroup
let routeNodeGroup
let routeArcGroup
let routePulseGroup
let routeLineMaterials = []
let boundaryGroups = {}
let boundaryMaterials = {}
let activeBoundary = null
let fadingBoundaries = []
let geoLayers = null
let raycaster
let pointer
let pointerDown = null
let stagePointerDown = null
let animationId
let pointerMoveFrame = null
let latestPointerEvent = null
let targetCameraPosition = null
let targetControlPoint = null
let autoRotateTimer = null
let earthReady = false
let resizeFrame = null
let cursorState = ''
let lastGeoHover = null
let lastGeoHoverAt = 0
let lastGeoHoverLat = null
let lastGeoHoverLng = null

const RADIUS = 2.55
const EARTH_SEGMENTS = 128
const OVERLAY_SEGMENTS = 96
const MAX_PIXEL_RATIO = 1.5
const MAX_TEXTURE_ANISOTROPY = 4
const COSMOS_MOON_ORBIT_RADIUS = RADIUS * 1.24
const CAMERA_HOME = new Vector3(-0.35, 0.78, 6.45)
const CLICK_THRESHOLD = 5
const TEXTURE_PATHS = {
  day: '/textures/earth-day-4k.jpg',
  night: '/textures/earth-night-4k.jpg',
  clouds: '/textures/earth-clouds-4k.jpg',
  normal: '/textures/earth-normal.jpg',
  specular: '/textures/earth-specular.jpg'
}

const COSMOS_DEFAULT_STATE = {
  time: 12,
  season: 'june-solstice',
  moonPhase: 'full',
  polarFocus: 'north'
}

const COSMOS_SEASON_DECLINATIONS = {
  'march-equinox': 0,
  'june-solstice': 23.44,
  'september-equinox': 0,
  'december-solstice': -23.44
}

const COSMOS_MOON_OFFSETS = {
  new: 0,
  'first-quarter': -90,
  full: 180,
  'last-quarter': 90
}

onMounted(async () => {
  initScene()
  geoLayers = await loadGeoLayers()
  addBoundaryLayers()
  addMarkers()
  addTerrainMarkers()
  addClimateZones()
  addCosmosLayer()
  updateCosmosLayer()
  updateRouteLayer()
  animate()
  window.addEventListener('resize', resize)
  window.addEventListener('pointerdown', onGlobalPointerDown, true)
  window.addEventListener('keydown', onDebugKey)
  document.addEventListener('visibilitychange', onVisibilityChange)
  const el = renderer.domElement
  stageRef.value.addEventListener('pointerdown', onStagePointerDown, true)
  stageRef.value.addEventListener('pointermove', onStagePointerMove, true)
  stageRef.value.addEventListener('wheel', releaseFocus, { passive: true, capture: true })
  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointerup', onPointerUp)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)
  el.addEventListener('wheel', releaseFocus, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointerdown', onGlobalPointerDown, true)
  window.removeEventListener('keydown', onDebugKey)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  if (renderer?.domElement) {
    const el = renderer.domElement
    stageRef.value?.removeEventListener('pointerdown', onStagePointerDown, true)
    stageRef.value?.removeEventListener('pointermove', onStagePointerMove, true)
    stageRef.value?.removeEventListener('wheel', releaseFocus, true)
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('pointerup', onPointerUp)
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerleave', onPointerLeave)
    el.removeEventListener('wheel', releaseFocus)
  }
  controls?.removeEventListener('start', releaseFocus)
  clearTimeout(autoRotateTimer)
  cancelAnimationFrame(animationId)
  cancelAnimationFrame(pointerMoveFrame)
  cancelAnimationFrame(resizeFrame)
  clearRouteLayer()
  if (terrainGroup) disposeObject(terrainGroup)
  if (terrainReliefOverlay) disposeObject(terrainReliefOverlay)
  if (tectonicsGroup) disposeObject(tectonicsGroup)
  if (climateGroup) disposeObject(climateGroup)
  if (cosmosGroup) disposeObject(cosmosGroup)
  renderer?.dispose()
})

watch(
  () => props.places,
  () => {
    if (earthGroup) addMarkers()
  }
)

watch(
  () => props.terrainFeatures,
  () => {
    if (earthGroup) addTerrainMarkers()
  }
)

watch(
  () => props.climateZones,
  () => {
    if (earthGroup) addClimateZones()
  }
)

watch(
  () => props.focusPlace,
  (place) => {
    if (!place || !geoLayers) return
    orientToLatLng(place.lat, place.lng)
  }
)

watch(
  () => props.activeFeature,
  (feature) => {
    if (!feature || !geoLayers) return
    setActiveFeatureFromSelected(feature)
  }
)

watch(
  () => props.focusCommand,
  (command) => {
    if (command?.place) focusToLatLng(command.place.lat, command.place.lng)
  }
)

watch(
  () => props.freeFocusToken,
  () => releaseFocus()
)

watch(
  () => props.activeRoute,
  () => updateRouteLayer()
)

watch(
  () => props.routeMode,
  () => updateRouteLayer()
)

watch(
  () => props.activeRouteNodeIndex,
  () => updateRouteNodeStyles()
)

watch(
  () => props.terrainMode,
  (enabled) => {
    layersVisible.terrain = enabled
    if (enabled) {
      layersVisible.hotspots = false
      layersVisible.climate = false
    }
    updateTerrainModeVisuals()
  }
)

watch(
  () => props.activeTerrainFeature,
  () => {
    updateTerrainMarkerStyles()
    updateTectonicsLayer()
  }
)

watch(
  () => props.terrainTectonicsMode,
  () => updateTectonicsLayer()
)

watch(
  () => props.climateMode,
  (enabled) => {
    layersVisible.climate = enabled
    updateTerrainModeVisuals()
  }
)

watch(
  () => props.activeClimateZone,
  () => updateClimateZoneStyles()
)

watch(
  () => props.cosmosMode,
  () => {
    updateCosmosLayer()
    updateTerrainModeVisuals()
  }
)

watch(
  () => props.cosmosState,
  () => updateCosmosLayer(),
  { deep: true }
)

function initScene() {
  const stage = stageRef.value
  const { width, height } = stage.getBoundingClientRect()

  scene = new Scene()
  scene.fog = new FogExp2(0x020611, 0.018)

  camera = new PerspectiveCamera(38, width / height, 0.1, 120)
  camera.position.copy(CAMERA_HOME)

  renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO))
  renderer.setSize(width, height)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  stage.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.055
  controls.enableRotate = true
  controls.enableZoom = true
  controls.enablePan = false
  controls.minDistance = 3.72
  controls.maxDistance = 9.2
  controls.rotateSpeed = 0.34
  controls.zoomSpeed = 0.38
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.1
  controls.mouseButtons = {
    LEFT: MOUSE.ROTATE,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.PAN
  }
  controls.addEventListener('start', releaseFocus)

  raycaster = new Raycaster()
  raycaster.params.Line.threshold = 0.045
  pointer = new Vector2()

  addLights()
  addStarField()
  addEarth()
  earthReady = true
}

function addLights() {
  scene.add(new HemisphereLight(0x8bb8ff, 0x060b13, 1.25))

  sunLight = new DirectionalLight(0xffffff, 3.25)
  sunLight.position.set(-5.4, 2.7, 6.8)
  scene.add(sunLight)

  const coolFill = new DirectionalLight(0x4fb3ff, 0.85)
  coolFill.position.set(3.8, 1.4, -4.6)
  scene.add(coolFill)
}

function addStarField() {
  const starGeometry = new BufferGeometry()
  const starCount = 1800
  const positions = new Float32Array(starCount * 3)
  const colors = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount; i += 1) {
    const radius = MathUtils.randFloat(24, 58)
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(MathUtils.randFloatSpread(2))
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.cos(phi)
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

    const tint = Math.random() > 0.82 ? new Color(0x8ecbff) : new Color(0xffffff)
    colors[i * 3] = tint.r
    colors[i * 3 + 1] = tint.g
    colors[i * 3 + 2] = tint.b
  }

  starGeometry.setAttribute('position', new BufferAttribute(positions, 3))
  starGeometry.setAttribute('color', new BufferAttribute(colors, 3))
  scene.add(new Points(
    starGeometry,
    new PointsMaterial({
      size: 0.024,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      depthWrite: false
    })
  ))
}

function loadTexture(loader, path) {
  const texture = loader.load(path)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), MAX_TEXTURE_ANISOTROPY)
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = true
  return texture
}

function addEarth() {
  const loadingManager = new LoadingManager()
  loadingManager.onLoad = () => {
    isLoading.value = false
  }
  const loader = new TextureLoader(loadingManager)

  const dayMap = loadTexture(loader, TEXTURE_PATHS.day)
  const nightMap = loadTexture(loader, TEXTURE_PATHS.night)
  const cloudMap = loadTexture(loader, TEXTURE_PATHS.clouds)
  const normalMap = loadTexture(loader, TEXTURE_PATHS.normal)
  const specularMap = loadTexture(loader, TEXTURE_PATHS.specular)

  earthGroup = new Group()
  earthGroup.rotation.y = -0.35
  scene.add(earthGroup)

  routeGroup = new Group()
  routeGroup.visible = false
  earthGroup.add(routeGroup)

  earth = new Mesh(
    new SphereGeometry(RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS),
    new MeshPhongMaterial({
      map: dayMap,
      normalMap,
      normalScale: new Vector2(0.36, 0.36),
      specularMap,
      specular: new Color(0x526d83),
      shininess: 16
    })
  )
  earthGroup.add(earth)

  terrainReliefOverlay = new Mesh(
    new SphereGeometry(RADIUS * 1.021, OVERLAY_SEGMENTS, OVERLAY_SEGMENTS),
    new ShaderMaterial({
      vertexShader: `
        varying vec3 vLocalNormal;
        void main() {
          vLocalNormal = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vLocalNormal;
        void main() {
          vec3 n = normalize(vLocalNormal);
          float lat = asin(n.y);
          float lng = atan(n.z, -n.x);
          float ridge = pow(abs(sin(lng * 18.0 + lat * 9.0)), 10.0);
          float folded = pow(abs(sin(lng * 7.0 - lat * 16.0)), 8.0);
          float highland = smoothstep(0.18, 0.9, ridge * 0.55 + folded * 0.48);
          float polar = smoothstep(0.76, 1.0, abs(n.y));
          vec3 rock = vec3(0.64, 0.53, 0.36);
          vec3 ice = vec3(0.72, 0.88, 0.94);
          vec3 color = mix(rock, ice, polar * 0.55);
          gl_FragColor = vec4(color, highland * 0.18 + polar * 0.05);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending
    })
  )
  terrainReliefOverlay.visible = false
  earthGroup.add(terrainReliefOverlay)

  nightLights = new Mesh(
    new SphereGeometry(RADIUS * 1.002, OVERLAY_SEGMENTS, OVERLAY_SEGMENTS),
    new MeshBasicMaterial({
      map: nightMap,
      transparent: true,
      opacity: 0.34,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  earthGroup.add(nightLights)

  clouds = new Mesh(
    new SphereGeometry(RADIUS * 1.016, OVERLAY_SEGMENTS, OVERLAY_SEGMENTS),
    new MeshLambertMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0.38,
      depthWrite: false
    })
  )
  earthGroup.add(clouds)

  atmosphere = new Mesh(
    new SphereGeometry(RADIUS * 1.09, OVERLAY_SEGMENTS, OVERLAY_SEGMENTS),
    new ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDirection), 0.0), 2.75);
          vec3 glow = vec3(0.22, 0.72, 1.0) * fresnel;
          gl_FragColor = vec4(glow, fresnel * 0.66);
        }
      `,
      transparent: true,
      blending: AdditiveBlending,
      side: BackSide,
      depthWrite: false
    })
  )
  scene.add(atmosphere)
}

function addBoundaryLayers() {
  boundaryMaterials = {
    countries: new LineBasicMaterial({ color: 0xb8e8ff, transparent: true, opacity: 0.1, depthWrite: false }),
    continents: new LineBasicMaterial({ color: 0xe7c46b, transparent: true, opacity: 0.16, depthWrite: false }),
    oceans: new LineBasicMaterial({ color: 0x75d6ff, transparent: true, opacity: 0.14, depthWrite: false })
  }
  boundaryGroups = {
    countries: buildLayerGroup(geoLayers.countries.features, boundaryMaterials.countries, RADIUS * 1.021),
    continents: buildLayerGroup(geoLayers.continents.features, boundaryMaterials.continents, RADIUS * 1.026),
    oceans: buildLayerGroup(geoLayers.oceans.features, boundaryMaterials.oceans, RADIUS * 1.024)
  }
  Object.entries(boundaryGroups).forEach(([key, group]) => {
    group.visible = layersVisible[key]
    earthGroup.add(group)
  })
}

function buildLayerGroup(features, material, radius) {
  const group = new Group()
  features.forEach((feature) => {
    buildFeatureLines(feature, material, radius).forEach((line) => {
      line.userData.feature = feature
      group.add(line)
    })
  })
  return group
}

function buildFeatureLines(feature, material, radius) {
  return featureRings(feature).flatMap((ring) => ringToLines(ring, material, radius))
}

function ringToLines(ring, material, radius) {
  const lines = []
  let segment = []
  for (let i = 0; i < ring.length; i += 1) {
    const [lng, lat] = ring[i]
    const previous = ring[i - 1]
    if (previous && Math.abs(lng - previous[0]) > 180 && segment.length > 1) {
      lines.push(makeLine(segment, material))
      segment = []
    }
    segment.push(latLngToVector3(lat, lng, radius))
  }
  if (segment.length > 1) lines.push(makeLine(segment, material))
  return lines
}

function makeLine(points, material) {
  return new Line(new BufferGeometry().setFromPoints(points), material)
}

function disposeMaterial(material) {
  if (!material) return
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial)
    return
  }
  material.dispose?.()
}

function disposeObject(object) {
  object.traverse?.((child) => {
    child.geometry?.dispose?.()
    disposeMaterial(child.material)
  })
}

function clearRouteLayer() {
  if (!routeGroup) return
  while (routeGroup.children.length) {
    const child = routeGroup.children[0]
    routeGroup.remove(child)
    disposeObject(child)
  }
  routeNodeGroup = null
  routeArcGroup = null
  routePulseGroup = null
  routeLineMaterials = []
}

function updateRouteLayer() {
  if (!routeGroup || !earthGroup) return
  clearRouteLayer()
  routeGroup.visible = Boolean(props.routeMode && props.activeRoute)
  if (!routeGroup.visible) return

  routeArcGroup = new Group()
  routeNodeGroup = new Group()
  routePulseGroup = new Group()
  routeGroup.add(routeArcGroup, routePulseGroup, routeNodeGroup)

  const nodes = props.activeRoute.nodes || []
  nodes.slice(0, -1).forEach((node, index) => {
    routeArcGroup.add(createRouteArc(node, nodes[index + 1], index))
  })
  nodes.forEach((node, index) => {
    routeNodeGroup.add(createRouteNodeMarker(node, index))
  })
  updateRouteNodeStyles()
}

function createRouteArc(startNode, endNode, index) {
  const start = latLngToVector3(startNode.lat, startNode.lng, RADIUS * 1.045)
  const end = latLngToVector3(endNode.lat, endNode.lng, RADIUS * 1.045)
  const angle = start.angleTo(end)
  const lift = MathUtils.clamp(angle * 0.34, 0.16, 0.68)
  const points = []
  const steps = 72

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const point = start.clone().lerp(end, t).normalize()
    const altitude = RADIUS * 1.045 + Math.sin(Math.PI * t) * lift
    points.push(point.multiplyScalar(altitude))
  }

  const material = new LineBasicMaterial({
    color: 0x92e8ff,
    transparent: true,
    opacity: 0.42,
    blending: AdditiveBlending,
    depthWrite: false
  })
  routeLineMaterials.push(material)

  const line = new Line(new BufferGeometry().setFromPoints(points), material)
  line.userData.routeArc = true
  line.userData.phase = index * 0.62

  const pulse = new Mesh(
    new SphereGeometry(0.025, 16, 16),
    new MeshBasicMaterial({
      color: 0xf8dc8f,
      transparent: true,
      opacity: 0.92,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  pulse.userData.arcPoints = points
  pulse.userData.phase = index * 0.19
  routePulseGroup?.add(pulse)

  return line
}

function createRouteNodeMarker(node, index) {
  const group = new Group()
  const surface = latLngToVector3(node.lat, node.lng, RADIUS * 1.07)
  const normal = surface.clone().normalize()
  group.position.copy(surface)
  group.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal)
  group.userData.routeNode = { node, index }
  group.userData.phase = index * 0.5

  const core = new Mesh(
    new SphereGeometry(0.035, 18, 18),
    new MeshBasicMaterial({
      color: 0xf8dc8f,
      transparent: true,
      opacity: 0.96,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  core.userData.routeCore = true
  group.add(core)

  const halo = new Mesh(
    new TorusGeometry(0.105, 0.004, 8, 72),
    new MeshBasicMaterial({
      color: 0x8ae7ff,
      transparent: true,
      opacity: 0.58,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  halo.userData.routeHalo = true
  group.add(halo)

  const outer = new Mesh(
    new TorusGeometry(0.18, 0.0025, 8, 96),
    new MeshBasicMaterial({
      color: 0xf8dc8f,
      transparent: true,
      opacity: 0.28,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  outer.userData.routeOuter = true
  group.add(outer)

  return group
}

function updateRouteNodeStyles() {
  if (!routeNodeGroup) return
  routeNodeGroup.children.forEach((marker, index) => {
    const active = index === props.activeRouteNodeIndex
    marker.scale.setScalar(active ? 1.45 : 1)
    marker.children.forEach((child) => {
      if (!child.material) return
      if (child.userData.routeCore) {
        child.material.color.set(active ? 0xffffff : 0xf8dc8f)
        child.material.opacity = active ? 1 : 0.9
      }
      if (child.userData.routeHalo) child.material.opacity = active ? 0.86 : 0.5
      if (child.userData.routeOuter) child.material.opacity = active ? 0.46 : 0.24
    })
  })
}

function addMarkers() {
  if (!earthGroup) return
  if (markerGroup) {
    earthGroup.remove(markerGroup)
    disposeObject(markerGroup)
    markerGroup = null
  }
  if (!HOTSPOTS_LAYER_ENABLED) {
    return
  }
  markerGroup = new Group()
  markerGroup.visible = layersVisible.hotspots && !props.cosmosMode && !props.terrainMode
  const visiblePlaces = props.places
    .filter((place) => Number.isFinite(place?.lat) && Number.isFinite(place?.lng))
    .slice(0, 260)

  visiblePlaces.forEach((place, index) => {
    markerGroup.add(createMarker(place, index))
  })

  earthGroup.add(markerGroup)
}

function addTerrainMarkers() {
  if (!earthGroup) return
  if (terrainGroup) {
    earthGroup.remove(terrainGroup)
    disposeObject(terrainGroup)
  }
  terrainGroup = new Group()
  layersVisible.terrain = Boolean(props.terrainMode || layersVisible.terrain)
  terrainGroup.visible = layersVisible.terrain && !props.cosmosMode

  props.terrainFeatures.forEach((feature, index) => {
    terrainGroup.add(createTerrainFeatureVisual(feature, index))
  })

  earthGroup.add(terrainGroup)
  updateTerrainMarkerStyles()
  updateTerrainModeVisuals()
}

function createTerrainFeatureVisual(feature, index) {
  const group = new Group()
  group.userData.terrainFeature = feature
  group.userData.phase = index * 0.41
  group.userData.terrainVisual = true

  const color = terrainColor(feature.type)
  const shape = feature.shape || { kind: 'area', center: [feature.latitude, feature.longitude], radius: 0.2, aspect: [1, 1] }

  if (shape.kind === 'line') {
    const path = terrainSurfacePath(shape.path || [], RADIUS * 1.06)
    if (path.length >= 2) {
      const curve = new CatmullRomCurve3(path)
      const halo = new Mesh(
        new TubeGeometry(curve, Math.max(32, path.length * 28), (shape.width || 0.018) * 2.8, 8, false),
        new MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.1,
          blending: AdditiveBlending,
          depthWrite: false
        })
      )
      halo.userData.terrainHalo = true
      group.add(halo)

      const body = new Mesh(
        new TubeGeometry(curve, Math.max(48, path.length * 36), shape.width || 0.018, 8, false),
        new MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.44,
          blending: AdditiveBlending,
          depthWrite: false
        })
      )
      body.userData.terrainBody = true
      group.add(body)

      const trace = new Line(
        new BufferGeometry().setFromPoints(path.map((point) => point.clone().normalize().multiplyScalar(RADIUS * 1.082))),
        new LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.24,
          blending: AdditiveBlending,
          depthWrite: false
        })
      )
      trace.userData.terrainTrace = true
      group.add(trace)
    }
    return group
  }

  const [lat, lng] = shape.center || [feature.latitude, feature.longitude]
  const surface = latLngToVector3(lat, lng, RADIUS * 1.055)
  const normal = surface.clone().normalize()
  const radius = MathUtils.clamp(shape.radius || 0.24, 0.06, 0.72)
  const aspect = shape.aspect || [1, 1]

  group.position.copy(surface)
  group.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal)

  const patch = new Mesh(
    new CircleGeometry(radius, 96),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: terrainPatchOpacity(feature.type),
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  patch.scale.set(aspect[0], aspect[1], 1)
  patch.userData.terrainPatch = true
  group.add(patch)

  const border = new Mesh(
    new TorusGeometry(radius, 0.006, 8, 128),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.34,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  border.scale.set(aspect[0], aspect[1], 1)
  border.userData.terrainBorder = true
  group.add(border)

  if (feature.type === 'volcano') {
    const cone = new Mesh(
      new ConeGeometry(radius * 0.6, radius * 0.46, 32, 1),
      new MeshBasicMaterial({
        color: 0xf8b45e,
        transparent: true,
        opacity: 0.3,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    cone.position.z = radius * 0.08
    cone.userData.terrainCone = true
    group.add(cone)
  }

  return group
}

function terrainColor(type) {
  if (type === 'river' || type === 'lake' || type === 'reef') return 0x82d8ff
  if (type === 'trench') return 0x3f8dd4
  if (type === 'ridge') return 0x9ad4ff
  if (type === 'island_chain') return 0x8cc7a6
  if (type === 'rainforest') return 0x6ee7b7
  if (type === 'desert') return 0xe7c46b
  if (type === 'glacier') return 0xe0f2fe
  if (type === 'volcano') return 0xf8b45e
  if (type === 'basin') return 0x8fb986
  if (type === 'plain') return 0xb7d99a
  if (type === 'canyon' || type === 'rift') return 0xd69a62
  return 0xf2d98d
}

function terrainPatchOpacity(type) {
  if (type === 'glacier') return 0.24
  if (type === 'rainforest') return 0.16
  if (type === 'desert') return 0.18
  if (type === 'plain') return 0.12
  return 0.15
}

function terrainSurfacePath(coords, radius) {
  const source = coords.map(([lat, lng]) => latLngToVector3(lat, lng, 1).normalize())
  if (source.length < 2) return source.map((point) => point.multiplyScalar(radius))
  const points = []
  source.slice(0, -1).forEach((start, index) => {
    const end = source[index + 1]
    const angle = start.angleTo(end)
    const steps = Math.max(8, Math.ceil(angle / 0.045))
    for (let step = 0; step < steps; step += 1) {
      const t = step / steps
      points.push(start.clone().lerp(end, t).normalize().multiplyScalar(radius))
    }
  })
  points.push(source[source.length - 1].clone().multiplyScalar(radius))
  return points
}

function addClimateZones() {
  if (!earthGroup) return
  if (climateGroup) {
    earthGroup.remove(climateGroup)
    disposeObject(climateGroup)
  }
  climateGroup = new Group()
  layersVisible.climate = Boolean(props.climateMode || layersVisible.climate)
  climateGroup.visible = layersVisible.climate && !props.cosmosMode && !props.terrainMode

  props.climateZones.forEach((zone, index) => {
    climateGroup.add(createClimateZonePatch(zone, index))
  })

  earthGroup.add(climateGroup)
  updateClimateZoneStyles()
}

function createClimateZonePatch(zone, index) {
  const group = new Group()
  const surface = latLngToVector3(zone.latitude, zone.longitude, RADIUS * 1.034)
  const normal = surface.clone().normalize()
  group.position.copy(surface)
  group.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal)
  group.userData.climateZone = zone
  group.userData.phase = index * 0.37

  const color = climateColor(zone.type)
  const radius = MathUtils.clamp(zone.map_radius || 0.32, 0.18, 0.66)
  const patch = new Mesh(
    new CircleGeometry(radius, 72),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.18,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  patch.userData.climatePatch = true
  group.add(patch)

  const ring = new Mesh(
    new TorusGeometry(radius * 1.02, 0.006, 8, 96),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.32,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  ring.userData.climateRing = true
  group.add(ring)

  const core = new Mesh(
    new SphereGeometry(0.028, 14, 14),
    new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.78,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  core.userData.climateCore = true
  group.add(core)

  return group
}

function climateColor(type) {
  if (type === 'tropical_rainforest') return 0x0f8f5f
  if (type === 'tropical_monsoon') return 0x16a878
  if (type === 'savanna') return 0x8bbd45
  if (type === 'hot_desert') return 0xe0b545
  if (type === 'cold_desert') return 0xc7b37a
  if (type === 'mediterranean') return 0xd98b44
  if (type === 'humid_subtropical') return 0x53b56d
  if (type === 'temperate_monsoon') return 0x4ea66f
  if (type === 'oceanic') return 0x4aa7c7
  if (type === 'continental') return 0x77a85d
  if (type === 'subarctic') return 0x4f86c6
  if (type === 'polar') return 0xe8f3f7
  if (type === 'highland') return 0x91c4d7
  return 0x82d8ff
}

function addCosmosLayer() {
  if (!earthGroup) return
  if (cosmosGroup) {
    earthGroup.remove(cosmosGroup)
    disposeObject(cosmosGroup)
  }

  cosmosGroup = new Group()
  cosmosGroup.visible = false

  cosmosOverlay = new Mesh(
    new SphereGeometry(RADIUS * 1.019, OVERLAY_SEGMENTS, OVERLAY_SEGMENTS),
    new ShaderMaterial({
      uniforms: {
        sunDirection: { value: new Vector3(1, 0, 0) },
        nightOpacity: { value: 0.56 },
        terminatorOpacity: { value: 0.34 }
      },
      vertexShader: `
        varying vec3 vLocalNormal;
        void main() {
          vLocalNormal = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 sunDirection;
        uniform float nightOpacity;
        uniform float terminatorOpacity;
        varying vec3 vLocalNormal;
        void main() {
          float solar = dot(normalize(vLocalNormal), normalize(sunDirection));
          float night = smoothstep(0.08, -0.22, solar);
          float terminator = 1.0 - smoothstep(0.0, 0.048, abs(solar));
          vec3 nightColor = vec3(0.006, 0.018, 0.05);
          vec3 dawnColor = vec3(0.92, 0.66, 0.34);
          vec3 color = mix(nightColor, dawnColor, terminator * 0.66);
          float alpha = night * nightOpacity + terminator * terminatorOpacity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false
    })
  )
  cosmosGroup.add(cosmosOverlay)

  cosmosGuideGroup = new Group()
  cosmosGuideGroup.add(createLatitudeLine(0, 0xffffff, 0.28, { cosmosGuide: 'equator' }))
  cosmosGuideGroup.add(createLatitudeLine(23.44, 0xf6d58b, 0.28, { cosmosGuide: 'north-tropic' }))
  cosmosGuideGroup.add(createLatitudeLine(-23.44, 0xf6d58b, 0.28, { cosmosGuide: 'south-tropic' }))
  cosmosGuideGroup.add(createLatitudeLine(66.56, 0xa8d8ff, 0.36, { cosmosPolar: 'north' }))
  cosmosGuideGroup.add(createLatitudeLine(-66.56, 0xa8d8ff, 0.36, { cosmosPolar: 'south' }))
  cosmosSubsolarLine = createLatitudeLine(23.44, 0xffd27a, 0.52, { cosmosGuide: 'subsolar' }, RADIUS * 1.066)
  cosmosGuideGroup.add(cosmosSubsolarLine)
  cosmosGroup.add(cosmosGuideGroup)

  cosmosTerminatorLine = new LineLoop(
    new BufferGeometry(),
    new LineBasicMaterial({
      color: 0xffd27a,
      transparent: true,
      opacity: 0.72,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  cosmosGroup.add(cosmosTerminatorLine)

  cosmosSubsolarMarker = new Mesh(
    new SphereGeometry(0.052, 20, 20),
    new MeshBasicMaterial({
      color: 0xffd27a,
      transparent: true,
      opacity: 0.96,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  cosmosGroup.add(cosmosSubsolarMarker)

  cosmosMoonGroup = new Group()
  const moonOrbit = createOrbitLine(COSMOS_MOON_ORBIT_RADIUS)
  cosmosMoonGroup.add(moonOrbit)
  cosmosMoon = new Mesh(
    new SphereGeometry(0.13, 32, 32),
    new MeshStandardMaterial({
      color: 0xd8d5cb,
      roughness: 0.84,
      metalness: 0.02
    })
  )
  const moonHalo = new Sprite(
    new SpriteMaterial({
      color: 0xcfe8ff,
      transparent: true,
      opacity: 0.34,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  moonHalo.scale.set(0.48, 0.48, 0.48)
  cosmosMoon.add(moonHalo)
  cosmosMoonGroup.add(cosmosMoon)
  cosmosMoonLine = new Line(
    new BufferGeometry(),
    new LineBasicMaterial({
      color: 0xcfe8ff,
      transparent: true,
      opacity: 0.28,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  cosmosMoonGroup.add(cosmosMoonLine)
  cosmosGroup.add(cosmosMoonGroup)

  cosmosTideGroup = new Group()
  cosmosTidePatches = [
    createTidePatch('moon', 1),
    createTidePatch('moon', -1),
    createTidePatch('sun', 1),
    createTidePatch('sun', -1)
  ]
  cosmosTidePatches.forEach((patch) => cosmosTideGroup.add(patch.group))
  cosmosGroup.add(cosmosTideGroup)

  earthGroup.add(cosmosGroup)
}

function createLatitudeLine(lat, color, opacity, userData = {}, radius = RADIUS * 1.058) {
  const points = []
  for (let lng = -180; lng <= 180; lng += 3) {
    points.push(latLngToVector3(lat, lng, radius))
  }
  const line = new LineLoop(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  line.userData = { ...userData, latitude: lat }
  return line
}

function createOrbitLine(radius) {
  const points = []
  for (let i = 0; i <= 180; i += 1) {
    const angle = (i / 180) * Math.PI * 2
    points.push(new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
  }
  return new LineLoop(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({
      color: 0xa8d8ff,
      transparent: true,
      opacity: 0.12,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
}

function createTidePatch(role, sign) {
  const group = new Group()
  const patch = new Mesh(
    new CircleGeometry(0.42, 80),
    new MeshBasicMaterial({
      color: role === 'moon' ? 0x7dd3fc : 0xffd27a,
      transparent: true,
      opacity: role === 'moon' ? 0.24 : 0.12,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  patch.scale.set(1.7, 0.72, 1)
  patch.userData.tidePatch = true
  group.add(patch)
  group.userData.tideRole = role
  group.userData.tideSign = sign
  return { group, patch, role, sign }
}

function updateCosmosLayer() {
  if (!cosmosGroup || !earthGroup) return
  cosmosGroup.visible = props.cosmosMode

  if (!props.cosmosMode) {
    if (nightLights?.material) nightLights.material.opacity = 0.34
    if (sunLight) {
      sunLight.position.set(-5.4, 2.7, 6.8)
      sunLight.intensity = 3.25
    }
    if (markerGroup) markerGroup.visible = HOTSPOTS_LAYER_ENABLED && layersVisible.hotspots
    if (terrainGroup) terrainGroup.visible = layersVisible.terrain
    if (climateGroup) climateGroup.visible = layersVisible.climate
    if (controls && !targetCameraPosition) controls.autoRotate = true
    return
  }

  if (controls) controls.autoRotate = false
  if (nightLights?.material) nightLights.material.opacity = 0.5
  if (markerGroup) markerGroup.visible = false
  if (terrainGroup && !props.terrainMode) terrainGroup.visible = false
  if (climateGroup && !props.climateMode) climateGroup.visible = false

  const state = getCosmosState()
  const declination = COSMOS_SEASON_DECLINATIONS[state.season] ?? 23.44
  const subsolarLongitude = getCosmosSubsolarLongitude(state.time)
  const sunDirection = latLngToVector3(declination, subsolarLongitude, 1).normalize()
  const moonDirection = getCosmosMoonDirection(sunDirection, state.moonPhase)
  const tideStrength = state.moonPhase === 'new' || state.moonPhase === 'full' ? 1 : 0.58

  cosmosOverlay.material.uniforms.sunDirection.value.copy(sunDirection)
  updateLineGeometry(cosmosTerminatorLine, getGreatCirclePoints(sunDirection, RADIUS * 1.066, 180))
  updateLineGeometry(cosmosSubsolarLine, getLatitudePoints(declination, RADIUS * 1.068))

  cosmosSubsolarMarker.position.copy(latLngToVector3(declination, subsolarLongitude, RADIUS * 1.092))
  cosmosSubsolarMarker.scale.setScalar(1 + Math.sin(performance.now() * 0.002) * 0.08)

  if (sunLight) {
    sunLight.position.copy(sunDirection.clone().multiplyScalar(7.8))
    sunLight.intensity = 3.45
  }

  updateMoonLayer(moonDirection)
  updateTideLayer(moonDirection, sunDirection, tideStrength)
  updatePolarLineFocus(state.polarFocus)
}

function getCosmosState() {
  return { ...COSMOS_DEFAULT_STATE, ...props.cosmosState }
}

function getCosmosSubsolarLongitude(beijingHour) {
  const hour = Number.isFinite(Number(beijingHour)) ? Number(beijingHour) : 12
  const utcHour = (hour - 8 + 24) % 24
  return normalizeCosmosLongitude((12 - utcHour) * 15)
}

function normalizeCosmosLongitude(lng) {
  return ((((lng + 180) % 360) + 360) % 360) - 180
}

function getCosmosMoonDirection(sunDirection, moonPhase) {
  const angle = MathUtils.degToRad(COSMOS_MOON_OFFSETS[moonPhase] ?? 180)
  return sunDirection.clone().applyAxisAngle(new Vector3(0, 1, 0), angle).normalize()
}

function getLatitudePoints(lat, radius = RADIUS * 1.058) {
  const points = []
  for (let lng = -180; lng <= 180; lng += 3) {
    points.push(latLngToVector3(lat, lng, radius))
  }
  return points
}

function getGreatCirclePoints(normal, radius, segments) {
  const reference = Math.abs(normal.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)
  const u = new Vector3().crossVectors(normal, reference).normalize()
  const v = new Vector3().crossVectors(normal, u).normalize()
  const points = []
  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2
    points.push(u.clone().multiplyScalar(Math.cos(angle) * radius).add(v.clone().multiplyScalar(Math.sin(angle) * radius)))
  }
  return points
}

function updateLineGeometry(line, points) {
  if (!line) return
  line.geometry.dispose()
  line.geometry = new BufferGeometry().setFromPoints(points)
}

function updateMoonLayer(moonDirection) {
  if (!cosmosMoon || !cosmosMoonLine) return
  const moonPosition = moonDirection.clone().multiplyScalar(COSMOS_MOON_ORBIT_RADIUS)
  cosmosMoon.position.copy(moonPosition)
  updateLineGeometry(cosmosMoonLine, [moonDirection.clone().multiplyScalar(RADIUS * 1.16), moonPosition])
}

function updateTideLayer(moonDirection, sunDirection, strength) {
  cosmosTidePatches.forEach(({ group, patch, role, sign }) => {
    const direction = (role === 'moon' ? moonDirection : sunDirection).clone().multiplyScalar(sign).normalize()
    group.position.copy(direction.clone().multiplyScalar(RADIUS * 1.074))
    group.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), direction)
    const roleStrength = role === 'moon' ? strength : strength * 0.54
    patch.scale.set(1.46 + roleStrength * 0.54, 0.58 + roleStrength * 0.2, 1)
    patch.material.opacity = (role === 'moon' ? 0.18 : 0.08) + roleStrength * (role === 'moon' ? 0.18 : 0.08)
    patch.userData.baseOpacity = patch.material.opacity
  })
}

function updatePolarLineFocus(polarFocus) {
  if (!cosmosGuideGroup) return
  cosmosGuideGroup.children.forEach((line) => {
    if (!line.userData.cosmosPolar || !line.material) return
    const active = line.userData.cosmosPolar === polarFocus
    line.material.opacity = active ? 0.78 : 0.32
    line.material.color.set(active ? 0xffffff : 0xa8d8ff)
  })
}

function animateCosmosLayer(time) {
  if (!cosmosGroup?.visible) return
  if (cosmosMoon) {
    cosmosMoon.rotation.y += 0.006
    cosmosMoon.scale.setScalar(1 + Math.sin(time * 1.4) * 0.025)
  }
  if (cosmosTerminatorLine?.material) {
    cosmosTerminatorLine.material.opacity = 0.64 + Math.sin(time * 0.9) * 0.08
  }
  cosmosTidePatches.forEach(({ patch }, index) => {
    if (!patch?.material) return
    patch.material.opacity = (patch.userData.baseOpacity || patch.material.opacity) + Math.sin(time * 1.1 + index) * 0.018
  })
}

function createMarker(place, index) {
  const group = new Group()
  const surface = latLngToVector3(place.lat, place.lng, RADIUS * 1.034)
  const outer = latLngToVector3(place.lat, place.lng, RADIUS * 1.108)
  const normal = surface.clone().normalize()

  group.position.copy(surface)
  group.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal)
  group.userData.place = place
  group.userData.phase = index * 0.74

  const ring = new Mesh(
    new TorusGeometry(0.068, 0.0032, 8, 64),
    new MeshBasicMaterial({
      color: 0x9ee7ff,
      transparent: true,
      opacity: 0.72,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  ring.userData.isPulse = true
  group.add(ring)

  const line = new Line(
    new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), outer.sub(surface)]),
    new LineBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.28,
      blending: AdditiveBlending
    })
  )
  group.add(line)
  return group
}

function updatePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

function setCursor(cursor) {
  if (cursorState === cursor) return
  cursorState = cursor
  renderer.domElement.style.cursor = cursor
}

function setHoverLabel(text, x, y) {
  hoverLabel.text = text
  hoverLabel.x = x + 16
  hoverLabel.y = y + 16
}

function getRouteNodeHit() {
  if (!props.routeMode || !routeNodeGroup?.children?.length) return null
  const hit = raycaster.intersectObjects(routeNodeGroup.children, true)
    .find((item) => findRouteNodeData(item.object))
  return hit ? findRouteNodeData(hit.object) : null
}

function getTerrainHit() {
  if (!terrainGroup?.visible || !terrainGroup.children.length) return null
  const hit = raycaster.intersectObjects(terrainGroup.children, true)
    .find((item) => findTerrainFeature(item.object))
  return hit ? findTerrainFeature(hit.object) : null
}

function getClimateHit() {
  if (!climateGroup?.visible || !climateGroup.children.length) return null
  const hit = raycaster.intersectObjects(climateGroup.children, true)
    .find((item) => findClimateZone(item.object))
  return hit ? findClimateZone(hit.object) : null
}

function getCosmosPolarHit() {
  if (!props.cosmosMode || !cosmosGuideGroup?.children?.length) return null
  const hit = raycaster.intersectObjects(cosmosGuideGroup.children, true)
    .find((item) => findCosmosPolar(item.object))
  return hit ? findCosmosPolar(hit.object) : null
}

function getMarkerHit() {
  if (!markerGroup?.visible || !markerGroup.children.length) return null
  const hit = raycaster.intersectObjects(markerGroup.children, true)
    .find((item) => findMarkerPlace(item.object))
  return hit ? findMarkerPlace(hit.object) : null
}

function findRouteNodeData(object) {
  let current = object
  while (current) {
    if (current.userData?.routeNode) return current.userData.routeNode
    current = current.parent
  }
  return null
}

function findCosmosPolar(object) {
  let current = object
  while (current) {
    if (current.userData?.cosmosPolar) return current.userData.cosmosPolar
    current = current.parent
  }
  return null
}

function cancelCameraAnimation() {
  targetCameraPosition = null
  targetControlPoint = null
  isFocused.value = false
  cameraAnimating.value = false
}

function ensureControlsFree() {
  cancelCameraAnimation()
  if (!controls) return
  controls.enableRotate = true
  controls.enableZoom = true
  clearTimeout(autoRotateTimer)
  autoRotateTimer = setTimeout(() => {
    if (controls && !targetCameraPosition) controls.autoRotate = !props.cosmosMode
  }, 1200)
}

function onPointerDown(event) {
  ensureControlsFree()
  pointerDown = { x: event.clientX, y: event.clientY, time: performance.now(), dragged: false }
}

function onGlobalPointerDown() {
  ensureControlsFree()
}

function onStagePointerDown(event) {
  ensureControlsFree()
  stagePointerDown = { x: event.clientX, y: event.clientY }
}

function onStagePointerMove(event) {
  if (!stagePointerDown) return
  const distance = Math.hypot(event.clientX - stagePointerDown.x, event.clientY - stagePointerDown.y)
  if (distance > CLICK_THRESHOLD) ensureControlsFree()
}

function onPointerUp(event) {
  if (!pointerDown || !earthReady || isLoading.value) return
  const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y)
  const wasDragged = pointerDown.dragged
  pointerDown = null
  stagePointerDown = null
  if (wasDragged || distance > CLICK_THRESHOLD) return
  handleClickSelection(event)
}

function onPointerMove(event) {
  if (!earthReady) return
  latestPointerEvent = { clientX: event.clientX, clientY: event.clientY }
  if (pointerDown) {
    const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y)
    if (distance > CLICK_THRESHOLD) {
      pointerDown.dragged = true
      ensureControlsFree()
    }
  }

  if (pointerMoveFrame) return
  pointerMoveFrame = requestAnimationFrame(() => {
    pointerMoveFrame = null
    if (latestPointerEvent) updateHoverFromPointer(latestPointerEvent)
  })
}

function updateHoverFromPointer(event) {
  updatePointer(event)
  raycaster.setFromCamera(pointer, camera)

  const routeNodeHit = getRouteNodeHit()
  if (routeNodeHit) {
    setHoverLabel(routeNodeHit.node.name, event.clientX, event.clientY)
    setCursor('pointer')
    return
  }

  const cosmosPolarHit = getCosmosPolarHit()
  if (cosmosPolarHit) {
    setHoverLabel(cosmosPolarHit === 'north' ? '北极圈' : '南极圈', event.clientX, event.clientY)
    setCursor('pointer')
    return
  }

  const climateHit = getClimateHit()
  if (climateHit) {
    setHoverLabel(climateHit.name, event.clientX, event.clientY)
    setCursor('pointer')
    return
  }

  const terrainHit = getTerrainHit()
  if (terrainHit) {
    setHoverLabel(terrainHit.name, event.clientX, event.clientY)
    setCursor('pointer')
    return
  }

  const markerHit = getMarkerHit()
  if (markerHit) {
    setHoverLabel(markerHit.name, event.clientX, event.clientY)
    setCursor('pointer')
    return
  }

  const earthHit = raycaster.intersectObject(earth)[0]
  hoverLabel.text = ''

  if (earthHit) {
    const { lat, lng } = vector3ToLatLng(earth.worldToLocal(earthHit.point.clone()).normalize())
    const coordStr = `${formatCoordinate(lat, 'lat')}  ${formatCoordinate(lng, 'lng')}`
    coordinateReadout.value = coordStr
    debugCoords.value = coordStr
    const now = performance.now()
    if (
      geoLayers
      && (
        now - lastGeoHoverAt > 120
        || Math.abs(lat - (lastGeoHoverLat ?? lat)) > 0.18
        || Math.abs(lng - (lastGeoHoverLng ?? lng)) > 0.18
      )
    ) {
      lastGeoHover = findFeatureAt(lat, lng, geoLayers)
      lastGeoHoverAt = now
      lastGeoHoverLat = lat
      lastGeoHoverLng = lng
    }
    setHoverLabel(lastGeoHover?.name || '', event.clientX, event.clientY)
  } else {
    coordinateReadout.value = ''
  }

  setCursor(earthHit ? 'crosshair' : hoverLabel.text ? 'pointer' : 'grab')
}

function onPointerLeave() {
  coordinateReadout.value = ''
  hoverLabel.text = ''
  pointerDown = null
  stagePointerDown = null
  latestPointerEvent = null
  cancelAnimationFrame(pointerMoveFrame)
  pointerMoveFrame = null
}

function handleClickSelection(event) {
  updatePointer(event)
  raycaster.setFromCamera(pointer, camera)

  const routeNodeHit = getRouteNodeHit()
  if (routeNodeHit) {
    emit('route-node-select', routeNodeHit)
    return
  }

  const cosmosPolarHit = getCosmosPolarHit()
  if (cosmosPolarHit) {
    emit('cosmos-polar-select', cosmosPolarHit)
    return
  }

  const climateHit = getClimateHit()
  if (climateHit) {
    emit('climate-select', climateHit)
    return
  }

  const terrainHit = getTerrainHit()
  if (terrainHit) {
    emit('terrain-select', terrainHit)
    return
  }

  const markerHit = getMarkerHit()
  if (markerHit) {
    emit('marker-select', markerHit)
    return
  }

  const hit = raycaster.intersectObject(earth)[0]
  if (hit) {
    const localPoint = earth.worldToLocal(hit.point.clone()).normalize()
    const { lat, lng } = vector3ToLatLng(localPoint)
    const result = geoLayers ? findFeatureAt(lat, lng, geoLayers) : null
    emit('globe-click', { lat, lng, geoFeature: result })
    return
  }
  releaseFocus()
}

function findMarkerPlace(object) {
  let current = object
  while (current) {
    if (current.userData?.place) return current.userData.place
    current = current.parent
  }
  return null
}

function findTerrainFeature(object) {
  let current = object
  while (current) {
    if (current.userData?.terrainFeature) return current.userData.terrainFeature
    current = current.parent
  }
  return null
}

function findClimateZone(object) {
  let current = object
  while (current) {
    if (current.userData?.climateZone) return current.userData.climateZone
    current = current.parent
  }
  return null
}

function updateTerrainMarkerStyles() {
  if (!terrainGroup) return
  const activeId = props.activeTerrainFeature?.id
  terrainGroup.children.forEach((marker) => {
    const active = marker.userData.terrainFeature?.id === activeId
    marker.scale.setScalar(active ? 1.06 : 1)
    marker.children.forEach((child) => {
      if (!child.material) return
      if (child.userData.terrainPatch) child.material.opacity = active ? 0.34 : terrainPatchOpacity(marker.userData.terrainFeature?.type)
      if (child.userData.terrainBorder) child.material.opacity = active ? 0.82 : 0.34
      if (child.userData.terrainHalo) child.material.opacity = active ? 0.28 : 0.1
      if (child.userData.terrainBody) child.material.opacity = active ? 0.82 : 0.44
      if (child.userData.terrainTrace) child.material.opacity = active ? 0.58 : 0.24
      if (child.userData.terrainCone) child.material.opacity = active ? 0.48 : 0.3
    })
  })
}

function updateTerrainModeVisuals() {
  const terrainActive = Boolean(props.terrainMode)
  if (terrainActive) {
    layersVisible.terrain = true
    layersVisible.hotspots = false
    layersVisible.climate = false
  }
  if (terrainReliefOverlay) terrainReliefOverlay.visible = terrainActive
  if (earth?.material?.normalScale) {
    earth.material.normalScale.setScalar(terrainActive ? 0.72 : 0.36)
    earth.material.shininess = terrainActive ? 10 : 16
  }
  if (markerGroup) markerGroup.visible = HOTSPOTS_LAYER_ENABLED && layersVisible.hotspots && !props.cosmosMode && !terrainActive
  if (terrainGroup) terrainGroup.visible = layersVisible.terrain && !props.cosmosMode
  if (climateGroup) climateGroup.visible = layersVisible.climate && !props.cosmosMode && !terrainActive
  updateTectonicsLayer()
}

function updateTectonicsLayer() {
  if (!earthGroup) return
  clearTectonicsLayer()
  const story = props.activeTerrainFeature?.tectonics
  if (!props.terrainMode || !props.terrainTectonicsMode || !story?.plates?.length) return

  tectonicsGroup = new Group()
  story.plates.forEach((plate, index) => {
    tectonicsGroup.add(createTectonicArrow(plate, index))
  })

  const center = latLngToVector3(
    props.activeTerrainFeature.latitude,
    props.activeTerrainFeature.longitude,
    RADIUS * 1.15
  )
  const pulse = new Mesh(
    new SphereGeometry(0.06, 24, 24),
    new MeshBasicMaterial({
      color: 0xffd27a,
      transparent: true,
      opacity: 0.84,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  pulse.position.copy(center)
  pulse.userData.tectonicPulse = true
  tectonicsGroup.add(pulse)
  tectonicsGroup.add(createTextSprite(
    story.title,
    center.clone().normalize().multiplyScalar(RADIUS * 1.24),
    0xfff2c5,
    0.56
  ))
  earthGroup.add(tectonicsGroup)
}

function clearTectonicsLayer() {
  if (!tectonicsGroup) return
  earthGroup?.remove(tectonicsGroup)
  disposeObject(tectonicsGroup)
  tectonicsGroup = null
}

function createTectonicArrow(plate, index) {
  const group = new Group()
  const color = index % 2 === 0 ? 0xffd27a : 0x8fd8ff
  const start = latLngToVector3(plate.from[0], plate.from[1], RADIUS * 1.13)
  const end = latLngToVector3(plate.to[0], plate.to[1], RADIUS * 1.13)
  const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(RADIUS * 1.17)
  const curve = new CatmullRomCurve3([start, mid, end])
  const shaft = new Mesh(
    new TubeGeometry(curve, 64, 0.012, 8, false),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.62,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  shaft.userData.tectonicArrow = true
  group.add(shaft)

  const direction = end.clone().sub(mid).normalize()
  const cone = new Mesh(
    new ConeGeometry(0.05, 0.16, 24),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.82,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  cone.position.copy(end)
  cone.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction)
  cone.userData.tectonicArrow = true
  group.add(cone)

  group.add(createTextSprite(plate.name, mid.clone().normalize().multiplyScalar(RADIUS * 1.2), color, 0.42))
  return group
}

function createTextSprite(text, position, color = 0xffffff, scale = 0.52) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'rgba(2, 6, 10, 0.58)'
  context.strokeStyle = 'rgba(217, 244, 235, 0.22)'
  context.lineWidth = 2
  roundRect(context, 14, 20, 484, 82, 18)
  context.fill()
  context.stroke()
  context.fillStyle = `#${new Color(color).getHexString()}`
  context.font = '600 34px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, 256, 62, 448)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  const sprite = new Sprite(new SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  }))
  sprite.position.copy(position)
  sprite.scale.set(scale, scale * 0.25, 1)
  sprite.userData.tectonicLabel = true
  return sprite
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

function updateClimateZoneStyles() {
  if (!climateGroup) return
  const activeId = props.activeClimateZone?.id
  climateGroup.children.forEach((zoneGroup) => {
    const active = zoneGroup.userData.climateZone?.id === activeId
    zoneGroup.scale.setScalar(active ? 1.14 : 1)
    zoneGroup.children.forEach((child) => {
      if (!child.material) return
      if (child.userData.climatePatch) child.material.opacity = active ? 0.32 : 0.16
      if (child.userData.climateRing) child.material.opacity = active ? 0.68 : 0.28
      if (child.userData.climateCore) child.material.opacity = active ? 1 : 0.58
    })
  })
}

function findFeatureInAllLayers(featureId, layers) {
  for (const layer of ['countries', 'oceans', 'continents']) {
    const feature = layers[layer]?.features.find(
      (f) => f.id === featureId || f.properties?.name === featureId
    )
    if (feature) return { feature, layer }
  }
  return null
}

function highlightFeatureIds(featureIds, primaryId) {
  if (!geoLayers) return

  // 移除旧高亮到 fading 队列
  if (activeBoundary) {
    if (activeBoundary.userData.material) {
      fadingBoundaries.push({ group: activeBoundary, opacity: 1 })
    } else {
      earthGroup.remove(activeBoundary)
    }
    activeBoundary = null
  }

  activeBoundary = new Group()
  const materials = []

  featureIds.forEach((fid) => {
    const entry = findFeatureInAllLayers(fid, geoLayers)
    if (!entry) return
    const isPrimary = fid === primaryId
    const opacity = isPrimary ? 1.0 : 0.4
    const layer = entry.layer
    const color = layer === 'oceans' ? 0x80eaff
      : layer === 'continents' ? 0xf0d88a
      : 0xffffff

    const material = new LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: AdditiveBlending,
      depthWrite: false
    })
    materials.push(material)
    buildFeatureLines(entry.feature, material, RADIUS * 1.04).forEach((line) => {
      activeBoundary.add(line)
    })
  })

  // 存储第一个 material 供 fading 系统使用
  if (materials.length > 0) {
    activeBoundary.userData.material = materials[0]
  }

  earthGroup.add(activeBoundary)
}

function getGeometryForFeatureIds(featureIds, layers) {
  const geometries = []
  featureIds.forEach((id) => {
    for (const layer of ['countries', 'oceans', 'continents']) {
      const feature = layers[layer]?.features.find(
        (f) => f.id === id || f.properties?.name === id
      )
      if (feature) {
        geometries.push({ feature, layer })
        break
      }
    }
  })
  return geometries
}

function setActiveFeatureFromSelected(feature) {
  if (!feature?.highlightFeatureIds?.length) return
  highlightFeatureIds(feature.highlightFeatureIds, feature.geoFeatureId)
}

function toggleLayer(layer) {
  if (layer === 'hotspots' && !HOTSPOTS_LAYER_ENABLED) return
  if (props.terrainMode && (layer === 'hotspots' || layer === 'climate')) return
  layersVisible[layer] = !layersVisible[layer]
  if (layer === 'hotspots') {
    updateTerrainModeVisuals()
    return
  }
  if (layer === 'terrain') {
    updateTerrainModeVisuals()
    return
  }
  if (layer === 'climate') {
    updateTerrainModeVisuals()
    return
  }
  if (boundaryGroups[layer]) boundaryGroups[layer].visible = layersVisible[layer]
}

function orientToLatLng(lat, lng) {
  if (!camera || !controls) return
  const distance = camera.position.length()
  const dir = latLngToVector3(lat, lng, 1).normalize()
  targetCameraPosition = dir.multiplyScalar(distance)
  targetCameraPosition.y += 0.18
  targetControlPoint = new Vector3(0, 0, 0)
  cameraAnimating.value = true
  controls.autoRotate = false
}

function focusToLatLng(lat, lng) {
  const target = latLngToVector3(lat, lng, 1).normalize()
  clearTimeout(autoRotateTimer)
  targetCameraPosition = target.clone().multiplyScalar(3.95)
  targetCameraPosition.y += 0.36
  targetControlPoint = target.clone().multiplyScalar(0.35)
  isFocused.value = true
  cameraAnimating.value = true
  controls.autoRotate = false
}

function releaseFocus() {
  ensureControlsFree()
}

function updateBoundaryVisibility() {
  const distance = camera.position.length()
  const near = MathUtils.clamp((6.8 - distance) / 3.2, 0, 1)
  boundaryMaterials.countries.opacity = layersVisible.countries ? 0.08 + near * 0.32 : 0
  boundaryMaterials.continents.opacity = layersVisible.continents ? 0.12 + near * 0.20 : 0
  boundaryMaterials.oceans.opacity = layersVisible.oceans ? 0.10 + near * 0.18 : 0
  if (markerGroup) markerGroup.scale.setScalar(MathUtils.lerp(1.18, 0.78, near))
}

function animateRouteLayer(time) {
  if (!routeGroup?.visible) return

  routeLineMaterials.forEach((material, index) => {
    material.opacity = 0.34 + Math.sin(time * 1.8 + index * 0.7) * 0.08
  })

  routeNodeGroup?.children.forEach((marker, index) => {
    const active = index === props.activeRouteNodeIndex
    const pulse = 1 + Math.sin(time * 2.6 + marker.userData.phase) * (active ? 0.11 : 0.06)
    marker.children.forEach((child) => {
      if (child.userData.routeHalo || child.userData.routeOuter) {
        child.scale.setScalar(pulse)
      }
    })
  })

  routePulseGroup?.children.forEach((pulse) => {
    const points = pulse.userData.arcPoints
    if (!points?.length) return
    const t = (time * 0.18 + pulse.userData.phase) % 1
    const rawIndex = t * (points.length - 1)
    const index = Math.floor(rawIndex)
    const nextIndex = Math.min(points.length - 1, index + 1)
    const localT = rawIndex - index
    pulse.position.copy(points[index]).lerp(points[nextIndex], localT)
    pulse.material.opacity = 0.45 + Math.sin(t * Math.PI) * 0.48
  })
}

function animate() {
  animationId = requestAnimationFrame(animate)
  if (document.hidden) return

  const time = performance.now() * 0.001

  if (earthGroup && controls.autoRotate) earthGroup.rotation.y += 0.00016
  if (nightLights) nightLights.rotation.y += 0.00002
  if (clouds) clouds.rotation.y += 0.00042
  if (atmosphere) {
    atmosphere.rotation.y += 0.00008
    atmosphere.scale.setScalar(1 + Math.sin(time * 0.6) * 0.008)
  }
  if (markerGroup) {
    markerGroup.children.forEach((marker) => {
      const pulse = 1 + Math.sin(time * 2.1 + marker.userData.phase) * 0.16
      marker.children.forEach((child) => {
        if (child.userData.isPulse) {
          child.scale.setScalar(pulse)
          child.material.opacity = 0.34 + Math.max(0, Math.sin(time * 2.1 + marker.userData.phase)) * 0.38
        }
      })
    })
  }
  if (terrainGroup?.visible) {
    terrainGroup.children.forEach((marker) => {
      const pulse = 1 + Math.sin(time * 2.2 + marker.userData.phase) * 0.1
      marker.children.forEach((child) => {
        if (child.userData.terrainRing) {
          child.scale.setScalar(pulse)
        }
      })
    })
  }
  if (climateGroup?.visible) {
    climateGroup.children.forEach((zoneGroup) => {
      const pulse = 1 + Math.sin(time * 1.15 + zoneGroup.userData.phase) * 0.035
      zoneGroup.children.forEach((child) => {
        if (child.userData.climatePatch || child.userData.climateRing) {
          child.scale.setScalar(pulse)
        }
        if (child.userData.climateRing) {
          child.rotation.z += 0.002
        }
      })
    })
  }
  if (tectonicsGroup?.visible) {
    tectonicsGroup.children.forEach((child, index) => {
      if (child.userData.tectonicPulse) {
        child.scale.setScalar(1 + Math.sin(time * 2.2) * 0.22)
        child.material.opacity = 0.54 + Math.sin(time * 2.2) * 0.22
      }
      child.children?.forEach((part) => {
        if (part.userData.tectonicArrow && part.material) {
          part.material.opacity = 0.52 + Math.sin(time * 1.4 + index) * 0.12
        }
      })
    })
  }

  animateRouteLayer(time)
  animateCosmosLayer(time)

  fadingBoundaries = fadingBoundaries.filter((item) => {
    item.opacity -= 0.035
    const mat = item.group.userData.material
    if (!mat) {
      earthGroup.remove(item.group)
      return false
    }
    mat.opacity = Math.max(0, item.opacity)
    if (item.opacity <= 0) {
      earthGroup.remove(item.group)
      mat.dispose()
      return false
    }
    return true
  })

  if (targetCameraPosition) {
    camera.position.lerp(targetCameraPosition, 0.035)
    controls.target.lerp(targetControlPoint, 0.04)
    if (camera.position.distanceTo(targetCameraPosition) < 0.035) {
      ensureControlsFree()
    }
  }

  if (boundaryMaterials.countries) updateBoundaryVisibility()
  controls.update()
  renderer.render(scene, camera)
}

function resize() {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(resizeRenderer)
}

function resizeRenderer() {
  if (!stageRef.value || !renderer || !camera) return
  const { width, height } = stageRef.value.getBoundingClientRect()
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function onVisibilityChange() {
  if (!document.hidden) resize()
}
</script>
