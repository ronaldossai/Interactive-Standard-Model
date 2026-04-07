import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useParticle } from '../context/ParticleContext'

const OVERVIEW_POSITION = new Vector3(0, 0, 18)
const ZOOM_DISTANCE = 3

// Easing functions for smooth camera motion
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export const CameraController = () => {
  const { camera } = useThree()
  const { selectedParticle, isZoomedIn } = useParticle()
  
  const targetPosition = useRef(OVERVIEW_POSITION.clone())
  const targetLookAt = useRef(new Vector3(0, 0, 0))
  const currentLookAt = useRef(new Vector3(0, 0, 0))
  
  // Animation state for smooth transitions
  const isTransitioning = useRef(false)
  const transitionProgress = useRef(0)
  const transitionDuration = 0.8 // seconds
  const startPosition = useRef(new Vector3())
  const startLookAt = useRef(new Vector3())

  useEffect(() => {
    if (isZoomedIn && selectedParticle) {
      // Start transition to particle
      isTransitioning.current = true
      transitionProgress.current = 0
      startPosition.current.copy(camera.position)
      startLookAt.current.copy(currentLookAt.current)
      
      // Zoom to the selected particle
      const particlePos = selectedParticle.position
      targetPosition.current.set(
        particlePos.x,
        particlePos.y,
        particlePos.z + ZOOM_DISTANCE
      )
      targetLookAt.current.copy(particlePos)
    } else {
      // Start transition back to overview
      isTransitioning.current = true
      transitionProgress.current = 0
      startPosition.current.copy(camera.position)
      startLookAt.current.copy(currentLookAt.current)
      
      // Return to overview
      targetPosition.current.copy(OVERVIEW_POSITION)
      targetLookAt.current.set(0, 0, 0)
    }
  }, [isZoomedIn, selectedParticle, camera])

  useFrame((_, delta) => {
    if (isTransitioning.current) {
      // Animated transition with easing
      transitionProgress.current += delta / transitionDuration
      
      if (transitionProgress.current >= 1) {
        transitionProgress.current = 1
        isTransitioning.current = false
      }
      
      const t = easeInOutCubic(transitionProgress.current)
      
      // Interpolate camera position with easing
      camera.position.lerpVectors(startPosition.current, targetPosition.current, t)
      currentLookAt.current.lerpVectors(startLookAt.current, targetLookAt.current, t)
      camera.lookAt(currentLookAt.current)
    } else {
      // Gentle drift for cinematic feel when not transitioning
      const time = performance.now() * 0.0001
      const drift = new Vector3(
        Math.sin(time) * 0.02,
        Math.cos(time * 0.7) * 0.015,
        0
      )
      
      camera.position.copy(targetPosition.current).add(drift)
      camera.lookAt(currentLookAt.current)
    }
  })

  return null
}
