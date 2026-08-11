/**
 * neutrinoOscillation.ts
 *
 * Neutrino oscillation physics calculations using the PMNS matrix.
 * Based on PDG 2024 values for mixing angles and mass-squared differences.
 *
 * References:
 * - Particle Data Group (PDG) 2024: Neutrino Mixing
 * - Three-flavor neutrino oscillation formalism
 */

// PMNS mixing angles (degrees) - PDG 2024 best-fit values
export const THETA_12 = 33.82  // Solar mixing angle
export const THETA_23 = 49.2   // Atmospheric mixing angle
export const THETA_13 = 8.61   // Reactor mixing angle
export const DELTA_CP = 197    // CP-violating phase (degrees) - currently poorly constrained

// Mass-squared differences (eV²) - PDG 2024
export const DELTA_M21_SQ = 7.53e-5   // Δm²₂₁ (solar)
export const DELTA_M31_SQ = 2.453e-3  // Δm³₁ (atmospheric, normal ordering)

// Physical constants
const CONVERSION = 1.267     // Conversion factor: (Δm² [eV²] × L [km]) / (E [GeV])

export type NeutrinoFlavor = 'electron' | 'muon' | 'tau'

interface OscillationProbabilities {
  electron: number
  muon: number
  tau: number
}

/**
 * Convert mixing angle from degrees to radians
 */
const degToRad = (deg: number): number => (deg * Math.PI) / 180

/**
 * Calculate PMNS matrix elements (simplified, ignoring CP phase for now)
 * Returns the full 3×3 PMNS matrix U
 */
function calculatePMNSMatrix(): number[][] {
  const s12 = Math.sin(degToRad(THETA_12))
  const c12 = Math.cos(degToRad(THETA_12))
  const s23 = Math.sin(degToRad(THETA_23))
  const c23 = Math.cos(degToRad(THETA_23))
  const s13 = Math.sin(degToRad(THETA_13))
  const c13 = Math.cos(degToRad(THETA_13))

  // PMNS matrix (real part only, ignoring δCP for simplification)
  // U = R₂₃ · R₁₃ · R₁₂
  return [
    [
      c12 * c13,
      s12 * c13,
      s13,
    ],
    [
      -s12 * c23 - c12 * s23 * s13,
      c12 * c23 - s12 * s23 * s13,
      s23 * c13,
    ],
    [
      s12 * s23 - c12 * c23 * s13,
      -c12 * s23 - s12 * c23 * s13,
      c23 * c13,
    ],
  ]
}

/**
 * Calculate the oscillation phase for a given mass-squared difference
 * Φᵢⱼ = 1.267 × (Δm²ᵢⱼ [eV²] × L [km]) / E [GeV]
 */
function oscillationPhase(deltaMSq: number, distance: number, energy: number): number {
  return CONVERSION * (deltaMSq * distance) / energy
}

/**
 * Calculate three-flavor neutrino oscillation probabilities
 * P(να → νβ) as a function of distance L and energy E
 *
 * @param initialFlavor - Starting neutrino flavor ('electron', 'muon', or 'tau')
 * @param distance - Distance traveled in kilometers
 * @param energy - Neutrino energy in GeV
 * @returns Probabilities for each final flavor
 */
