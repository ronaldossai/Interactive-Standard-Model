import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Line, Text } from '@react-three/drei'
import { Group, Mesh, Vector3 } from 'three'
import { useParticle } from '../../context/ParticleContext'
import { ALL_PARTICLES } from '../../data/particleData'

interface CarrierInfo {
  color: string
  symbol: string
  name: string
  particleId: string
}

const INTERACTION_MAP: Record<string, CarrierInfo> = {
  'Electromagnetic': { color: '#ffeb3b', symbol: 'γ',  name: 'Photon',      particleId: 'photon' },
  'Strong':          { color: '#f44336', symbol: 'g',  name: 'Gluon',       particleId: 'gluon'  },
  'Higgs field':     { color: '#ce93d8', symbol: 'H',  name: 'Higgs Boson', particleId: 'higgs'  },
}

// Weak splits into two separate clickable carriers
const WEAK_CARRIERS: CarrierInfo[] = [
  { color: '#42a5f5', symbol: 'W±', name: 'W Boson', particleId: 'w-boson' },
  { color: '#3f51b5', symbol: 'Z',  name: 'Z Boson', particleId: 'z-boson' },
]

// Animated force-carrier bubble shown beside the main particle
const ForceCarrier = ({
  info,
  stackPosition,
  targetOffset,
  onClick,
}: {
  info: CarrierInfo
  stackPosition: [number, number, number]
  targetOffset: [number, number, number]
  onClick?: () => void
}) => {
  const floatRef  = useRef<Group>(null!)
  const haloRef   = useRef<Group>(null!)
  const glowRef   = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Gentle float
    if (floatRef.current) {
      floatRef.current.position.y =
        Math.sin(t * 1.2 + stackPosition[1] * 2) * 0.04
    }

    // Pulse the outer glow
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 2.5) * 0.12
      glowRef.current.scale.set(s, s, s)
    }

    // Spin halos
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.6
      haloRef.current.rotation.x =
        Math.PI / 2 + Math.sin(t * 0.4) * 0.2
    }
  })

  const linePoints: Vector3[] = [
    new Vector3(0, 0, 0),
    new Vector3(targetOffset[0], targetOffset[1], targetOffset[2]),
  ]

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick?.()
  }

  return (
    <group position={stackPosition}>
      <group ref={floatRef}>
        {/* Outer glow */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.10, 32, 32]} />
          <meshStandardMaterial
            color={info.color}
            emissive={info.color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>

        {/* Invisible hit area (larger for easier clicking) */}
        <mesh
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Core sphere */}
        <mesh>
          <sphereGeometry args={[0.05, 32, 32]} />
          <meshStandardMaterial
            color={info.color}
            emissive={info.color}
            emissiveIntensity={hovered ? 1.4 : 0.7}
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Hot inner core */}
        <mesh>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.0}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Dual animated halo rings */}
        <group ref={haloRef}>
          <mesh>
            <torusGeometry args={[0.08, 0.004, 8, 48]} />
            <meshStandardMaterial
              color={info.color}
              emissive={info.color}
              emissiveIntensity={1.5}
              transparent
              opacity={0.55}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 3, Math.PI / 5]}>
            <torusGeometry args={[0.10, 0.003, 8, 48]} />
            <meshStandardMaterial
              color={info.color}
              emissive={info.color}
              emissiveIntensity={1.0}
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>

        {/* Symbol */}
        <Text
          position={[0, 0, 0.08]}
          fontSize={0.045}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.003}
          outlineColor="#000000"
        >
          {info.symbol}
        </Text>

        {/* Name label below */}
        <Text
          position={[0, -0.14, 0]}
          fontSize={0.035}
          color={hovered ? '#ffffff' : info.color}
          anchorX="center"
          anchorY="top"
          outlineWidth={0.003}
          outlineColor="#000000"
        >
          {hovered ? `→ ${info.name}` : info.name}
        </Text>

        {/* Point light for real glow */}
        <pointLight color={info.color} intensity={0.3} distance={1.0} decay={2} />
      </group>

      {/* Connector line (outside float group so it stays anchored) */}
      <Line
        points={linePoints}
        color={info.color}
        lineWidth={1}
        transparent
        opacity={0.25}
        dashed
        dashSize={0.08}
        gapSize={0.05}
      />
    </group>
  )
}

