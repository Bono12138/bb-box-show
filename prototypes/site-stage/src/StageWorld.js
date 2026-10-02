// Geometry and materials for the BB concept stage. UI and business copy stay in HTML.
export function createStageWorld(THREE, courseImage, processImage, Reflector) {
  const world = new THREE.Group()
  const textures = new Set([courseImage, processImage])
  const lights = []
  const renderSurfaces = []
  const material = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.66, metalness: 0, ...options })

  function surfaceTexture(kind, branded = false) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 512
    const context = canvas.getContext('2d')
    context.fillStyle = kind === 'wood' ? '#826047' : '#faf9f4'
    context.fillRect(0, 0, 512, 512)
    let seed = 91
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
    if (kind === 'wood') {
      for (let line = 0; line < 280; line += 1) {
        const y = random() * 512
        context.strokeStyle = `rgba(40,18,4,${0.04 + random() * 0.18})`
        context.lineWidth = 0.35 + random() * 2.2
        context.beginPath()
        context.moveTo(0, y)
        context.bezierCurveTo(170, y + random() * 19, 340, y - random() * 22, 512, y + random() * 9)
        context.stroke()
      }
      if (branded) {
        context.fillStyle = '#102337'
        context.font = '900 194px Arial, sans-serif'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText('BB', 256, 265)
      }
    } else {
      for (let patch = 0; patch < 16; patch += 1) {
        const x = random() * 512, y = random() * 512, radius = 20 + random() * 90
        const wash = context.createRadialGradient(x, y, 0, x, y, radius)
        wash.addColorStop(0, 'rgba(112,92,62,.012)')
        wash.addColorStop(1, 'rgba(112,92,62,0)')
        context.fillStyle = wash
        context.fillRect(0, 0, 512, 512)
      }
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    textures.add(texture)
    return texture
  }
  const plaster = surfaceTexture('plaster'), woodGrain = surfaceTexture('wood'), boxBrand = surfaceTexture('wood', true)
  function physicalMaps(kind) {
    const size = 256, height = new Float32Array(size * size)
    const normalCanvas = document.createElement('canvas'), roughCanvas = document.createElement('canvas')
    normalCanvas.width = normalCanvas.height = roughCanvas.width = roughCanvas.height = size
    const normalContext = normalCanvas.getContext('2d'), roughContext = roughCanvas.getContext('2d')
    const normals = normalContext.createImageData(size, size), rough = roughContext.createImageData(size, size)
    for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
      const broad = Math.sin(x * 0.039 + Math.sin(y * 0.027)) * Math.cos(y * 0.031)
      height[y * size + x] = kind === 'wood'
        ? 0.50 + Math.sin(y * 0.24 + Math.sin(x * 0.017) * 1.8) * 0.13 + Math.sin(y * 0.89 + x * 0.019) * 0.024
        : 0.50 + broad * 0.15 + Math.sin(x * 0.113 + y * 0.077) * 0.018
    }
    for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
      const index = y * size + x, pixel = index * 4
      const dx = height[y * size + (x + 1) % size] - height[y * size + (x + size - 1) % size]
      const dy = height[((y + 1) % size) * size + x] - height[((y + size - 1) % size) * size + x]
      normals.data[pixel] = 128 - dx * 170
      normals.data[pixel + 1] = 128 - dy * 170
      normals.data[pixel + 2] = 255
      normals.data[pixel + 3] = 255
      const value = kind === 'wood' ? 152 + height[index] * 54 : 196 + height[index] * 42
      rough.data[pixel] = rough.data[pixel + 1] = rough.data[pixel + 2] = value
      rough.data[pixel + 3] = 255
    }
    normalContext.putImageData(normals, 0, 0)
    roughContext.putImageData(rough, 0, 0)
    const normalMap = new THREE.CanvasTexture(normalCanvas), roughnessMap = new THREE.CanvasTexture(roughCanvas)
    for (const texture of [normalMap, roughnessMap]) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      textures.add(texture)
    }
    return { normalMap, roughnessMap }
  }
  const paperMaps = physicalMaps('paper'), woodMaps = physicalMaps('wood'), floorMaps = physicalMaps('floor')
  const ivory = material(0xfff0d4, { map: plaster, ...paperMaps, normalScale: new THREE.Vector2(0.055, 0.055), roughness: 0.87 })
  const ivorySide = material(0xe8d6b6, { map: plaster, ...paperMaps, normalScale: new THREE.Vector2(0.055, 0.055), roughness: 0.90 })
  const yellow = material(0xffda00, { ...paperMaps, normalScale: new THREE.Vector2(0.055, 0.055), roughness: 0.65 })
  const yellowSide = material(0xd79b08, { roughness: 0.73 })
  const navy = material(0x112238, { ...paperMaps, normalScale: new THREE.Vector2(0.04, 0.04), roughness: 0.73 })
  const black = material(0x151b22, { roughness: 0.44, metalness: 0.65 })
  const rubber = material(0x16191d, { roughness: 0.92 })
  const brass = material(0xac8b48, { roughness: 0.35, metalness: 0.75 })
  const silver = material(0x89919b, { roughness: 0.34, metalness: 0.80 })
  const wood = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: woodGrain, ...woodMaps, normalScale: new THREE.Vector2(0.18, 0.18), roughness: 0.60, clearcoat: 0.13, clearcoatRoughness: 0.45 })
  const paper = material(0xf6efdb, { roughness: 0.96 })
  const fabric = material(0x213146, { ...paperMaps, normalScale: new THREE.Vector2(0.14, 0.14), roughness: 0.94 })
  const microphoneMetal = material(0x323942, { roughness: 0.25, metalness: 0.92 })
  const grilleMetal = material(0x69717a, { roughness: 0.42, metalness: 0.84 })
  function mesh(geometry, surface, position = [0, 0, 0], parent = world) {
    const object = new THREE.Mesh(geometry, surface)
    object.position.set(...position)
    object.castShadow = object.receiveShadow = true
    parent.add(object)
    return object
  }
  const box = (w, h, d, surface, position, parent) => mesh(rounded(w, h, d, Math.min(0.025, w / 8, h / 8, d / 8)), surface, position, parent)
  function rounded(w, h, d, radius = 0.035) {
    const shape = new THREE.Shape()
    const x = -w / 2, y = -h / 2, r = Math.min(radius, w / 4, h / 4)
    shape.moveTo(x + r, y)
    shape.lineTo(x + w - r, y)
    shape.quadraticCurveTo(x + w, y, x + w, y + r)
    shape.lineTo(x + w, y + h - r)
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    shape.lineTo(x + r, y + h)
    shape.quadraticCurveTo(x, y + h, x, y + h - r)
    shape.lineTo(x, y + r)
    shape.quadraticCurveTo(x, y, x + r, y)
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: Math.max(0.015, d - r * 0.4), bevelEnabled: true, bevelSize: r * 0.20, bevelThickness: r * 0.20, bevelSegments: 2, curveSegments: 4 })
    geometry.center()
    return geometry
  }
  function cylinder(radius, length, surface, position, parent = world, radiusTop = radius) {
    return mesh(new THREE.CylinderGeometry(radiusTop, radius, length, 24), surface, position, parent)
  }
  function rod(start, end, radius, surface, parent = world) {
    const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end)
    const object = cylinder(radius, a.distanceTo(b), surface, a.clone().add(b).multiplyScalar(0.5).toArray(), parent)
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize())
    return object
  }
  const ring = (radius, tube, surface, position, parent = world) => mesh(new THREE.TorusGeometry(radius, tube, 8, 36), surface, position, parent)
  function panel(w, h, d, surface, side, position, yaw = 0, slope = 0.12) {
    const shape = new THREE.Shape()
    shape.moveTo(-w / 2, 0)
    shape.lineTo(w / 2, 0)
    shape.lineTo(w / 2, h * (1 - slope))
    shape.lineTo(-w / 2, h)
    shape.closePath()
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 1 })
    geometry.translate(0, 0, -d / 2)
    const object = mesh(geometry, [surface, side], position)
    object.rotation.y = yaw
    return object
  }

  // Full-depth scenery keeps its side faces and stepped heights in moving views.
  box(200, 0.12, 200, material(0x08182a, { ...floorMaps, normalScale: new THREE.Vector2(0.055, 0.055), roughness: 0.48, metalness: 0.16 }), [0, -0.08, -4])
  const groundReflection = new Reflector(new THREE.PlaneGeometry(20, 20), {
    clipBias: 0.004, textureWidth: 512, textureHeight: 512, multisample: 0,
    shader: {
      name: 'SoftStageFloor',
      uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null } },
      vertexShader: `uniform mat4 textureMatrix; varying vec4 vReflectionUv; varying vec2 vSurfaceUv;
        void main(){vSurfaceUv=uv;vReflectionUv=textureMatrix*vec4(position,1.0);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `uniform sampler2D tDiffuse; varying vec4 vReflectionUv; varying vec2 vSurfaceUv;
        void main(){vec2 p=vReflectionUv.xy/vReflectionUv.w; vec3 reflection=texture2D(tDiffuse,p).rgb*0.20;
          for(int i=0;i<8;i++){float a=float(i)*0.785398;reflection+=texture2D(tDiffuse,p+vec2(cos(a),sin(a))*0.012).rgb*0.10;}
          float edge=smoothstep(0.0,0.20,min(min(vSurfaceUv.x,1.0-vSurfaceUv.x),min(vSurfaceUv.y,1.0-vSurfaceUv.y)));
          gl_FragColor=vec4(reflection,edge*0.09);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    },
  })
  groundReflection.rotation.x = -Math.PI / 2
  groundReflection.position.set(1, -0.014, 1)
  groundReflection.material.transparent = true
  groundReflection.material.depthWrite = false
  groundReflection.renderOrder = 1
  world.add(groundReflection)
  renderSurfaces.push(groundReflection)
  box(10.8, 0.26, 5.8, navy, [0.9, 0.12, -0.45])
  box(7.9, 0.46, 3.6, ivory, [1.0, 0.46, -1.45])
  box(5.7, 0.24, 2.65, ivory, [0.7, 0.82, -1.85])
  box(4.1, 0.18, 0.62, navy, [-0.6, 0.18, 2.18])
  box(3.7, 0.18, 0.62, navy, [-0.6, 0.35, 1.62])
  box(3.25, 0.18, 0.62, ivory, [-0.6, 0.52, 1.06])
  panel(2.15, 4.8, 0.65, ivory, ivorySide, [-3.0, 0.70, -1.9], -0.14, 0.15)
  panel(3.2, 6.35, 0.60, ivory, ivorySide, [-0.60, 0.92, -2.5], 0.04, 0.13)
  panel(2.05, 6.85, 0.67, ivory, ivorySide, [2.0, 0.92, -3.2], -0.14, 0.15)
  panel(3.5, 6.45, 0.70, yellow, yellowSide, [4.65, 0.70, -2.35], -0.16, -0.09)
  panel(1.15, 3.55, 1.0, ivory, navy, [-4.10, 0.25, -0.20], -0.08, -0.12)
  panel(1.15, 2.25, 1.0, ivory, ivorySide, [3.35, 0.35, -0.95], 0.10, -0.07)
  box(1.5, 0.65, 1.2, ivory, [4.45, 0.55, 0.10])

  function table(w, d, position, surface = wood) {
    const group = new THREE.Group()
    group.position.set(...position)
    world.add(group)
    mesh(rounded(w, 0.17, d, 0.055), surface, [0, 1.45, 0], group)
    for (const x of [-w / 2 + 0.18, w / 2 - 0.18]) for (const z of [-d / 2 + 0.14, d / 2 - 0.14]) {
      mesh(rounded(0.105, 1.38, 0.10, 0.012), black, [x, 0.70, z], group)
      box(0.18, 0.04, 0.15, microphoneMetal, [x, 1.34, z], group)
      box(0.11, 0.025, 0.12, rubber, [x, 0.03, z], group)
    }
    rod([-w / 2 + 0.18, 0.4, 0], [w / 2 - 0.18, 0.4, 0], 0.025, black, group)
    return group
  }
  function desktopMic(x, z, parent) {
    const group = new THREE.Group()
    group.position.set(x, 1.535, z)
    parent.add(group)
    cylinder(0.105, 0.022, black, [0, 0.012, 0], group)
    rod([0, 0.02, 0], [0, 0.22, 0], 0.010, black, group)
    rod([0, 0.22, 0], [0.10, 0.36, -0.03], 0.014, silver, group)
    const head = new THREE.Group()
    head.position.set(0.105, 0.39, -0.033)
    head.rotation.z = -0.55
    group.add(head)
    cylinder(0.039, 0.16, microphoneMetal, [0, 0, 0], head)
    cylinder(0.047, 0.095, rubber, [0, 0.072, 0], head)
    mesh(new THREE.SphereGeometry(0.047, 16, 12), rubber, [0, 0.12, 0], head)
    cylinder(0.041, 0.016, brass, [0, -0.05, 0], head)
    cylinder(0.042, 0.012, silver, [0, -0.078, 0], head)
    const cablePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.025, 0), new THREE.Vector3(0.16, 0.018, 0.15),
      new THREE.Vector3(0.27, 0.010, 0.39), new THREE.Vector3(0.24, -0.02, 0.60),
      new THREE.Vector3(0.21, -0.43, 0.62),
    ])
    mesh(new THREE.TubeGeometry(cablePath, 24, 0.006, 5, false), rubber, [0, 0, 0], group).castShadow = false
  }
  function chair(x, z, yaw = 0) {
    const group = new THREE.Group()
    group.position.set(x, 0.28, z)
    group.rotation.y = yaw
    world.add(group)
    mesh(rounded(0.76, 0.13, 0.71, 0.04), fabric, [0, 0.82, 0], group)
    mesh(rounded(0.76, 0.84, 0.115, 0.05), fabric, [0, 1.30, -0.29], group).rotation.x = -0.08
    for (const side of [-1, 1]) {
      rod([side * 0.34, 0, -0.29], [side * 0.34, 0.91, 0.29], 0.034, black, group)
      rod([side * 0.34, 0, 0.29], [side * 0.34, 1.75, -0.34], 0.034, black, group)
      rod([side * 0.42, 1.12, -0.25], [side * 0.42, 1.12, 0.28], 0.030, wood, group)
      rod([side * 0.42, 0.88, 0.26], [side * 0.42, 1.12, 0.26], 0.026, black, group)
      cylinder(0.055, 0.029, silver, [side * 0.34, 0.69, 0], group).rotation.z = Math.PI / 2
    }
  }
  const chatDesk = table(3.05, 1.45, [-2.25, 0.25, 0.30])
  desktopMic(-1.0, -0.03, chatDesk)
  desktopMic(0, -0.03, chatDesk)
  desktopMic(1.0, -0.03, chatDesk)
  chair(-3.13, -0.66, -0.08)
  chair(-1.37, -0.66, 0.08)

  function crate(position, scale = 1) {
    const group = new THREE.Group()
    group.position.set(...position)
    group.scale.setScalar(scale)
    world.add(group)
    box(1.05, 0.59, 0.73, wood, [0, 0.30, 0], group)
    mesh(new THREE.PlaneGeometry(1.0, 0.55), material(0xffffff, { map: boxBrand, roughness: 0.78 }), [0, 0.30, 0.367], group)
    for (const y of [0.07, 0.28, 0.50]) box(1.08, 0.018, 0.012, wood, [0, y, 0.376], group)
    for (const x of [-0.48, 0.48]) {
      box(0.035, 0.58, 0.025, wood, [x, 0.30, 0.38], group)
      for (const y of [0.08, 0.48]) cylinder(0.012, 0.015, black, [x, y, 0.40], group).rotation.x = Math.PI / 2
    }
    return group
  }
  crate([-3.75, 0.26, 2.30], 1.1)
  crate([-0.30, 0.26, 2.7], 0.55)

  const courseDesk = table(3.8, 1.85, [2.4, 0.0, 2.90])
  const laptop = new THREE.Group()
  laptop.position.set(-0.25, 1.545, -0.10)
  laptop.rotation.y = 0.10
  courseDesk.add(laptop)
  mesh(rounded(1.48, 0.047, 0.91, 0.025), silver, [0, 0.023, 0], laptop)
  mesh(rounded(0.39, 0.003, 0.22, 0.009), material(0x71818e, { metalness: 0.62 }), [0, 0.049, 0.25], laptop)
  const keyGeometry = rounded(0.082, 0.013, 0.063, 0.006)
  for (let row = 0; row < 5; row += 1) for (let col = 0; col < 13; col += 1) mesh(keyGeometry, black, [-0.61 + col * 0.100, 0.054, -0.30 + row * 0.083], laptop)
  const lid = new THREE.Group()
  lid.position.set(0, 0.48, -0.38)
  lid.rotation.x = -0.16
  laptop.add(lid)
  mesh(rounded(1.48, 0.89, 0.047, 0.025), black, [0, 0, 0], lid)
  mesh(new THREE.PlaneGeometry(1.37, 0.77), new THREE.MeshBasicMaterial({ map: courseImage, toneMapped: false }), [0, 0, 0.028], lid)
  cylinder(0.004, 0.009, rubber, [0, 0.41, 0.027], lid).rotation.x = Math.PI / 2
  mesh(rounded(0.80, 0.045, 0.52, 0.009), paper, [0.99, 1.56, 0.17], courseDesk).rotation.y = -0.14
  rod([0.63, 1.59, 0.08], [1.19, 1.59, 0.23], 0.013, black, courseDesk)
  const mug = new THREE.Group()
  mug.position.set(1.22, 1.53, -0.36)
  courseDesk.add(mug)
  cylinder(0.13, 0.26, yellow, [0, 0.13, 0], mug, 0.14)
  cylinder(0.119, 0.008, material(0x38271b, { roughness: 0.18 }), [0, 0.265, 0], mug)
  ring(0.132, 0.010, ivory, [0, 0.27, 0], mug).rotation.x = Math.PI / 2
  ring(0.088, 0.018, yellow, [0.172, 0.14, 0], mug)

  const processDesk = table(1.90, 1.1, [4.95, 0.20, 0.65], navy)
  const monitor = new THREE.Group()
  monitor.position.set(0, 1.56, -0.20)
  monitor.rotation.y = -0.20
  processDesk.add(monitor)
  cylinder(0.17, 0.025, black, [0, 0, 0], monitor)
  rod([0, 0.02, 0], [0, 0.34, -0.08], 0.033, black, monitor)
  mesh(rounded(1.50, 0.92, 0.055, 0.025), black, [0, 0.75, -0.08], monitor)
  mesh(new THREE.PlaneGeometry(1.39, 0.81), new THREE.MeshBasicMaterial({ map: processImage, toneMapped: false }), [0, 0.75, -0.049], monitor)
  for (let page = 0; page < 3; page += 1) mesh(rounded(0.52, 0.016, 0.36, 0.008), paper, [-0.40 + page * 0.05, 1.55 + page * 0.018, 0.29], processDesk).rotation.y = -0.12 + page * 0.08

  function tripod(position, height, fixture = false) {
    const group = new THREE.Group()
    group.position.set(...position)
    world.add(group)
    rod([0, 0.3, 0], [0, height, 0], 0.025, black, group)
    for (let leg = 0; leg < 3; leg += 1) {
      const angle = leg * Math.PI * 2 / 3
      rod([0, 0.62, 0], [Math.sin(angle) * 0.42, 0.03, Math.cos(angle) * 0.42], 0.024, black, group)
      cylinder(0.029, 0.12, rubber, [Math.sin(angle) * 0.42, 0.06, Math.cos(angle) * 0.42], group)
    }
    cylinder(0.045, 0.06, brass, [0, height * 0.65, 0], group)
    const head = new THREE.Group()
    head.position.y = height
    head.rotation.y = fixture ? -0.25 : -0.40
    group.add(head)
    mesh(rounded(0.38, 0.25, 0.24, 0.024), black, [0, 0.14, 0], head)
    cylinder(fixture ? 0.10 : 0.088, fixture ? 0.19 : 0.26, microphoneMetal, [0.06, 0.14, 0.20], head).rotation.x = Math.PI / 2
    const glass = fixture
      ? material(0xffe5af, { roughness: 0.22, emissive: 0xffc67b, emissiveIntensity: 2.0 })
      : new THREE.MeshPhysicalMaterial({ color: 0x103655, roughness: 0.07, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.04 })
    cylinder(fixture ? 0.079 : 0.070, 0.008, glass, [0.06, 0.14, fixture ? 0.29 : 0.335], head).rotation.x = Math.PI / 2
    if (fixture) {
      for (const sign of [-1, 1]) {
        const flap = box(0.17, 0.20, 0.013, black, [sign * 0.19, 0.14, 0.19], head)
        flap.rotation.y = sign * 0.55
        const horizontalFlap = box(0.27, 0.12, 0.014, black, [0.05, 0.14 + sign * 0.16, 0.19], head)
        horizontalFlap.rotation.x = -sign * 0.55
      }
      for (let radius = 0.025; radius < 0.079; radius += 0.018) ring(radius, 0.003, ivory, [0.06, 0.14, 0.295], head).castShadow = false
      rod([-0.11, 0.29, 0], [-0.11, 0.36, 0], 0.016, black, head)
      rod([0.12, 0.29, 0], [0.12, 0.36, 0], 0.016, black, head)
      rod([-0.11, 0.36, 0], [0.12, 0.36, 0], 0.016, black, head)
    } else {
      mesh(rounded(0.12, 0.28, 0.26, 0.03), rubber, [0.20, 0.15, 0], head)
      mesh(rounded(0.17, 0.09, 0.12, 0.018), black, [-0.05, 0.30, -0.02], head)
      box(0.26, 0.18, 0.013, microphoneMetal, [0, 0.14, -0.127], head)
      box(0.21, 0.13, 0.005, rubber, [0, 0.14, -0.136], head)
      for (const z of [0.14, 0.18, 0.22, 0.26, 0.31]) ring(z < 0.25 ? 0.094 : 0.089, 0.006, z === 0.31 ? silver : rubber, [0.06, 0.14, z], head)
      rod([-0.14, 0.04, -0.1], [-0.3, -0.03, 0.16], 0.011, black, head)
    }
  }
  tripod([5.70, 0.28, 1.55], 1.85)
  tripod([-4.9, 0.03, 0.9], 2.8, true)
  tripod([5.85, 0.70, -1.15], 4.0, true)

  // Metal body, foam head, shock-mount rings and support wire are separate geometry.
  const suspended = new THREE.Group()
  suspended.position.set(-1.25, 5.25, 3.10)
  suspended.rotation.set(0.18, 0.10, -0.25)
  suspended.scale.setScalar(1.70)
  world.add(suspended)
  cylinder(0.165, 0.48, microphoneMetal, [0, 0.18, 0], suspended)
  cylinder(0.172, 0.046, brass, [0, -0.05, 0], suspended)
  cylinder(0.172, 0.38, rubber, [0, -0.25, 0], suspended)
  mesh(new THREE.SphereGeometry(0.172, 24, 18), rubber, [0, -0.42, 0], suspended).scale.y = 0.73
  for (let row = 0; row < 18; row += 1) {
    const y = -0.45 + row * 0.026
    const grille = ring(0.177, 0.0026, grilleMetal, [0, y, 0], suspended)
    grille.rotation.x = Math.PI / 2
    grille.castShadow = false
  }
  for (let wire = 0; wire < 28; wire += 1) {
    const angle = wire * Math.PI * 2 / 28
    rod([Math.sin(angle) * 0.177, -0.45, Math.cos(angle) * 0.177], [Math.sin(angle) * 0.177, -0.008, Math.cos(angle) * 0.177], 0.0022, grilleMetal, suspended).castShadow = false
  }
  cylinder(0.13, 0.048, silver, [0, 0.44, 0], suspended)
  cylinder(0.070, 0.14, rubber, [0, 0.53, 0], suspended)
  for (const y of [-0.02, 0.30]) ring(0.236, 0.015, black, [0, y, 0], suspended).rotation.x = Math.PI / 2
  for (let spoke = 0; spoke < 8; spoke += 1) {
    const angle = spoke * Math.PI / 4, next = angle + Math.PI / 4
    rod([Math.sin(angle) * 0.236, -0.02, Math.cos(angle) * 0.236], [Math.sin(angle) * 0.236, 0.30, Math.cos(angle) * 0.236], 0.009, black, suspended)
    rod([Math.sin(angle) * 0.234, -0.02, Math.cos(angle) * 0.234], [Math.sin(next) * 0.177, 0.30, Math.cos(next) * 0.177], 0.004, rubber, suspended)
  }
  rod([0, 0.42, 0], [0, 1.60, 0], 0.015, black, suspended)
  rod([-1.65, 6.76, 2.42], [-2.8, 9.1, 1.0], 0.020, black)

  world.add(new THREE.HemisphereLight(0xe6eef6, 0x5d5142, 1.45))
  const key = new THREE.DirectionalLight(0xfff2df, 2.45)
  key.position.set(-3.5, 9.5, 6.8)
  key.target.position.set(0.8, 2.0, 0)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.left = -9
  key.shadow.camera.right = 9
  key.shadow.camera.top = 10
  key.shadow.camera.bottom = -6
  key.shadow.camera.near = 0.1
  key.shadow.camera.far = 30
  key.shadow.bias = -0.00025
  key.shadow.normalBias = 0.028
  key.shadow.radius = 9
  key.shadow.blurSamples = 12
  world.add(key, key.target)
  lights.push(key)
  const rim = new THREE.DirectionalLight(0xfff1d3, 1.35)
  rim.position.set(4, 7, -4)
  world.add(rim)
  const spill = new THREE.PointLight(0xffe2bb, 18, 12, 2)
  spill.position.set(1.4, 3.6, 2.5)
  world.add(spill)
  const microphoneRim = new THREE.PointLight(0xf4f3ed, 24, 5, 2)
  microphoneRim.position.set(-2.3, 5.7, 4.9)
  world.add(microphoneRim)
  return {
    world,
    setIntroduction(value) { key.intensity = 2.1 + 0.35 * value; spill.intensity = 13 + 5 * value },
    dispose() {
      const geometries = new Set(), materials = new Set()
      world.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry)
        if (object.material) for (const item of Array.isArray(object.material) ? object.material : [object.material]) materials.add(item)
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((surface) => surface.dispose())
      textures.forEach((texture) => texture.dispose())
      lights.forEach((light) => light.shadow.dispose())
      renderSurfaces.forEach((surface) => surface.getRenderTarget().dispose())
    },
  }
}
