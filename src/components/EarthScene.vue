<template>
  <div ref="stageRef" class="earth-stage">
    <div class="space-backdrop" aria-hidden="true">
      <span class="space-bg-image"></span>
      <span class="space-bg-stars"></span>
      <span class="space-bg-glow"></span>
    </div>
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

    <div class="layer-switcher earth-control-deck glass-card">
      <button :class="{ active: layersVisible.countries }" @click="toggleLayer('countries')">国家边界</button>
      <button :class="{ active: layersVisible.continents }" @click="toggleLayer('continents')">大洲轮廓</button>
      <button :class="{ active: layersVisible.oceans }" @click="toggleLayer('oceans')">大洋区域</button>
      <button class="graticule-switch" :class="{ active: layersVisible.graticule }" @click="toggleLayer('graticule')">经纬网</button>
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
  NormalBlending,
  Path,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  Shape,
  ShapeGeometry,
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
import { civilizationStyleForCountry } from '../data/civilizationLayers'
import { latLngToVector3, vector3ToLatLng } from '../utils/earthMath'
import { formatCoordinate, normalizeLng } from '../utils/geo'
import { featureRings, findFeatureAt, getFeatureId, loadGeoLayers } from '../utils/geoLookup'

const props = defineProps({
  places: { type: Array, default: () => [] },
  activeFeature: { type: Object, default: null },
  focusPlace: { type: Object, default: null },
  focusCommand: { type: Object, default: null },
  freeFocusToken: { type: Number, default: 0 },
  resetViewToken: { type: Number, default: 0 },
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
  civilizationMode: { type: Boolean, default: false },
  civilizationLayer: { type: String, default: 'routes' },
  civilizationMetrics: { type: Object, default: () => ({}) },
  cosmosMode: { type: Boolean, default: false },
  cosmosState: { type: Object, default: () => ({}) },
  oceanMode: { type: Boolean, default: false },
  oceanFeatures: { type: Array, default: () => [] },
  oceanLayer: { type: String, default: 'depth' },
  oceanOverlays: { type: Object, default: () => ({}) },
  activeOceanFeature: { type: Object, default: null },
  seasonalMode: { type: Boolean, default: false },
  seasonalState: { type: Object, default: null },
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
const CIVILIZATION_SURFACE_LAYERS = new Set(['population', 'language', 'skin-tone'])
const layersVisible = reactive({
  countries: false,
  continents: false,
  oceans: false,
  graticule: false,
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
let civilizationGroup
let graticuleGroup
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
let seasonalGroup
let dynamicGroup
let routeNodeGroup
let routeArcGroup
let routePulseGroup
let routeLineMaterials = []
let civilizationPatches = []
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
const CAMERA_HOME = new Vector3(-0.46, 0.72, 9.2)
const DEFAULT_EARTH_EMISSIVE_INTENSITY = 0.62
const COSMOS_EARTH_EMISSIVE_INTENSITY = 0.05
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

const GRATICULE_LINES = [
  { lat: 66.5, label: '北极圈', detail: '66.5°N', color: 0xbfeeff },
  { lat: 23.5, label: '北回归线', detail: '23.5°N', color: 0xf8dc8f },
  { lat: 0, label: '赤道', detail: '0°', color: 0xffffff },
  { lat: -23.5, label: '南回归线', detail: '23.5°S', color: 0xf8dc8f },
  { lat: -66.5, label: '南极圈', detail: '66.5°S', color: 0xbfeeff }
]

onMounted(async () => {
  initScene()
  geoLayers = await loadGeoLayers()
  addBoundaryLayers()
  addGraticuleLayer()
  addCivilizationLayer()
  addMarkers()
  addTerrainMarkers()
  addClimateZones()
  addCosmosLayer()
  addDynamicLayer()
  addOceanLayer()
  addSeasonalLayer()
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
  if (civilizationGroup) disposeObject(civilizationGroup)
  if (graticuleGroup) disposeObject(graticuleGroup)
  if (terrainGroup) disposeObject(terrainGroup)
  if (terrainReliefOverlay) disposeObject(terrainReliefOverlay)
  if (tectonicsGroup) disposeObject(tectonicsGroup)
  if (climateGroup) disposeObject(climateGroup)
  if (cosmosGroup) disposeObject(cosmosGroup)
  if (dynamicGroup) disposeObject(dynamicGroup)
  if (oceanGroup) disposeObject(oceanGroup)
  if (seasonalGroup) disposeObject(seasonalGroup)
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
  () => props.resetViewToken,
  () => resetCameraHome()
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
  () => {
    updateTerrainMarkerStyles()
    updateTectonicsLayer()
  }
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
  () => [props.civilizationMode, props.civilizationLayer, props.civilizationMetrics],
  () => updateCivilizationLayer(),
  { deep: true }
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

watch(
  () => [
    props.earthDynamicMode,
    props.dynamicLayer,
    props.earthquakeEvents,
    props.volcanoFeatures,
    props.plateFeatures,
    props.activeDynamicFeature
  ],
  () => {
    updateDynamicLayer()
    updateTerrainModeVisuals()
  },
  { deep: true }
)

watch(
  () => [
    props.oceanMode,
    props.oceanLayer,
    props.oceanFeatures,
    props.oceanOverlays,
    props.activeOceanFeature
  ],
  () => {
    updateOceanLayer()
    updateTerrainModeVisuals()
  },
  { deep: true }
)

watch(
  () => [props.seasonalMode, props.seasonalState],
  () => {
    updateSeasonalLayer()
    updateTerrainModeVisuals()
  },
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
  controls.maxDistance = 10.8
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
      emissive: new Color(0xffffff),
      emissiveMap: dayMap,
      emissiveIntensity: DEFAULT_EARTH_EMISSIVE_INTENSITY,
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
  nightLights.visible = false
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

function addGraticuleLayer() {
  if (!earthGroup) return
  if (graticuleGroup) {
    earthGroup.remove(graticuleGroup)
    disposeObject(graticuleGroup)
  }

  graticuleGroup = createGraticuleGroup()
  earthGroup.add(graticuleGroup)
}

function createGraticuleGroup() {
  const group = new Group()
  group.visible = layersVisible.graticule
  group.userData.graticuleLayer = true

  buildGraticuleLines(group)
  return group
}

function buildGraticuleLines(group) {
  group.userData.graticuleLayer = true

  for (let lat = -60; lat <= 60; lat += 30) {
    if (GRATICULE_LINES.some((line) => Math.abs(line.lat - lat) < 0.1)) continue
    const latitudeLine = createLatitudeLine(lat, 0xb7e8ff, 0.12, { graticuleLine: true }, RADIUS * 1.067)
    group.add(latitudeLine)
  }

  for (let lng = -150; lng <= 180; lng += 30) {
    const important = lng === 0 || Math.abs(lng) === 180
    group.add(createLongitudeLine(lng, important ? 0xffffff : 0x9edbff, important ? 0.22 : 0.1))
  }

  GRATICULE_LINES.forEach((line) => {
    group.add(createLatitudeLine(line.lat, line.color, line.lat === 0 ? 0.42 : 0.28, { graticuleLine: true, major: true }, RADIUS * 1.071))
    group.add(createGraticuleLabelSprite(
      line.label,
      line.detail,
      latLngToVector3(line.lat, -128, RADIUS * 1.18),
      line.color
    ))
  })

  group.add(createGraticuleLabelSprite('本初子午线', '0°', latLngToVector3(4, 0, RADIUS * 1.18), 0xffffff))
  group.add(createGraticuleLabelSprite('180°经线', '日期变更线附近', latLngToVector3(-8, 180, RADIUS * 1.18), 0xbfeeff))
}

function createLongitudeLine(lng, color = 0x9edbff, opacity = 0.12, radius = RADIUS * 1.068) {
  const points = []
  for (let lat = -88; lat <= 88; lat += 3) {
    points.push(latLngToVector3(lat, lng, radius))
  }
  const line = new Line(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  line.userData = { graticuleLine: true, longitude: lng }
  return line
}

function createGraticuleLabelSprite(label, detail, position, color = 0xffffff) {
  const canvas = document.createElement('canvas')
  canvas.width = 448
  canvas.height = 128
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'rgba(9, 25, 38, 0.48)'
  context.strokeStyle = 'rgba(211, 238, 255, 0.26)'
  context.lineWidth = 2
  roundRect(context, 16, 22, 416, 78, 18)
  context.fill()
  context.stroke()
  context.fillStyle = `#${new Color(color).getHexString()}`
  context.font = '700 30px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(label, 224, 52, 360)
  context.fillStyle = 'rgba(231, 244, 255, 0.72)'
  context.font = '600 18px sans-serif'
  context.fillText(detail, 224, 82, 360)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  const sprite = new Sprite(new SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  }))
  sprite.position.copy(position)
  sprite.scale.set(0.72, 0.205, 1)
  sprite.userData.graticuleLabel = true
  return sprite
}

function addCivilizationLayer() {
  if (!earthGroup || !geoLayers?.countries?.features) return
  if (civilizationGroup) {
    earthGroup.remove(civilizationGroup)
    disposeObject(civilizationGroup)
  }

  civilizationGroup = new Group()
  civilizationGroup.visible = false
  civilizationPatches = []

  geoLayers.countries.features.forEach((feature) => {
    createCivilizationCountryPatches(feature).forEach((patch) => {
      civilizationPatches.push(patch)
      civilizationGroup.add(patch)
    })
  })

  earthGroup.add(civilizationGroup)
  updateCivilizationLayer()
}

function createCivilizationCountryPatches(feature) {
  const countryId = getFeatureId(feature)
  const polygons = feature.geometry?.type === 'MultiPolygon'
    ? feature.geometry.coordinates
    : feature.geometry?.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : []

  return polygons
    .map((polygon, index) => createCivilizationPolygonPatch(polygon, feature, countryId, index))
    .filter(Boolean)
}

function createCivilizationPolygonPatch(polygon, feature, countryId, index) {
  const outerRing = unwrapRing(polygon?.[0] || [])
  if (outerRing.length < 4 || ringArea(outerRing) < 0.02) return null

  const shape = makeShapePath(outerRing, Shape)
  polygon.slice(1).forEach((holeRing) => {
    const hole = unwrapRing(holeRing)
    if (hole.length >= 4) shape.holes.push(makeShapePath(hole, Path))
  })

  const geometry = new ShapeGeometry(shape, 1)
  const position = geometry.getAttribute('position')
  for (let i = 0; i < position.count; i += 1) {
    const lng = normalizeLng(position.getX(i))
    const lat = position.getY(i)
    const point = latLngToVector3(lat, lng, RADIUS * 1.029)
    position.setXYZ(i, point.x, point.y, point.z)
  }
  position.needsUpdate = true
  geometry.computeBoundingSphere()
  geometry.computeVertexNormals()

  const material = new MeshBasicMaterial({
    color: 0x82d8ff,
    transparent: false,
    opacity: 1,
    side: DoubleSide,
    depthWrite: false,
    blending: NormalBlending,
    toneMapped: false
  })

  const mesh = new Mesh(geometry, material)
  mesh.visible = false
  mesh.renderOrder = 2
  mesh.userData.civilizationCountry = countryId
  mesh.userData.countryFeature = feature
  mesh.userData.polygonIndex = index
  return mesh
}

function makeShapePath(ring, PathType) {
  const path = new PathType()
  ring.forEach(([lng, lat], index) => {
    if (index === 0) path.moveTo(lng, lat)
    else path.lineTo(lng, lat)
  })
  path.closePath()
  return path
}

function unwrapRing(ring) {
  const cleaned = ring
    .filter((coord) => Number.isFinite(coord?.[0]) && Number.isFinite(coord?.[1]))
    .map(([lng, lat]) => [Number(lng), Number(lat)])

  if (!cleaned.length) return []
  const output = []
  let offset = 0
  let previous = cleaned[0][0]

  cleaned.forEach(([rawLng, lat]) => {
    let lng = rawLng + offset
    while (lng - previous > 180) {
      offset -= 360
      lng -= 360
    }
    while (lng - previous < -180) {
      offset += 360
      lng += 360
    }
    output.push([lng, lat])
    previous = lng
  })

  return output
}

function ringArea(ring) {
  let area = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    area += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1])
  }
  return Math.abs(area)
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

function clearGroup(group) {
  if (!group) return
  while (group.children.length) {
    const child = group.children[0]
    group.remove(child)
    disposeObject(child)
  }
}

function clearRouteLayer() {
  if (!routeGroup) return
  clearGroup(routeGroup)
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

  const outline = terrainPatchOutline(feature, radius, aspect)
  const patch = new Mesh(
    new ShapeGeometry(new Shape(outline)),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: terrainPatchOpacity(feature.type),
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  patch.userData.terrainPatch = true
  group.add(patch)

  const borderPoints = outline.map((point) => new Vector3(point.x, point.y, 0.006))
  const border = new LineLoop(
    new BufferGeometry().setFromPoints(borderPoints),
    new LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.34,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  border.userData.terrainBorder = true
  group.add(border)
  group.add(createTerrainPatchTexture(feature, radius, aspect, color))

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

function terrainPatchOutline(feature, radius, aspect = [1, 1]) {
  const seed = terrainPatchSeed(feature.id || feature.name_en || feature.name || feature.type)
  const points = []
  const segments = 72
  const roughness = terrainPatchRoughness(feature.type)
  const xScale = Math.max(0.34, aspect[0] || 1)
  const yScale = Math.max(0.34, aspect[1] || 1)
  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2
    const wave =
      Math.sin(angle * 2 + seed * 5.1) * 0.035 +
      Math.sin(angle * 3.7 + seed * 8.6) * 0.045 +
      Math.cos(angle * 6.2 - seed * 3.4) * 0.026
    const localRadius = radius * (1 + wave * roughness)
    points.push(new Vector2(
      Math.cos(angle) * localRadius * xScale,
      Math.sin(angle) * localRadius * yScale
    ))
  }
  return points
}

function terrainPatchSeed(value) {
  let hash = 2166136261
  String(value || 'terrain').split('').forEach((char) => {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  })
  return (hash >>> 0) / 4294967295
}

function terrainPatchRoughness(type) {
  if (type === 'lake' || type === 'glacier') return 0.9
  if (type === 'desert' || type === 'rainforest') return 1.35
  if (type === 'plateau' || type === 'plain') return 0.7
  return 1.05
}

function createTerrainPatchTexture(feature, radius, aspect, color) {
  const textureGroup = new Group()
  textureGroup.userData.terrainTextureGroup = true
  const type = feature.type
  const xScale = Math.max(0.34, aspect[0] || 1)
  const yScale = Math.max(0.34, aspect[1] || 1)
  const strokeColor = type === 'lake' || type === 'glacier' ? 0xffffff : color
  const strokeOpacity = type === 'desert' ? 0.24 : type === 'lake' ? 0.2 : 0.16
  const strokeCount = type === 'lake' ? 4 : type === 'glacier' ? 7 : type === 'desert' ? 8 : 6

  for (let row = 0; row < strokeCount; row += 1) {
    const offset = ((row + 1) / (strokeCount + 1) - 0.5) * radius * yScale * 1.55
    const points = []
    const steps = 40
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps
      const x = (t - 0.5) * radius * xScale * 1.72
      const curve = Math.sin(t * Math.PI * 2 + row * 0.74) * radius * 0.035
      const y = offset + curve
      const normalized = (x / (radius * xScale)) ** 2 + (y / (radius * yScale)) ** 2
      if (normalized <= 0.92) points.push(new Vector3(x, y, 0.012 + row * 0.0005))
    }
    if (points.length < 2) continue
    const line = new Line(
      new BufferGeometry().setFromPoints(points),
      new LineBasicMaterial({
        color: strokeColor,
        transparent: true,
        opacity: strokeOpacity,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    line.userData.terrainTrace = true
    textureGroup.add(line)
  }

  if (type === 'glacier' || type === 'plateau' || type === 'plain') {
    for (let index = 0; index < 5; index += 1) {
      const angle = index * 0.72 + 0.35
      const length = radius * (0.55 + index * 0.05)
      const center = new Vector3(
        Math.cos(angle) * radius * xScale * 0.24,
        Math.sin(angle) * radius * yScale * 0.2,
        0.018
      )
      const direction = new Vector3(Math.cos(angle + 1.4), Math.sin(angle + 1.4), 0)
      const points = [
        center.clone().add(direction.clone().multiplyScalar(-length * 0.5)),
        center.clone().add(direction.clone().multiplyScalar(length * 0.5))
      ]
      const crease = new Line(
        new BufferGeometry().setFromPoints(points),
        new LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: type === 'glacier' ? 0.22 : 0.12,
          blending: AdditiveBlending,
          depthWrite: false
        })
      )
      crease.userData.terrainTrace = true
      textureGroup.add(crease)
    }
  }

  return textureGroup
}

function terrainColor(type) {
  if (type === 'river' || type === 'lake' || type === 'reef') return 0x82d8ff
  if (type === 'trench') return 0x3f8dd4
  if (type === 'ridge') return 0x9ad4ff
  if (type === 'island_chain') return 0x8cc7a6
  if (type === 'fault') return 0xff8cc6
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

  const zonesByType = new Map()
  props.climateZones.forEach((zone, index) => {
    if (!zonesByType.has(zone.type)) zonesByType.set(zone.type, [])
    zonesByType.get(zone.type).push(zone)
  })

  Array.from(zonesByType.values()).forEach((zones, index) => {
    climateGroup.add(createClimateDistributionVisual(zones[0], zones, index))
  })

  props.climateZones.forEach((zone, index) => {
    climateGroup.add(createClimateZoneAnchor(zone, index))
  })

  earthGroup.add(climateGroup)
  updateClimateZoneStyles()
}

function createClimateDistributionVisual(zone, zones, index) {
  const group = new Group()
  group.userData.climateZone = zone
  group.userData.climateType = zone.type
  group.userData.phase = index * 0.31

  const color = climateColor(zone.type)
  const pattern = zone.distribution_pattern || {}

  ;(pattern.bands || []).forEach((band, bandIndex) => {
    group.add(createClimateLatitudeBandPatch(band, color, bandIndex))
    createClimateLatitudeBandEdges(band, color).forEach((edge) => group.add(edge))
  })

  ;(pattern.areas || []).forEach((area, areaIndex) => {
    const patch = createClimateAreaPatch(area, color, areaIndex)
    group.add(patch)
    group.add(createClimateAreaEdge(area, color))
  })

  ;(pattern.lines || []).forEach((line, lineIndex) => {
    createClimateDistributionLine(line, color, lineIndex).forEach((part) => group.add(part))
  })

  const activeAnchors = zones.slice(0, 4).map((item) => latLngToVector3(item.latitude, item.longitude, RADIUS * 1.064))
  if (activeAnchors.length >= 2) {
    const trace = new Line(
      new BufferGeometry().setFromPoints(activeAnchors),
      new LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.13,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    trace.userData.climateDistributionTrace = true
    group.add(trace)
  }

  return group
}

function createClimateLatitudeBandPatch(band, color, index) {
  const [latMin, latMax] = band.lat
  const [lngMin, lngMax] = band.lng || [-180, 180]
  const segments = Math.max(48, Math.ceil(Math.abs(lngMax - lngMin) / 4))
  const vertices = []
  for (let step = 0; step <= segments; step += 1) {
    const lng = MathUtils.lerp(lngMin, lngMax, step / segments)
    const lower = latLngToVector3(latMin, lng, RADIUS * 1.039)
    const upper = latLngToVector3(latMax, lng, RADIUS * 1.039)
    vertices.push(lower.x, lower.y, lower.z, upper.x, upper.y, upper.z)
  }
  const indices = []
  for (let step = 0; step < segments; step += 1) {
    const base = step * 2
    indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  const patch = new Mesh(
    geometry,
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.2,
      blending: NormalBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  patch.userData.climateLatitudeBand = true
  patch.userData.phase = index * 0.21
  return patch
}

function createClimateLatitudeBandEdges(band, color) {
  const [latMin, latMax] = band.lat
  const [lngMin, lngMax] = band.lng || [-180, 180]
  return [
    createClimateLatitudeLine(latMin, lngMin, lngMax, color),
    createClimateLatitudeLine(latMax, lngMin, lngMax, color)
  ]
}

function createClimateLatitudeLine(lat, lngMin, lngMax, color) {
  const segments = Math.max(72, Math.ceil(Math.abs(lngMax - lngMin) / 3))
  const points = []
  for (let step = 0; step <= segments; step += 1) {
    points.push(latLngToVector3(lat, MathUtils.lerp(lngMin, lngMax, step / segments), RADIUS * 1.064))
  }
  const line = new Line(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.48,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  line.userData.climateLatitudeEdge = true
  return line
}

function createClimateAreaPatch(area, color, index) {
  const boundary = climateAreaBoundary(area, RADIUS * 1.042)
  const center = climateAreaCenter(area, RADIUS * 1.041)
  const vertices = [center.x, center.y, center.z]
  boundary.forEach((point) => vertices.push(point.x, point.y, point.z))
  const indices = []
  for (let i = 1; i <= boundary.length; i += 1) {
    indices.push(0, i, i === boundary.length ? 1 : i + 1)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()
  const patch = new Mesh(
    geometry,
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.13,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  patch.userData.climateDistributionPatch = true
  patch.userData.phase = index * 0.19
  return patch
}

function createClimateAreaEdge(area, color) {
  const edge = new LineLoop(
    new BufferGeometry().setFromPoints(climateAreaBoundary(area, RADIUS * 1.052)),
    new LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.28,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  edge.userData.climateDistributionEdge = true
  return edge
}

function createClimateDistributionLine(line, color, index) {
  const path = terrainSurfacePath(line.path || [], RADIUS * 1.058)
  if (path.length < 2) return []
  const curve = new CatmullRomCurve3(path)
  const width = line.width || 0.018
  const glow = new Mesh(
    new TubeGeometry(curve, Math.max(40, path.length * 12), width * 2.3, 8, false),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.13,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  glow.userData.climateDistributionLine = true
  glow.userData.phase = index * 0.23

  const core = new Mesh(
    new TubeGeometry(curve, Math.max(48, path.length * 14), width * 0.72, 8, false),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.48,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  core.userData.climateDistributionLine = true

  const trace = new Line(
    new BufferGeometry().setFromPoints(path.map((point) => point.clone().normalize().multiplyScalar(RADIUS * 1.078))),
    new LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  trace.userData.climateDistributionTrace = true

  return [glow, core, trace]
}

function climateAreaBoundary(area, radius) {
  const [latMin, latMax] = area.lat
  const [lngMin, lngMax] = area.lng
  const points = []
  const latSteps = Math.max(3, Math.ceil(Math.abs(latMax - latMin) / 4))
  const lngSteps = Math.max(4, Math.ceil(Math.abs(lngMax - lngMin) / 5))
  for (let step = 0; step <= lngSteps; step += 1) {
    const t = step / lngSteps
    points.push(latLngToVector3(latMin, MathUtils.lerp(lngMin, lngMax, t), radius))
  }
  for (let step = 1; step <= latSteps; step += 1) {
    const t = step / latSteps
    points.push(latLngToVector3(MathUtils.lerp(latMin, latMax, t), lngMax, radius))
  }
  for (let step = 1; step <= lngSteps; step += 1) {
    const t = step / lngSteps
    points.push(latLngToVector3(latMax, MathUtils.lerp(lngMax, lngMin, t), radius))
  }
  for (let step = 1; step < latSteps; step += 1) {
    const t = step / latSteps
    points.push(latLngToVector3(MathUtils.lerp(latMax, latMin, t), lngMin, radius))
  }
  return points
}

function climateAreaCenter(area, radius) {
  return latLngToVector3(
    (area.lat[0] + area.lat[1]) / 2,
    (area.lng[0] + area.lng[1]) / 2,
    radius
  )
}

function createClimateZoneAnchor(zone, index) {
  const group = new Group()
  const surface = latLngToVector3(zone.latitude, zone.longitude, RADIUS * 1.072)
  const normal = surface.clone().normalize()
  group.position.copy(surface)
  group.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal)
  group.userData.climateZone = zone
  group.userData.climateType = zone.type
  group.userData.phase = index * 0.37

  const color = climateColor(zone.type)
  const ring = new Mesh(
    new TorusGeometry(0.056, 0.0045, 8, 56),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.42,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  ring.userData.climateAnchorRing = true
  group.add(ring)

  const core = new Mesh(
    new SphereGeometry(0.024, 14, 14),
    new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.82,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  core.userData.climateAnchorCore = true
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
    const civilizationActive = civilizationSurfaceActive()
    const exclusiveModeActive = Boolean(props.earthDynamicMode || props.oceanMode || props.seasonalMode)
    if (earth?.material) earth.material.emissiveIntensity = DEFAULT_EARTH_EMISSIVE_INTENSITY
    if (nightLights) nightLights.visible = props.cosmosMode
    if (nightLights?.material) nightLights.material.opacity = 0
    if (sunLight) {
      sunLight.position.set(-1.4, 3.6, 7.4)
      sunLight.intensity = 2.15
    }
    if (markerGroup) markerGroup.visible = HOTSPOTS_LAYER_ENABLED && layersVisible.hotspots && !civilizationActive && !exclusiveModeActive
    if (terrainGroup) terrainGroup.visible = layersVisible.terrain && !civilizationActive && !exclusiveModeActive
    if (climateGroup) climateGroup.visible = layersVisible.climate && !civilizationActive && !exclusiveModeActive
    if (civilizationGroup) civilizationGroup.visible = civilizationActive
    updateCivilizationBaseOverlays(civilizationActive)
    if (controls && !targetCameraPosition) controls.autoRotate = true
    return
  }

  if (controls) controls.autoRotate = false
  if (earth?.material) earth.material.emissiveIntensity = COSMOS_EARTH_EMISSIVE_INTENSITY
  if (nightLights) nightLights.visible = true
  if (nightLights?.material) nightLights.material.opacity = 0.5
  if (markerGroup) markerGroup.visible = false
  if (terrainGroup && !props.terrainMode) terrainGroup.visible = false
  if (climateGroup && !props.climateMode) climateGroup.visible = false
  if (civilizationGroup) civilizationGroup.visible = false
  updateCivilizationBaseOverlays(false)

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

function addDynamicLayer() {
  if (!earthGroup) return
  if (dynamicGroup) {
    earthGroup.remove(dynamicGroup)
    disposeObject(dynamicGroup)
  }
  dynamicGroup = new Group()
  dynamicGroup.visible = false
  earthGroup.add(dynamicGroup)
  updateDynamicLayer()
}

function updateDynamicLayer() {
  if (!dynamicGroup) return
  clearGroup(dynamicGroup)
  dynamicGroup.visible = Boolean(props.earthDynamicMode)
  if (!dynamicGroup.visible) return

  if (props.dynamicLayer === 'earthquakes') {
    props.earthquakeEvents.forEach((event, index) => dynamicGroup.add(createEarthquakeVisual(event, index)))
  } else if (props.dynamicLayer === 'volcanoes') {
    props.volcanoFeatures.forEach((volcano, index) => dynamicGroup.add(createVolcanoVisual(volcano, index)))
  } else {
    props.plateFeatures.forEach((plate, index) => dynamicGroup.add(createPlateVisual(plate, index)))
  }

  const beacon = createDynamicFeatureBeacon()
  if (beacon) dynamicGroup.add(beacon)
}

function createPlateVisual(plate, index) {
  const group = new Group()
  group.userData.dynamicFeature = { kind: 'plate', feature: plate }
  group.userData.phase = index * 0.47

  const color = plateColor(index)
  const active = isDynamicActive('plate', plate)
  const boundary = plate.boundary || []

  if (boundary.length >= 3) group.add(createPlateSurfacePatch(plate, color, active))
  if (boundary.length >= 2) {
    createPlateBoundaryBand(plate, color, active).forEach((part) => group.add(part))
  }
  if (plate.center && plate.motion) group.add(createPlateMotionArrow(plate, index, color, active))
  if (plate.center) {
    group.add(createTextSprite(
      plate.name,
      latLngToVector3(plate.center[0], plate.center[1], RADIUS * (active ? 1.24 : 1.2)),
      active ? 0xffffff : color,
      active ? 0.52 : 0.38
    ))
  }

  return group
}

function createPlateSurfacePatch(plate, color, active) {
  const center = latLngToVector3(plate.center[0], plate.center[1], RADIUS * 1.032)
  const boundary = plate.boundary.map(([lat, lng]) => latLngToVector3(lat, lng, RADIUS * 1.033))
  const vertices = [center.x, center.y, center.z]
  boundary.forEach((point) => vertices.push(point.x, point.y, point.z))
  const indices = []
  for (let i = 1; i <= boundary.length; i += 1) {
    indices.push(0, i, i === boundary.length ? 1 : i + 1)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()
  const patch = new Mesh(
    geometry,
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: active ? 0.2 : 0.105,
      blending: NormalBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  patch.userData.dynamicPlatePatch = true
  patch.userData.baseOpacity = patch.material.opacity
  return patch
}

function createPlateBoundaryBand(plate, color, active) {
  const path = terrainSurfacePath(plate.boundary || [], RADIUS * 1.09)
  if (path.length < 2) return []
  const curve = new CatmullRomCurve3(path)
  const glow = new Mesh(
    new TubeGeometry(curve, Math.max(80, path.length * 10), active ? 0.026 : 0.018, 12, true),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: active ? 0.36 : 0.2,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  glow.userData.dynamicBoundary = true
  glow.userData.baseOpacity = glow.material.opacity

  const core = new Mesh(
    new TubeGeometry(curve, Math.max(80, path.length * 12), active ? 0.007 : 0.0045, 8, true),
    new MeshBasicMaterial({
      color: active ? 0xffffff : 0xffd27a,
      transparent: true,
      opacity: active ? 0.7 : 0.34,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  core.userData.dynamicBoundary = true
  core.userData.baseOpacity = core.material.opacity

  return [glow, core]
}

function createPlateMotionArrow(plate, index, color, active) {
  const group = new Group()
  group.userData.dynamicArrowGroup = true
  const start = latLngToVector3(plate.center[0], plate.center[1], RADIUS * 1.13)
  const end = latLngToVector3(plate.motion[0], plate.motion[1], RADIUS * 1.13)
  const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(RADIUS * 1.2)
  const curve = new CatmullRomCurve3([start, mid, end])
  const points = Array.from({ length: 56 }, (_, step) => curve.getPoint(step / 55).normalize().multiplyScalar(RADIUS * 1.18))

  const shaft = new Mesh(
    new TubeGeometry(curve, 72, active ? 0.011 : 0.0075, 8, false),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: active ? 0.72 : 0.46,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  shaft.userData.dynamicArrow = true
  shaft.userData.baseOpacity = shaft.material.opacity
  group.add(shaft)

  const trace = new Line(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: active ? 0.42 : 0.22,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  trace.userData.dynamicArrow = true
  trace.userData.baseOpacity = trace.material.opacity
  group.add(trace)

  ;[0.44, 0.67, 0.84].forEach((t, chevronIndex) => {
    const chevron = createTectonicChevron(curve, t, chevronIndex % 2 ? 0xffd27a : color)
    chevron.userData.dynamicArrow = true
    chevron.userData.baseOpacity = active ? 0.7 : 0.42
    chevron.material.opacity = chevron.userData.baseOpacity
    group.add(chevron)
  })

  const head = new Mesh(
    new ConeGeometry(active ? 0.058 : 0.046, active ? 0.18 : 0.14, 24),
    new MeshBasicMaterial({
      color: active ? 0xffffff : color,
      transparent: true,
      opacity: active ? 0.88 : 0.62,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  head.position.copy(end.clone().normalize().multiplyScalar(RADIUS * 1.17))
  head.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), end.clone().sub(mid).normalize())
  head.userData.dynamicArrow = true
  head.userData.baseOpacity = head.material.opacity
  group.add(head)
  group.userData.phase = index * 0.33
  return group
}

function createEarthquakeVisual(event, index) {
  const magnitude = MathUtils.clamp((Number(event.magnitude || 5) - 4.5) / 2, 0, 1)
  const color = magnitude > 0.72 ? 0xff6a3d : magnitude > 0.42 ? 0xffd27a : 0x7dd3fc
  const active = isDynamicActive('earthquake', event)
  const group = createSurfaceGroup(event.lat, event.lng, RADIUS * 1.108)
  group.userData.dynamicFeature = { kind: 'earthquake', feature: event }
  group.userData.phase = index * 0.42

  const core = new Mesh(
    new SphereGeometry((active ? 0.044 : 0.026) + magnitude * (active ? 0.04 : 0.028), 18, 18),
    new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  core.userData.dynamicPulse = true
  group.add(core)

  const shock = new Mesh(
    new CircleGeometry((active ? 0.2 : 0.12) + magnitude * (active ? 0.28 : 0.18), 80),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: (active ? 0.3 : 0.18) + magnitude * 0.14,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  shock.position.z = -0.002
  shock.userData.dynamicShock = true
  shock.userData.baseOpacity = shock.material.opacity
  group.add(shock)

  ;[0.12, 0.22 + magnitude * 0.08, active ? 0.42 + magnitude * 0.16 : 0].filter(Boolean).forEach((radius, ringIndex) => {
    const ring = new Mesh(
      new TorusGeometry(radius, 0.0045, 8, 96),
      new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: (ringIndex ? 0.42 : 0.64) + (active ? 0.12 : 0),
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    ring.userData.dynamicRipple = true
    ring.userData.baseOpacity = ring.material.opacity
    ring.userData.phase = ringIndex * 0.55
    group.add(ring)
  })

  group.add(createTextSprite(`M ${event.magnitude}`, latLngToVector3(event.lat, event.lng, RADIUS * 1.25), color, 0.32))
  return group
}

function createVolcanoVisual(volcano, index) {
  const active = isDynamicActive('volcano', volcano)
  const statusColor = volcano.status === 'supervolcano' ? 0xff4f8b : volcano.status === 'active' ? 0xff8a3d : 0xf2d98d
  const group = createSurfaceGroup(volcano.lat, volcano.lng, RADIUS * 1.102)
  group.userData.dynamicFeature = { kind: 'volcano', feature: volcano }
  group.userData.phase = index * 0.6

  const baseRadius = active ? 0.22 : 0.09
  const cone = new Mesh(
    new ConeGeometry(baseRadius * 0.74, active ? 0.68 : 0.24, 44, 1),
    new MeshBasicMaterial({
      color: statusColor,
      transparent: true,
      opacity: active ? 0.9 : 0.54,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  cone.position.z = active ? 0.16 : 0.048
  cone.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(0, 0, 1))
  cone.userData.dynamicVolcano = true
  cone.userData.baseOpacity = cone.material.opacity
  group.add(cone)

  const plume = new Mesh(
    new ConeGeometry(baseRadius * 0.58, active ? 1.05 : 0.32, 40, 1, true),
    new MeshBasicMaterial({
      color: volcano.status === 'dormant' ? 0xf8fafc : statusColor,
      transparent: true,
      opacity: active ? 0.48 : 0.2,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  plume.position.z = active ? 0.64 : 0.16
  plume.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(0, 0, 1))
  plume.userData.dynamicPlume = true
  plume.userData.baseOpacity = plume.material.opacity
  group.add(plume)

  const halo = new Mesh(
    new CircleGeometry(baseRadius * (active ? 2.25 : 1.45), 72),
    new MeshBasicMaterial({
      color: statusColor,
      transparent: true,
      opacity: active ? 0.4 : 0.16,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  halo.position.z = -0.002
  halo.userData.dynamicPulse = true
  halo.userData.baseOpacity = halo.material.opacity
  group.add(halo)

  if (active) {
    ;[0.28, 0.48, 0.68].forEach((radius, ringIndex) => {
      const plumeRing = new Mesh(
        new TorusGeometry(radius, 0.006, 8, 96),
        new MeshBasicMaterial({
          color: ringIndex === 1 ? 0xffffff : statusColor,
          transparent: true,
          opacity: 0.34 - ringIndex * 0.055,
          blending: AdditiveBlending,
          depthWrite: false
        })
      )
      plumeRing.position.z = 0.26 + ringIndex * 0.18
      plumeRing.userData.featureBeaconRing = true
      plumeRing.userData.baseOpacity = plumeRing.material.opacity
      group.add(plumeRing)
    })
  }

  group.add(createTextSprite(volcano.name, latLngToVector3(volcano.lat, volcano.lng, RADIUS * 1.28), statusColor, active ? 0.5 : 0.3))
  return group
}

function createDynamicFeatureBeacon() {
  const payload = props.activeDynamicFeature
  const center = dynamicPayloadCenter(payload)
  if (!payload || !center) return null
  const color = dynamicFeatureColor(payload)
  const scale = payload.kind === 'plate' ? 1.4 : payload.kind === 'volcano' ? 1.25 : 1.12
  const beacon = createFeatureBeacon(center.lat, center.lng, color, {
    scale,
    variant: payload.kind === 'volcano' ? 'magma' : 'dynamic'
  })
  beacon.userData.dynamicFeature = payload
  beacon.userData.dynamicFeatureBeacon = true
  return beacon
}

function addOceanLayer() {
  if (!earthGroup) return
  if (oceanGroup) {
    earthGroup.remove(oceanGroup)
    disposeObject(oceanGroup)
  }
  oceanGroup = new Group()
  oceanGroup.visible = false
  earthGroup.add(oceanGroup)
  updateOceanLayer()
}

function updateOceanLayer() {
  if (!oceanGroup) return
  clearGroup(oceanGroup)
  oceanGroup.visible = Boolean(props.oceanMode)
  if (!oceanGroup.visible) return

  oceanOverlayGroup = new Group()
  oceanOverlayGroup.add(createOceanWash())
  oceanGroup.add(oceanOverlayGroup)

  if (props.oceanLayer === 'depth') {
    props.oceanFeatures.forEach((feature, index) => oceanGroup.add(createOceanDepthVisual(feature, index)))
    return
  }

  props.oceanFeatures.slice(0, 5).forEach((feature, index) => {
    const ghost = createOceanDepthVisual(feature, index, true)
    oceanGroup.add(ghost)
  })

  const overlays = props.oceanOverlays?.[props.oceanLayer] || []
  overlays.forEach((feature, index) => {
    if (props.oceanLayer === 'currents') oceanGroup.add(createOceanCurrentVisual(feature, index))
    else if (props.oceanLayer === 'trenches' || props.oceanLayer === 'ridges') oceanGroup.add(createOceanLinearVisual(feature, props.oceanLayer, index))
    else oceanGroup.add(createOceanAreaVisual(feature, props.oceanLayer, index))
  })

  const beacon = createOceanFeatureBeacon()
  if (beacon) oceanGroup.add(beacon)
}

function createOceanWash() {
  const wash = new Mesh(
    new SphereGeometry(RADIUS * 1.023, OVERLAY_SEGMENTS, OVERLAY_SEGMENTS),
    new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        layerTint: { value: oceanLayerTint(props.oceanLayer) }
      },
      vertexShader: `
        varying vec3 vLocalNormal;
        void main() {
          vLocalNormal = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 layerTint;
        varying vec3 vLocalNormal;
        void main() {
          vec3 n = normalize(vLocalNormal);
          float lat = asin(n.y);
          float lng = atan(n.z, -n.x);
          float wave = sin(lng * 18.0 + time * 0.35) * 0.5 + sin(lat * 24.0 - time * 0.22) * 0.5;
          float polar = smoothstep(0.72, 1.0, abs(n.y));
          vec3 deep = vec3(0.015, 0.07, 0.16);
          vec3 color = mix(deep, layerTint, 0.42 + wave * 0.08 + polar * 0.08);
          gl_FragColor = vec4(color, 0.23 + wave * 0.018);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending
    })
  )
  wash.userData.oceanWash = true
  return wash
}

function createOceanDepthVisual(feature, index, muted = false) {
  const active = isOceanActive(feature, muted ? 'depth-muted' : 'depth')
  const group = createSurfaceGroup(feature.center[0], feature.center[1], RADIUS * (muted ? 1.046 : 1.055))
  group.userData.oceanFeature = { kind: 'ocean', layer: 'depth', feature }
  group.userData.phase = index * 0.35
  const radius = MathUtils.clamp(feature.radius || 0.18, 0.07, 0.78)
  const color = oceanDepthColor(feature.depthClass)

  const patch = new Mesh(
    new CircleGeometry(radius, 96),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: muted ? 0.045 : active ? 0.22 : 0.13,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  patch.scale.set(1.32, 0.72, 1)
  patch.userData.oceanPatch = true
  patch.userData.baseOpacity = patch.material.opacity
  group.add(patch)

  ;[0.58, 0.86, 1.14].forEach((scale, ringIndex) => {
    const ring = new Mesh(
      new TorusGeometry(radius * scale, 0.0028, 8, 112),
      new MeshBasicMaterial({
        color: ringIndex === 0 ? 0xffffff : color,
        transparent: true,
        opacity: muted ? 0.045 : active ? 0.32 - ringIndex * 0.06 : 0.17 - ringIndex * 0.035,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    ring.scale.set(1.32, 0.72, 1)
    ring.userData.oceanContour = true
    ring.userData.baseOpacity = ring.material.opacity
    group.add(ring)
  })

  if (!muted) group.add(createTextSprite(feature.name, latLngToVector3(feature.center[0], feature.center[1], RADIUS * 1.18), color, active ? 0.42 : 0.3))
  return group
}

function createOceanCurrentVisual(feature, index) {
  const path = terrainSurfacePath(feature.path || [], RADIUS * 1.086)
  const group = new Group()
  group.userData.oceanFeature = { kind: 'overlay', layer: 'currents', feature }
  group.userData.phase = index * 0.44
  if (path.length < 2) return group

  const active = isOceanActive(feature, 'currents')
  const color = currentVisualColor(feature.kind)
  const edgeColor = feature.kind === 'warm' ? 0xff7a45 : feature.kind === 'seasonal' ? 0xb9f7ff : 0x185f9b
  const curve = new CatmullRomCurve3(path)
  const tubularSegments = active ? Math.max(96, path.length * 20) : Math.max(56, path.length * 12)
  const glow = new Mesh(
    new TubeGeometry(curve, tubularSegments, active ? 0.074 : 0.036, 16, false),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: active ? 0.38 : 0.16,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  glow.userData.oceanCurrent = true
  glow.userData.baseOpacity = glow.material.opacity
  group.add(glow)

  const wake = new Mesh(
    new TubeGeometry(curve, tubularSegments, active ? 0.118 : 0.062, 18, false),
    new MeshBasicMaterial({
      color: edgeColor,
      transparent: true,
      opacity: active ? 0.18 : 0.07,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  wake.userData.oceanCurrentWake = true
  wake.userData.baseOpacity = wake.material.opacity
  group.add(wake)

  const core = new Mesh(
    new TubeGeometry(curve, tubularSegments, active ? 0.02 : 0.009, 8, false),
    new MeshBasicMaterial({
      color: active ? 0xffffff : color,
      transparent: true,
      opacity: active ? 0.86 : 0.68,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  core.userData.oceanCurrent = true
  core.userData.baseOpacity = core.material.opacity
  group.add(core)

  const currentParticleCount = active ? 16 : 4
  const wakeCount = active ? 4 : 2
  for (let wakeIndex = 1; wakeIndex <= wakeCount; wakeIndex += 1) {
    const t = wakeIndex / (wakeCount + 1)
    const point = curve.getPoint(t).normalize().multiplyScalar(RADIUS * 1.118)
    const bead = new Mesh(
      new TorusGeometry(active ? 0.06 : 0.038, active ? 0.0048 : 0.003, 8, 44),
      new MeshBasicMaterial({
        color: wakeIndex % 2 ? 0xffffff : color,
        transparent: true,
        opacity: active ? 0.44 : 0.18,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    bead.position.copy(point)
    bead.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), point.clone().normalize())
    bead.userData.oceanCurrentWake = true
    bead.userData.baseOpacity = bead.material.opacity
    bead.userData.phase = wakeIndex * 0.4
    group.add(bead)
  }

  const influenceField = active ? createCurrentInfluenceField(feature, curve, color, active) : null
  if (influenceField) group.add(influenceField)

  for (let particleIndex = 0; particleIndex < currentParticleCount; particleIndex += 1) {
    const particle = new Mesh(
      new SphereGeometry(active ? 0.028 : 0.018, 14, 14),
      new MeshBasicMaterial({
        color: particleIndex % 2 ? 0xffffff : color,
        transparent: true,
        opacity: 0.88,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    particle.userData.oceanParticle = true
    particle.userData.curve = curve
    particle.userData.offset = particleIndex / currentParticleCount
    particle.userData.phase = index * 0.12
    group.add(particle)
  }

  group.add(createTextSprite(feature.name, curve.getPoint(0.5).normalize().multiplyScalar(RADIUS * 1.22), color, active ? 0.46 : 0.34))
  return group
}

function createCurrentInfluenceField(feature, curve, color, active) {
  if (!feature.influence && !active) return null
  const fallbackCenter = vector3ToLatLng(curve.getPoint(0.52).normalize())
  const center = feature.influence?.center || [fallbackCenter.lat, fallbackCenter.lng]
  const radius = MathUtils.clamp(feature.influence?.radius || 0.16, 0.08, 0.36) * (active ? 1.8 : 1.18)
  const group = createSurfaceGroup(center[0], center[1], RADIUS * 1.066)
  group.userData.phase = (center[0] + center[1]) * 0.017

  const wash = new Mesh(
    new CircleGeometry(radius, 96),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: active ? 0.22 : 0.07,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  wash.scale.set(feature.kind === 'cold' ? 1.45 : 1.24, feature.kind === 'seasonal' ? 1.1 : 0.76, 1)
  wash.userData.oceanCurrentImpact = true
  wash.userData.baseOpacity = wash.material.opacity
  group.add(wash)

  ;[0.62, 0.95, 1.28].forEach((scale, ringIndex) => {
    const ring = new Mesh(
      new TorusGeometry(radius * scale, active ? 0.0045 : 0.0028, 8, 96),
      new MeshBasicMaterial({
        color: ringIndex === 1 ? 0xffffff : color,
        transparent: true,
        opacity: (active ? 0.38 : 0.14) - ringIndex * 0.055,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    ring.scale.set(wash.scale.x, wash.scale.y, 1)
    ring.userData.oceanCurrentImpact = true
    ring.userData.baseOpacity = ring.material.opacity
    ring.userData.phase = ringIndex * 0.36
    group.add(ring)
  })

  return group
}

function createOceanLinearVisual(feature, layer, index) {
  const path = terrainSurfacePath(feature.path || [], RADIUS * 1.094)
  const group = new Group()
  group.userData.oceanFeature = { kind: 'overlay', layer, feature }
  group.userData.phase = index * 0.38
  if (path.length < 2) return group

  const isTrench = layer === 'trenches'
  const active = isOceanActive(feature, layer)
  const color = isTrench ? 0x6d5dfc : 0x63f7d6
  const shadowColor = isTrench ? 0x120a33 : 0x0b5c5a
  const curve = new CatmullRomCurve3(path)

  const shadow = new Mesh(
    new TubeGeometry(curve, Math.max(72, path.length * 14), active ? (isTrench ? 0.076 : 0.045) : (isTrench ? 0.028 : 0.02), 14, false),
    new MeshBasicMaterial({
      color: shadowColor,
      transparent: true,
      opacity: active ? (isTrench ? 0.68 : 0.42) : (isTrench ? 0.42 : 0.22),
      blending: isTrench ? NormalBlending : AdditiveBlending,
      depthWrite: false
    })
  )
  shadow.userData.oceanLinear = true
  shadow.userData.baseOpacity = shadow.material.opacity
  group.add(shadow)

  const core = new Mesh(
    new TubeGeometry(curve, Math.max(72, path.length * 18), active ? (isTrench ? 0.02 : 0.018) : (isTrench ? 0.008 : 0.01), 8, false),
    new MeshBasicMaterial({
      color: active ? 0xffffff : color,
      transparent: true,
      opacity: active ? 0.9 : (isTrench ? 0.74 : 0.66),
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  core.userData.oceanLinear = true
  core.userData.baseOpacity = core.material.opacity
  group.add(core)

  if (!isTrench) {
    for (let tick = 1; tick <= 9; tick += 1) {
      group.add(createOceanRidgeTick(curve, tick / 10, color))
    }
  }

  if (active && isTrench) {
    ;[0.42, 0.58, 0.74].forEach((t, ringIndex) => {
      const point = curve.getPoint(t).normalize().multiplyScalar(RADIUS * 1.116)
      const marker = new Mesh(
        new TorusGeometry(0.07 + ringIndex * 0.016, 0.004, 8, 48),
        new MeshBasicMaterial({
          color: ringIndex === 1 ? 0xffffff : color,
          transparent: true,
          opacity: 0.5 - ringIndex * 0.08,
          blending: AdditiveBlending,
          depthWrite: false
        })
      )
      marker.position.copy(point)
      marker.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), point.clone().normalize())
      marker.userData.oceanContour = true
      marker.userData.baseOpacity = marker.material.opacity
      group.add(marker)
    })
  }

  group.add(createTextSprite(feature.name, curve.getPoint(0.5).normalize().multiplyScalar(RADIUS * 1.22), color, active ? 0.46 : 0.34))
  return group
}

function createOceanRidgeTick(curve, t, color) {
  const point = curve.getPoint(t).normalize().multiplyScalar(RADIUS * 1.112)
  const tangent = curve.getTangent(t).normalize()
  const normal = point.clone().normalize()
  const side = new Vector3().crossVectors(normal, tangent).normalize()
  const points = [
    point.clone().sub(side.clone().multiplyScalar(0.052)).normalize().multiplyScalar(RADIUS * 1.114),
    point.clone().add(side.clone().multiplyScalar(0.052)).normalize().multiplyScalar(RADIUS * 1.114)
  ]
  const line = new Line(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.48,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  line.userData.oceanRidgeTick = true
  line.userData.baseOpacity = line.material.opacity
  return line
}

function createOceanAreaVisual(feature, layer, index) {
  const color = layer === 'reefs' ? 0x8fffe3 : 0x2466a8
  const accent = layer === 'reefs' ? 0xf2d98d : 0x7dd3fc
  const group = createSurfaceGroup(feature.center[0], feature.center[1], RADIUS * 1.072)
  group.userData.oceanFeature = { kind: 'overlay', layer, feature }
  group.userData.phase = index * 0.49
  const active = isOceanActive(feature, layer)
  const radius = MathUtils.clamp(feature.radius || 0.12, 0.045, 0.24) * (active ? 1.75 : 1)

  const patch = new Mesh(
    new CircleGeometry(radius, 88),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: active ? (layer === 'reefs' ? 0.5 : 0.38) : (layer === 'reefs' ? 0.24 : 0.2),
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  patch.scale.set(layer === 'reefs' ? 1.18 : 1.55, layer === 'reefs' ? 0.8 : 1, 1)
  patch.userData.oceanArea = true
  patch.userData.baseOpacity = patch.material.opacity
  group.add(patch)

  ;[0.6, 0.96, 1.28].forEach((scale, ringIndex) => {
    const ring = new Mesh(
      new TorusGeometry(radius * scale, 0.0028, 8, 96),
      new MeshBasicMaterial({
        color: ringIndex ? color : accent,
        transparent: true,
        opacity: (active ? 0.5 : 0.34) - ringIndex * 0.07,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    ring.scale.set(patch.scale.x, patch.scale.y, 1)
    ring.userData.oceanContour = true
    ring.userData.baseOpacity = ring.material.opacity
    group.add(ring)
  })

  if (layer === 'reefs') {
    const dotCount = active ? 24 : 12
    for (let dot = 0; dot < dotCount; dot += 1) {
      const angle = dot * 2.399
      const distance = radius * (0.2 + (dot % 5) * 0.14)
      const sparkle = new Mesh(
        new SphereGeometry((active ? 0.014 : 0.008) + (dot % 3) * 0.002, 8, 8),
        new MeshBasicMaterial({
          color: dot % 2 ? accent : color,
          transparent: true,
          opacity: 0.8,
          blending: AdditiveBlending,
          depthWrite: false
        })
      )
      sparkle.position.set(Math.cos(angle) * distance * 1.1, Math.sin(angle) * distance * 0.72, 0.018)
      sparkle.userData.oceanSparkle = true
      sparkle.userData.phase = dot * 0.31
      group.add(sparkle)
    }
  }

  group.add(createTextSprite(feature.name, latLngToVector3(feature.center[0], feature.center[1], RADIUS * 1.22), accent, active ? 0.46 : 0.32))
  return group
}

function createOceanFeatureBeacon() {
  const payload = props.activeOceanFeature
  const center = oceanPayloadCenter(payload)
  if (!payload || !center) return null
  const color = oceanFeatureColor(payload)
  const scale = payload.layer === 'trenches' ? 1.18 : payload.layer === 'reefs' ? 1.34 : 1.08
  const beacon = createFeatureBeacon(center.lat, center.lng, color, {
    scale,
    variant: payload.layer === 'trenches' ? 'abyss' : 'ocean'
  })
  beacon.userData.oceanFeature = payload
  beacon.userData.oceanFeatureBeacon = true
  return beacon
}

function addSeasonalLayer() {
  if (!earthGroup) return
  if (seasonalGroup) {
    earthGroup.remove(seasonalGroup)
    disposeObject(seasonalGroup)
  }
  seasonalGroup = new Group()
  seasonalGroup.visible = false
  earthGroup.add(seasonalGroup)
  updateSeasonalLayer()
}

function updateSeasonalLayer() {
  if (!seasonalGroup) return
  clearGroup(seasonalGroup)
  seasonalGroup.visible = Boolean(props.seasonalMode && props.seasonalState)
  if (!seasonalGroup.visible) return
  seasonalGroup.add(createSeasonalLayer(props.seasonalState))
}

function createSeasonalLayer(state) {
  const group = new Group()
  group.userData.seasonalState = state
  group.add(createSeasonalSunBeltGlow(state))
  group.add(createSeasonalRainBeltMass(state))
  ;(state.pressureBelts || []).forEach((belt, index) => group.add(createSeasonalPressureBelt(belt, index)))
  ;(state.polarCaps || []).forEach((cap, index) => group.add(createSeasonalPolarCap(cap, index)))
  ;(state.regionalImpacts || []).forEach((impact, index) => {
    const impactVisual = createSeasonalImpactPatch(impact, index)
    if (impactVisual) group.add(impactVisual)
  })
  ;(state.monsoonSystems || []).forEach((wind, index) => {
    const windVisual = createSeasonalMonsoonWindBand(wind, index)
    if (windVisual) group.add(windVisual)
  })
  ;(state.seasonalCurrents || []).forEach((current, index) => {
    const currentVisual = createSeasonalCurrentVisual(current, index)
    if (currentVisual) group.add(currentVisual)
  })
  return group
}

function createSeasonalSunBeltGlow(state) {
  const seasonalSunBeltGlow = new Group()
  seasonalSunBeltGlow.userData.seasonalSunBeltGlow = true
  const latRange = state.sunBelt?.latRange || [state.solarDirectLatitude - 4, state.solarDirectLatitude + 4]
  const core = createLatLngAreaPatch(
    { latRange, lngRange: [-180, 180] },
    RADIUS * 1.094,
    0xffd166,
    0.42
  )
  core.userData.seasonalSunBeltGlow = true
  core.userData.baseOpacity = core.material.opacity
  seasonalSunBeltGlow.add(core)

  const halo = createLatLngAreaPatch(
    { latRange: [latRange[0] - 2.2, latRange[1] + 2.2], lngRange: [-180, 180] },
    RADIUS * 1.091,
    0xfff2a6,
    0.18
  )
  halo.userData.seasonalSunBeltGlow = true
  halo.userData.baseOpacity = halo.material.opacity
  halo.userData.phase = 0.45
  seasonalSunBeltGlow.add(halo)
  return seasonalSunBeltGlow
}

function createSeasonalRainBeltMass(state) {
  const seasonalRainBeltMass = new Group()
  seasonalRainBeltMass.userData.seasonalRainBeltMass = true
  const latRange = state.rainBelt?.latRange || [-5, 5]
  const patch = createLatLngAreaPatch(
    { latRange, lngRange: [-180, 180] },
    RADIUS * 1.101,
    0x62f7c9,
    0.36
  )
  patch.userData.seasonalRainBeltMass = true
  patch.userData.baseOpacity = patch.material.opacity
  seasonalRainBeltMass.add(patch)

  const cloud = createSeasonalCloudPoints(latRange, 124, 0x9fffe8, RADIUS * 1.117)
  cloud.userData.seasonalRainBeltMass = true
  seasonalRainBeltMass.add(cloud)
  return seasonalRainBeltMass
}

function createSeasonalPressureBelt(belt, index) {
  const patch = createLatLngAreaPatch(
    { latRange: belt.latRange, lngRange: [-180, 180] },
    RADIUS * 1.083,
    0xf3a84b,
    belt.role === 'polar-high' ? 0.14 : 0.24
  )
  patch.userData.seasonalPressureBelt = true
  patch.userData.baseOpacity = patch.material.opacity
  patch.userData.phase = index * 0.4
  return patch
}

function createSeasonalPolarCap(cap, index) {
  const color = cap.role === 'polar-day' ? 0xfff5b8 : cap.role === 'polar-night' ? 0x4568ff : 0x9ad4ff
  const patch = createLatLngAreaPatch(
    { latRange: cap.latRange, lngRange: [-180, 180] },
    RADIUS * 1.092,
    color,
    cap.role === 'polar-twilight' ? 0.08 : 0.14
  )
  patch.userData.seasonalPolarCap = true
  patch.userData.baseOpacity = patch.material.opacity
  patch.userData.phase = index * 0.5
  return patch
}

function createSeasonalImpactPatch(impact, index) {
  const color = colorToHex(impact.color || '#7dd3fc')
  const area = impact.area || pathArea(impact.path)
  if (!area) return null
  const seasonalImpactPatch = new Group()
  seasonalImpactPatch.userData.seasonalImpactPatch = true
  seasonalImpactPatch.userData.phase = index * 0.38
  const patch = createLatLngAreaPatch(area, RADIUS * 1.106, color, 0.28)
  patch.userData.seasonalImpactPatch = true
  patch.userData.baseOpacity = patch.material.opacity
  seasonalImpactPatch.add(patch)

  const center = areaCenter(area)
  const pulse = createSurfaceGroup(center.lat, center.lng, RADIUS * 1.135)
  pulse.userData.seasonalImpactPulse = true
  pulse.userData.phase = index * 0.29
  const ring = new Mesh(
    new TorusGeometry(0.18, 0.009, 8, 88),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.78,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  ring.userData.seasonalImpactPulse = true
  ring.userData.baseOpacity = ring.material.opacity
  pulse.add(ring)
  seasonalImpactPatch.add(pulse)
  return seasonalImpactPatch
}

function createSeasonalMonsoonWindBand(wind, index) {
  const points = terrainSurfacePath(wind.path || [], RADIUS * 1.142)
  if (points.length < 2) return null
  const curve = new CatmullRomCurve3(points)
  const color = wind.role === 'summer-monsoon' ? 0x4fd1ff : 0xb7d4ff
  const group = new Group()
  group.userData.seasonalMonsoonWindBand = true
  group.userData.phase = index * 0.27

  const glow = new Mesh(
    new TubeGeometry(curve, Math.max(64, points.length * 12), 0.074, 16, false),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.34 + (wind.strength || 0.6) * 0.16,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  glow.userData.seasonalMonsoonWindBand = true
  glow.userData.baseOpacity = glow.material.opacity
  group.add(glow)

  const core = new Mesh(
    new TubeGeometry(curve, Math.max(72, points.length * 14), 0.019, 10, false),
    new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  core.userData.seasonalMonsoonWindBand = true
  core.userData.baseOpacity = core.material.opacity
  group.add(core)

  const seasonalParticleCount = Math.max(14, Math.round((wind.strength || 0.6) * 24))
  for (let particleIndex = 0; particleIndex < seasonalParticleCount; particleIndex += 1) {
    const particle = new Mesh(
      new SphereGeometry(0.03, 10, 10),
      new MeshBasicMaterial({
        color: particleIndex % 2 ? color : 0xffffff,
        transparent: true,
        opacity: 0.86,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    particle.userData.seasonalMonsoonWindBand = true
    particle.userData.seasonalWindParticle = true
    particle.userData.curve = curve
    particle.userData.offset = particleIndex / seasonalParticleCount
    particle.userData.phase = index * 0.12
    particle.position.copy(curve.getPoint(particle.userData.offset))
    group.add(particle)
  }
  return group
}

function createSeasonalCurrentVisual(current, index) {
  const points = terrainSurfacePath(current.path || [], RADIUS * 1.131)
  if (points.length < 2) return null
  const curve = new CatmullRomCurve3(points)
  const color = current.kind === 'cold' ? 0x7dd3fc : 0xffc979
  const group = new Group()
  group.userData.seasonalCurrent = true
  group.userData.phase = index * 0.2
  const mesh = new Mesh(
    new TubeGeometry(curve, Math.max(56, points.length * 11), 0.032, 12, false),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.74,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  mesh.userData.seasonalCurrent = true
  mesh.userData.baseOpacity = mesh.material.opacity
  group.add(mesh)

  for (let dot = 0; dot < 8; dot += 1) {
    const particle = new Mesh(
      new SphereGeometry(0.022, 8, 8),
      new MeshBasicMaterial({
        color: dot % 2 ? color : 0xffffff,
        transparent: true,
        opacity: 0.76,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    particle.userData.seasonalCurrentParticle = true
    particle.userData.curve = curve
    particle.userData.offset = dot / 8
    particle.userData.phase = index * 0.17
    particle.position.copy(curve.getPoint(particle.userData.offset))
    group.add(particle)
  }
  return group
}

function createSeasonalCloudPoints(latRange, count, color, radius) {
  const positions = []
  for (let index = 0; index < count; index += 1) {
    const row = index % 11
    const lng = -170 + ((index * 47) % 340)
    const lat = latRange[0] + ((latRange[1] - latRange[0]) * row) / 10 + Math.sin(index * 1.7) * 0.42
    const point = latLngToVector3(lat, lng, radius + (index % 5) * 0.002)
    positions.push(point.x, point.y, point.z)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  const points = new Points(
    geometry,
    new PointsMaterial({
      color,
      size: 0.046,
      transparent: true,
      opacity: 0.84,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  points.userData.baseOpacity = points.material.opacity
  points.userData.phase = 0.2
  return points
}

function pathArea(path) {
  if (!path?.length) return null
  const lats = path.map((point) => point[0])
  const lngs = path.map((point) => point[1])
  return {
    latRange: [Math.min(...lats) - 2, Math.max(...lats) + 2],
    lngRange: [Math.min(...lngs) - 4, Math.max(...lngs) + 4]
  }
}

function areaCenter(area) {
  return {
    lat: (area.latRange[0] + area.latRange[1]) / 2,
    lng: (area.lngRange[0] + area.lngRange[1]) / 2
  }
}

function createLatLngAreaPatch(area, radius, color, opacity) {
  const latRange = area?.latRange || [-5, 5]
  const lngRange = area?.lngRange || [-180, 180]
  const latSteps = Math.max(3, Math.ceil(Math.abs(latRange[1] - latRange[0]) / 4))
  const lngSteps = Math.max(8, Math.ceil(Math.abs(lngRange[1] - lngRange[0]) / 10))
  const positions = []
  const indices = []

  for (let latIndex = 0; latIndex <= latSteps; latIndex += 1) {
    const lat = latRange[0] + ((latRange[1] - latRange[0]) * latIndex) / latSteps
    for (let lngIndex = 0; lngIndex <= lngSteps; lngIndex += 1) {
      const lng = lngRange[0] + ((lngRange[1] - lngRange[0]) * lngIndex) / lngSteps
      const point = latLngToVector3(lat, lng, radius)
      positions.push(point.x, point.y, point.z)
    }
  }

  const row = lngSteps + 1
  for (let latIndex = 0; latIndex < latSteps; latIndex += 1) {
    for (let lngIndex = 0; lngIndex < lngSteps; lngIndex += 1) {
      const a = latIndex * row + lngIndex
      const b = a + 1
      const c = a + row
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()
  return new Mesh(
    geometry,
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
}

function colorToHex(value) {
  return new Color(value || '#ffffff').getHex()
}

function createFeatureBeacon(lat, lng, color, options = {}) {
  const { scale = 1, variant = 'dynamic' } = options
  const group = createSurfaceGroup(lat, lng, RADIUS * 1.126)
  group.userData.phase = (lat + lng) * 0.01
  const isOcean = variant === 'ocean' || variant === 'abyss'
  const isAbyss = variant === 'abyss'
  const ringRadius = (isOcean ? 0.34 : 0.3) * scale
  const columnHeight = (isAbyss ? 0.46 : isOcean ? 0.62 : 0.88) * scale

  const wash = new Mesh(
    new CircleGeometry(ringRadius * 1.45, 96),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: isOcean ? 0.28 : 0.24,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  wash.userData.featureBeaconPulse = true
  wash.userData.baseOpacity = wash.material.opacity
  group.add(wash)

  ;[0.72, 1, 1.32].forEach((radiusScale, index) => {
    const ring = new Mesh(
      new TorusGeometry(ringRadius * radiusScale, index === 1 ? 0.008 : 0.005, 8, 120),
      new MeshBasicMaterial({
        color: index === 1 ? 0xffffff : color,
        transparent: true,
        opacity: 0.5 - index * 0.08,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    ring.position.z = index * 0.012
    ring.userData.featureBeaconRing = true
    ring.userData.baseOpacity = ring.material.opacity
    group.add(ring)
  })

  const column = new Mesh(
    new ConeGeometry(ringRadius * (isAbyss ? 0.42 : 0.3), columnHeight, 48, 1, true),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: isAbyss ? 0.42 : 0.3,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  column.position.z = isAbyss ? -columnHeight * 0.22 : columnHeight * 0.42
  column.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(0, 0, isAbyss ? -1 : 1))
  column.userData.featureBeaconColumn = true
  column.userData.baseOpacity = column.material.opacity
  group.add(column)

  const particleCount = isOcean ? 18 : 14
  for (let index = 0; index < particleCount; index += 1) {
    const angle = index * 2.399
    const distance = ringRadius * (0.56 + (index % 4) * 0.18)
    const particle = new Mesh(
      new SphereGeometry((0.012 + (index % 3) * 0.004) * scale, 10, 10),
      new MeshBasicMaterial({
        color: index % 3 === 1 ? 0xffffff : color,
        transparent: true,
        opacity: 0.72,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    particle.position.set(Math.cos(angle) * distance, Math.sin(angle) * distance * 0.72, 0.05 + (index % 5) * 0.025)
    particle.userData.featureBeaconParticle = true
    particle.userData.basePosition = particle.position.clone()
    particle.userData.phase = index * 0.37
    group.add(particle)
  }

  return group
}

function dynamicPayloadCenter(payload) {
  const feature = payload?.feature
  if (!feature) return null
  if (payload.kind === 'plate' && feature.center) return { lat: feature.center[0], lng: feature.center[1] }
  if (Number.isFinite(feature.lat) && Number.isFinite(feature.lng)) return { lat: feature.lat, lng: feature.lng }
  if (feature.center) return { lat: feature.center[0], lng: feature.center[1] }
  return null
}

function oceanPayloadCenter(payload) {
  const feature = payload?.feature
  if (!feature) return null
  if (feature.center) return { lat: feature.center[0], lng: feature.center[1] }
  const path = feature.path || []
  if (path.length) {
    const middle = path[Math.floor(path.length / 2)]
    return { lat: middle[0], lng: middle[1] }
  }
  return null
}

function dynamicFeatureColor(payload) {
  const feature = payload?.feature || {}
  if (payload?.kind === 'earthquake') {
    const magnitude = Number(feature.magnitude || 0)
    if (magnitude >= 6.5) return 0xff6a3d
    if (magnitude >= 5.8) return 0xffd27a
    return 0x7dd3fc
  }
  if (payload?.kind === 'volcano') {
    if (feature.status === 'supervolcano') return 0xff4f8b
    if (feature.status === 'active') return 0xff8a3d
    return 0xf2d98d
  }
  return 0xffd27a
}

function oceanFeatureColor(payload) {
  if (payload?.layer === 'currents') return currentVisualColor(payload.feature?.kind)
  if (payload?.layer === 'trenches') return 0x6d5dfc
  if (payload?.layer === 'ridges') return 0x63f7d6
  if (payload?.layer === 'reefs') return 0x8fffe3
  if (payload?.layer === 'basins') return 0x2466a8
  return 0x4aa7c7
}

function currentVisualColor(kind) {
  if (kind === 'warm') return 0xf2d98d
  if (kind === 'seasonal') return 0xb9f7ff
  return 0x7dd3fc
}

function createSurfaceGroup(lat, lng, radius) {
  const group = new Group()
  const surface = latLngToVector3(lat, lng, radius)
  const normal = surface.clone().normalize()
  group.position.copy(surface)
  group.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal)
  return group
}

function plateColor(index) {
  const colors = [0x8fd8ff, 0xffd27a, 0x63f7d6, 0xff8cc6, 0x9ad4ff, 0xf8b45e, 0xb8f7ff]
  return colors[index % colors.length]
}

function oceanLayerTint(layer) {
  const color = new Color(0x0b4b7a)
  if (layer === 'currents') color.set(0x0d6f8e)
  if (layer === 'trenches') color.set(0x17104a)
  if (layer === 'ridges') color.set(0x0c6b72)
  if (layer === 'basins') color.set(0x092f66)
  if (layer === 'reefs') color.set(0x0e7d78)
  return color
}

function oceanDepthColor(depthClass) {
  if (depthClass === 'abyssal') return 0x082f66
  if (depthClass === 'deep') return 0x0c4a7a
  if (depthClass === 'polar' || depthClass === 'cold') return 0x3f8dd4
  if (depthClass === 'rift') return 0x2c5d91
  if (depthClass === 'shelf') return 0x4aa7c7
  return 0x1d5f8a
}

function isDynamicActive(kind, feature) {
  return props.activeDynamicFeature?.kind === kind && props.activeDynamicFeature?.feature?.id === feature?.id
}

function isOceanActive(feature, layer = props.oceanLayer) {
  return props.activeOceanFeature?.layer === layer && props.activeOceanFeature?.feature?.id === feature?.id
}

function animateFeatureBeacon(object, time) {
  const phase = object.parent?.userData.phase || object.userData.phase || 0
  if (object.userData.featureBeaconPulse) {
    const pulse = 1 + Math.sin(time * 1.55 + phase) * 0.08
    object.scale.setScalar(pulse)
    if (object.material) object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.max(0, Math.sin(time * 1.8 + phase)) * 0.16
  }
  if (object.userData.featureBeaconRing) {
    object.rotation.z += 0.0035
    if (object.material) object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 1.1 + phase) * 0.07
  }
  if (object.userData.featureBeaconColumn) {
    object.rotation.z += 0.002
    object.scale.z = 1 + Math.sin(time * 1.28 + phase) * 0.1
    if (object.material) object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.max(0, Math.sin(time * 1.62 + phase)) * 0.12
  }
  if (object.userData.featureBeaconParticle && object.userData.basePosition) {
    object.position.copy(object.userData.basePosition)
    object.position.z += Math.sin(time * 1.9 + object.userData.phase) * 0.045
    object.scale.setScalar(1 + Math.sin(time * 2.3 + object.userData.phase) * 0.28)
    if (object.material) object.material.opacity = 0.42 + Math.max(0, Math.sin(time * 2.1 + object.userData.phase)) * 0.46
  }
}

function animateDynamicLayer(time) {
  if (!dynamicGroup?.visible) return
  dynamicGroup.traverse((object) => {
    animateFeatureBeacon(object, time)
    if (object.userData.dynamicPulse) {
      const pulse = 1 + Math.sin(time * 2.2 + (object.parent?.userData.phase || 0)) * 0.22
      object.scale.setScalar(pulse)
      if (object.material) object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.max(0, Math.sin(time * 2.1)) * 0.12
    }
    if (object.userData.dynamicRipple) {
      const phase = object.userData.phase || 0
      const pulse = 1 + ((time * 0.55 + phase) % 1) * 1.05
      object.scale.setScalar(pulse)
      if (object.material) object.material.opacity = Math.max(0.04, (object.userData.baseOpacity || 0.34) * (1.35 - pulse * 0.62))
    }
    if (object.userData.dynamicArrow && object.material) {
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 1.35 + (object.parent?.userData.phase || 0)) * 0.1
    }
    if (object.userData.dynamicBoundary && object.material) {
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 0.82 + (object.parent?.userData.phase || 0)) * 0.045
    }
    if (object.userData.dynamicPlume) {
      object.rotation.z += 0.003
      if (object.material) object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.max(0, Math.sin(time * 1.7 + (object.parent?.userData.phase || 0))) * 0.12
    }
  })
}

function animateOceanLayer(time) {
  if (!oceanGroup?.visible) return
  oceanGroup.traverse((object) => {
    animateFeatureBeacon(object, time)
    if (object.userData.oceanWash && object.material?.uniforms?.time) {
      object.material.uniforms.time.value = time
    }
    if (object.userData.oceanParticle && object.userData.curve) {
      const t = (time * 0.12 + object.userData.offset + object.userData.phase) % 1
      object.position.copy(object.userData.curve.getPoint(t).normalize().multiplyScalar(RADIUS * 1.116))
      if (object.material) object.material.opacity = 0.42 + Math.sin(t * Math.PI) * 0.5
    }
    if (object.userData.oceanCurrent && object.material) {
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 1.4 + (object.parent?.userData.phase || 0)) * 0.05
    }
    if (object.userData.oceanCurrentWake && object.material) {
      object.rotation.z += 0.0016
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.max(0, Math.sin(time * 1.15 + (object.userData.phase || 0))) * 0.055
    }
    if (object.userData.oceanCurrentImpact && object.material) {
      object.rotation.z += 0.0008
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 0.86 + (object.userData.phase || 0)) * 0.045
    }
    if (object.userData.oceanLinear && object.material) {
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 1.0 + (object.parent?.userData.phase || 0)) * 0.045
    }
    if (object.userData.oceanContour && object.material) {
      object.rotation.z += 0.0009
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 0.9 + (object.parent?.userData.phase || 0)) * 0.035
    }
    if (object.userData.oceanSparkle) {
      object.scale.setScalar(1 + Math.sin(time * 2.4 + object.userData.phase) * 0.32)
      if (object.material) object.material.opacity = 0.48 + Math.max(0, Math.sin(time * 2.2 + object.userData.phase)) * 0.42
    }
  })
}

function animateSeasonalLayer(time) {
  if (!seasonalGroup?.visible) return
  seasonalGroup.traverse((object) => {
    if (object.userData.seasonalSunBeltGlow && object.material) {
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 0.7 + (object.userData.phase || 0)) * 0.03
    }
    if (object.userData.seasonalRainBeltMass && object.material) {
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 0.9 + (object.userData.phase || 0)) * 0.045
    }
    if ((object.userData.seasonalPressureBelt || object.userData.seasonalPolarCap || object.userData.seasonalImpactPatch) && object.material) {
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 0.55 + (object.userData.phase || 0)) * 0.018
    }
    if (object.userData.seasonalMonsoonWindBand && object.material) {
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 1.05 + (object.parent?.userData.phase || 0)) * 0.045
    }
    if (object.userData.seasonalWindParticle && object.userData.curve) {
      const t = (time * 0.16 + object.userData.offset + object.userData.phase) % 1
      object.position.copy(object.userData.curve.getPoint(t).normalize().multiplyScalar(RADIUS * 1.148))
      if (object.material) object.material.opacity = 0.38 + Math.sin(t * Math.PI) * 0.52
    }
    if (object.userData.seasonalCurrentParticle && object.userData.curve) {
      const t = (time * 0.09 + object.userData.offset + object.userData.phase) % 1
      object.position.copy(object.userData.curve.getPoint(t).normalize().multiplyScalar(RADIUS * 1.134))
      if (object.material) object.material.opacity = 0.3 + Math.sin(t * Math.PI) * 0.5
    }
    if (object.userData.seasonalCurrent && object.material) {
      object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 1.2 + (object.userData.phase || 0)) * 0.055
    }
    if (object.userData.seasonalImpactPulse) {
      object.rotation.z += 0.003
      object.scale.setScalar(1 + Math.sin(time * 1.25 + (object.userData.phase || object.parent?.userData.phase || 0)) * 0.12)
      if (object.material) object.material.opacity = (object.userData.baseOpacity || object.material.opacity) + Math.sin(time * 1.3) * 0.08
    }
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

function getDynamicHit() {
  if (!props.earthDynamicMode || !dynamicGroup?.visible || !dynamicGroup.children.length) return null
  const hit = raycaster.intersectObjects(dynamicGroup.children, true)
    .find((item) => findDynamicFeature(item.object))
  return hit ? findDynamicFeature(hit.object) : null
}

function getOceanHit() {
  if (!props.oceanMode || !oceanGroup?.visible || !oceanGroup.children.length) return null
  const hit = raycaster.intersectObjects(oceanGroup.children, true)
    .find((item) => findOceanFeature(item.object))
  return hit ? findOceanFeature(hit.object) : null
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

function findDynamicFeature(object) {
  let current = object
  while (current) {
    if (current.userData?.dynamicFeature) return current.userData.dynamicFeature
    current = current.parent
  }
  return null
}

function findOceanFeature(object) {
  let current = object
  while (current) {
    if (current.userData?.oceanFeature) return current.userData.oceanFeature
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

  const dynamicHit = getDynamicHit()
  if (dynamicHit) {
    setHoverLabel(dynamicHit.feature?.name || '', event.clientX, event.clientY)
    setCursor('pointer')
    return
  }

  const oceanHit = getOceanHit()
  if (oceanHit) {
    setHoverLabel(oceanHit.feature?.name || '', event.clientX, event.clientY)
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
    setHoverLabel(civilizationHoverText(lastGeoHover) || lastGeoHover?.name || '', event.clientX, event.clientY)
  } else {
    coordinateReadout.value = ''
  }

  setCursor(earthHit ? 'crosshair' : hoverLabel.text ? 'pointer' : 'grab')
}

function civilizationHoverText(geoFeature) {
  if (!civilizationSurfaceActive() || !geoFeature?.id) return ''
  const metric = props.civilizationMetrics?.[geoFeature.id]
  const style = civilizationStyleForCountry(metric, props.civilizationLayer)
  return metric ? `${geoFeature.name} · ${style.value}` : geoFeature.name
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

  const dynamicHit = getDynamicHit()
  if (dynamicHit) {
    emit('dynamic-select', dynamicHit)
    return
  }

  const oceanHit = getOceanHit()
  if (oceanHit) {
    emit('ocean-select', oceanHit)
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
  const tectonicFocus = Boolean(props.terrainMode && props.terrainTectonicsMode && activeId)
  terrainGroup.children.forEach((marker) => {
    const active = marker.userData.terrainFeature?.id === activeId
    const muted = tectonicFocus && !active
    marker.scale.setScalar(active ? 1.06 : muted ? 0.96 : 1)
    marker.children.forEach((child) => {
      if (child.userData.terrainTextureGroup) {
        child.children.forEach((part) => {
          if (part.material) part.material.opacity = muted ? 0.035 : active ? 0.2 : 0.12
        })
      }
      if (!child.material) return
      if (child.userData.terrainPatch) child.material.opacity = muted ? 0.035 : active ? (tectonicFocus ? 0.14 : 0.34) : terrainPatchOpacity(marker.userData.terrainFeature?.type)
      if (child.userData.terrainBorder) child.material.opacity = muted ? 0.08 : active ? (tectonicFocus ? 0.32 : 0.82) : 0.34
      if (child.userData.terrainHalo) child.material.opacity = muted ? 0.035 : active ? (tectonicFocus ? 0.12 : 0.28) : 0.1
      if (child.userData.terrainBody) child.material.opacity = muted ? 0.1 : active ? (tectonicFocus ? 0.34 : 0.82) : 0.44
      if (child.userData.terrainTrace) child.material.opacity = muted ? 0.05 : active ? (tectonicFocus ? 0.24 : 0.58) : 0.24
      if (child.userData.terrainCone) child.material.opacity = muted ? 0.08 : active ? (tectonicFocus ? 0.28 : 0.48) : 0.3
    })
  })
}

function updateTerrainModeVisuals() {
  const terrainActive = Boolean(props.terrainMode)
  const civilizationActive = civilizationSurfaceActive()
  const exclusiveModeActive = Boolean(props.earthDynamicMode || props.oceanMode || props.seasonalMode)
  if (terrainActive) {
    layersVisible.terrain = true
    layersVisible.hotspots = false
    layersVisible.climate = false
  }
  if (terrainReliefOverlay) terrainReliefOverlay.visible = terrainActive && !civilizationActive && !exclusiveModeActive
  if (earth?.material?.normalScale) {
    earth.material.normalScale.setScalar(terrainActive && !exclusiveModeActive ? 0.72 : props.oceanMode || props.seasonalMode ? 0.22 : 0.36)
    earth.material.shininess = terrainActive && !exclusiveModeActive ? 10 : props.oceanMode || props.seasonalMode ? 22 : 16
  }
  if (clouds?.material) {
    clouds.visible = !civilizationActive
    clouds.material.opacity = props.seasonalMode ? 0.14 : 0.38
  }
  if (markerGroup) markerGroup.visible = HOTSPOTS_LAYER_ENABLED && layersVisible.hotspots && !props.cosmosMode && !terrainActive && !civilizationActive && !exclusiveModeActive
  if (terrainGroup) terrainGroup.visible = layersVisible.terrain && !props.cosmosMode && !civilizationActive && !exclusiveModeActive
  if (climateGroup) climateGroup.visible = layersVisible.climate && !props.cosmosMode && !terrainActive && !civilizationActive && !exclusiveModeActive
  if (civilizationGroup) civilizationGroup.visible = civilizationActive
  updateCivilizationBaseOverlays(civilizationActive)
  if (dynamicGroup) dynamicGroup.visible = Boolean(props.earthDynamicMode)
  if (oceanGroup) oceanGroup.visible = Boolean(props.oceanMode)
  if (seasonalGroup) seasonalGroup.visible = Boolean(props.seasonalMode)
  updateTectonicsLayer()
}

function updateTectonicsLayer() {
  if (!earthGroup) return
  clearTectonicsLayer()
  const story = props.activeTerrainFeature?.tectonics
  if (!props.terrainMode || !props.terrainTectonicsMode || !story?.plates?.length) return

  tectonicsGroup = new Group()
  tectonicsGroup.add(createTectonicBoundaryBand(story, props.activeTerrainFeature))
  story.plates.forEach((plate, index) => {
    tectonicsGroup.add(createTectonicArrow(plate, index, story.mode))
  })

  const center = latLngToVector3(
    props.activeTerrainFeature.latitude,
    props.activeTerrainFeature.longitude,
    RADIUS * 1.15
  )
  tectonicsGroup.add(createTectonicFocus(story, center))
  tectonicsGroup.add(createTextSprite(
    story.title,
    center.clone().normalize().multiplyScalar(RADIUS * 1.24),
    tectonicPalette(story.mode).label,
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

function createTectonicBoundaryBand(story, feature) {
  const group = new Group()
  const coords = tectonicBoundaryPath(story, feature)
  if (coords.length < 2) return group

  const palette = tectonicPalette(story.mode)
  const path = terrainSurfacePath(coords, RADIUS * 1.14)
  if (path.length < 2) return group
  const curve = new CatmullRomCurve3(path)
  const shadow = new Mesh(
    new TubeGeometry(curve, Math.max(96, path.length * 10), 0.024, 12, false),
    new MeshBasicMaterial({
      color: palette.shadow,
      transparent: true,
      opacity: 0.14,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  shadow.userData.tectonicBoundary = true
  group.add(shadow)

  const core = new Mesh(
    new TubeGeometry(curve, Math.max(96, path.length * 12), 0.0065, 10, false),
    new MeshBasicMaterial({
      color: palette.primary,
      transparent: true,
      opacity: 0.72,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  core.userData.tectonicBoundary = true
  group.add(core)

  const ridgeLine = new Line(
    new BufferGeometry().setFromPoints(path.map((point) => point.clone().normalize().multiplyScalar(RADIUS * 1.178))),
    new LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  ridgeLine.userData.tectonicBoundary = true
  group.add(ridgeLine)

  const ticks = tectonicBoundaryTickCount(story.mode)
  for (let index = 1; index <= ticks; index += 1) {
    const t = index / (ticks + 1)
    const point = curve.getPoint(t).normalize().multiplyScalar(RADIUS * 1.18)
    const tangent = curve.getTangent(t).normalize()
    const normal = point.clone().normalize()
    const side = new Vector3().crossVectors(normal, tangent).normalize()
    if (!Number.isFinite(side.x)) continue
    tectonicBoundaryGlyph(story.mode, point, tangent, side, palette).forEach((glyph) => group.add(glyph))
  }

  return group
}

function tectonicBoundaryPath(story, feature) {
  if (story?.boundary?.path?.length >= 2) return story.boundary.path
  if (feature?.shape?.kind === 'line' && feature.shape.path?.length >= 2) return feature.shape.path
  const center = [feature?.latitude || 0, feature?.longitude || 0]
  const plateTargets = story?.plates?.map((plate) => plate.to).filter(Boolean) || []
  if (plateTargets.length >= 2) return [plateTargets[0], center, plateTargets[1]]
  return [
    [center[0] - 2.2, center[1] - 3.2],
    center,
    [center[0] + 2.2, center[1] + 3.2]
  ]
}

function tectonicBoundaryGlyph(mode, point, tangent, side, palette) {
  const radius = RADIUS * 1.188
  const width = mode === 'transform' ? 0.082 : 0.058
  const forward = tangent.clone().multiplyScalar(width * 0.64)
  const lateral = side.clone().multiplyScalar(width)
  const glyphs = []

  if (mode === 'subduction' || mode === 'volcanic-arc') {
    const apex = point.clone().add(lateral).normalize().multiplyScalar(radius)
    const left = point.clone().add(forward).sub(lateral.clone().multiplyScalar(0.2)).normalize().multiplyScalar(radius)
    const right = point.clone().sub(forward).sub(lateral.clone().multiplyScalar(0.2)).normalize().multiplyScalar(radius)
    glyphs.push(createTectonicLine([left, apex, right], palette.secondary, 0.62))
    return glyphs
  }

  if (mode === 'divergence' || mode === 'spreading') {
    glyphs.push(createTectonicLine([
      point.clone().sub(lateral).normalize().multiplyScalar(radius),
      point.clone().sub(lateral.clone().multiplyScalar(0.22)).normalize().multiplyScalar(radius)
    ], palette.secondary, 0.52))
    glyphs.push(createTectonicLine([
      point.clone().add(lateral.clone().multiplyScalar(0.22)).normalize().multiplyScalar(radius),
      point.clone().add(lateral).normalize().multiplyScalar(radius)
    ], palette.secondary, 0.52))
    return glyphs
  }

  if (mode === 'transform') {
    glyphs.push(createTectonicLine([
      point.clone().sub(forward).add(lateral).normalize().multiplyScalar(radius),
      point.clone().add(forward).sub(lateral).normalize().multiplyScalar(radius)
    ], palette.secondary, 0.58))
    glyphs.push(createTectonicLine([
      point.clone().sub(forward).sub(lateral).normalize().multiplyScalar(radius),
      point.clone().add(forward).add(lateral).normalize().multiplyScalar(radius)
    ], palette.primary, 0.42))
    return glyphs
  }

  if (mode === 'hotspot') {
    glyphs.push(createTectonicLine([
      point.clone().sub(forward).normalize().multiplyScalar(radius),
      point.clone().add(forward).normalize().multiplyScalar(radius)
    ], palette.secondary, 0.34))
    return glyphs
  }

  glyphs.push(createTectonicLine([
    point.clone().sub(lateral).normalize().multiplyScalar(radius),
    point.clone().add(lateral).normalize().multiplyScalar(radius)
  ], palette.secondary, 0.46))
  glyphs.push(createTectonicLine([
    point.clone().sub(forward).normalize().multiplyScalar(radius),
    point.clone().add(forward).normalize().multiplyScalar(radius)
  ], 0xffffff, 0.25))
  return glyphs
}

function tectonicBoundaryTickCount(mode) {
  if (mode === 'hotspot') return 4
  if (mode === 'transform') return 10
  if (mode === 'collision') return 9
  return 8
}

function createTectonicLine(points, color, opacity) {
  const line = new Line(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  line.userData.tectonicBoundary = true
  return line
}

function createTectonicFocus(story, center) {
  const group = new Group()
  const palette = tectonicPalette(story.mode)
  const normal = center.clone().normalize()
  group.position.copy(center)
  group.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal)

  const ring = new Mesh(
    new TorusGeometry(0.16, 0.006, 10, 96),
    new MeshBasicMaterial({
      color: palette.label,
      transparent: true,
      opacity: 0.74,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  ring.userData.tectonicPulse = true
  group.add(ring)

  const core = new Mesh(
    new CircleGeometry(0.09, 48),
    new MeshBasicMaterial({
      color: palette.primary,
      transparent: true,
      opacity: story.mode === 'hotspot' ? 0.34 : 0.18,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )
  core.position.z = 0.002
  core.userData.tectonicPulse = true
  group.add(core)

  if (story.mode === 'hotspot') {
    const plume = new Mesh(
      new ConeGeometry(0.055, 0.22, 28),
      new MeshBasicMaterial({
        color: 0xff9f43,
        transparent: true,
        opacity: 0.7,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    plume.position.z = 0.06
    plume.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(0, 0, 1))
    plume.userData.tectonicPulse = true
    group.add(plume)
  }

  return group
}

function createTectonicArrow(plate, index, mode) {
  const group = new Group()
  const palette = tectonicPalette(mode, index)
  const color = palette.primary
  const startBase = latLngToVector3(plate.from[0], plate.from[1], RADIUS * 1.13)
  const endBase = latLngToVector3(plate.to[0], plate.to[1], RADIUS * 1.13)
  const tangentBase = endBase.clone().sub(startBase).normalize()
  const normal = startBase.clone().lerp(endBase, 0.5).normalize()
  const lateral = new Vector3().crossVectors(normal, tangentBase).normalize()
  const lanes = [-0.026, 0.026]

  lanes.forEach((lane, laneIndex) => {
    const start = startBase.clone().add(lateral.clone().multiplyScalar(lane)).normalize().multiplyScalar(RADIUS * 1.13)
    const end = endBase.clone().add(lateral.clone().multiplyScalar(lane)).normalize().multiplyScalar(RADIUS * 1.13)
    const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(RADIUS * (1.17 + laneIndex * 0.008))
    const curve = new CatmullRomCurve3([start, mid, end])
    const shaft = new Mesh(
      new TubeGeometry(curve, 72, 0.0075, 8, false),
      new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.58,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    shaft.userData.tectonicArrow = true
    group.add(shaft)

    const trace = new Line(
      new BufferGeometry().setFromPoints(Array.from({ length: 26 }, (_, step) =>
        curve.getPoint(step / 25).normalize().multiplyScalar(RADIUS * 1.19)
      )),
      new LineBasicMaterial({
        color: laneIndex === 0 ? 0xffffff : palette.secondary,
        transparent: true,
        opacity: laneIndex === 0 ? 0.28 : 0.2,
        blending: AdditiveBlending,
        depthWrite: false
      })
    )
    trace.userData.tectonicArrow = true
    group.add(trace)

    ;[0.46, 0.7].forEach((t) => {
      group.add(createTectonicChevron(curve, t, laneIndex === 0 ? palette.secondary : color))
    })
  })

  const mid = startBase.clone().lerp(endBase, 0.5).normalize().multiplyScalar(RADIUS * 1.17)
  const direction = endBase.clone().sub(mid).normalize()
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
  cone.position.copy(endBase.clone().normalize().multiplyScalar(RADIUS * 1.16))
  cone.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction)
  cone.userData.tectonicArrow = true
  group.add(cone)

  group.add(createTextSprite(plate.name, mid.clone().normalize().multiplyScalar(RADIUS * 1.2), color, 0.42))
  return group
}

function createTectonicChevron(curve, t, color) {
  const point = curve.getPoint(t).normalize().multiplyScalar(RADIUS * 1.19)
  const tangent = curve.getTangent(t).normalize()
  const normal = point.clone().normalize()
  const side = new Vector3().crossVectors(normal, tangent).normalize()
  const apex = point.clone().add(tangent.clone().multiplyScalar(0.052)).normalize().multiplyScalar(RADIUS * 1.192)
  const left = point.clone().sub(tangent.clone().multiplyScalar(0.046)).add(side.clone().multiplyScalar(0.035)).normalize().multiplyScalar(RADIUS * 1.192)
  const right = point.clone().sub(tangent.clone().multiplyScalar(0.046)).sub(side.clone().multiplyScalar(0.035)).normalize().multiplyScalar(RADIUS * 1.192)
  const line = new Line(
    new BufferGeometry().setFromPoints([left, apex, right]),
    new LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.52,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
  line.userData.tectonicArrow = true
  return line
}

function tectonicPalette(mode, index = 0) {
  const palettes = {
    collision: { primary: [0xffd27a, 0xf8fbff], secondary: 0xfff1b8, shadow: 0x7d521c, label: 0xffe19a },
    subduction: { primary: [0x8fd8ff, 0xffd27a], secondary: 0xeaf8ff, shadow: 0x17496d, label: 0xb8eaff },
    'volcanic-arc': { primary: [0x8fd8ff, 0xffb35c], secondary: 0xffe4b5, shadow: 0x5e3618, label: 0xffd27a },
    divergence: { primary: [0x63f7d6, 0x9ad4ff], secondary: 0xd8fff6, shadow: 0x0b5c5a, label: 0x9fffe8 },
    spreading: { primary: [0x7bdff2, 0x9ad4ff], secondary: 0xffffff, shadow: 0x0d4f72, label: 0xbbf7ff },
    transform: { primary: [0xff8cc6, 0xffd27a], secondary: 0xffffff, shadow: 0x70214a, label: 0xffc1df },
    hotspot: { primary: [0xff9f43, 0xfff2a6], secondary: 0xffefd1, shadow: 0x6f3210, label: 0xffd27a }
  }
  const palette = palettes[mode] || palettes.collision
  return {
    primary: palette.primary[index % palette.primary.length],
    secondary: palette.secondary,
    shadow: palette.shadow,
    label: palette.label
  }
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
  const activeType = props.activeClimateZone?.type
  climateGroup.children.forEach((zoneGroup) => {
    const active = zoneGroup.userData.climateZone?.id === activeId
    const sameType = activeType && zoneGroup.userData.climateType === activeType
    const isAnchor = zoneGroup.children.some((child) => child.userData.climateAnchorCore)
    zoneGroup.scale.setScalar(active && isAnchor ? 1.18 : 1)
    zoneGroup.children.forEach((child) => {
      if (!child.material) return
      if (child.userData.climateLatitudeBand) child.material.opacity = sameType ? 0.42 : 0.22
      if (child.userData.climateLatitudeEdge) child.material.opacity = sameType ? 0.78 : 0.42
      if (child.userData.climateDistributionPatch) child.material.opacity = sameType ? 0.26 : 0.11
      if (child.userData.climateDistributionEdge) child.material.opacity = sameType ? 0.58 : 0.26
      if (child.userData.climateDistributionLine) child.material.opacity = sameType ? 0.68 : 0.32
      if (child.userData.climateDistributionTrace) child.material.opacity = sameType ? 0.36 : 0.14
      if (child.userData.climateAnchorRing) child.material.opacity = active ? 0.9 : sameType ? 0.52 : 0.28
      if (child.userData.climateAnchorCore) child.material.opacity = active ? 1 : sameType ? 0.82 : 0.48
      if (
        child.userData.climateLatitudeBand ||
        child.userData.climateLatitudeEdge ||
        child.userData.climateDistributionPatch ||
        child.userData.climateDistributionEdge ||
        child.userData.climateDistributionLine ||
        child.userData.climateDistributionTrace ||
        child.userData.climateAnchorRing ||
        child.userData.climateAnchorCore
      ) {
        child.userData.baseOpacity = child.material.opacity
      }
    })
  })
}

function civilizationSurfaceActive() {
  return Boolean(props.civilizationMode && CIVILIZATION_SURFACE_LAYERS.has(props.civilizationLayer) && !props.cosmosMode && !props.earthDynamicMode && !props.oceanMode)
}

function updateCivilizationLayer() {
  if (!civilizationGroup) return
  const active = civilizationSurfaceActive()
  civilizationGroup.visible = active
  updateCivilizationBaseOverlays(active)

  civilizationPatches.forEach((patch) => {
    const metric = props.civilizationMetrics?.[patch.userData.civilizationCountry]
    const style = civilizationStyleForCountry(metric, props.civilizationLayer)
    patch.material.color.set(style.color)
    patch.material.opacity = style.opacity
    patch.visible = active
  })

  if (active) {
    if (markerGroup) markerGroup.visible = false
    if (terrainGroup) terrainGroup.visible = false
    if (climateGroup) climateGroup.visible = false
    if (boundaryGroups.countries) boundaryGroups.countries.visible = true
  } else if (boundaryGroups.countries) {
    boundaryGroups.countries.visible = layersVisible.countries
  }

  if (boundaryMaterials.countries) updateBoundaryVisibility()
}

function updateCivilizationBaseOverlays(active) {
  if (clouds) clouds.visible = !active
  if (nightLights) nightLights.visible = props.cosmosMode && !active
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
  if ((props.earthDynamicMode || props.oceanMode || props.seasonalMode) && (layer === 'hotspots' || layer === 'terrain' || layer === 'climate')) return
  if (civilizationSurfaceActive() && (layer === 'hotspots' || layer === 'terrain' || layer === 'climate')) return
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
  if (layer === 'graticule') {
    if (graticuleGroup) graticuleGroup.visible = layersVisible.graticule
    return
  }
  if (boundaryGroups[layer]) boundaryGroups[layer].visible = layersVisible[layer]
}

function orientToLatLng(lat, lng) {
  if (!camera || !controls) return
  const distance = camera.position.length()
  const dir = worldDirectionForLatLng(lat, lng)
  targetCameraPosition = dir.multiplyScalar(distance)
  targetCameraPosition.y += 0.18
  targetControlPoint = new Vector3(0, 0, 0)
  cameraAnimating.value = true
  controls.autoRotate = false
}

function resetCameraHome() {
  if (!camera || !controls) return
  clearTimeout(autoRotateTimer)
  targetCameraPosition = CAMERA_HOME.clone()
  targetControlPoint = new Vector3(0, 0, 0)
  isFocused.value = false
  cameraAnimating.value = true
  controls.enableRotate = true
  controls.enableZoom = true
  controls.autoRotate = false
}

function focusToLatLng(lat, lng) {
  const target = worldDirectionForLatLng(lat, lng)
  const immersiveMode = props.earthDynamicMode || props.oceanMode || props.seasonalMode
  const modeFocusDistance = props.earthDynamicMode ? 3.22 : props.oceanMode ? 3.34 : props.seasonalMode ? 3.48 : 3.95
  const modeTargetDepth = immersiveMode ? 0.86 : 0.35
  const modeLift = immersiveMode ? 0.18 : 0.36
  clearTimeout(autoRotateTimer)
  targetCameraPosition = target.clone().multiplyScalar(modeFocusDistance)
  targetCameraPosition.y += modeLift
  targetControlPoint = target.clone().multiplyScalar(modeTargetDepth)
  isFocused.value = true
  cameraAnimating.value = true
  controls.autoRotate = false
}

function worldDirectionForLatLng(lat, lng) {
  const direction = latLngToVector3(lat, lng, 1).normalize()
  if (earthGroup) direction.applyQuaternion(earthGroup.quaternion).normalize()
  return direction
}

function releaseFocus() {
  ensureControlsFree()
}

function updateBoundaryVisibility() {
  const distance = camera.position.length()
  const near = MathUtils.clamp((6.8 - distance) / 3.2, 0, 1)
  const countryBoundaryActive = layersVisible.countries || civilizationSurfaceActive()
  if (boundaryGroups.countries) boundaryGroups.countries.visible = countryBoundaryActive
  boundaryMaterials.countries.opacity = countryBoundaryActive ? 0.08 + near * (civilizationSurfaceActive() ? 0.2 : 0.32) : 0
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
        if (child.userData.climateLatitudeBand) {
          child.material.opacity = (child.userData.baseOpacity || child.material.opacity) + Math.sin(time * 0.45 + (child.userData.phase || 0)) * 0.012
        }
        if (child.userData.climateLatitudeEdge) {
          child.material.opacity = (child.userData.baseOpacity || child.material.opacity) + Math.sin(time * 0.5 + zoneGroup.userData.phase) * 0.04
        }
        if (child.userData.climateDistributionPatch) {
          child.material.opacity = (child.userData.baseOpacity || child.material.opacity) + Math.sin(time * 0.8 + (child.userData.phase || 0)) * 0.018
        }
        if (child.userData.climateAnchorRing) {
          child.scale.setScalar(pulse)
          child.rotation.z += 0.003
          child.material.opacity = (child.userData.baseOpacity || child.material.opacity) + Math.max(0, Math.sin(time * 1.25 + zoneGroup.userData.phase)) * 0.08
        }
        if (child.userData.climateAnchorCore) {
          child.scale.setScalar(1 + Math.sin(time * 1.3 + zoneGroup.userData.phase) * 0.08)
        }
      })
    })
  }
  if (tectonicsGroup?.visible) {
    tectonicsGroup.children.forEach((child, index) => {
      if (child.userData.tectonicPulse) {
        child.scale.setScalar(1 + Math.sin(time * 2.2) * 0.22)
        if (child.material) child.material.opacity = 0.54 + Math.sin(time * 2.2) * 0.22
      }
      child.children?.forEach((part) => {
        if (part.userData.tectonicPulse) {
          const pulse = 1 + Math.sin(time * 2 + index * 0.2) * 0.18
          part.scale.setScalar(pulse)
          if (part.material) part.material.opacity = 0.42 + Math.max(0, Math.sin(time * 2 + index)) * 0.28
        }
        if (part.userData.tectonicArrow && part.material) {
          part.material.opacity = 0.52 + Math.sin(time * 1.4 + index) * 0.12
        }
        if (part.userData.tectonicBoundary && part.material) {
          part.material.opacity = 0.22 + Math.max(0, Math.sin(time * 1.1 + index * 0.35)) * 0.18
        }
      })
    })
  }

  animateRouteLayer(time)
  animateCosmosLayer(time)
  animateDynamicLayer(time)
  animateOceanLayer(time)
  animateSeasonalLayer(time)

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
    const immersiveCamera = props.earthDynamicMode || props.oceanMode || props.seasonalMode
    camera.position.lerp(targetCameraPosition, immersiveCamera ? 0.078 : 0.035)
    controls.target.lerp(targetControlPoint, immersiveCamera ? 0.09 : 0.04)
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
