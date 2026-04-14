import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Mesh, Color, Vector3, MeshStandardMaterial } from 'three'
import { useParticle } from '../../context/ParticleContext'
import { toAntimatter } from '../../data/particleData'
import type { ParticleData } from '../../types/particle'

interface ParticleProps {
  data: ParticleData
  geometry?: 'sphere' | 'box' | 'octahedron' | 'icosahedron'
  scale?: number
}

export const Particle = ({ data, geometry = 'sphere', scale = 1 }: ParticleProps) => {
  const meshRef = useRef<Mesh>(null!)
  const glowRef = useRef<Mesh>(null!)
  const { selectParticle, setHoveredParticle, hoveredParticle, selectedParticle, isZoomedIn, showAntimatter } = useParticle()
  
  // Apply antimatter transformation for display
  const displayData = showAntimatter ? toAntimatter(data) : data
  
  const isThisSelected = selectedParticle?.id === data.id
  const isThisHovered = hoveredParticle?.id === data.id
  const baseColor = new Color(data.color)
  
  // Shift color for antimatter mode (invert for visual distinction)
  const displayColor = showAntimatter 
    ? new Color(1 - baseColor.r, 1 - baseColor.g, 1 - baseColor.b)
    : baseColor
  
  useFrame((state) => {
    if (!meshRef.current) return
    
    // Subtle idle animation (only when not zoomed in)
    if (!isZoomedIn) {
      const time = state.clock.elapsedTime
      const floatOffset = Math.sin(time * 0.5 + data.position.x * 0.5) * 0.05
      meshRef.current.position.y = floatOffset
    }
    
    // Hover/selection scale animation
    const targetScale = isThisHovered || isThisSelected ? scale * 1.2 : scale
    meshRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.1)
    
    // Glow effect on hover
    if (glowRef.current) {
      const glowScale = isThisHovered ? scale * 1.8 : scale * 1.4
      glowRef.current.scale.lerp(new Vector3(glowScale, glowScale, glowScale), 0.1)
      const material = glowRef.current.material as MeshStandardMaterial
      material.opacity = isThisHovered ? 0.3 : 0.1
    }
    
    // Rotation for selected particle when zoomed
    if (isZoomedIn && isThisSelected) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.x += 0.005
    }
  })

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHoveredParticle(data)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    setHoveredParticle(null)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectParticle(data)
  }

  const renderGeometry = () => {
    const size = 0.4 * scale
    switch (geometry) {
      case 'box':
        return <boxGeometry args={[size, size, size]} />
      case 'octahedron':
        return <octahedronGeometry args={[size * 0.8]} />
      case 'icosahedron':
        return <icosahedronGeometry args={[size * 0.8]} />
      default:
        return <sphereGeometry args={[size, 32, 32]} />
    }
  }

  const renderGlowGeometry = () => {
    const size = 0.5 * scale
    switch (geometry) {
      case 'box':
        return <boxGeometry args={[size, size, size]} />
      case 'octahedron':
        return <octahedronGeometry args={[size * 0.8]} />
      case 'icosahedron':
        return <icosahedronGeometry args={[size * 0.8]} />
      default:
        return <sphereGeometry args={[size, 16, 16]} />
    }
  }

  // Hide other particles when zoomed into one
  if (isZoomedIn && !isThisSelected) {
    return null
  }

  return (
    <group position={[data.position.x, data.position.y, data.position.z]}>
      {/* Glow effect */}
      <mesh ref={glowRef}>
        {renderGlowGeometry()}
        <meshBasicMaterial
          color={displayColor}
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>
      
      {/* Main particle */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={isThisHovered ? displayColor.clone().multiplyScalar(1.3) : displayColor}
          emissive={displayColor}
          emissiveIntensity={isThisHovered ? 0.4 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Particle symbol label */}
      {!isZoomedIn && (
        <>
          <Text
            position={[0, -0.65, 0]}
            fontSize={0.35}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
            fontWeight="bold"
          >
            {displayData.symbol}
          </Text>
          <Text
            position={[0, -1.0, 0]}
            fontSize={0.14}
            color="#aaaaaa"
            anchorX="center"
            anchorY="middle"
          >
            {displayData.name}
          </Text>
        </>
      )}
      
      {/* Mass on hover */}
      {isThisHovered && !isZoomedIn && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.18}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {displayData.mass}
        </Text>
      )}
    </group>
  )
}
