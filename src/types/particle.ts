import { Vector3 } from 'three'

export interface ParticleData {
  id: string
  name: string
  symbol: string
  type: 'quark' | 'lepton' | 'boson'
  mass: string
  charge: string
  spin: string
  color?: string
  description: string
  position: Vector3
  generation?: number
  // Additional physics properties
  interactions?: string[]
  discovered?: string
  lifetime?: string
}

export interface ParticleContextType {
  selectedParticle: ParticleData | null
  hoveredParticle: ParticleData | null
  isZoomedIn: boolean
  showAntimatter: boolean
  comparisonParticles: [ParticleData | null, ParticleData | null]
  selectParticle: (particle: ParticleData | null) => void
  setHoveredParticle: (particle: ParticleData | null) => void
  zoomOut: () => void
  toggleAntimatter: () => void
  addToComparison: (particle: ParticleData) => void
  clearComparison: () => void
}
