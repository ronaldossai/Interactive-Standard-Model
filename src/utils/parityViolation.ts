/**
 * parityViolation.ts
 *
 * The Wu experiment (1957): polarized cobalt-60 nuclei, cooled to near
 * absolute zero in a magnetic field, emit beta-decay electrons
 * preferentially in the direction opposite their nuclear spin. The
 * standard angular distribution for allowed beta decay from polarized
 * nuclei is W(theta) = 1 + A*P*beta*cos(theta), theta measured from the
 * spin axis. Under a parity transformation, momentum flips (theta -> pi -
 * theta) but spin (an axial vector) does not — equivalent to flipping the
 * sign of A. Co-60 undergoes a pure Gamow-Teller transition, for which A =
 * -1 (theoretically maximal violation), which is why Wu chose that isotope.
 */

export const ASYMMETRY_PARAMETER = -1 // A, for Co-60's Gamow-Teller transition

export interface AngularState {
  wAligned: number // W at theta = 0 (electron emitted along the spin direction)
  wOpposed: number // W at theta = 180 (electron emitted opposite the spin direction)
}

export function calculateAngularState(polarization: number, beta: number): AngularState {
  const p = Math.min(Math.max(polarization, 0), 1)
  const b = Math.min(Math.max(beta, 0), 1)
  return {
    wAligned: 1 + ASYMMETRY_PARAMETER * p * b,
    wOpposed: 1 - ASYMMETRY_PARAMETER * p * b,
  }
}

export interface AngularPoint {
  angleDeg: number
  w: number
  wMirror: number
}

/**
 * The real angular distribution and its parity-mirrored counterpart
 * (same formula, A -> -A), traced around a full circle for a polar plot.
 */
export function generateAngularDistribution(
  polarization: number,
  beta: number,
  numPoints: number = 72
): AngularPoint[] {
  const p = Math.min(Math.max(polarization, 0), 1)
  const b = Math.min(Math.max(beta, 0), 1)
  const points: AngularPoint[] = []
  for (let i = 0; i <= numPoints; i++) {
    const angleDeg = (i / numPoints) * 360
    const cosTheta = Math.cos((angleDeg * Math.PI) / 180)
    points.push({
      angleDeg,
      w: 1 + ASYMMETRY_PARAMETER * p * b * cosTheta,
      wMirror: 1 - ASYMMETRY_PARAMETER * p * b * cosTheta,
    })
  }
  return points
}

export function formatPolarization(p: number): string {
  return `${(p * 100).toFixed(0)}%`
}

export function formatW(w: number): string {
  return w.toFixed(3)
}

export interface ParityPreset {
  id: string
  name: string
  description: string
  polarization: number
  beta: number
}

export const PARITY_PRESETS: ParityPreset[] = [
  {
    id: 'unpolarized',
    name: 'No Polarization',
    description: 'Room temperature, no magnetic field — no way to distinguish a handed effect, the pattern is a perfect circle',
    polarization: 0,
    beta: 0.6,
  },
  {
    id: 'wu',
    name: "Wu's Experiment (Illustrative)",
    description: 'Cobalt-60 cooled to ~0.01K in a strong magnetic field — illustrative polarization; precise historical figures vary by source',
    polarization: 0.6,
    beta: 0.6,
  },
  {
    id: 'maximal',
    name: 'Maximal',
    description: 'Full nuclear polarization and a highly relativistic electron — the starkest possible violation',
    polarization: 1,
    beta: 0.9,
  },
]