// Visualizations for when zoomed into a particle
export const DetailedParticleView = () => {
  const { selectedParticle, isZoomedIn, selectParticle } = useParticle()
  const groupRef = useRef<Group>(null!)
  const orbitRef = useRef<Group>(null!)
  const colorChargeRef = useRef<Group>(null!)
  
  useFrame((state) => {
    if (!groupRef.current || !isZoomedIn) return
    
    // Animate orbital elements
    if (orbitRef.current) {
      orbitRef.current.rotation.z = state.clock.elapsedTime * 0.3
    }
    
    // Rotate color charges for quarks
    if (colorChargeRef.current) {
      colorChargeRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  if (!isZoomedIn || !selectedParticle) return null

  const particlePos = selectedParticle.position

  // Render force carriers as animated bubbles stacked on the left,
  // each connected to the central particle by a dashed line.
  const renderInteractions = () => {
    if (!selectedParticle.interactions?.length) return null

    // Expand 'Weak' into separate W and Z boson bubbles
    const expanded: CarrierInfo[] = []
    selectedParticle.interactions.forEach(interaction => {
      if (interaction === 'Weak') {
        expanded.push(...WEAK_CARRIERS)
      } else {
        const info = INTERACTION_MAP[interaction]
        if (info) expanded.push(info)
      }
    })

    const count   = expanded.length
    const spacing = 0.7
    const startY  = ((count - 1) * spacing) / 2
    const stackX  = -2.0

    const handleCarrierClick = (particleId: string) => {
      const target = ALL_PARTICLES.find((p: { id: string }) => p.id === particleId)
      if (target) selectParticle(target)
    }

    return expanded.map((info, index) => {
      const y = startY - index * spacing
      return (
        <ForceCarrier
          key={`${info.particleId}-${index}`}
          info={info}
          stackPosition={[stackX, y, 0]}
          targetOffset={[-stackX, -y, 0]}
          onClick={() => handleCarrierClick(info.particleId)}
        />
      )
    })
  }

  // Render particle-specific visualizations
  const renderParticleSpecificEffects = () => {
    switch (selectedParticle.type) {
      case 'quark':
        // Color charge visualization for quarks
        return (
          <group ref={colorChargeRef}>
            {/* Three color charges orbiting */}
            {['#ff0000', '#00ff00', '#0000ff'].map((color, i) => {
              const angle = (i / 3) * Math.PI * 2
              return (
                <mesh
                  key={color}
                  position={[
                    Math.cos(angle) * 0.8,
                    Math.sin(angle) * 0.8,
                    0
                  ]}
                >
                  <sphereGeometry args={[0.05, 16, 16]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.8}
                  />
                </mesh>
              )
            })}
          </group>
        )
      
      case 'boson':
        // Wave-like effect for force carriers
        return (
          <group ref={orbitRef}>
            {[0, 1, 2, 3].map((i) => {
              const radius = 1 + i * 0.2
              const points: Vector3[] = []
              for (let j = 0; j <= 32; j++) {
                const t = j / 32
                const theta = t * Math.PI * 4
                const wave = Math.sin(theta * 2) * 0.1
                points.push(new Vector3(
                  Math.cos(theta) * (radius + wave),
                  wave * 2,
                  Math.sin(theta) * (radius + wave)
                ))
              }
              return (
                <Line
                  key={`wave-${i}`}
                  points={points}
                  color={selectedParticle.color}
                  lineWidth={2}
                  transparent
                  opacity={0.5 - i * 0.1}
                />
              )
            })}
          </group>
        )
      
      case 'lepton':
        // Probability cloud for leptons
        return (
          <mesh>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial
              color={selectedParticle.color}
              transparent
              opacity={0.1}
              depthWrite={false}
            />
          </mesh>
        )
      
      default:
        return null
    }
  }

  return (
    <group ref={groupRef} position={[particlePos.x, particlePos.y, particlePos.z]}>
      {/* Particle-specific effects */}
      {renderParticleSpecificEffects()}
      
      {/* Interaction indicators */}
      {renderInteractions()}
    </group>
  )
}
