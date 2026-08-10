/**
 * gravitonPhysics.ts
 *
 * The graviton is hypothetical — nothing here simulates "detecting" one.
 * Instead: (1) Newton's law of gravitation vs. Coulomb's law between real
 * particle pairs, showing gravity is 10^36-10^42x weaker than
 * electromagnetism, at every distance (both forces fall off as 1/r^2, so
 * the ratio never changes); and (2) how many gravitons a real LIGO
 * detection implies, via E = Nhf — the same math used to count photons in
 * a laser pulse, explaining why a coherent gravitational wave is detectable
 * even though a single graviton is not.
 */

export const G = 6.6743e-11 // gravitational constant, N m^2/kg^2
export const COULOMB_K = 8.9875e9 // 1/(4 pi epsilon0), N m^2/C^2
export const ELEMENTARY_CHARGE = 1.602176634e-19 // C
export const ELECTRON_MASS_KG = 9.1093837015e-31
export const PROTON_MASS_KG = 1.67262192369e-27
export const PLANCK_H = 6.62607015e-34 // J s
export const SOLAR_MASS_KG = 1.989e30
export const C_M_PER_S = 2.99792458e8

export interface ParticlePair {
  id: string
  name: string
  description: string
  m1: number
  m2: number
  q1: number
  q2: number
}

export const PARTICLE_PAIRS: ParticlePair[] = [
  {
    id: 'proton-proton',
    name: 'Two Protons',
    description: 'The classic comparison — electromagnetic repulsion is ~10³⁶x stronger than gravitational attraction',
    m1: PROTON_MASS_KG,
    m2: PROTON_MASS_KG,
    q1: ELEMENTARY_CHARGE,
    q2: ELEMENTARY_CHARGE,
  },
  {
    id: 'electron-electron',
    name: 'Two Electrons',
    description: 'The electron is far lighter than the proton, so the gap is even larger here',
    m1: ELECTRON_MASS_KG,
    m2: ELECTRON_MASS_KG,
    q1: ELEMENTARY_CHARGE,
    q2: ELEMENTARY_CHARGE,
  },
  {
    id: 'electron-proton',
    name: 'Electron & Proton (Hydrogen Atom)',
    description: "Inside every hydrogen atom, the electron's orbit is governed entirely by electromagnetism — gravity is utterly negligible",
    m1: ELECTRON_MASS_KG,
    m2: PROTON_MASS_KG,
    q1: ELEMENTARY_CHARGE,
    q2: ELEMENTARY_CHARGE,
  },
]

export const R_MIN = 1e-15 // meters (nuclear scale)
export const R_MAX = 1 // meters
export const R_DEFAULT = 5.29e-11 // Bohr radius

export interface ForcePairState {
  forceGrav: number
  forceEm: number
  ratioEmOverGrav: number
}

export function calculateForcePairState(pairId: string, r: number): ForcePairState {
  const pair = PARTICLE_PAIRS.find((p) => p.id === pairId) ?? PARTICLE_PAIRS[0]
  const clampedR = Math.max(r, R_MIN)
  const forceGrav = (G * pair.m1 * pair.m2) / (clampedR * clampedR)
  const forceEm = (COULOMB_K * pair.q1 * pair.q2) / (clampedR * clampedR)
  return {
    forceGrav,
    forceEm,
    ratioEmOverGrav: forceEm / forceGrav, // r cancels — this is constant for a given pair
  }
}

/** Log-spaced force-vs-distance curve for both forces, for a log-log plot. */
export function generateForceCurve(
  pairId: string,
  rMin: number = R_MIN,
  rMax: number = R_MAX,
  numPoints: number = 100
): Array<{ r: number; forceGrav: number; forceEm: number }> {
  const logMin = Math.log10(rMin)
  const logMax = Math.log10(rMax)
  const curve = []
  for (let i = 0; i < numPoints; i++) {
    const logR = logMin + (i / (numPoints - 1)) * (logMax - logMin)
    const r = Math.pow(10, logR)
    const state = calculateForcePairState(pairId, r)
    curve.push({ r, forceGrav: state.forceGrav, forceEm: state.forceEm })
  }
  return curve
}

