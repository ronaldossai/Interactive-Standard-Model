/**
 * gluonQCD.ts
 *
 * Two faces of the gluon's self-interaction, tied to the same running
 * coupling:
 *
 * 1. The Cornell potential — a real, standard phenomenological model of
 *    the confining force between a quark and antiquark (used since the
 *    1970s for charmonium/bottomonium spectroscopy): V(r) = -(4/3)(αs/r)
 *    + σr. The 4/3 is the actual QCD color (Casimir) factor for a
 *    color-singlet pair, not an invented number. String breaking is
 *    modeled as a flat plateau once V(r) reaches the energy needed to
 *    pop a new quark-antiquark pair out of the vacuum — a deliberate
 *    simplification of what's really a smooth lattice-QCD crossover.
 *
 * 2. The one-loop running coupling — asymptotic freedom, the coupling
 *    getting *weaker* at short distance/high energy, the opposite of how
 *    electric charge screening works.
 *
 * All slider ranges are arbitrary/illustrative units (same "cartoon but
 * structurally correct" spirit as the other labs' normalized constants) —
 * not calibrated to real GeV/fm values, since one-loop-only running
 * doesn't cleanly reproduce the precision multi-loop PDG numbers anyway.
 */

export const ALPHA_S_MIN = 0.1
export const ALPHA_S_MAX = 0.6
export const SIGMA_MIN = 0.3
export const SIGMA_MAX = 2
export const R_MIN = 0.05
export const R_MAX_SLIDER = 5
export const MESON_MASS_MIN = 0.2
export const MESON_MASS_MAX = 2

// --- Section 1: Cornell potential + string breaking ---

export function cornellPotential(r: number, alphaS: number, sigma: number): number {
  const clampedR = Math.max(r, R_MIN)
  return -(4 / 3) * (alphaS / clampedR) + sigma * clampedR
}

/**
 * Closed-form positive root of σr² − E·r − (4/3)αs = 0. V(r) is strictly
 * increasing for αs,σ>0, so there is exactly one crossing of any energy
 * threshold E — no iterative search needed.
 */
export function computeRBreak(alphaS: number, sigma: number, ePlateau: number): number {
  const discriminant = ePlateau * ePlateau + (16 / 3) * alphaS * sigma
  return (ePlateau + Math.sqrt(discriminant)) / (2 * sigma)
}

export interface CornellState {
  alphaS: number
  sigma: number
  mMeson: number
  ePlateau: number
  rBreak: number
}

export function calculateCornellState(alphaS: number, sigma: number, mMeson: number): CornellState {
  const ePlateau = 2 * mMeson
  const rBreak = computeRBreak(alphaS, sigma, ePlateau)
  return { alphaS, sigma, mMeson, ePlateau, rBreak }
}

export function generateCornellCurve(
  alphaS: number,
  sigma: number,
  mMeson: number,
  rMax: number = R_MAX_SLIDER,
  numPoints: number = 100
): Array<{ r: number; v: number; isBroken: boolean }> {
  const state = calculateCornellState(alphaS, sigma, mMeson)
  const curve = []
  const step = (rMax - R_MIN) / (numPoints - 1)
  for (let i = 0; i < numPoints; i++) {
    const r = R_MIN + i * step
    const isBroken = r >= state.rBreak
    const v = isBroken ? state.ePlateau : cornellPotential(r, alphaS, sigma)
    curve.push({ r, v, isBroken })
  }
  return curve
}

export interface CornellPreset {
  id: string
  name: string
  description: string
  alphaS: number
  sigma: number
  mMeson: number
}

export const CORNELL_PRESETS: CornellPreset[] = [
  {
    id: 'tight',
    name: 'Tightly Confined',
    description: 'Strong string tension — the potential rises steeply with separation',
    alphaS: 0.3,
    sigma: 1.5,
    mMeson: 0.5,
  },
  {
    id: 'loose',
    name: 'Loosely Confined',
    description: 'Weak string tension — the potential rises gently with separation',
    alphaS: 0.3,
    sigma: 0.5,
    mMeson: 0.5,
  },
  {
    id: 'light-new-quark',
    name: 'Light New Quark',
    description: 'The string breaks early — cheap to pop a light quark-antiquark pair',
    alphaS: 0.35,
    sigma: 1.0,
    mMeson: 0.3,
  },
  {
    id: 'heavy-new-quark',
    name: 'Heavy New Quark',
    description: 'The string stretches far before breaking — a heavy pair costs more energy',
    alphaS: 0.35,
    sigma: 1.0,
    mMeson: 1.5,
  },
]

