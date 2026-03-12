import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Text } from '@react-three/drei'
import { Group, Vector3 } from 'three'
import { useParticle } from '../../context/ParticleContext'

interface CarrierInfo {
  color: string
  symbol: string
  name: string
}

const INTERACTION_MAP: Record<string, CarrierInfo> = {
  'Electromagnetic': { color: '#ffeb3b', symbol: 'γ',   name: 'Photon'      },
  'Strong':          { color: '#f44336', symbol: 'g',   name: 'Gluon'       },
  'Weak':            { color: '#42a5f5', symbol: 'W±/Z', name: 'W / Z Boson' },
  'Higgs field':     { color: '#ce93d8', symbol: 'H',   name: 'Higgs Boson' },
}

// Visualizations for when zoomed into a particle
export const DetailedParticleView = () => {
  const { selectedParticle, isZoomedIn } = useParticle()
  const groupRef = useRef<Group>(null!)
  const orbitRef = useRef<Group>(null!)
  
  useFrame((state) => {
    if (!groupRef.current || !isZoomedIn) return
    
    // Animate orbital elements
    if (orbitRef.current) {
      orbitRef.current.rotation.z = state.clock.elapsedTime * 0.3
    }
  })

  if (!isZoomedIn || !selectedParticle) return null

  const particlePos = selectedParticle.position

  // Generate orbital rings based on particle type
  const renderOrbitalRings = () => {
    const rings = []
    const ringCount = selectedParticle.type === 'boson' ? 2 : 3
    
    for (let i = 0; i < ringCount; i++) {
      const radius = 1.2 + i * 0.4
      const points: Vector3[] = []
      const segments = 64
      
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2
        points.push(new Vector3(
          Math.cos(theta) * radius,
          Math.sin(theta) * radius * 0.3, // Flatten the orbit
          Math.sin(theta) * radius * 0.8
        ))
      }
      
      rings.push(
        <Line
          key={`ring-${i}`}
          points={points}
          color={selectedParticle.color}
          // bold= false // Make the innermost ring bolder
          lineWidth={1}
          transparent
          opacity={0.3 - i * 0.08}
        />
      )
    }
    return rings
  }

  // Render force carriers as a vertical stack on the left-hand side,
  // each with a name label above and a connecting line to the main particle.
  const renderInteractions = () => {
    if (!selectedParticle.interactions?.length) return null

    const count = selectedParticle.interactions.length
    const spacing = 1.15
    const startY = ((count - 1) * spacing) / 2
    const stackX = -2.4

    return selectedParticle.interactions.map((interaction, index) => {
      const info = INTERACTION_MAP[interaction]
      if (!info) return null

      const y = startY - index * spacing

      // Line drawn in the carrier's local space: [0,0,0] → main particle offset
      const linePoints: Vector3[] = [
        new Vector3(0, 0, 0),
        new Vector3(-stackX, -y, 0),
      ]

      return (
        <group key={interaction} position={[stackX, y, 0]}>
          {/* Carrier name label above the sphere */}
          <Text
            position={[0, 0.55, 0]}
            fontSize={0.16}
            color={info.color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.008}
            outlineColor="#000000"
          >
            {info.name}
          </Text>

          {/* Carrier sphere */}
          <mesh>
            <sphereGeometry args={[0.28, 32, 32]} />
            <meshStandardMaterial
              color={info.color}
              emissive={info.color}
              emissiveIntensity={0.55}
              transparent
              opacity={0.92}
            />
          </mesh>

          {/* Symbol rendered just in front of the sphere */}
          <Text
            position={[0, 0, 0.3]}
            fontSize={0.21}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {info.symbol}
          </Text>

          {/* Glow ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.34, 0.025, 8, 48]} />
            <meshStandardMaterial
              color={info.color}
              emissive={info.color}
              emissiveIntensity={1.0}
              transparent
              opacity={0.55}
            />
          </mesh>

          {/* Dashed connector line to the central particle */}
          <Line
            points={linePoints}
            color={info.color}
            lineWidth={1}
            transparent
            opacity={0.35}
            dashed
            dashSize={0.1}
            gapSize={0.07}
          />
        </group>
      )
    })
  }

  // Render particle-specific visualizations
  const renderParticleSpecificEffects = () => {
    switch (selectedParticle.type) {
      case 'quark':
        // Color charge visualization for quarks
        return (
          <group>
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
                  <sphereGeometry args={[0.08, 16, 16]} />
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
      {/* Orbital rings */}
      {renderOrbitalRings()}
      
      {/* Particle-specific effects */}
      {renderParticleSpecificEffects()}
      
      {/* Interaction indicators */}
      {renderInteractions()}
    </group>
  )
}