export function sliderToDistance(t: number): number {
  const clampedT = Math.min(Math.max(t, 0), 1)
  const logMin = Math.log10(R_MIN)
  const logMax = Math.log10(R_MAX)
  return Math.pow(10, logMin + clampedT * (logMax - logMin))
}

export function distanceToSlider(r: number): number {
  const clampedR = Math.min(Math.max(r, R_MIN), R_MAX)
  const logMin = Math.log10(R_MIN)
  const logMax = Math.log10(R_MAX)
  return (Math.log10(clampedR) - logMin) / (logMax - logMin)
}

export const E_MIN = 0.01 // solar masses
export const E_MAX = 5
export const F_MIN = 10 // Hz
export const F_MAX = 2000

export interface GravitonBurstState {
  energyJoules: number
  gravitonEnergyJoules: number
  numGravitons: number
}

export function calculateGravitonBurstState(energySolarMasses: number, frequencyHz: number): GravitonBurstState {
  const energyJoules = energySolarMasses * SOLAR_MASS_KG * C_M_PER_S * C_M_PER_S
  const gravitonEnergyJoules = PLANCK_H * frequencyHz
  return {
    energyJoules,
    gravitonEnergyJoules,
    numGravitons: energyJoules / gravitonEnergyJoules,
  }
}

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

export function sliderToFrequency(t: number): number {
  const clampedT = Math.min(Math.max(t, 0), 1)
  const logMin = Math.log10(F_MIN)
  const logMax = Math.log10(F_MAX)
  return Math.pow(10, logMin + clampedT * (logMax - logMin))
}

export function frequencyToSlider(f: number): number {
  const clampedF = Math.min(Math.max(f, F_MIN), F_MAX)
  const logMin = Math.log10(F_MIN)
  const logMax = Math.log10(F_MAX)
  return (Math.log10(clampedF) - logMin) / (logMax - logMin)
}

export interface GWPreset {
  id: string
  name: string
  description: string
  energySolarMasses: number
  frequencyHz: number
}

export const GW_PRESETS: GWPreset[] = [
  {
    id: 'gw150914',
    name: 'GW150914 (First Detection)',
    description: 'The real 2016 LIGO announcement — ~3 solar masses radiated as gravitational waves, peaking around 250 Hz',
    energySolarMasses: 3,
    frequencyHz: 250,
  },
  {
    id: 'quiet-merger',
    name: 'Smaller Merger (Illustrative)',
    description: 'A less energetic, lower-frequency merger',
    energySolarMasses: 0.1,
    frequencyHz: 100,
  },
  {
    id: 'high-freq-merger',
    name: 'High-Frequency Merger (Illustrative)',
    description: 'A higher-frequency compact merger, near the top of LIGO’s sensitive band',
    energySolarMasses: 1,
    frequencyHz: 1000,
  },
]

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
}

function toSuperscript(n: number): string {
  return String(n)
    .split('')
    .map((c) => SUPERSCRIPT_DIGITS[c] ?? c)
    .join('')
}

/** Scientific notation with a real superscript exponent, for numbers spanning many orders of magnitude. */
export function formatScientific(n: number, unit: string = ''): string {
  if (n === 0) return unit ? `0 ${unit}` : '0'
  const exp = Math.floor(Math.log10(Math.abs(n)))
  const mantissa = n / Math.pow(10, exp)
  const suffix = unit ? ` ${unit}` : ''
  return `${mantissa.toFixed(2)} × 10${toSuperscript(exp)}${suffix}`
}

export function formatForce(n: number): string {
  return formatScientific(n, 'N')
}

export function formatRatio(n: number): string {
  return formatScientific(n)
}

export function formatGravitonCount(n: number): string {
  return formatScientific(n, 'gravitons')
}

export function formatDistance(r: number): string {
  return formatScientific(r, 'm')
}

export function formatEnergySolarMasses(e: number): string {
  return `${e.toFixed(e < 1 ? 3 : 2)} M☉`
}

export function formatFrequency(f: number): string {
  return `${f.toFixed(f < 10 ? 1 : 0)} Hz`
}
