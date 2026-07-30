/**
 * relativisticEM.ts
 *
 * Relativity of electric and magnetic fields: the classic Purcell/Feynman
 * demonstration that a current-carrying wire, neutral in the lab frame,
 * appears charged once you boost into the drift electrons' rest frame —
 * and that the resulting electric force, transformed back, exactly
 * reproduces the "magnetic" force computed in the lab frame.
 *
 * Natural units: c = 1, and arbitrary normalized constants (Coulomb's-law
 * and Ampere's-law prefactors set to 1, ion rest linear charge density
 * ρ+0 = 1, rest spacing A0 = 1). This is a pedagogical "cartoon" — real
 * drift velocities are ~mm/s (v/c ≈ 1e-12), far too small for the effect
 * to be visible, so the demo deliberately exaggerates v by many orders of
 * magnitude. The physical relationships themselves are exact.
 */

const A0 = 1 // rest spacing / rest linear charge density unit

export const MAX_V = 0.999999
export const R_MIN = 0.1
export const FORCE_MATCH_EPS = 1e-9

/**
 * Lorentz factor, with v clamped to a safe range so a stray input can
 * never produce NaN/Infinity (1 - v² <= 0).
 */
export function gammaOf(v: number): number {
  const clamped = Math.min(Math.max(v, 0), MAX_V)
  return 1 / Math.sqrt(1 - clamped * clamped)
}

export interface WireState {
  gamma: number
  ionSpacingLab: number
  electronSpacingLab: number
  ionSpacingElectronFrame: number
  electronSpacingElectronFrame: number
  netChargeDensityLab: number
  netChargeDensityElectronFrame: number
  current: number
  magneticFieldLab: number
  electricFieldElectronFrame: number
  forceLabMagnetic: number
  forceElectronFrameElectric: number
  forceLabPredictedFromElectronFrame: number
  forcesMatch: boolean
}

export function calculateWireState(v: number, r: number): WireState {
  const clampedV = Math.min(Math.max(v, 0), MAX_V)
  const clampedR = Math.max(r, R_MIN)
  const gamma = gammaOf(clampedV)

  // Lab frame: both rows have equal spacing (equal density magnitudes) —
  // that's precisely what makes the wire neutral.
  const ionSpacingLab = A0
  const electronSpacingLab = A0

  // Electron rest frame: ions (now moving) contract; electrons (now at
  // rest) relax to their own larger proper spacing.
  const ionSpacingElectronFrame = A0 / gamma
  const electronSpacingElectronFrame = A0 * gamma

  const netChargeDensityLab = 0
  // γ − 1/γ, rewritten as γv² to avoid subtracting two near-equal
  // numbers at small v (catastrophic cancellation).
  const netChargeDensityElectronFrame = gamma * clampedV * clampedV

  const current = A0 * clampedV
  const magneticFieldLab = current / clampedR
  const electricFieldElectronFrame = netChargeDensityElectronFrame / clampedR

  const forceLabMagnetic = clampedV * magneticFieldLab
  const forceElectronFrameElectric = electricFieldElectronFrame
  const forceLabPredictedFromElectronFrame = forceElectronFrameElectric / gamma

  const scale = Math.max(1, Math.abs(forceLabMagnetic), Math.abs(forceLabPredictedFromElectronFrame))
  const forcesMatch =
    Math.abs(forceLabMagnetic - forceLabPredictedFromElectronFrame) <= FORCE_MATCH_EPS * scale

  return {
    gamma,
    ionSpacingLab,
    electronSpacingLab,
    ionSpacingElectronFrame,
    electronSpacingElectronFrame,
    netChargeDensityLab,
    netChargeDensityElectronFrame,
    current,
    magneticFieldLab,
    electricFieldElectronFrame,
    forceLabMagnetic,
    forceElectronFrameElectric,
    forceLabPredictedFromElectronFrame,
    forcesMatch,
  }
}

/**
 * Field strength vs. distance, for both frames' field descriptions, at a
 * fixed drift speed. Useful for plotting the 1/r falloff.
 */
export function generateFieldCurve(
  v: number,
  rMin: number,
  rMax: number,
  numPoints: number = 100
): Array<{ r: number; bLab: number; eElectronFrame: number }> {
  const curve = []
  const step = (rMax - rMin) / (numPoints - 1)
  for (let i = 0; i < numPoints; i++) {
    const r = rMin + i * step
    const state = calculateWireState(v, r)
    curve.push({ r, bLab: state.magneticFieldLab, eElectronFrame: state.electricFieldElectronFrame })
  }
  return curve
}