export function calculateOscillationProbabilities(
  initialFlavor: NeutrinoFlavor,
  distance: number,
  energy: number
): OscillationProbabilities {
  const U = calculatePMNSMatrix()

  // Map flavor to index: e=0, μ=1, τ=2
  const flavorIndex: Record<NeutrinoFlavor, number> = {
    electron: 0,
    muon: 1,
    tau: 2,
  }

  const alpha = flavorIndex[initialFlavor]

  // Calculate oscillation phases
  const phi21 = oscillationPhase(DELTA_M21_SQ, distance, energy)
  const phi31 = oscillationPhase(DELTA_M31_SQ, distance, energy)
  const phi32 = phi31 - phi21

  // Three-flavor oscillation probability formula
  // P(να → νβ) = Σᵢⱼ Uαᵢ* Uβᵢ Uαⱼ Uβⱼ* exp(-i Φᵢⱼ)
  //
  // For real PMNS matrix (ignoring CP phase), this simplifies to:
  // P(να → νβ) = δαβ - 4 Σᵢ>ⱼ Uαᵢ Uβᵢ Uαⱼ Uβⱼ sin²(Φᵢⱼ/2)
  //            + 2 Σᵢ>ⱼ Uαᵢ Uβᵢ Uαⱼ Uβⱼ sin(Φᵢⱼ)  [imaginary part, ignored for real U]

  const probabilities: OscillationProbabilities = {
    electron: 0,
    muon: 0,
    tau: 0,
  }

  // Calculate probability for each final flavor
  const flavors: NeutrinoFlavor[] = ['electron', 'muon', 'tau']
  
  for (const finalFlavor of flavors) {
    const beta = flavorIndex[finalFlavor]
    
    // Start with diagonal term (no oscillation)
    let prob = alpha === beta ? 1 : 0

    // Add oscillation terms from all mass eigenstate pairs
    const U_a1 = U[alpha][0]
    const U_a2 = U[alpha][1]
    const U_a3 = U[alpha][2]
    const U_b1 = U[beta][0]
    const U_b2 = U[beta][1]
    const U_b3 = U[beta][2]

    // (i=2, j=1)
    prob -= 4 * U_a2 * U_b2 * U_a1 * U_b1 * Math.sin(phi21 / 2) ** 2

    // (i=3, j=1)
    prob -= 4 * U_a3 * U_b3 * U_a1 * U_b1 * Math.sin(phi31 / 2) ** 2

    // (i=3, j=2)
    prob -= 4 * U_a3 * U_b3 * U_a2 * U_b2 * Math.sin(phi32 / 2) ** 2

    // Clamp to [0, 1] to handle numerical precision issues
    prob = Math.max(0, Math.min(1, prob))

    probabilities[finalFlavor] = prob
  }

  // Normalize to ensure sum = 1 (handle floating point errors)
  const total = probabilities.electron + probabilities.muon + probabilities.tau
  if (total > 0) {
    probabilities.electron /= total
    probabilities.muon /= total
    probabilities.tau /= total
  }

  return probabilities
}

/**
 * Generate oscillation probability curves over a range of distances
 * Useful for plotting
 */
export function generateOscillationCurve(
  initialFlavor: NeutrinoFlavor,
  energy: number,
  maxDistance: number,
  numPoints: number = 200
): Array<{ distance: number; probabilities: OscillationProbabilities }> {
  const curve = []
  const step = maxDistance / (numPoints - 1)

  for (let i = 0; i < numPoints; i++) {
    const distance = i * step
    const probabilities = calculateOscillationProbabilities(initialFlavor, distance, energy)
    curve.push({ distance, probabilities })
  }

  return curve
}

/**
 * Preset scenarios for common neutrino sources
 */
export interface OscillationPreset {
  id: string
  name: string
  description: string
  initialFlavor: NeutrinoFlavor
  energy: number      // GeV
  distance: number    // km
  maxDistance: number // km (for graph display)
}

export const OSCILLATION_PRESETS: OscillationPreset[] = [
  {
    id: 'solar',
    name: 'Solar Neutrinos',
    description: 'Electron neutrinos from the Sun traveling to Earth',
    initialFlavor: 'electron',
    energy: 0.0005, // 0.5 MeV = 0.0005 GeV (typical solar neutrino)
    distance: 149597870, // 1 AU in km (Sun-Earth distance)
    maxDistance: 200000000, // Show oscillation pattern over extended distance
  },
  {
    id: 'atmospheric',
    name: 'Atmospheric',
    description: 'Muon neutrinos from cosmic ray interactions in the atmosphere',
    initialFlavor: 'muon',
    energy: 1.0, // 1 GeV (typical atmospheric neutrino)
    distance: 500, // 500 km (through Earth)
    maxDistance: 13000, // Diameter of Earth
  },
  {
    id: 'reactor',
    name: 'Reactor (Short)',
    description: 'Electron antineutrinos from nuclear reactor at short distance',
    initialFlavor: 'electron',
    energy: 0.003, // 3 MeV = 0.003 GeV (reactor antineutrino)
    distance: 1, // 1 km (typical reactor experiment)
    maxDistance: 10, // Show oscillation maximum
  },
  {
    id: 'accelerator',
    name: 'Accelerator Beam',
    description: 'Muon neutrinos from particle accelerator (long baseline)',
    initialFlavor: 'muon',
    energy: 0.6, // 0.6 GeV (T2K, NOvA energy)
    distance: 295, // 295 km (Fermilab to Minnesota)
    maxDistance: 1000,
  },
  {
    id: 'supernova',
    name: 'Supernova',
    description: 'Electron neutrinos from core-collapse supernova',
    initialFlavor: 'electron',
    energy: 0.015, // 15 MeV = 0.015 GeV (typical SN neutrino)
    distance: 50000, // 50,000 light-years (galactic center)
    maxDistance: 100000,
  },
]
