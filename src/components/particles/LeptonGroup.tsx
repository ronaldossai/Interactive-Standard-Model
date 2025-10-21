import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface LeptonProps {
  name: string
  position: [number, number, number]
  color: string
  mass: string
}

const Lepton = ({ position, color }: Pick<LeptonProps, 'position' | 'color'>) => {
  const meshRef = useRef<Mesh>(null!)

  useFrame((state) => {
    // Add orbital motion
    const time = state.clock.elapsedTime
    meshRef.current.position.x = position[0] + Math.cos(time + position[1]) * 0.05
    meshRef.current.position.z = position[2] + Math.sin(time + position[1]) * 0.05
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.25, 32, 32]} />
      <meshStandardMaterial color={color} />
      {/* Particle label */}
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={[1, 0.3]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} />
      </mesh>
    </mesh>
  )
}

const LeptonGroup = () => {
  const leptons = [
    { name: "Electron", position: [-1, 1, 0] as [number, number, number], color: "#e74c3c", mass: "0.511 MeV" },
    { name: "Electron Neutrino", position: [1, 1, 0] as [number, number, number], color: "#f39c12", mass: "< 2 eV" },
    { name: "Muon", position: [-1, 0, 0] as [number, number, number], color: "#9b59b6", mass: "105.7 MeV" },
    { name: "Muon Neutrino", position: [1, 0, 0] as [number, number, number], color: "#3498db", mass: "< 0.19 MeV" },
    { name: "Tau", position: [-1, -1, 0] as [number, number, number], color: "#2ecc71", mass: "1777 MeV" },
    { name: "Tau Neutrino", position: [1, -1, 0] as [number, number, number], color: "#1abc9c", mass: "< 18.2 MeV" },
  ]

  return (
    <group>
      {leptons.map((lepton) => (
        <Lepton key={lepton.name} {...lepton} />
      ))}
      {/* Group label */}
      <mesh position={[0, 2, 0]}>
        <planeGeometry args={[2, 0.4]} />
        <meshBasicMaterial color="white" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

export default LeptonGroup