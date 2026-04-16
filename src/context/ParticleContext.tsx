import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { ParticleData, ParticleContextType } from '../types/particle'

// Re-export types for convenience
export type { ParticleData, ParticleContextType }

const ParticleContext = createContext<ParticleContextType | null>(null)

export const useParticle = () => {
  const context = useContext(ParticleContext)
  if (!context) {
    throw new Error('useParticle must be used within a ParticleProvider')
  }
  return context
}

interface ParticleProviderProps {
  children: ReactNode
}

export const ParticleProvider = ({ children }: ParticleProviderProps) => {
  const [selectedParticle, setSelectedParticle] = useState<ParticleData | null>(null)
  const [hoveredParticle, setHoveredParticle] = useState<ParticleData | null>(null)
  const [isZoomedIn, setIsZoomedIn] = useState(false)
  const [showAntimatter, setShowAntimatter] = useState(false)
  const [comparisonParticles, setComparisonParticles] = useState<[ParticleData | null, ParticleData | null]>([null, null])

  const selectParticle = useCallback((particle: ParticleData | null) => {
    setSelectedParticle(particle)
    setIsZoomedIn(particle !== null)
  }, [])

  const zoomOut = useCallback(() => {
    setSelectedParticle(null)
    setIsZoomedIn(false)
  }, [])

  const toggleAntimatter = useCallback(() => {
    setShowAntimatter(prev => !prev)
  }, [])

  const addToComparison = useCallback((particle: ParticleData) => {
    setComparisonParticles(prev => {
      // If both slots empty, add to first
      if (!prev[0]) return [particle, null]
      // If first filled, add to second
      if (!prev[1]) return [prev[0], particle]
      // If both filled, replace second with new particle
      return [prev[0], particle]
    })
  }, [])

  const clearComparison = useCallback(() => {
    setComparisonParticles([null, null])
  }, [])

  return (
    <ParticleContext.Provider
      value={{
        selectedParticle,
        hoveredParticle,
        isZoomedIn,
        showAntimatter,
        comparisonParticles,
        selectParticle,
        setHoveredParticle,
        zoomOut,
        toggleAntimatter,
        addToComparison,
        clearComparison,
      }}
    >
      {children}
    </ParticleContext.Provider>
  )
}