// --- Section 2: running coupling / asymptotic freedom ---

export const Q0 = 1
export const ALPHA_S_AT_Q0 = 0.3
export const Q_SLIDER_MIN = 0.01
export const Q_SLIDER_MAX = 1000
export const NF_OPTIONS = [3, 4, 5, 6] as const
export const QED_ILLUSTRATIVE_B0 = -0.5

const ALPHA_CAP = 10
const MIN_RAW = 1 / ALPHA_CAP

/** One-loop QCD beta coefficient: b0 = 11 - (2/3)nf. Positive (asymptotically free) for all physical nf. */
export function betaCoefficient(nf: number): number {
  return 11 - (2 / 3) * nf
}

/**
 * One-loop running coupling: 1/α(Q) = 1/α(Q0) + (b0/2π)ln(Q/Q0). Clamped
 * near the Landau-pole-like scale (where the one-loop formula would
 * predict unphysical negative/divergent coupling) rather than returning
 * NaN or Infinity.
 */
export function runningCoupling(Q: number, refQ: number, alpha0: number, b0: number): number {
  const raw = 1 / alpha0 + (b0 / (2 * Math.PI)) * Math.log(Q / refQ)
  if (raw <= MIN_RAW) return ALPHA_CAP
  return 1 / raw
}

/** The scale where the one-loop formula formally diverges — the toy analog of the confinement scale. */
export function computeLandauPoleQ(b0: number, refQ: number, alpha0: number): number {
  return refQ * Math.exp(-2 * Math.PI / (b0 * alpha0))
}

export function generateRunningCouplingCurve(
  nf: number,
  qMin: number = Q_SLIDER_MIN,
  qMax: number = Q_SLIDER_MAX,
  numPoints: number = 100
): Array<{ Q: number; alphaS: number }> {
  const b0 = betaCoefficient(nf)
  const logMin = Math.log10(qMin)
  const logMax = Math.log10(qMax)
  const curve = []
  for (let i = 0; i < numPoints; i++) {
    const logQ = logMin + (i / (numPoints - 1)) * (logMax - logMin)
    const Q = Math.pow(10, logQ)
    curve.push({ Q, alphaS: runningCoupling(Q, Q0, ALPHA_S_AT_Q0, b0) })
  }
  return curve
}

export function generateQEDIllustrativeCurve(
  qMin: number = Q_SLIDER_MIN,
  qMax: number = Q_SLIDER_MAX,
  numPoints: number = 100
): Array<{ Q: number; alphaEm: number }> {
  const logMin = Math.log10(qMin)
  const logMax = Math.log10(qMax)
  const curve = []
  for (let i = 0; i < numPoints; i++) {
    const logQ = logMin + (i / (numPoints - 1)) * (logMax - logMin)
    const Q = Math.pow(10, logQ)
    curve.push({ Q, alphaEm: runningCoupling(Q, Q0, ALPHA_S_AT_Q0, QED_ILLUSTRATIVE_B0) })
  }
  return curve
}

/** Log-scale slider mapping for Q, mirroring sliderToV/vToSlider in relativisticEM.ts. */
export function sliderToQ(t: number): number {
  const clampedT = Math.min(Math.max(t, 0), 1)
  const logMin = Math.log10(Q_SLIDER_MIN)
  const logMax = Math.log10(Q_SLIDER_MAX)
  return Math.pow(10, logMin + clampedT * (logMax - logMin))
}

export function qToSlider(Q: number): number {
  const clampedQ = Math.min(Math.max(Q, Q_SLIDER_MIN), Q_SLIDER_MAX)
  const logMin = Math.log10(Q_SLIDER_MIN)
  const logMax = Math.log10(Q_SLIDER_MAX)
  return (Math.log10(clampedQ) - logMin) / (logMax - logMin)
}

// --- Display formatters ---

export function formatDistance(r: number): string {
  if (r > 0 && r < 0.01) return `${r.toExponential(2)} units`
  return `${r.toFixed(3)} units`
}

export function formatEnergy(e: number): string {
  if (Math.abs(e) > 0 && Math.abs(e) < 0.01) return `${e.toExponential(2)} units`
  return `${e.toFixed(3)} units`
}

export function formatAlpha(alpha: number): string {
  if (alpha >= ALPHA_CAP) return `≥ ${ALPHA_CAP.toFixed(0)} (breakdown)`
  return alpha.toFixed(4)
}

export function formatQ(Q: number): string {
  if (Q < 0.01 || Q > 1000) return `${Q.toExponential(2)}`
  return Q.toFixed(2)
}
