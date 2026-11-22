// Builds and controls the interactive Three.js Earth globe and its scene assets.
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Globe, Pause, Play, SlidersHorizontal, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { geoEquirectangular, geoGraticule10, geoPath } from 'd3-geo'
import { feature, mesh } from 'topojson-client'
import countriesTopology from 'world-atlas/countries-110m.json'

const countries = feature(countriesTopology, countriesTopology.objects.countries)
const countryBorders = mesh(
  countriesTopology,
  countriesTopology.objects.countries,
  (first, second) => first !== second,
)
const graticule = geoGraticule10()
const cityLights = [
  [-122.33, 47.6, 0.6],
  [-118.24, 34.05, 0.78],
  [-87.63, 41.88, 0.62],
  [-74.01, 40.71, 0.95],
  [-99.13, 19.43, 0.84],
  [-46.63, -23.55, 0.94],
  [-43.2, -22.91, 0.72],
  [-3.7, 40.42, 0.72],
  [-0.12, 51.51, 0.82],
  [2.35, 48.86, 0.72],
  [13.4, 52.52, 0.68],
  [28.98, 41.01, 0.7],
  [31.24, 30.04, 0.76],
  [55.27, 25.2, 0.78],
  [72.88, 19.08, 0.84],
  [77.21, 28.61, 0.86],
  [90.41, 23.81, 0.68],
  [116.41, 39.9, 0.88],
  [121.47, 31.23, 0.92],
  [126.98, 37.57, 0.76],
  [139.69, 35.68, 0.95],
  [151.21, -33.87, 0.72],
]
const viewWidth = 1000
const viewHeight = 684
const globeRadius = 1.84
const earthStyles = {
  natural: { tint: '#ffffff', dayBrightness: 1, cityLights: 2.8, atmosphere: '#5dcaff' },
  night: { tint: '#aebddb', dayBrightness: 0.58, cityLights: 5.4, atmosphere: '#8b94ff' },
  blueprint: { tint: '#83d7ff', dayBrightness: 0.86, cityLights: 0.45, atmosphere: '#55cfff' },
}

// Draws country, border, and graticule layers into a reusable Earth map texture.
function createMapTexture(THREE, anisotropy) {
  const width = 1536
  const height = 768
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height

  const ocean = context.createLinearGradient(0, 0, 0, height)
  ocean.addColorStop(0, '#55b9ee')
  ocean.addColorStop(1, '#174b94')
  context.fillStyle = ocean
  context.fillRect(0, 0, width, height)

  const projection = geoEquirectangular()
    .translate([width / 2, height / 2])
    .scale(width / (2 * Math.PI))
  const path = geoPath(projection, context)

  context.beginPath()
  path(countries)
  const land = context.createLinearGradient(0, 80, 0, height - 50)
  land.addColorStop(0, '#f7fbff')
  land.addColorStop(1, '#c7def4')
  context.fillStyle = land
  context.fill()

  context.beginPath()
  path(countryBorders)
  context.strokeStyle = 'rgba(30, 82, 143, .58)'
  context.lineWidth = 1
  context.stroke()

  context.beginPath()
  path(graticule)
  context.strokeStyle = 'rgba(255, 255, 255, .3)'
  context.lineWidth = 1
  context.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = anisotropy
  return texture
}

// Creates a generated night-side texture with representative city-light glows.
function createFallbackNightTexture(THREE, anisotropy) {
  const width = 1536
  const height = 768
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  context.fillStyle = '#000'
  context.fillRect(0, 0, width, height)

  const projection = geoEquirectangular()
    .translate([width / 2, height / 2])
    .scale(width / (2 * Math.PI))

  cityLights.forEach(([longitude, latitude, intensity]) => {
    const point = projection([longitude, latitude])
    if (!point) return
    const radius = 8 + intensity * 10
    const glow = context.createRadialGradient(point[0], point[1], 0, point[0], point[1], radius)
    glow.addColorStop(0, `rgba(255, 219, 148, ${intensity * 0.85})`)
    glow.addColorStop(0.24, `rgba(255, 179, 87, ${intensity * 0.42})`)
    glow.addColorStop(1, 'rgba(255, 152, 72, 0)')
    context.fillStyle = glow
    context.fillRect(point[0] - radius, point[1] - radius, radius * 2, radius * 2)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = anisotropy
  return texture
}

// Calculates the sun's approximate direction from the supplied UTC date.
function getSolarDirection(THREE, date) {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1)
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const nextYearStart = Date.UTC(date.getUTCFullYear() + 1, 0, 1)
  const dayOfYear = Math.floor((today - yearStart) / 86400000) + 1
  const daysInYear = (nextYearStart - yearStart) / 86400000
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const gamma = (2 * Math.PI / daysInYear) * (dayOfYear - 1 + (hour - 12) / 24)
  const equationOfTime = 229.18 * (
    0.000075
    + 0.001868 * Math.cos(gamma)
    - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma)
    - 0.040849 * Math.sin(2 * gamma)
  )
  const declination = 0.006918
    - 0.399912 * Math.cos(gamma)
    + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma)
    + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma)
    + 0.00148 * Math.sin(3 * gamma)
  const longitude = THREE.MathUtils.degToRad((12 - hour - equationOfTime / 60) * 15)
  return new THREE.Vector3(
    Math.cos(declination) * Math.cos(longitude),
    Math.sin(declination),
    -Math.cos(declination) * Math.sin(longitude),
  ).normalize()
}

