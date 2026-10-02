import { useEffect, useRef } from 'react'
import { createStageWorld } from './StageWorld.js'

const INTRO_SECONDS = 2.0
const destinations = {
  all: { position: [8.2, 5.2, 15.0], target: [0.35, 2.7, 0.15], fov: 37 },
  show: { position: [0.7, 2.85, 7.0], target: [-2.2, 1.95, 0.25], fov: 36 },
  course: { position: [4.45, 2.9, 7.4], target: [2.3, 2.0, 2.9], fov: 35 },
  process: { position: [8.2, 2.95, 6.8], target: [4.9, 2.2, 0.7], fov: 35 },
}
const compactDestinations = {
  all: { position: [14.3, 8.9, 23.0], target: [0.9, 2.7, 0.4], fov: 47 },
  show: { position: [1.3, 3.7, 11.0], target: [-2.25, 1.85, 0.30], fov: 46 },
  course: { position: [4.5, 3.8, 9.5], target: [2.3, 2.0, 2.9], fov: 44 },
  process: { position: [8.7, 3.6, 9.8], target: [4.9, 2.2, 0.7], fov: 44 },
}
const validMode = (value) => Object.hasOwn(destinations, value) ? value : 'all'
const normalizeProgress = (value) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
const ease = (value) => value * value * (3 - 2 * value)

