/**
 * tauDecay.ts
 *
 * The tau's proper lifetime (2.9x10^-13 s) is about 7,600x shorter than the
 * muon's — the flip side of the Muon Decay Lab's cosmic-ray argument. A
 * muon's dilated lifetime lets it survive a trip through kilometers of
 * atmosphere; a tau, even boosted at a collider, decays after only microns
 * to millimeters, so it is never detected directly. Experiments instead
 * reconstruct a displaced secondary vertex from its decay products (see the
 * Decay panel for tau's actual branching ratios).
 *
 * Reuses the muon's proper lifetime and c from muonDecay.ts for the
 * side-by-side comparison rather than redeclaring those constants.
 */

import { MUON_TAU0_US, C_KM_PER_US } from './muonDecay'

export const TAU_MASS_GEV = 1.77686 // tau rest mass, GeV/c^2
export const TAU_TAU0_PS = 0.29 // tau proper mean lifetime, picoseconds
// km/us -> mm/ps: 1km = 1e6mm and 1us = 1e6ps, so the two factors of 1e6 cancel exactly.
export const C_MM_PER_PS = C_KM_PER_US
export const VERTEX_RESOLUTION_MM = 0.02 // typical silicon vertex-detector impact-parameter resolution, ~20um
export const FIRST_LAYER_MM = 30 // illustrative first tracking-layer radius

export const E_MIN = 2 // GeV, just above the tau's rest mass
export const E_MAX = 200 // GeV, high-energy collider tau

const MUON_TAU0_PS = MUON_TAU0_US * 1e6 // us -> ps
const MUON_TAU_RATIO = MUON_TAU0_PS / TAU_TAU0_PS // ~7.6 million, independent of gamma/beta

export interface TauState {
  gamma: number
  beta: number
  tauDecayLengthMm: number
  muonDecayLengthMm: number
  ratio: number
}

export function calculateTauState(energyGeV: number): TauState {
  const clampedE = Math.max(energyGeV, TAU_MASS_GEV * 1.0001)
  const gamma = clampedE / TAU_MASS_GEV
  const beta = Math.sqrt(Math.max(0, 1 - 1 / (gamma * gamma)))

  const tauDecayLengthMm = gamma * beta * C_MM_PER_PS * TAU_TAU0_PS
  const muonDecayLengthMm = gamma * beta * C_MM_PER_PS * MUON_TAU0_PS

  return {
    gamma,
    beta,
    tauDecayLengthMm,
    muonDecayLengthMm,
    ratio: MUON_TAU_RATIO,
  }
}

/**
 * Tau decay length vs. energy, log-spaced in energy to plot cleanly on a
 * log-x graph (mirroring generateRunningCouplingCurve in gluonQCD.ts).
 */
export function generateDecayLengthCurve(
  eMin: number = E_MIN,
  eMax: number = E_MAX,
  numPoints: number = 100
): Array<{ energy: number; tauDecayLengthMm: number }> {
  const logMin = Math.log10(eMin)
  const logMax = Math.log10(eMax)
  const curve = []
  for (let i = 0; i < numPoints; i++) {
    const logE = logMin + (i / (numPoints - 1)) * (logMax - logMin)
    const energy = Math.pow(10, logE)
    curve.push({ energy, tauDecayLengthMm: calculateTauState(energy).tauDecayLengthMm })
  }
  return curve
}

/** Log-scale slider mapping for energy, mirroring sliderToQ/qToSlider in gluonQCD.ts. */
export function sliderToEnergy(t: number): number {
  const clampedT = Math.min(Math.max(t, 0), 1)
  const logMin = Math.log10(E_MIN)
  const logMax = Math.log10(E_MAX)
  return Math.pow(10, logMin + clampedT * (logMax - logMin))
}

export function energyToSlider(e: number): number {
  const clampedE = Math.min(Math.max(e, E_MIN), E_MAX)
  const logMin = Math.log10(E_MIN)
  const logMax = Math.log10(E_MAX)
  return (Math.log10(clampedE) - logMin) / (logMax - logMin)
}

export function formatEnergy(e: number): string {
  return `${e.toFixed(e < 10 ? 2 : 0)} GeV`
}

/** Adaptive-unit length formatter — the tau/muon comparison spans mm to km. */
export function formatDecayLength(mm: number): string {
  if (mm < 1) return `${(mm * 1000).toFixed(1)} µm`
  if (mm < 1000) return `${mm.toFixed(2)} mm`
  if (mm < 1_000_000) return `${(mm / 1000).toFixed(2)} m`
  return `${(mm / 1_000_000).toFixed(2)} km`
}

export function formatRatio(ratio: number): string {
  if (ratio >= 1_000_000) return `${(ratio / 1_000_000).toFixed(2)} million×`
  if (ratio >= 1_000) return `${(ratio / 1000).toFixed(1)} thousand×`
  return `${ratio.toFixed(1)}×`
}

export interface TauPreset {
  id: string
  name: string
  description: string
  energy: number
}

export const TAU_PRESETS: TauPreset[] = [
  {
    id: 'threshold',
    name: 'Near Rest Mass',
    description: 'γ ≈ 1.1 — barely moving, decays essentially at the production point',
    energy: 2,
  },
  {
    id: 'lep',
    name: 'LEP-Era Collider Tau',
    description: 'γ ≈ 25 — a typical tau produced at the LEP e⁺e⁻ collider',
    energy: 45,
  },
  {
    id: 'lhc',
    name: 'High-Energy Collider Tau',
    description: 'γ ≈ 113 — LHC-scale energy, flight length approaches 1cm',
    energy: 200,
  },
]
