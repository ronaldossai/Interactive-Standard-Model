import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { Mesh, Vector3 } from 'three'

const ForceVisualization = () => {
  const lineRef = useRef<Mesh>(null!)

  useFrame((state) => {
    // Animate force field lines
    if (lineRef.current) {
      lineRef.current.rotation.z = state.clock.elapsedTime * 0.2
    }
  })

  // Generate some force field lines between particle groups
  const forceLines = [
    // Electromagnetic force lines (photon interactions)
    {
      points: [new Vector3(-4, 0, 0), new Vector3(0, 0, 0)],
      color: "#ffeb3b",
      opacity: 0.3
    },
    {
      points: [new Vector3(0, 0, 0), new Vector3(4, 0, 0)],
      color: "#ffeb3b", 
      opacity: 0.3
    },
    // Strong force lines (gluon interactions)
    {
      points: [new Vector3(-4, 1, 0), new Vector3(-4, -1, 0)],
      color: "#f44336",
      opacity: 0.4
    },
    // Weak force lines
    {
      points: [new Vector3(0, 1, 0), new Vector3(0, -1, 0)],
      color: "#2196f3",
      opacity: 0.3
    }
  ]

  return (
    <group ref={lineRef}>
      {forceLines.map((line, index) => (
        <Line
          key={index}
          points={line.points}
          color={line.color}
          lineWidth={2}
          transparent
          opacity={line.opacity}
        />
      ))}
      
      {/* Add some particle interaction indicators */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[5, 5.1, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
    </group>
  )
}

export default ForceVisualization