export default function StageScene({ reducedMotion = false, paused = false, replayKey = 0, onReady, mode = 'all', progress }) {
  const containerRef = useRef(null), controllerRef = useRef(null)
  const pausedRef = useRef(paused), readyRef = useRef(onReady)
  const modeRef = useRef(validMode(mode)), progressRef = useRef(normalizeProgress(progress))
  readyRef.current = onReady
  useEffect(() => { pausedRef.current = paused; controllerRef.current?.setPaused(paused) }, [paused])
  useEffect(() => { controllerRef.current?.replay() }, [replayKey])
  useEffect(() => { modeRef.current = validMode(mode); controllerRef.current?.retarget() }, [mode])
  useEffect(() => { progressRef.current = normalizeProgress(progress); controllerRef.current?.retarget() }, [progress])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    const query = new URLSearchParams(window.location.search)
    readyRef.current?.(false)
    container.dataset.sceneState = 'loading'
    if (reducedMotion || query.get('flat') === '1') { container.dataset.sceneState = 'static'; return undefined }
    const pose = query.get('pose'), fixedPose = pose === 'half' || pose === 'closed'
    const removers = []
    let disposed = false, failed = false, ready = false
    let renderer, scene, camera, stage, environment, resizeObserver, intersectionObserver, THREE
    let width = 0, height = 0, compact = false, frame = 0, lastTime = 0
    let inView = true, pageVisible = !document.hidden
    let elapsed = pose === 'half' ? INTRO_SECONDS / 2 : 0, activeTime = 0
    let currentPosition, currentTarget, desiredPosition, desiredTarget, desiredFov = 37
    let horizontalOffset = modeRef.current === 'all' ? 0.21 : 0.32
    const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 }
    const listen = (target, event, listener, options) => {
      target.addEventListener(event, listener, options)
      removers.push(() => target.removeEventListener(event, listener, options))
    }
    const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; lastTime = 0 }
    const release = () => {
      stop()
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      removers.splice(0).forEach((remove) => remove())
      stage?.dispose()
      stage = undefined
      environment?.dispose()
      environment = undefined
      if (renderer) {
        const canvas = renderer.domElement
        renderer.dispose()
        if (!renderer.getContext().isContextLost()) renderer.forceContextLoss()
        canvas.remove()
        renderer = undefined
      }
    }
    const fail = () => {
      if (failed || disposed) return
      failed = true
      stop()
      if (renderer) renderer.domElement.hidden = true
      container.dataset.sceneState = 'fallback'
      readyRef.current?.(false)
      queueMicrotask(() => { if (!disposed) release() })
    }
    const canPresent = () => !disposed && !failed && renderer && stage && width > 0 && height > 0 && inView && pageVisible && !document.hidden
    const chooseDestination = (instant = false) => {
      if (!THREE || !camera) return
      const selected = (compact ? compactDestinations : destinations)[modeRef.current]
      desiredPosition.set(...selected.position)
      desiredTarget.set(...selected.target)
      desiredPosition.lerp(desiredTarget, progressRef.current * 0.065)
      desiredFov = selected.fov
      if (instant) {
        currentPosition.copy(desiredPosition)
        currentTarget.copy(desiredTarget)
        camera.fov = desiredFov
        horizontalOffset = modeRef.current === 'all' ? 0.21 : 0.32
      }
      container.dataset.sceneMode = modeRef.current
    }
    const composeCamera = () => {
      const introduction = ease(Math.min(1, elapsed / INTRO_SECONDS)), distance = 1 + 0.12 * (1 - introduction)
      camera.position.copy(currentPosition).sub(currentTarget).multiplyScalar(distance).add(currentTarget)
      camera.position.x += pointer.currentX * (compact ? 0.035 : 0.16) + (compact ? Math.sin(activeTime * 0.42) * 0.035 : 0)
      camera.position.y += pointer.currentY * (compact ? 0.020 : 0.075) + (compact ? Math.sin(activeTime * 0.31) * 0.016 : 0) + 0.24 * (1 - introduction)
      camera.lookAt(currentTarget)
      camera.setViewOffset(width, height, compact ? 0 : -width * horizontalOffset, compact ? -height * (width < 600 ? 0.08 : 0.23) : 0, width, height)
      camera.updateProjectionMatrix()
      stage.setIntroduction(introduction)
    }
    const draw = () => {
      if (!canPresent()) return false
      try {
        composeCamera()
        renderer.render(scene, camera)
        if (failed) return false
        container.dataset.currentElapsed = elapsed.toFixed(3)
        container.dataset.revealProgress = Math.min(1, elapsed / INTRO_SECONDS).toFixed(4)
        container.dataset.cameraPosition = camera.position.toArray().map((n) => n.toFixed(3)).join(',')
        container.dataset.activeTime = activeTime.toFixed(3)
        if (!ready) { ready = true; container.dataset.sceneState = fixedPose ? pose : 'ready'; readyRef.current?.(true) }
        return true
      } catch { fail(); return false }
    }
    const requestFrame = () => { if (!frame && canPresent() && !pausedRef.current && !fixedPose) frame = requestAnimationFrame(tick) }
    function tick(now) {
      frame = 0
      if (!canPresent() || pausedRef.current || fixedPose) { lastTime = 0; return }
      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0
      lastTime = now
      elapsed = Math.min(INTRO_SECONDS, elapsed + delta)
      activeTime += delta
      const damping = 1 - Math.exp(-delta * 3.3)
      currentPosition.lerp(desiredPosition, damping)
      currentTarget.lerp(desiredTarget, damping)
      camera.fov += (desiredFov - camera.fov) * damping
      horizontalOffset += ((modeRef.current === 'all' ? 0.21 : 0.32) - horizontalOffset) * damping
      pointer.currentX += (pointer.x - pointer.currentX) * damping
      pointer.currentY += (pointer.y - pointer.currentY) * damping
      if (draw()) requestFrame()
    }
    const visibility = () => {
      const bounds = container.getBoundingClientRect()
      if (!intersectionObserver) inView = bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth
      stop()
      if (canPresent()) { draw(); requestFrame() }
    }
    const resize = () => {
      if (!renderer || failed || disposed) return
      width = container.clientWidth; height = container.clientHeight
      if (!width || !height) { stop(); return }
      const nextCompact = width < 900, changedLayout = compact !== nextCompact
      compact = nextCompact
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.35 : 1.6))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      chooseDestination(changedLayout || !ready)
      visibility()
    }
    const controller = {
      setPaused(value) { if (value) stop(); else requestFrame() },
      retarget() { chooseDestination(); requestFrame() },
      replay() { if (fixedPose || failed || disposed) return; elapsed = 0; lastTime = 0; requestFrame() },
    }
    controllerRef.current = controller
    async function initialize() {
      const loadedTextures = []
      try {
        const modules = await Promise.all([import('three'), import('three/addons/objects/Reflector.js')])
        THREE = modules[0]
        if (disposed) return
        renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'high-performance' })
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.NeutralToneMapping
        renderer.toneMappingExposure = 1.00
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.VSMShadowMap
        renderer.shadowMap.autoUpdate = false
        renderer.shadowMap.needsUpdate = true
        renderer.setClearColor(0x071222, 1)
        renderer.debug.onShaderError = fail
        renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none'
        renderer.domElement.setAttribute('aria-hidden', 'true')
        container.appendChild(renderer.domElement)
        listen(renderer.domElement, 'webglcontextlost', (event) => { event.preventDefault(); fail() })
        scene = new THREE.Scene()
        scene.fog = new THREE.FogExp2(0x071222, 0.021)
        // Local softbox reflections give metal its shape without a remote HDR file.
        const studio = new THREE.Scene()
        studio.background = new THREE.Color(0x18202b)
        const softboxGeometry = new THREE.PlaneGeometry(8, 5)
        const softboxMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.0, 2.65, 2.10), side: THREE.DoubleSide })
        const softbox = new THREE.Mesh(softboxGeometry, softboxMaterial)
        softbox.position.set(-4, 5, 5)
        softbox.lookAt(0, 0, 0)
        studio.add(softbox)
        const edgeboxMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.1, 2.2, 2.4), side: THREE.DoubleSide })
        const edgeboxGeometry = new THREE.PlaneGeometry(2, 6)
        const edgebox = new THREE.Mesh(edgeboxGeometry, edgeboxMaterial)
        edgebox.position.set(5, 3.5, -2)
        edgebox.lookAt(0, 0, 0)
        studio.add(edgebox)
        const reflector = new THREE.PMREMGenerator(renderer)
        environment = reflector.fromScene(studio, 0.08)
        scene.environment = environment.texture
        scene.environmentIntensity = 0.65
        reflector.dispose()
        softboxGeometry.dispose()
        softboxMaterial.dispose()
        edgeboxGeometry.dispose()
        edgeboxMaterial.dispose()
        camera = new THREE.PerspectiveCamera(37, 1, 0.08, 100)
        currentPosition = new THREE.Vector3(); currentTarget = new THREE.Vector3()
        desiredPosition = new THREE.Vector3(); desiredTarget = new THREE.Vector3()
        const loader = new THREE.TextureLoader(), base = import.meta.env.BASE_URL
        const load = async (name) => {
          const texture = await loader.loadAsync(`${base}assets/${name}`)
          if (disposed || failed) { texture.dispose(); return undefined }
          texture.colorSpace = THREE.SRGBColorSpace
          texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
          loadedTextures.push(texture)
          return texture
        }
        const [courseTexture, processTexture] = await Promise.all([load('project-course.png'), load('project-process.png')])
        if (disposed || failed) { loadedTextures.forEach((texture) => texture.dispose()); return }
        stage = createStageWorld(THREE, courseTexture, processTexture, modules[1].Reflector)
        scene.add(stage.world)
        listen(window, 'scroll', visibility, { passive: true })
        listen(window, 'pointermove', (event) => {
          if (pausedRef.current || compact || !inView) return
          const bounds = container.getBoundingClientRect()
          const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom
          pointer.x = inside ? ((event.clientX - bounds.left) / bounds.width - 0.5) * 2 : 0
          pointer.y = inside ? -((event.clientY - bounds.top) / bounds.height - 0.5) * 2 : 0
        }, { passive: true })
        listen(document, 'visibilitychange', () => { pageVisible = !document.hidden; visibility() })
        if ('ResizeObserver' in window) { resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container) }
        else listen(window, 'resize', resize, { passive: true })
        if ('IntersectionObserver' in window) {
          intersectionObserver = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; visibility() })
          intersectionObserver.observe(container)
        }
        resize()
      } catch { if (!stage) loadedTextures.forEach((texture) => texture.dispose()); fail() }
    }
    initialize()
    return () => {
      disposed = true
      if (controllerRef.current === controller) controllerRef.current = null
      release()
      readyRef.current?.(false)
    }
  }, [reducedMotion])
  return <div className="stage-canvas" aria-hidden="true" ref={containerRef} />
}
