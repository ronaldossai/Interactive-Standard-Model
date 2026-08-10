/**
 * muonDecay.ts
 *
 * The classic cosmic-ray-muon argument for special relativity: muons are
 * produced high in the atmosphere with a mean lifetime of just 2.2 μs, and
 * classically almost none should survive the trip to sea level — yet we
 * detect them constantly. Time dilation (ground frame) and length
 * contraction (muon frame) are two descriptions of the same effect, and
 * must predict the identical survival fraction.
 *
 * Reuses the generic special-relativity math (γ, slider mapping, speed
 * formatting) from relativisticEM.ts rather than re-deriving it.
 */

import { gammaOf, MAX_V } from './relativisticEM'

export const MUON_TAU0_US = 2.2 // muon proper mean lifetime, microseconds
export const C_KM_PER_US = 0.299792458 // speed of light, km per microsecond

export const V_MIN = 1e-6
export const H_MIN = 1
export const H_MAX = 20
export const H_DEFAULT = 15

export interface MuonState {
  gamma: number
  groundTime: number // classical/ground-frame travel time, μs
  dilatedLifetime: number // γτ0 — the muon's lifetime as seen from the ground, μs
  contractedHeight: number // h/γ — the production altitude as seen by the muon, km
  muonFrameTime: number // travel time as experienced by the muon itself, μs
  survivalFractionClassical: number
  survivalFractionRelativisticGroundFrame: number
  survivalFractionRelativisticMuonFrame: number
  survivalMatch: boolean
  meanDecayDepthClassical: number // distance (km) at which 1/e of muons remain, ignoring relativity
  meanDecayDepthRelativistic: number // distance (km) at which 1/e of muons remain, actual
}

export function calculateMuonState(v: number, h: number): MuonState {
  const clampedV = Math.min(Math.max(v, V_MIN), MAX_V)
  const clampedH = Math.max(h, 0)
  const gamma = gammaOf(clampedV)

  const speed = clampedV * C_KM_PER_US
  const groundTime = clampedH / speed
  const dilatedLifetime = gamma * MUON_TAU0_US
  const contractedHeight = clampedH / gamma
  const muonFrameTime = contractedHeight / speed

  const survivalFractionClassical = Math.exp(-groundTime / MUON_TAU0_US)
  const survivalFractionRelativisticGroundFrame = Math.exp(-groundTime / dilatedLifetime)
  const survivalFractionRelativisticMuonFrame = Math.exp(-muonFrameTime / MUON_TAU0_US)

  const scale = Math.max(
    survivalFractionRelativisticGroundFrame,
    survivalFractionRelativisticMuonFrame,
    1e-12
  )
  const survivalMatch =
    Math.abs(survivalFractionRelativisticGroundFrame - survivalFractionRelativisticMuonFrame) <=
    1e-9 * scale

  const meanDecayDepthClassical = speed * MUON_TAU0_US
  const meanDecayDepthRelativistic = speed * dilatedLifetime

  return {
    gamma,
    groundTime,
    dilatedLifetime,
    contractedHeight,
    muonFrameTime,
    survivalFractionClassical,
    survivalFractionRelativisticGroundFrame,
    survivalFractionRelativisticMuonFrame,
    survivalMatch,
    meanDecayDepthClassical,
    meanDecayDepthRelativistic,
  }
}

/**
 * Survival fraction vs. distance traveled, at a fixed muon speed, for
 * plotting the classical and relativistic curves against each other.
 */
export function generateSurvivalCurve(
  v: number,
  hMax: number,
  numPoints: number = 100
): Array<{ depth: number; survivalClassical: number; survivalRelativistic: number }> {
  const curve = []
  const step = hMax / (numPoints - 1)
  for (let i = 0; i < numPoints; i++) {
    const depth = i * step
    const state = calculateMuonState(v, depth)
    curve.push({
      depth,
      survivalClassical: state.survivalFractionClassical,
      survivalRelativistic: state.survivalFractionRelativisticGroundFrame,
    })
  }
  return curve
}

export function formatFraction(x: number): string {
  const pct = x * 100
  if (pct >= 99.995) return '≈100%'
  if (pct > 0 && pct < 0.001) return `${pct.toExponential(2)}%`
  return `${pct.toFixed(pct < 1 ? 4 : 2)}%`
}

export function formatMicroseconds(t: number): string {
  if (t < 0.001) return `${(t * 1000).toFixed(2)} ns`
  return `${t.toFixed(3)} μs`
}

export function formatDepth(d: number): string {
  return `${d.toFixed(2)} km`
}

export interface MuonPreset {
  id: string
  name: string
  description: string
  v: number
  h: number
}

export const MUON_PRESETS: MuonPreset[] = [
  {
    id: 'classical',
    name: 'Classical Regime',
    description: 'A slow muon : negligible time dilation, virtually none survive the trip',
    v: 0.1,
    h: 15,
  },
  {
    id: 'moderate',
    name: 'Moderate Speed',
    description: 'γ ≈ 3.2 : time dilation helps, but most still decay before reaching the ground',
    v: 0.95,
    h: 15,
  },
  {
    id: 'typical',
    name: 'Typical Cosmic-Ray Muon',
    description: 'γ ≈ 22 : this is why cosmic-ray muons reach sea level despite a 2.2 μs lifetime',
    v: 0.999,
    h: 15,
  },
]
