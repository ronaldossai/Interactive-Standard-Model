import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface QuarkProps {
  name: string
  position: [number, number, number]
  color: string
  charge: number
}

const Quark = ({ position, color }: Pick<QuarkProps, 'position' | 'color'>) => {
  const meshRef = useRef<Mesh>(null!)

  useFrame((state) => {
    // Add subtle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color={color} />
      {/* Particle label */}
      <mesh position={[0, 0.6, 0]}>
        <planeGeometry args={[1, 0.3]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} />
      </mesh>
    </mesh>
  )
}

const QuarkGroup = () => {
  const quarks = [
    { name: "Up", position: [-1, 1, 0] as [number, number, number], color: "#ff6b6b", charge: 2/3 },
    { name: "Down", position: [1, 1, 0] as [number, number, number], color: "#4ecdc4", charge: -1/3 },
    { name: "Charm", position: [-1, 0, 0] as [number, number, number], color: "#45b7d1", charge: 2/3 },
    { name: "Strange", position: [1, 0, 0] as [number, number, number], color: "#96ceb4", charge: -1/3 },
    { name: "Top", position: [-1, -1, 0] as [number, number, number], color: "#feca57", charge: 2/3 },
    { name: "Bottom", position: [1, -1, 0] as [number, number, number], color: "#ff9ff3", charge: -1/3 },
  ]

  return (
    <group>
      {quarks.map((quark) => (
        <Quark key={quark.name} {...quark} />
      ))}
      {/* Group label */}
      <mesh position={[0, 2, 0]}>
        <planeGeometry args={[2, 0.4]} />
        <meshBasicMaterial color="white" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

export default QuarkGroup