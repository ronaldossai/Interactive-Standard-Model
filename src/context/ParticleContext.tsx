import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
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
  const [spinExplainerSpin, setSpinExplainerSpin] = useState<string | null>(null)
  const [showCurrentParticlePopup, setShowCurrentParticlePopup] = useState(false)
  const [neutrinoOscillationOpen, setNeutrinoOscillationOpen] = useState(false)
  const [hadronLabOpen, setHadronLabOpen] = useState(false)
  const [photonLabOpen, setPhotonLabOpen] = useState(false)
  const [electronLabOpen, setElectronLabOpen] = useState(false)
  const [higgsLabOpen, setHiggsLabOpen] = useState(false)
  const [gluonLabOpen, setGluonLabOpen] = useState(false)
  const [muonLabOpen, setMuonLabOpen] = useState(false)
  const [tauLabOpen, setTauLabOpen] = useState(false)
  const [gravitonLabOpen, setGravitonLabOpen] = useState(false)
  const [parityLabOpen, setParityLabOpen] = useState(false)
  const [topQuarkLabOpen, setTopQuarkLabOpen] = useState(false)
  const popupTimeoutRef = useRef<number | null>(null)

  // Clear popup immediately when particle changes or zoom out
  useEffect(() => {
    setShowCurrentParticlePopup(false)
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current)
      popupTimeoutRef.current = null
    }
  }, [selectedParticle, isZoomedIn])

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

  const openSpinExplainer = useCallback((spin: string) => {
    setSpinExplainerSpin(spin)
  }, [])

  const closeSpinExplainer = useCallback(() => {
    setSpinExplainerSpin(null)
  }, [])

  const triggerCurrentParticlePopup = useCallback(() => {
    // Clear any existing timeout
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current)
    }
    
    setShowCurrentParticlePopup(true)
    popupTimeoutRef.current = window.setTimeout(() => {
      setShowCurrentParticlePopup(false)
      popupTimeoutRef.current = null
    }, 2000)
  }, [])

  const openNeutrinoOscillation = useCallback(() => {
    setNeutrinoOscillationOpen(true)
  }, [])

  const closeNeutrinoOscillation = useCallback(() => {
    setNeutrinoOscillationOpen(false)
  }, [])

  const openHadronLab = useCallback(() => {
    setHadronLabOpen(true)
  }, [])

  const closeHadronLab = useCallback(() => {
    setHadronLabOpen(false)
  }, [])

  const openPhotonLab = useCallback(() => {
    setPhotonLabOpen(true)
  }, [])

  const closePhotonLab = useCallback(() => {
    setPhotonLabOpen(false)
  }, [])

  const openElectronLab = useCallback(() => {
    setElectronLabOpen(true)
  }, [])

  const closeElectronLab = useCallback(() => {
    setElectronLabOpen(false)
  }, [])

  const openHiggsLab = useCallback(() => {
    setHiggsLabOpen(true)
  }, [])

  const closeHiggsLab = useCallback(() => {
    setHiggsLabOpen(false)
  }, [])

  const openGluonLab = useCallback(() => {
    setGluonLabOpen(true)
  }, [])

  const closeGluonLab = useCallback(() => {
    setGluonLabOpen(false)
  }, [])

  const openMuonLab = useCallback(() => {
    setMuonLabOpen(true)
  }, [])

  const closeMuonLab = useCallback(() => {
    setMuonLabOpen(false)
  }, [])

  const openTauLab = useCallback(() => {
    setTauLabOpen(true)
  }, [])

  const closeTauLab = useCallback(() => {
    setTauLabOpen(false)
  }, [])

  const openGravitonLab = useCallback(() => {
    setGravitonLabOpen(true)
  }, [])

  const closeGravitonLab = useCallback(() => {
    setGravitonLabOpen(false)
  }, [])

  const openParityLab = useCallback(() => {
    setParityLabOpen(true)
  }, [])

  const closeParityLab = useCallback(() => {
    setParityLabOpen(false)
  }, [])

  const openTopQuarkLab = useCallback(() => {
    setTopQuarkLabOpen(true)
  }, [])

  const closeTopQuarkLab = useCallback(() => {
    setTopQuarkLabOpen(false)
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
        spinExplainerSpin,
        openSpinExplainer,
        closeSpinExplainer,
        showCurrentParticlePopup,
        triggerCurrentParticlePopup,
        neutrinoOscillationOpen,
        openNeutrinoOscillation,
        closeNeutrinoOscillation,
        hadronLabOpen,
        openHadronLab,
        closeHadronLab,
        photonLabOpen,
        openPhotonLab,
        closePhotonLab,
        electronLabOpen,
        openElectronLab,
        closeElectronLab,
        higgsLabOpen,
        openHiggsLab,
        closeHiggsLab,
        gluonLabOpen,
        openGluonLab,
        closeGluonLab,
        muonLabOpen,
        openMuonLab,
        closeMuonLab,
        tauLabOpen,
        openTauLab,
        closeTauLab,
        gravitonLabOpen,
        openGravitonLab,
        closeGravitonLab,
        parityLabOpen,
        openParityLab,
        closeParityLab,
        topQuarkLabOpen,
        openTopQuarkLab,
        closeTopQuarkLab,
      }}
    >
      {children}
    </ParticleContext.Provider>
  )
}
