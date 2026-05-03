import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stats } from '@react-three/drei'

interface StarfieldProps {
  count?: number
  spread?: number
  depth?: number
  twinkleSpeed?: number
  size?: number
  showStats?: boolean
}

// Virtual particle force colours — matching the app's boson palette
const FORCE_COLORS: [number, number, number][] = [
  [0.4,  1.0,  0.4],   // Photon  γ  — green
  [0.0,  0.85, 0.85],  // Gluon   g  — cyan / teal
  [1.0,  0.25, 0.85],  // W boson    — pink / magenta
  [0.9,  0.9,  0.2],   // Z⁰ boson   — yellow
]
const EXCHANGE_COUNT = 20  // simultaneous virtual-particle exchanges
const TRAIL_LENGTH   = 6   // point trail behind each VP head

export const StarfieldThree = ({
  count = 800,
  spread = 50,
  depth = 20,
  twinkleSpeed = 2,
  size = 1.0,
  showStats = false,
}: StarfieldProps) => {
  const starGroupRef = useRef<THREE.Group>(null!)
  const pointsRef    = useRef<THREE.Points>(null!)
  const materialRef  = useRef<THREE.ShaderMaterial>(null!)
  const vpPointsRef  = useRef<THREE.Points>(null!)

  // Generate star positions, sizes, phase offsets, and colors
  const { positions, sizes, phases, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const phases = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Spread stars across a 2D plane with slight depth variation
      const x = (Math.random() - 0.5) * spread
      const y = (Math.random() - 0.5) * spread * 0.7 // aspect ratio compensation
      const z = -Math.random() * depth - 5 // push behind the grid

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      sizes[i] = (Math.random() * 0.8 + 0.2) * size
      phases[i] = Math.random() * Math.PI * 2

      // Pure white stars
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 1.0
      colors[i * 3 + 2] = 1.0
    }

    return { positions, sizes, phases, colors }
  }, [count, spread, depth, size])

  // Build geometry with attributes
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geom.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geom
  }, [positions, sizes, phases, colors])

  // Shader material for twinkling stars
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uTwinkleSpeed: { value: twinkleSpeed },
      },
      vertexShader: `
        attribute float size;
        attribute float phase;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uTwinkleSpeed;
        
        varying float vAlpha;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          
          // Twinkling effect with phase offset
          float twinkle = sin(uTime * uTwinkleSpeed + phase * 3.14159) * 0.5 + 0.5;
          vAlpha = 0.3 + twinkle * 0.7;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z) * uPixelRatio;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;
        
        void main() {
          // Circular point with soft edges
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          float alpha = smoothstep(0.5, 0.4, dist);
          
          gl_FragColor = vec4(vColor, vAlpha * alpha);
        }
      `,
    })
  }, [twinkleSpeed])

  // ── Virtual particle exchange system ────────────────────────────────────

  // Mutable exchange state — no re-render needed
  const exchangesRef = useRef(
    Array.from({ length: EXCHANGE_COUNT }, () => ({
      startIdx: Math.floor(Math.random() * count),
      endIdx:   Math.floor(Math.random() * count),
      progress: Math.random(),                            // stagger spawns
      speed:    0.25 + Math.random() * 0.4,
      color:    FORCE_COLORS[Math.floor(Math.random() * FORCE_COLORS.length)],
    }))
  )

  // Dynamic GPU buffers (updated every frame)
  const vpBuffers = useMemo(() => {
    const total = EXCHANGE_COUNT * TRAIL_LENGTH
    return {
      posArr:  new Float32Array(total * 3),
      colArr:  new Float32Array(total * 3),
      sizeArr: new Float32Array(total),
    }
  }, [])

  const vpGeometry = useMemo(() => {
    const geom     = new THREE.BufferGeometry()
    const posAttr  = new THREE.BufferAttribute(vpBuffers.posArr,  3)
    const colAttr  = new THREE.BufferAttribute(vpBuffers.colArr,  3)
    const sizeAttr = new THREE.BufferAttribute(vpBuffers.sizeArr, 1)
    posAttr .setUsage(THREE.DynamicDrawUsage)
    colAttr .setUsage(THREE.DynamicDrawUsage)
    sizeAttr.setUsage(THREE.DynamicDrawUsage)
    geom.setAttribute('position', posAttr)
    geom.setAttribute('color',    colAttr)
    geom.setAttribute('size',     sizeAttr)
    return geom
  }, [vpBuffers])

  // Simple glowing-dot shader — additive, vertex-coloured, size from attribute
  const vpMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: `
      attribute float size;
      uniform float uPixelRatio;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z) * uPixelRatio;
        gl_Position  = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2  center = gl_PointCoord - vec2(0.5);
        float dist   = length(center);
        float alpha  = smoothstep(0.5, 0.05, dist);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  }), [])

  // Animate time uniform
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }

    // Parallax — move the whole group so VP particles track with stars
    if (starGroupRef.current) {
      starGroupRef.current.position.x = state.mouse.x * 1.5
      starGroupRef.current.position.y = state.mouse.y * 1.5
    }

    // ── Update virtual particle exchanges ──────────────────────────────
    const posAttr  = vpGeometry.getAttribute('position') as THREE.BufferAttribute
    const colAttr  = vpGeometry.getAttribute('color')    as THREE.BufferAttribute
    const sizeAttr = vpGeometry.getAttribute('size')     as THREE.BufferAttribute

    for (let i = 0; i < EXCHANGE_COUNT; i++) {
      const ex = exchangesRef.current[i]
      ex.progress += delta * ex.speed

      // Respawn with a new random pair when the exchange completes
      if (ex.progress >= 1.0) {
        ex.progress = 0
        const si = Math.floor(Math.random() * count)
        let   ei = Math.floor(Math.random() * count)
        if (si === ei) ei = (ei + 1) % count
        ex.startIdx = si
        ex.endIdx   = ei
        ex.speed    = 0.25 + Math.random() * 0.4
        ex.color    = FORCE_COLORS[Math.floor(Math.random() * FORCE_COLORS.length)]
      }

      const startX = positions[ex.startIdx * 3]
      const startY = positions[ex.startIdx * 3 + 1]
      const startZ = positions[ex.startIdx * 3 + 2]
      const endX   = positions[ex.endIdx * 3]
      const endY   = positions[ex.endIdx * 3 + 1]
      const endZ   = positions[ex.endIdx * 3 + 2]

      const dX    = endX - startX
      const dY    = endY - startY
      const len2D = Math.sqrt(dX * dX + dY * dY) || 1
      // Perpendicular normal for the arc bulge
      const nx = -dY / len2D
      const ny =  dX / len2D

      // Smooth fade-in at birth, fade-out at death
      const envFade = Math.sin(ex.progress * Math.PI)

      for (let t = 0; t < TRAIL_LENGTH; t++) {
        const tp = ex.progress - (t / TRAIL_LENGTH) * 0.15
        const cp = Math.max(0, Math.min(1, tp))

        // Slight arc perpendicular to the travel direction (virtual-tunnelling feel)
        const arc = Math.sin(cp * Math.PI) * len2D * 0.07
        const px  = startX + dX * cp + nx * arc
        const py  = startY + dY * cp + ny * arc
        const pz  = startZ + (endZ - startZ) * cp

        const bi = (i * TRAIL_LENGTH + t) * 3
        posAttr.array[bi]     = px
        posAttr.array[bi + 1] = py
        posAttr.array[bi + 2] = pz

        const trailFade = Math.pow(1.0 - t / TRAIL_LENGTH, 1.5) * envFade
        colAttr.array[bi]     = ex.color[0] * trailFade
        colAttr.array[bi + 1] = ex.color[1] * trailFade
        colAttr.array[bi + 2] = ex.color[2] * trailFade

        sizeAttr.array[i * TRAIL_LENGTH + t] = Math.max(0, trailFade * 1.4)
      }
    }

    posAttr .needsUpdate = true
    colAttr .needsUpdate = true
    sizeAttr.needsUpdate = true
  })

  return (
    <group renderOrder={-100}>
      {showStats && <Stats />}
      {/* Black space background */}
      <mesh position={[0, 0, -25]} renderOrder={-200}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <group ref={starGroupRef}>
        <points ref={pointsRef} geometry={geometry} material={material} />
        <points ref={vpPointsRef} geometry={vpGeometry} material={vpMaterial} />
      </group>
    </group>
  )
}
