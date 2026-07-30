/**
 * higgsMechanism.ts
 *
 * A 2D toy model of spontaneous symmetry breaking: a single complex scalar
 * field φ = φ1 + iφ2 (a literal 2D field space) with potential
 * V(ρ) = μ²ρ² + λρ⁴, where ρ = |φ|. Negative μ² produces the "sombrero"
 * potential — a circular valley of minima at ρ0 = √(−μ²/2λ). Moving
 * radially (up the wall) costs energy — that's the massive "Higgs boson"
 * excitation. Moving angularly (around the flat valley) costs nothing —
 * that's the massless "Goldstone boson."
 *
 * All constants are an arbitrary pedagogical normalization (same spirit as
 * the relativistic-E&M lab's k_B=k_E=1), not claimed to be SM-exact — many
 * textbooks differ by factors of 2 depending on whether they write the
 * potential with an extra 1/2 or 1/4 prefactor. This module picks one
 * self-consistent convention and derives it fully.
 */

export const LAMBDA_MIN = 0.05
export const MU2_MIN = -2
export const MU2_MAX = 2
export const MU2_EPS = 1e-6
export const RHO_SLIDER_MAX = 2.5

export interface HiggsState {
  mu2: number
  lambda: number
  isBroken: boolean
  rho0: number
  radialMassSquared: number
  radialMass: number
}

export function calculateHiggsState(mu2: number, lambda: number): HiggsState {
  const clampedLambda = Math.max(lambda, LAMBDA_MIN)
  const isBroken = mu2 < -MU2_EPS

  // Minimizing V(x) = μ²x + λx² (x = ρ²) gives x0 = -μ²/(2λ), real and
  // positive only when μ² < 0.
  const rho0 = isBroken ? Math.sqrt(-mu2 / (2 * clampedLambda)) : 0

  // Curvature of V(ρ) at the vacuum: d²V/dρ²|ρ0 = -4μ² (broken phase).
  // In the unbroken phase, the curvature at ρ=0 is 2μ².
  const radialMassSquared = isBroken ? -4 * mu2 : 2 * mu2
  const radialMass = Math.sqrt(Math.max(radialMassSquared, 0))

  return { mu2, lambda: clampedLambda, isBroken, rho0, radialMassSquared, radialMass }
}

export function potentialV(rho: number, mu2: number, lambda: number): number {
  return mu2 * rho * rho + lambda * rho ** 4
}

export function generatePotentialCurve(
  mu2: number,
  lambda: number,
  rhoMax: number = RHO_SLIDER_MAX,
  numPoints: number = 100
): Array<{ rho: number; v: number }> {
  const curve = []
  const step = rhoMax / (numPoints - 1)
  for (let i = 0; i < numPoints; i++) {
    const rho = i * step
    curve.push({ rho, v: potentialV(rho, mu2, lambda) })
  }
  return curve
}

/** Polar-to-cartesian helper for the 2D field-space disc view. */
export function fieldSpacePoint(rho: number, thetaRad: number): { x: number; y: number } {
  return { x: rho * Math.cos(thetaRad), y: rho * Math.sin(thetaRad) }
}

export interface HiggsPreset {
  id: string
  name: string
  description: string
  mu2: number
  lambda: number
}

export const HIGGS_PRESETS: HiggsPreset[] = [
  {
    id: 'unbroken',
    name: 'Unbroken Bowl',
    description: 'Positive μ² — a simple bowl centered at the origin, symmetry intact',
    mu2: 1,
    lambda: 0.5,
  },
  {
    id: 'transition',
    name: 'Right at the Transition',
    description: 'μ² just below zero — the vacuum ring is barely forming',
    mu2: -0.05,
    lambda: 0.5,
  },
  {
    id: 'sombrero',
    name: 'Standard Sombrero',
    description: 'Negative μ² — the classic Mexican-hat potential',
    mu2: -1,
    lambda: 0.5,
  },
  {
    id: 'steep',
    name: 'Steep Valley',
    description: 'A deep, steep-walled sombrero',
    mu2: -2,
    lambda: 1,
  },
]

/**
 * Real, fixed Standard Model reference values — NOT derived from the mu2/
 * lambda sliders above (that would require gauging this toy model with
 * real SU(2)xU(1) couplings, well beyond a single-scalar toy). Sourced
 * from the w-boson/z-boson mass strings already present in particleData.ts.
 */
export const WZ_REFERENCE = {
  mW: 80.4,
  mZ: 91.2,
  cosThetaW: 80.4 / 91.2,
  thetaWDeg: (Math.acos(80.4 / 91.2) * 180) / Math.PI,
} as const

/** Precision-aware μ² formatter — avoids "-0.000" near the symmetry-breaking transition. */
export function formatMu2(mu2: number): string {
  if (mu2 !== 0 && Math.abs(mu2) < 1e-4) {
    return mu2.toExponential(1)
  }
  return mu2.toFixed(3)
}

export function formatMass(m: number): string {
  if (m === 0) return '0'
  if (Math.abs(m) < 0.001) return m.toExponential(2)
  return m.toFixed(3)
}