// Generates a repeatable procedural cloud texture.
function createCloudTexture(THREE, anisotropy) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = 1024
  canvas.height = 512
  let seed = 73421
  // Supplies deterministic pseudo-random values for cloud placement.
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  for (let index = 0; index < 260; index += 1) {
    const x = random() * canvas.width
    const y = random() * canvas.height
    const radiusX = 12 + random() * 65
    const radiusY = 3 + random() * 14
    const rotation = (random() - 0.5) * 0.8
    const opacity = 0.1 + random() * 0.24
    context.save()
    context.translate(x, y)
    context.rotate(rotation)
    context.scale(1, radiusY / radiusX)
    const cloud = context.createRadialGradient(0, 0, radiusX * 0.08, 0, 0, radiusX)
    cloud.addColorStop(0, `rgba(255,255,255,${opacity})`)
    cloud.addColorStop(0.55, `rgba(255,255,255,${opacity * 0.72})`)
    cloud.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = cloud
    context.fillRect(-radiusX, -radiusX, radiusX * 2, radiusX * 2)
    context.restore()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = anisotropy
  return texture
}

// Assembles a detailed satellite model from reusable Three.js geometry.
function createSatellite(THREE) {
  const satellite = new THREE.Group()
  const frame = new THREE.MeshStandardMaterial({ color: '#8297a5', metalness: 0.42, roughness: 0.3 })
  const foil = new THREE.MeshStandardMaterial({
    color: '#e1bd74',
    metalness: 0.32,
    roughness: 0.38,
    emissive: '#4c3210',
    emissiveIntensity: 0.32,
  })
  const foilShadow = new THREE.MeshStandardMaterial({ color: '#aa8954', metalness: 0.35, roughness: 0.42 })
  const silver = new THREE.MeshStandardMaterial({
    color: '#e3edf2',
    metalness: 0.4,
    roughness: 0.24,
    emissive: '#15232c',
    emissiveIntensity: 0.25,
  })
  const radiator = new THREE.MeshStandardMaterial({ color: '#bdcbd0', metalness: 0.38, roughness: 0.34 })
  const dark = new THREE.MeshStandardMaterial({ color: '#35495a', metalness: 0.36, roughness: 0.32 })
  const panelBase = new THREE.MeshStandardMaterial({ color: '#071326', metalness: 0.45, roughness: 0.34 })
  const solarCells = [
    new THREE.MeshStandardMaterial({ color: '#3479ba', metalness: 0.24, roughness: 0.28, emissive: '#174d82', emissiveIntensity: 0.62 }),
    new THREE.MeshStandardMaterial({ color: '#5599d2', metalness: 0.2, roughness: 0.3, emissive: '#24639b', emissiveIntensity: 0.54 }),
    new THREE.MeshStandardMaterial({ color: '#2864a5', metalness: 0.28, roughness: 0.27, emissive: '#12467c', emissiveIntensity: 0.62 }),
  ]
  const redLight = new THREE.MeshStandardMaterial({ color: '#fa6257', emissive: '#ba201a', emissiveIntensity: 1.1 })
  const greenLight = new THREE.MeshStandardMaterial({ color: '#8bf1c1', emissive: '#15986a', emissiveIntensity: 0.9 })
  // Creates a box geometry with the requested dimensions.
  const box = (width, height, depth) => new THREE.BoxGeometry(width, height, depth)
  // Adds a positioned box mesh to the satellite model.
  const addBox = (geometry, material, position, rotation) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...position)
    if (rotation) mesh.rotation.set(...rotation)
    satellite.add(mesh)
    return mesh
  }
  // Adds a rod between two 3D points and aligns it to their direction.
  const addRod = (start, end, radius, material, segments = 8) => {
    const from = new THREE.Vector3(...start)
    const to = new THREE.Vector3(...end)
    const direction = new THREE.Vector3().subVectors(to, from)
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), segments), material)
    rod.position.copy(from).add(to).multiplyScalar(0.5)
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
    satellite.add(rod)
    return rod
  }
  // Adds a positioned and rotated cylinder mesh to the satellite model.
  const addCylinder = (radiusTop, radiusBottom, height, material, position, rotation = [0, 0, 0], segments = 12) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material)
    mesh.position.set(...position)
    mesh.rotation.set(...rotation)
    satellite.add(mesh)
    return mesh
  }
  // Adds a positioned sphere mesh to the satellite model.
  const addSphere = (radius, material, position, segments = 8) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments), material)
    mesh.position.set(...position)
    satellite.add(mesh)
    return mesh
  }

  const bus = box(0.3, 0.27, 0.26)
  addBox(bus, frame, [0, 0, 0])
  addBox(box(0.25, 0.215, 0.012), foil, [0, 0.015, 0.138])
  addBox(box(0.25, 0.215, 0.012), foilShadow, [0, 0.015, -0.138])
  addBox(box(0.012, 0.21, 0.22), foil, [0.157, 0.015, 0])
  addBox(box(0.012, 0.21, 0.22), foilShadow, [-0.157, 0.015, 0])
  addBox(box(0.26, 0.012, 0.23), radiator, [0, 0.148, 0])
  addBox(box(0.26, 0.012, 0.23), dark, [0, -0.148, 0])

  const edgeRail = box(0.014, 0.014, 0.3)
  for (const x of [-0.145, 0.145]) {
    for (const y of [-0.13, 0.13]) addBox(edgeRail, silver, [x, y, 0])
  }
  for (const z of [-0.126, 0.126]) {
    for (const y of [-0.13, 0.13]) addBox(box(0.27, 0.014, 0.014), silver, [0, y, z])
  }

  for (const x of [-0.108, 0.108]) {
    for (const y of [-0.084, 0.084]) {
      addSphere(0.009, silver, [x, y, 0.149], 8)
      addSphere(0.009, silver, [x, y, -0.149], 8)
    }
  }
  addBox(box(0.085, 0.055, 0.018), dark, [0, -0.025, 0.152])
  addBox(box(0.048, 0.012, 0.008), silver, [0, -0.024, 0.165])
  for (let pin = -2; pin <= 2; pin += 1) {
    addBox(box(0.003, 0.016, 0.004), foil, [pin * 0.008, -0.024, 0.17])
  }
  for (const x of [-0.12, 0.12]) {
    for (const z of [-0.09, 0.09]) {
      addBox(box(0.018, 0.018, 0.01), dark, [x, 0.04, z])
    }
  }
  addSphere(0.012, redLight, [0.13, 0.105, 0.02])
  addSphere(0.012, greenLight, [-0.13, 0.105, 0.02])

  const panelBaseGeometry = box(0.58, 0.014, 0.36)
  const cellGeometry = box(0.102, 0.008, 0.102)
  const cellRail = box(0.008, 0.014, 0.36)
  const panelEdge = box(0.58, 0.018, 0.009)
  const cellInstances = solarCells.map((material) => new THREE.InstancedMesh(cellGeometry, material, 10))
  const cellInstanceCounts = solarCells.map(() => 0)
  const cellTransform = new THREE.Object3D()
  cellInstances.forEach((instances) => satellite.add(instances))
  for (const side of [-1, 1]) {
    const centerX = side * 0.51
    addCylinder(0.027, 0.027, 0.06, silver, [side * 0.18, 0, 0], [0, 0, Math.PI / 2])
    addCylinder(0.018, 0.018, 0.1, dark, [side * 0.22, 0, 0], [0, 0, Math.PI / 2])
    addBox(panelBaseGeometry, panelBase, [centerX, 0, 0])

    for (let column = 0; column < 5; column += 1) {
      for (let row = 0; row < 3; row += 1) {
        const x = centerX + (column - 2) * 0.108
        const z = (row - 1) * 0.109
        const materialIndex = (column + row) % solarCells.length
        cellTransform.position.set(x, 0.012, z)
        cellTransform.updateMatrix()
        cellInstances[materialIndex].setMatrixAt(cellInstanceCounts[materialIndex]++, cellTransform.matrix)
      }
    }

    for (let line = -2; line <= 2; line += 1) {
      addBox(cellRail, silver, [centerX + line * 0.108, 0.012, 0])
    }
    for (const edge of [-1, 1]) {
      addBox(panelEdge, silver, [centerX, 0, edge * 0.177])
      addRod([centerX - 0.28, 0.014, edge * 0.177], [centerX + 0.28, 0.014, edge * 0.177], 0.004, silver, 6)
    }
    addRod([side * 0.22, 0, 0], [side * 0.25, 0, 0], 0.012, foil, 8)
    addRod([side * 0.24, -0.012, -0.12], [centerX - side * 0.22, -0.012, -0.12], 0.006, frame, 6)
    addRod([side * 0.24, -0.012, 0.12], [centerX - side * 0.22, -0.012, 0.12], 0.006, frame, 6)
  }
  cellInstances.forEach((instances) => {
    instances.instanceMatrix.needsUpdate = true
  })

  const dishRadius = 0.145
  const dishGeometry = new THREE.BufferGeometry()
  const dishPositions = [0, 0, 0]
  const dishIndices = []
  const rings = 8
  const segments = 32
  for (let ring = 1; ring <= rings; ring += 1) {
    const radius = dishRadius * ring / rings
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = segment / segments * Math.PI * 2
      dishPositions.push(radius * Math.cos(angle), radius * Math.sin(angle), -0.035 * (radius / dishRadius) ** 2)
    }
  }
  for (let segment = 0; segment < segments; segment += 1) {
    dishIndices.push(0, 1 + segment, 1 + (segment + 1) % segments)
  }
  for (let ring = 1; ring < rings; ring += 1) {
    const innerStart = 1 + (ring - 1) * segments
    const outerStart = 1 + ring * segments
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments
      dishIndices.push(
        innerStart + segment, outerStart + segment, outerStart + next,
        innerStart + segment, outerStart + next, innerStart + next,
      )
    }
  }
  dishGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dishPositions, 3))
  dishGeometry.setIndex(dishIndices)
  dishGeometry.computeVertexNormals()
  const dish = new THREE.Mesh(dishGeometry, new THREE.MeshStandardMaterial({
    color: '#e5e9e9',
    metalness: 0.82,
    roughness: 0.24,
    side: THREE.DoubleSide,
  }))
  dish.position.set(0, 0.015, 0.202)
  satellite.add(dish)
  const dishRim = new THREE.Mesh(
    new THREE.TorusGeometry(dishRadius, 0.006, 6, 32),
    silver,
  )
  dishRim.position.copy(dish.position)
  satellite.add(dishRim)
  for (let spoke = 0; spoke < 8; spoke += 1) {
    const angle = spoke / 8 * Math.PI * 2
    addRod(
      [0, 0.015, 0.207],
      [Math.cos(angle) * dishRadius, 0.015 + Math.sin(angle) * dishRadius, 0.202],
      0.0025,
      foil,
      5,
    )
  }
  addRod([0, 0.015, 0.207], [0, 0.015, 0.32], 0.004, silver, 6)
  addCylinder(0.014, 0.03, 0.06, foil, [0, 0.015, 0.32], [Math.PI / 2, 0, 0])
  addSphere(0.018, silver, [0, 0.015, 0.355], 10)

  for (const side of [-1, 1]) {
    addCylinder(0.026, 0.032, 0.027, silver, [side * 0.09, 0.163, -0.04], [0, 0, 0])
    addRod([side * 0.09, 0.17, -0.04], [side * 0.12, 0.29, -0.06], 0.004, frame, 6)
    addSphere(0.01, foil, [side * 0.12, 0.29, -0.06], 8)
  }

  addCylinder(0.049, 0.054, 0.05, silver, [0, 0.005, -0.175], [Math.PI / 2, 0, 0], 16)
  addCylinder(0.039, 0.043, 0.025, dark, [0, 0.005, -0.211], [Math.PI / 2, 0, 0], 16)
  addCylinder(0.029, 0.033, 0.018, foilShadow, [0, 0.005, -0.232], [Math.PI / 2, 0, 0], 16)
  addCylinder(0.021, 0.024, 0.012, dark, [0, 0.005, -0.247], [Math.PI / 2, 0, 0], 16)
  addSphere(0.016, new THREE.MeshStandardMaterial({
    color: '#62b8e9',
    metalness: 0.25,
    roughness: 0.14,
    emissive: '#164b75',
    emissiveIntensity: 0.3,
  }), [0, 0.005, -0.256], 12)

  for (const side of [-1, 1]) {
    addCylinder(0.009, 0.012, 0.052, silver, [side * 0.11, -0.145, 0.065], [0, 0, 0], 8)
    addCylinder(0.006, 0.008, 0.035, dark, [side * 0.11, -0.184, 0.065], [0, 0, 0], 8)
  }

  return satellite
}

