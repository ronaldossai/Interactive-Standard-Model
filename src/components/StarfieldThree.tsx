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

export const StarfieldThree = ({
  count = 800,
  spread = 50,
  depth = 20,
  twinkleSpeed = 2,
  size = 1.0,
  showStats = false,
}: StarfieldProps) => {
  const pointsRef = useRef<THREE.Points>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

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

  // Animate time uniform
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    
    // Subtle parallax based on mouse movement
    if (pointsRef.current) {
      pointsRef.current.position.x = state.mouse.x * 1.5
      pointsRef.current.position.y = state.mouse.y * 1.5
    }
  })

  return (
    <group renderOrder={-100}>
      {showStats && <Stats />}
      {/* Black space background */}
      <mesh position={[0, 0, -25]} renderOrder={-200}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  )
}