/**
 * Precision-aware speed formatter — switches to scientific notation for
 * very small drift speeds (the "everyday wire" regime) rather than
 * rendering "0.000c".
 */
export function formatSpeed(v: number): string {
  if (v > 0 && v < 0.001) {
    return `${v.toExponential(2)}c`
  }
  return `${v.toFixed(v < 0.1 ? 5 : 3)}c`
}

/**
 * Precision-aware gamma formatter — at everyday drift speeds, γ − 1 is
 * astronomically small (~1e-25), which would round to a flat "1.0000"
 * under fixed decimal formatting and read as a broken display rather
 * than "the effect is real but currently too small to show."
 */
export function formatGamma(gamma: number): string {
  const delta = gamma - 1
  if (delta > 0 && delta < 1e-4) {
    return `1 + ${delta.toExponential(1)}`
  }
  return gamma.toFixed(4)
}

const V_MIN_SLIDER = 1e-6
const V_MID = 0.3
const ONE_MINUS_V_MID = 1 - V_MID
const ONE_MINUS_V_MAX_SLIDER = 0.001 // reaches v = 0.999 at the top of the slider

/**
 * Two-segment log-log mapping from a linear slider fraction t ∈ [0, 1] to
 * drift speed v. A single log10(v) slider (as used for the Neutrino lab's
 * energy control) would compress the entire near-light-speed regime,
 * where the visual payoff is greatest, into an unusably small sliver.
 * This maps the lower half of the slider to log10(v) from 1e-6 to 0.3,
 * and the upper half to log10(1-v) from 0.7 down to 0.001 (v -> 0.999),
 * joined continuously at t=0.5, v=0.3.
 */
export function sliderToV(t: number): number {
  const clampedT = Math.min(Math.max(t, 0), 1)
  if (clampedT <= 0.5) {
    const frac = clampedT / 0.5
    const log10V =
      Math.log10(V_MIN_SLIDER) + frac * (Math.log10(V_MID) - Math.log10(V_MIN_SLIDER))
    return Math.pow(10, log10V)
  }
  const frac = (clampedT - 0.5) / 0.5
  const log10OneMinusV =
    Math.log10(ONE_MINUS_V_MID) +
    frac * (Math.log10(ONE_MINUS_V_MAX_SLIDER) - Math.log10(ONE_MINUS_V_MID))
  return 1 - Math.pow(10, log10OneMinusV)
}

/** Inverse of sliderToV, so a physically-set v (e.g. from a preset) can position the slider. */
export function vToSlider(v: number): number {
  const clampedV = Math.min(Math.max(v, V_MIN_SLIDER), 1 - ONE_MINUS_V_MAX_SLIDER)
  if (clampedV <= V_MID) {
    const frac =
      (Math.log10(clampedV) - Math.log10(V_MIN_SLIDER)) /
      (Math.log10(V_MID) - Math.log10(V_MIN_SLIDER))
    return frac * 0.5
  }
  const oneMinusV = 1 - clampedV
  const frac =
    (Math.log10(oneMinusV) - Math.log10(ONE_MINUS_V_MID)) /
    (Math.log10(ONE_MINUS_V_MAX_SLIDER) - Math.log10(ONE_MINUS_V_MID))
  return 0.5 + frac * 0.5
}

export interface RelativisticEMPreset {
  id: string
  name: string
  description: string
  v: number
  r: number
}

export const RELATIVISTIC_EM_PRESETS: RelativisticEMPreset[] = [
  {
    id: 'everyday',
    name: 'Everyday Wire',
    description: 'A realistic household current — the effect is real, but far too small to see',
    v: 1e-6,
    r: 1.5,
  },
  {
    id: 'visible',
    name: 'Visible Effect',
    description: 'Drift speed exaggerated to make the relativistic effect clearly visible',
    v: 0.5,
    r: 1.5,
  },
  {
    id: 'near-light-speed',
    name: 'Near Light Speed',
    description: 'Drift speed close to c — strong length contraction',
    v: 0.95,
    r: 1.5,
  },
  {
    id: 'ultra-relativistic',
    name: 'Ultra-Relativistic',
    description: 'Extreme drift speed at the edge of the slider range',
    v: 0.999,
    r: 1.5,
  },
]