// Creates the rendered Earth, orbiting satellites, animation, and cleanup controller.
function createGlobeScene(THREE, canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setSize(viewWidth, viewHeight, false)
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.92
  const anisotropy = renderer.capabilities.getMaxAnisotropy()

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, viewWidth / viewHeight, 0.1, 100)
  camera.position.set(0, 0, 7.5)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.HemisphereLight(0xc9ecff, 0x17223a, 0.88))
  scene.add(new THREE.AmbientLight(0x9ab8e8, 0.28))
  const sun = new THREE.DirectionalLight(0xffffff, 2.8)
  scene.add(sun)
  const rimLight = new THREE.DirectionalLight(0x6abaff, 0.85)
  rimLight.position.set(4, -2, -3)
  scene.add(rimLight)

  const globe = new THREE.Group()
  scene.add(globe)

  const ownedTextures = new Set()
  const simpleMapTexture = createMapTexture(THREE, anisotropy)
  let activeMapTexture = simpleMapTexture
  let nightMapTexture = createFallbackNightTexture(THREE, anisotropy)
  ownedTextures.add(activeMapTexture)
  ownedTextures.add(nightMapTexture)
  let earthNormalTexture = null
  let earthSpecularTexture = null
  let isDisposed = false
  let compiledGlobeShader = null
  let activeEarthStyle = earthStyles.natural
  let viewMode = 'globe'

  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: '#fff',
    map: activeMapTexture,
    shininess: 10,
    specular: '#354c59',
  })
  const mapMaterial = new THREE.MeshBasicMaterial({ map: simpleMapTexture })
  sphereMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uNightMap = { value: nightMapTexture }
    shader.uniforms.uSunDirectionWorld = { value: new THREE.Vector3(1, 0, 0) }
    shader.uniforms.uDayBrightness = { value: activeEarthStyle.dayBrightness }
    shader.uniforms.uNightLightIntensity = { value: activeEarthStyle.cityLights }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vEarthWorldNormal;')
      .replace(
        '#include <beginnormal_vertex>',
        '#include <beginnormal_vertex>\nvEarthWorldNormal = normalize(mat3(modelMatrix) * objectNormal);',
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D uNightMap;
        uniform vec3 uSunDirectionWorld;
        uniform float uDayBrightness;
        uniform float uNightLightIntensity;
        varying vec3 vEarthWorldNormal;`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float earthDayFactor = smoothstep(-0.14, 0.11, dot(normalize(vEarthWorldNormal), normalize(uSunDirectionWorld)));
        diffuseColor.rgb *= mix(0.18, uDayBrightness, earthDayFactor);
        vec3 cityLightColor = texture2D(uNightMap, vMapUv).rgb * vec3(1.0, 0.75, 0.46);`,
      )
      .replace(
        '#include <opaque_fragment>',
        `outgoingLight += cityLightColor * (1.0 - earthDayFactor) * uNightLightIntensity;
        #include <opaque_fragment>`,
      )
    compiledGlobeShader = shader
  }
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(globeRadius, 112, 80), sphereMaterial)
  globe.add(sphere)

  const cloudTexture = createCloudTexture(THREE, anisotropy)
  ownedTextures.add(cloudTexture)
  const cloudMaterial = new THREE.MeshPhongMaterial({
    color: '#fff',
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    side: THREE.DoubleSide,
    map: cloudTexture,
  })
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(globeRadius * 1.012, 96, 64),
    cloudMaterial,
  )
  globe.add(clouds)

  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color('#5dcaff') } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDirection;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDirection = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying vec3 vNormal;
      varying vec3 vViewDirection;
      void main() {
        float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0), 2.35);
        gl_FragColor = vec4(glowColor, rim * 0.48);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(globeRadius * 1.038, 64, 48),
    atmosphereMaterial,
  )
  atmosphere.renderOrder = 3
  globe.add(atmosphere)

  const satelliteOrbitSettings = [
    { rotation: [0.76, -Math.PI / 2, -0.18], speed: 0.035, radius: 2.28, scale: 0.37 },
    { rotation: [-0.88, -Math.PI / 2 + 1.25, 0.32], speed: -0.03, radius: 2.42, scale: 0.35 },
    { rotation: [0.42, -Math.PI / 2 - 1.65, -0.6], speed: 0.026, radius: 2.34, scale: 0.34 },
    { rotation: [-0.53, -Math.PI / 2 + 2.6, 0.2], speed: -0.022, radius: 2.46, scale: 0.36 },
  ]
  const satelliteOrbits = satelliteOrbitSettings.map(({ rotation }) => {
    const orbit = new THREE.Group()
    orbit.rotation.set(...rotation)
    return orbit
  })
  const satellites = satelliteOrbitSettings.map(({ radius, scale }, index) => {
    const satellite = createSatellite(THREE)
    satellite.scale.setScalar(scale)
    satellite.position.set(radius, 0, 0)
    satellite.rotation.set(index * 0.3, index * 0.7, index * -0.2)
    return satellite
  })
  satelliteOrbits.forEach((orbit, index) => {
    orbit.add(satellites[index])
    scene.add(orbit)
  })

  // Loads an Earth texture and registers it for cleanup when available.
  function loadEarthTexture(url, onLoad, colorSpace = THREE.SRGBColorSpace) {
    new THREE.TextureLoader().load(url, (texture) => {
      if (isDisposed) {
        texture.dispose()
        return
      }
      texture.colorSpace = colorSpace
      texture.anisotropy = anisotropy
      ownedTextures.add(texture)
      onLoad(texture)
    }, undefined, (error) => {
      if (!isDisposed) console.warn(`Earth texture unavailable at ${url}; keeping the generated fallback.`, error)
    })
  }

  loadEarthTexture('/images/earth-day.jpg', (texture) => {
    const previousTexture = activeMapTexture
    activeMapTexture = texture
    sphereMaterial.map = viewMode === 'map' ? simpleMapTexture : texture
    sphereMaterial.normalMap = viewMode === 'map' ? null : earthNormalTexture
    sphereMaterial.specularMap = viewMode === 'map' ? null : earthSpecularTexture
    sphereMaterial.needsUpdate = true
    if (previousTexture && previousTexture !== texture && previousTexture !== simpleMapTexture) {
      previousTexture.dispose()
      ownedTextures.delete(previousTexture)
    }
  })

  loadEarthTexture('/images/earth-night.jpg', (texture) => {
    const previousTexture = nightMapTexture
    nightMapTexture = texture
    if (compiledGlobeShader) compiledGlobeShader.uniforms.uNightMap.value = texture
    if (previousTexture && previousTexture !== texture) {
      previousTexture.dispose()
      ownedTextures.delete(previousTexture)
    }
  })

  loadEarthTexture('/images/earth-normal.png', (texture) => {
    earthNormalTexture = texture
    if (viewMode === 'globe') {
      sphereMaterial.normalMap = texture
      sphereMaterial.needsUpdate = true
    }
  }, THREE.NoColorSpace)

  loadEarthTexture('/images/earth-specular.png', (texture) => {
    earthSpecularTexture = texture
    if (viewMode === 'globe') {
      sphereMaterial.specularMap = texture
      sphereMaterial.needsUpdate = true
    }
  }, THREE.NoColorSpace)

  loadEarthTexture('/images/earth-clouds.jpg', (texture) => {
    const previousTexture = cloudMaterial.map
    cloudMaterial.map = null
    cloudMaterial.alphaMap = texture
    cloudMaterial.needsUpdate = true
    if (previousTexture && previousTexture !== texture) {
      previousTexture.dispose()
      ownedTextures.delete(previousTexture)
    }
  }, THREE.NoColorSpace)

  let startTime = null
  let lastRenderTime = null
  let rotationY = -Math.PI / 2
  let rotationX = 0
  let rotationSpeed = 0.09
  let rotationPaused = false
  let cloudsEnabled = true
  let atmosphereEnabled = true
  let satellitesEnabled = true

  // Updates animated globe elements and renders the current frame.
  function render(time) {
    if (startTime === null) startTime = time
    const deltaSeconds = lastRenderTime === null ? 0 : Math.min((time - lastRenderTime) * 0.001, 0.1)
    lastRenderTime = time
    const seconds = (time - startTime) * 0.001
    if (!rotationPaused) rotationY += deltaSeconds * rotationSpeed
    globe.rotation.set(rotationX, rotationY, 0)
    clouds.rotation.y = seconds * 0.00011
    satelliteOrbits.forEach((orbit, index) => {
      orbit.rotation.y = satelliteOrbitSettings[index].rotation[1] + seconds * satelliteOrbitSettings[index].speed
      satellites[index].rotation.z = Math.sin(seconds * 0.24 + index) * 0.08
      satellites[index].rotation.x = index * 0.3 + Math.sin(seconds * 0.18 + index) * 0.06
    })

    globe.updateMatrixWorld(true)
    const sunDirection = getSolarDirection(THREE, new Date())
      .applyQuaternion(globe.quaternion)
      .normalize()
    sun.position.copy(sunDirection).multiplyScalar(5)
    if (compiledGlobeShader) {
      compiledGlobeShader.uniforms.uSunDirectionWorld.value.copy(sunDirection)
    }
    renderer.render(scene, camera)
  }

  return {
    render,
    // Sets the globe's automatic rotation rate.
    setRotationSpeed(speed) {
      rotationSpeed = speed
    },
    // Pauses or resumes automatic globe rotation.
    setRotationPaused(paused) {
      rotationPaused = paused
    },
    // Applies user drag offsets and immediately renders the updated view.
    rotateBy(horizontal, vertical) {
      rotationY += horizontal
      rotationX = THREE.MathUtils.clamp(rotationX + vertical, -1.2, 1.2)
      globe.rotation.set(rotationX, rotationY, 0)
      render(performance.now())
    },
    // Releases textures, scene materials, geometry, and the WebGL renderer.
    dispose() {
      isDisposed = true
      ownedTextures.forEach((texture) => texture.dispose())
      const inactiveEarthMaterial = viewMode === 'map' ? sphereMaterial : mapMaterial
      scene.traverse((object) => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material?.dispose()
        }
      })
      inactiveEarthMaterial.dispose()
      renderer.dispose()
    },
    // Applies a color and lighting preset to the Earth and atmosphere.
    setEarthStyle(style) {
      const settings = earthStyles[style]
      if (!settings) throw new RangeError(`Unknown Earth style: ${style}`)
      activeEarthStyle = settings
      sphereMaterial.color.set(settings.tint)
      mapMaterial.color.set(settings.tint)
      atmosphereMaterial.uniforms.glowColor.value.set(settings.atmosphere)
      if (compiledGlobeShader) {
        compiledGlobeShader.uniforms.uDayBrightness.value = settings.dayBrightness
        compiledGlobeShader.uniforms.uNightLightIntensity.value = settings.cityLights
      }
      render(performance.now())
    },
    // Switches between realistic satellite imagery and a simplified globe map.
    setViewMode(mode) {
      if (mode !== 'globe' && mode !== 'map') throw new RangeError(`Unknown Earth view: ${mode}`)
      viewMode = mode
      const isMapMode = mode === 'map'
      sphere.material = isMapMode ? mapMaterial : sphereMaterial
      clouds.visible = !isMapMode && cloudsEnabled
      atmosphere.visible = !isMapMode && atmosphereEnabled
      satellites.forEach((satellite) => { satellite.visible = !isMapMode && satellitesEnabled })
      render(performance.now())
    },
    // Shows or hides the cloud layer.
    setCloudsVisible(visible) {
      cloudsEnabled = visible
      clouds.visible = visible && viewMode === 'globe'
      render(performance.now())
    },
    // Shows or hides the atmospheric glow.
    setAtmosphereVisible(visible) {
      atmosphereEnabled = visible
      atmosphere.visible = visible && viewMode === 'globe'
      render(performance.now())
    },
    // Shows or hides the orbiting satellites.
    setSatellitesVisible(visible) {
      satellitesEnabled = visible
      satellites.forEach((satellite) => { satellite.visible = visible && viewMode === 'globe' })
      render(performance.now())
    },
  }
}

