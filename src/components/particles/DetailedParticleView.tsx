import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { Group, Vector3 } from 'three'
import { useParticle } from '../../context/ParticleContext'

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

  // Render interaction indicators (visual only, no text labels)
  const renderInteractions = () => {
    if (!selectedParticle.interactions) return null 
    
    const interactionColors: Record<string, string> = {
      'Strong': '#f44336',
      'Weak': '#2196f3',
      'Electromagnetic': '#ffeb3b',
      'Higgs field': '#9c27b0',
    }

    return selectedParticle.interactions.map((interaction, index) => {
      const angle = (index / selectedParticle.interactions!.length) * Math.PI * 2
      const radius = 2.2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius * 0.5
      
      return (
        <group key={interaction} position={[x, y, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={interactionColors[interaction] || '#ffffff'}
              emissive={interactionColors[interaction] || '#ffffff'}
              emissiveIntensity={0.5}
            />
          </mesh>
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
