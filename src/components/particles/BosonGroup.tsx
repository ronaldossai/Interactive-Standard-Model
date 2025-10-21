import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface BosonProps {
  name: string
  position: [number, number, number]
  color: string
  role: string
  geometry: 'sphere' | 'box' | 'octahedron'
}

const Boson = ({ position, color, geometry }: Pick<BosonProps, 'position' | 'color' | 'geometry'>) => {
  const meshRef = useRef<Mesh>(null!)

  useFrame((state) => {
    // Add pulsing effect for bosons (force carriers)
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
    meshRef.current.scale.setScalar(pulse)
  })

  const renderGeometry = () => {
    switch (geometry) {
      case 'box':
        return <boxGeometry args={[0.5, 0.5, 0.5]} />
      case 'octahedron':
        return <octahedronGeometry args={[0.4]} />
      default:
        return <sphereGeometry args={[0.35, 32, 32]} />
    }
  }

  return (
    <mesh ref={meshRef} position={position}>
      {renderGeometry()}
      <meshStandardMaterial color={color} />
      {/* Particle label */}
      <mesh position={[0, 0.7, 0]}>
        <planeGeometry args={[1.2, 0.3]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} />
      </mesh>
    </mesh>
  )
}

const BosonGroup = () => {
  const bosons = [
    { 
      name: "Photon", 
      position: [-1, 1.5, 0] as [number, number, number], 
      color: "#ffeb3b", 
      role: "Electromagnetic force",
      geometry: "sphere" as const
    },
    { 
      name: "W Boson", 
      position: [0, 1, 0] as [number, number, number], 
      color: "#2196f3", 
      role: "Weak force",
      geometry: "box" as const
    },
    { 
      name: "Z Boson", 
      position: [1, 1.5, 0] as [number, number, number], 
      color: "#3f51b5", 
      role: "Weak force",
      geometry: "box" as const
    },
    { 
      name: "Gluon", 
      position: [-1, 0, 0] as [number, number, number], 
      color: "#f44336", 
      role: "Strong force",
      geometry: "octahedron" as const
    },
    { 
      name: "Higgs", 
      position: [0, -0.5, 0] as [number, number, number], 
      color: "#9c27b0", 
      role: "Mass generation",
      geometry: "sphere" as const
    },
  ]

  return (
    <group>
      {bosons.map((boson) => (
        <Boson key={boson.name} {...boson} />
      ))}
      {/* Group label */}
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[2, 0.4]} />
        <meshBasicMaterial color="white" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

export default BosonGroup