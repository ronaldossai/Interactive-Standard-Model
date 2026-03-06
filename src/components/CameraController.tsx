import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useParticle } from '../context/ParticleContext'

const OVERVIEW_POSITION = new Vector3(0, 0, 18)
const ZOOM_DISTANCE = 3

export const CameraController = () => {
  const { camera } = useThree()
  const { selectedParticle, isZoomedIn } = useParticle()
  
  const targetPosition = useRef(OVERVIEW_POSITION.clone())
  const targetLookAt = useRef(new Vector3(0, 0, 0))
  const currentLookAt = useRef(new Vector3(0, 0, 0))

  useEffect(() => {
    if (isZoomedIn && selectedParticle) {
      // Zoom to the selected particle
      const particlePos = selectedParticle.position
      targetPosition.current.set(
        particlePos.x,
        particlePos.y,
        particlePos.z + ZOOM_DISTANCE
      )
      targetLookAt.current.copy(particlePos)
    } else {
      // Return to overview
      targetPosition.current.copy(OVERVIEW_POSITION)
      targetLookAt.current.set(0, 0, 0)
    }
  }, [isZoomedIn, selectedParticle])

  useFrame((_, delta) => {
    // Smooth camera movement
    const lerpFactor = 1 - Math.pow(0.001, delta)
    
    camera.position.lerp(targetPosition.current, lerpFactor * 3)
    currentLookAt.current.lerp(targetLookAt.current, lerpFactor * 3)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
