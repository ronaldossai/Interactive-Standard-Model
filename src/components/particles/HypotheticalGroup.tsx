import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Mesh, Group, MeshBasicMaterial } from 'three'
import { Particle } from './Particle'
import { HYPOTHETICAL_DATA } from '../../data/particleData'
import { useParticle } from '../../context/ParticleContext'

// Pulsing wireframe overlay to visually distinguish hypothetical particles
const HypotheticalOverlay = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime
      const mat = meshRef.current.material as MeshBasicMaterial
      mat.opacity = 0.25 + Math.sin(t * 1.5) * 0.15
      meshRef.current.rotation.y = t * 0.4
      meshRef.current.rotation.z = t * 0.25
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <dodecahedronGeometry args={[0.75, 0]} />
      <meshBasicMaterial
        color="#34d399"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  )
}

// Question mark label above the graviton
const HypotheticalLabel = ({ position }: { position: [number, number, number] }) => {
  const groupRef = useRef<Group>(null!)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + 1.2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }
  })

  return (
    <group ref={groupRef} position={[position[0], position[1] + 1.2, position[2]]}>
      <Text
        fontSize={0.22}
        color="#34d399"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        HYPOTHETICAL
      </Text>
    </group>
  )
}

const HypotheticalGroup = () => {
  const { isZoomedIn, selectedParticle } = useParticle()

  return (
    <group>
      {HYPOTHETICAL_DATA.map((particle) => {
        const pos: [number, number, number] = [
          particle.position.x,
          particle.position.y,
          particle.position.z,
        ]
        // Show overlay when: overview mode OR zoomed into this specific particle
        const isThisParticleSelected = selectedParticle?.id === particle.id
        const showOverlay = !isZoomedIn || isThisParticleSelected
        return (
          <group key={particle.id}>
            {/* Base particle always renders (needed for click/selection) */}
            <Particle
              data={particle}
              geometry="icosahedron"
              scale={1.1}
            />
            {/* Overlay: hidden when zoomed into a different particle */}
            {showOverlay && (
              <>
                <HypotheticalOverlay position={pos} />
                {/* Label only shown in overview */}
                {!isZoomedIn && <HypotheticalLabel position={pos} />}
              </>
            )}
          </group>
        )
      })}
    </group>
  )
}

export default HypotheticalGroup
