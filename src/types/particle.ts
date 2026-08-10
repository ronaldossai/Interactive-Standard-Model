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
  hypothetical?: boolean
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
  spinExplainerSpin: string | null
  openSpinExplainer: (spin: string) => void
  closeSpinExplainer: () => void
  showCurrentParticlePopup: boolean
  triggerCurrentParticlePopup: () => void
  neutrinoOscillationOpen: boolean
  openNeutrinoOscillation: () => void
  closeNeutrinoOscillation: () => void
  hadronLabOpen: boolean
  openHadronLab: () => void
  closeHadronLab: () => void
  photonLabOpen: boolean
  openPhotonLab: () => void
  closePhotonLab: () => void
  electronLabOpen: boolean
  openElectronLab: () => void
  closeElectronLab: () => void
  higgsLabOpen: boolean
  openHiggsLab: () => void
  closeHiggsLab: () => void
  gluonLabOpen: boolean
  openGluonLab: () => void
  closeGluonLab: () => void
  muonLabOpen: boolean
  openMuonLab: () => void
  closeMuonLab: () => void
  tauLabOpen: boolean
  openTauLab: () => void
  closeTauLab: () => void
  gravitonLabOpen: boolean
  openGravitonLab: () => void
  closeGravitonLab: () => void
  parityLabOpen: boolean
  openParityLab: () => void
  closeParityLab: () => void
  topQuarkLabOpen: boolean
  openTopQuarkLab: () => void
  closeTopQuarkLab: () => void
}
