import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import QuarkGroup from './particles/QuarkGroup'
import LeptonGroup from './particles/LeptonGroup'
import BosonGroup from './particles/BosonGroup'
import ForceVisualization from './forces/ForceVisualization'

const StandardModelScene = () => {
  const sceneRef = useRef<Mesh>(null!)

  useFrame((_state, delta) => {
    // Add subtle rotation to the entire scene
    if (sceneRef.current) {
      sceneRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group ref={sceneRef}>
      {/* Quarks positioned on the left */}
      <group position={[-4, 0, 0]}>
        <QuarkGroup />
      </group>

      {/* Leptons positioned in the center */}
      <group position={[0, 0, 0]}>
        <LeptonGroup />
      </group>

      {/* Bosons positioned on the right */}
      <group position={[4, 0, 0]}>
        <BosonGroup />
      </group>

      {/* Force visualization overlay */}
      <ForceVisualization />
    </group>
  )
}

export default StandardModelScene