// Loads the 3D scene, manages pointer and motion controls, and renders its UI.
export default function CountryGlobe() {
  const shouldReduceMotion = useReducedMotion()
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const speedMultiplierRef = useRef(1)
  const speedOutputRef = useRef(null)
  const rotationPausedRef = useRef(false)
  const [rotationPaused, setRotationPaused] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)
  const [earthStyle, setEarthStyle] = useState('natural')
  const [viewMode, setViewMode] = useState('globe')
  const [cloudsVisible, setCloudsVisible] = useState(true)
  const [atmosphereVisible, setAtmosphereVisible] = useState(true)
  const [satellitesVisible, setSatellitesVisible] = useState(true)
  const [globeVisible, setGlobeVisible] = useState(false)
  const [portalRoot] = useState(() => (typeof document === 'undefined' ? null : document.body))
  const [sceneFailed, setSceneFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    let cancelled = false
    // Provides a safe cleanup function until the asynchronous scene is ready.
    let disposeScene = () => {}

    import('three').then((THREE) => {
      if (cancelled) return

      const sceneController = createGlobeScene(THREE, canvas)
      sceneRef.current = sceneController
      sceneController.setRotationSpeed(0.09 * speedMultiplierRef.current)
      sceneController.setRotationPaused(rotationPausedRef.current)
      disposeScene = () => {
        sceneController.dispose()
        sceneRef.current = null
      }

      let isVisible = false
      let isAnimating = false
      let frameId = 0
      let lastFrameTime = 0
      let isDragging = false
      let lastPointerX = 0
      let lastPointerY = 0
      const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')

      // Starts a drag when the pointer is over the globe surface.
      function handlePointerDown(event) {
        if (event.button !== 0 || event.target.closest?.('.figma-globe-controls')) return
        const bounds = canvas.getBoundingClientRect()
        const distance = Math.hypot(
          event.clientX - (bounds.left + bounds.width / 2),
          event.clientY - (bounds.top + bounds.height / 2),
        )
        if (distance > Math.min(bounds.width, bounds.height) * 0.43) return
        isDragging = true
        lastPointerX = event.clientX
        lastPointerY = event.clientY
        if (event.pointerType !== 'touch') event.preventDefault()
      }

      // Converts pointer movement into horizontal and vertical globe rotation.
      function handlePointerMove(event) {
        if (!isDragging) return
        const bounds = canvas.getBoundingClientRect()
        const horizontalDelta = event.clientX - lastPointerX
        const verticalDelta = event.pointerType === 'touch' ? 0 : event.clientY - lastPointerY
        lastPointerX = event.clientX
        lastPointerY = event.clientY
        sceneController.rotateBy(
          horizontalDelta * Math.PI * 2 / bounds.width,
          verticalDelta * Math.PI * 2 / bounds.height,
        )
      }

      // Ends the current globe drag.
      function stopDragging() {
        isDragging = false
      }

      // Cancels the scheduled animation frame.
      function stopAnimation() {
        isAnimating = false
        window.cancelAnimationFrame(frameId)
        frameId = 0
      }

      // Draws frames at a capped rate while globe animation is active.
      function animate(time) {
        if (!isAnimating) return
        if (time - lastFrameTime >= 1000 / 30) {
          sceneController.render(time)
          lastFrameTime = time
        }
        frameId = window.requestAnimationFrame(animate)
      }

      // Starts or stops animation according to visibility and motion preferences.
      function updateAnimation() {
        if (motionPreference.matches || !isVisible || document.hidden) {
          stopAnimation()
          sceneController.render(performance.now())
          return
        }
        if (isAnimating) return
        isAnimating = true
        lastFrameTime = 0
        frameId = window.requestAnimationFrame(animate)
      }

      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting
        setGlobeVisible(entry.isIntersecting)
        if (!entry.isIntersecting) setControlsOpen(false)
        updateAnimation()
      }, { threshold: 0.1 })
      observer.observe(canvas)
      window.addEventListener('pointerdown', handlePointerDown, { capture: true })
      window.addEventListener('pointermove', handlePointerMove, { capture: true })
      window.addEventListener('pointerup', stopDragging, { capture: true })
      window.addEventListener('pointercancel', stopDragging, { capture: true })
      motionPreference.addEventListener('change', updateAnimation)
      document.addEventListener('visibilitychange', updateAnimation)
      sceneController.render(performance.now())

      disposeScene = () => {
        stopAnimation()
        observer.disconnect()
        window.removeEventListener('pointerdown', handlePointerDown, true)
        window.removeEventListener('pointermove', handlePointerMove, true)
        window.removeEventListener('pointerup', stopDragging, true)
        window.removeEventListener('pointercancel', stopDragging, true)
        motionPreference.removeEventListener('change', updateAnimation)
        document.removeEventListener('visibilitychange', updateAnimation)
        sceneController.dispose()
        sceneRef.current = null
      }
    }).catch((error) => {
      if (cancelled) return
      disposeScene()
      console.error('Unable to initialize the 3D globe', error)
      setSceneFailed(true)
    })

    return () => {
      cancelled = true
      disposeScene()
    }
  }, [])

  // Toggles automatic globe rotation and synchronizes scene and UI state.
  function toggleRotation() {
    const nextPaused = !rotationPausedRef.current
    rotationPausedRef.current = nextPaused
    setRotationPaused(nextPaused)
    sceneRef.current?.setRotationPaused(nextPaused)
  }

  // Updates the scene rotation rate and its accessible value text.
  function changeSpeed(event) {
    const nextSpeed = Number(event.target.value)
    speedMultiplierRef.current = nextSpeed
    sceneRef.current?.setRotationSpeed(0.09 * nextSpeed)
    if (speedOutputRef.current) speedOutputRef.current.textContent = `${nextSpeed.toFixed(2)}×`
    event.currentTarget.setAttribute('aria-valuetext', `${nextSpeed.toFixed(2)} times`)
  }

  // Applies an Earth appearance preset to the rendered scene.
  function changeEarthStyle(style) {
    setEarthStyle(style)
    sceneRef.current?.setEarthStyle(style)
  }

  // Switches between realistic satellite imagery and the simplified globe map.
  function changeViewMode(mode) {
    setViewMode(mode)
    sceneRef.current?.setViewMode(mode)
  }

  // Toggles the rendered cloud layer.
  function toggleClouds() {
    const nextVisible = !cloudsVisible
    setCloudsVisible(nextVisible)
    sceneRef.current?.setCloudsVisible(nextVisible)
  }

  // Toggles the atmospheric glow around Earth.
  function toggleAtmosphere() {
    const nextVisible = !atmosphereVisible
    setAtmosphereVisible(nextVisible)
    sceneRef.current?.setAtmosphereVisible(nextVisible)
  }

  // Toggles the orbiting satellites around Earth.
  function toggleSatellites() {
    const nextVisible = !satellitesVisible
    setSatellitesVisible(nextVisible)
    sceneRef.current?.setSatellitesVisible(nextVisible)
  }

  const globeControls = (
    <motion.div
      className={`figma-globe-controls${controlsOpen ? ' is-open' : ' is-collapsed'}`}
      role="group"
      aria-label="Globe controls"
      initial={shouldReduceMotion ? false : { opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.2, 0.75, 0.25, 1] }}
    >
      <div className="figma-globe-controls-heading">
        {controlsOpen && (
          <>
            <span className="figma-globe-control-title">EARTH STUDIO</span>
            <span className={`figma-globe-status${rotationPaused ? ' is-paused' : ''}`}>
              <span />
              {rotationPaused ? 'PAUSED' : 'LIVE'}
            </span>
          </>
        )}
        <motion.button
          className="figma-globe-disclosure"
          type="button"
          aria-label={controlsOpen ? 'Hide globe controls' : 'Show globe controls'}
          aria-expanded={controlsOpen}
          aria-controls="globe-control-panel"
          title={controlsOpen ? 'Hide globe controls' : 'Show globe controls'}
          onClick={() => setControlsOpen((open) => !open)}
          whileHover={shouldReduceMotion ? undefined : { rotate: 8, scale: 1.08 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
        >
          {controlsOpen ? (
            <X size={16} />
          ) : (
            <>
              <Globe size={16} />
              <span className="figma-globe-trigger-label">EARTH</span>
              <SlidersHorizontal size={14} />
            </>
          )}
        </motion.button>
      </div>
      <AnimatePresence initial={false}>
        {controlsOpen && (
          <motion.div
            id="globe-control-panel"
            className="figma-globe-control-panel"
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0, y: -5 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
          >
            <div className="figma-globe-settings-section">
              <div className="figma-globe-section-heading">
                <span>View mode</span>
                <span>Switch view</span>
              </div>
              <div className="figma-globe-view-options" role="group" aria-label="Earth view">
                <button
                  className={`figma-globe-view-option${viewMode === 'globe' ? ' is-selected' : ''}`}
                  type="button"
                  aria-pressed={viewMode === 'globe'}
                  onClick={() => changeViewMode('globe')}
                >
                  <Globe size={13} />
                  <span>3D globe</span>
                </button>
                <button
                  className={`figma-globe-view-option${viewMode === 'map' ? ' is-selected' : ''}`}
                  type="button"
                  aria-pressed={viewMode === 'map'}
                  onClick={() => changeViewMode('map')}
                >
                  <span className="figma-globe-map-icon" />
                  <span>Map view</span>
                </button>
              </div>
            </div>
            <div className="figma-globe-settings-section">
              <div className="figma-globe-section-heading">
                <span>Earth style</span>
                <span>3 presets</span>
              </div>
              <div className="figma-globe-style-options" role="group" aria-label="Earth style">
                {Object.keys(earthStyles).map((style) => (
                  <button
                    className={`figma-globe-style-option is-${style}${earthStyle === style ? ' is-selected' : ''}`}
                    key={style}
                    type="button"
                    aria-pressed={earthStyle === style}
                    onClick={() => changeEarthStyle(style)}
                  >
                    <span className="figma-globe-style-swatch" />
                    <span>{style === 'natural' ? 'Natural' : style === 'night' ? 'Night' : 'Blueprint'}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="figma-globe-settings-section">
              <div className="figma-globe-section-heading">
                <span>Scene layers</span>
                <span>Customize</span>
              </div>
              <div className="figma-globe-layer-options">
                <button
                  className={`figma-globe-layer-option${cloudsVisible ? ' is-active' : ''}`}
                  type="button"
                  aria-label="Cloud layer"
                  aria-pressed={cloudsVisible}
                  onClick={toggleClouds}
                >
                  <span>Clouds</span><span className="figma-globe-layer-indicator" />
                </button>
                <button
                  className={`figma-globe-layer-option${atmosphereVisible ? ' is-active' : ''}`}
                  type="button"
                  aria-label="Atmosphere"
                  aria-pressed={atmosphereVisible}
                  onClick={toggleAtmosphere}
                >
                  <span>Atmosphere</span><span className="figma-globe-layer-indicator" />
                </button>
                <button
                  className={`figma-globe-layer-option${satellitesVisible ? ' is-active' : ''}`}
                  type="button"
                  aria-label="Satellites"
                  aria-pressed={satellitesVisible}
                  onClick={toggleSatellites}
                >
                  <span>Satellites</span><span className="figma-globe-layer-indicator" />
                </button>
              </div>
            </div>
            <motion.button
              className="figma-globe-toggle"
              type="button"
              aria-label={rotationPaused ? 'Resume globe rotation' : 'Pause globe rotation'}
              aria-pressed={rotationPaused}
              onClick={toggleRotation}
              whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.015 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.975 }}
              transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 24 }}
            >
              <span className="figma-globe-toggle-icon">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={rotationPaused ? 'play' : 'pause'}
                    initial={shouldReduceMotion ? false : { opacity: 0, rotate: -45, scale: 0.65 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, rotate: 45, scale: 0.65 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18 }}
                  >
                    {rotationPaused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span>{rotationPaused ? 'Resume rotation' : 'Pause rotation'}</span>
            </motion.button>
            <label className="figma-globe-speed">
              <span className="figma-globe-speed-heading">
                <span>Rotation speed</span>
                <output ref={speedOutputRef}>1.00×</output>
              </span>
              <input
                type="range"
                min="0.25"
                max="3"
                step="0.25"
                defaultValue="1"
                aria-label="Globe rotation speed"
                aria-valuetext="1.00 times"
                onChange={changeSpeed}
              />
            </label>
            <span className="figma-globe-drag-hint">Drag the Earth to explore</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  return (
    <>
      <div className="figma-globe-stage" role="group" aria-label="Interactive Earth globe">
        <canvas className="figma-globe-canvas" ref={canvasRef} width={viewWidth} height={viewHeight} aria-hidden="true" />
        {sceneFailed && <img className="figma-globe-fallback" src="/images/figma-globe.svg" alt="" />}
      </div>
      {portalRoot && globeVisible && createPortal(globeControls, portalRoot)}
    </>
  )
}
