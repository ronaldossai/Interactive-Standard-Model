/**
 * Hadron Builder Utilities
 * 
 * Physics rules for composing quarks into hadrons:
 * - Baryons: 3 quarks (qqq) with color charges RGB → white
 * - Mesons: quark + antiquark (qq̄) with color + anticolor → white
 * - Color confinement: only colorless combinations can exist freely
 */

import { COMPOSITE_DATA, type CompositeData } from '../data/compositeData'

export type ColorCharge = 'red' | 'green' | 'blue' | 'antired' | 'antigreen' | 'antiblue'

export interface QuarkSelection {
  id: string
  symbol: string
  color: string // hex color for display
  colorCharge: ColorCharge
  isAntiquark: boolean
}

export interface HadronValidation {
  isValid: boolean
  hadron: CompositeData | null
  errors: string[]
  warnings: string[]
}

// Standard quark charges (for normal quarks)
const QUARK_CHARGES: Record<string, number> = {
  'up': 2/3,
  'down': -1/3,
  'charm': 2/3,
  'strange': -1/3,
  'top': 2/3,
  'bottom': -1/3,
}

/**
 * Check if a color charge combination is valid (colorless)
 */
export function isColorNeutral(charges: ColorCharge[]): boolean {
  if (charges.length === 3) {
    // Baryon: must have R, G, B (in any order)
    const sorted = [...charges].sort()
    return sorted.join(',') === 'blue,green,red'
  } else if (charges.length === 2) {
    // Meson: must have color + anticolor
    const [c1, c2] = charges
    return (
      (c1 === 'red' && c2 === 'antired') || (c1 === 'antired' && c2 === 'red') ||
      (c1 === 'green' && c2 === 'antigreen') || (c1 === 'antigreen' && c2 === 'green') ||
      (c1 === 'blue' && c2 === 'antiblue') || (c1 === 'antiblue' && c2 === 'blue')
    )
  }
  return false
}

/**
 * Calculate total electric charge of selected quarks
 */
export function calculateTotalCharge(quarks: QuarkSelection[]): number {
  return quarks.reduce((sum, q) => {
    const baseCharge = QUARK_CHARGES[q.id] || 0
    return sum + (q.isAntiquark ? -baseCharge : baseCharge)
  }, 0)
}

/**
 * Normalize quark ID array for matching (sort, handle antiquarks)
 */
function normalizeQuarkIds(ids: string[]): string {
  return [...ids].sort().join(',')
}

/**
 * Check if the quark combination matches a known hadron
 */
export function findMatchingHadron(quarks: QuarkSelection[]): CompositeData | null {
  const quarkIds = quarks.map(q => q.id)
  const normalizedSelection = normalizeQuarkIds(quarkIds)

  for (const hadron of COMPOSITE_DATA) {
    const normalizedHadron = normalizeQuarkIds(hadron.quarks)
    if (normalizedSelection === normalizedHadron) {
      // Additional check: verify antiquark configuration matches
      const antiquarkCount = quarks.filter(q => q.isAntiquark).length
      const expectedAntiquarkCount = hadron.category === 'meson' ? 1 : 0
      
      if (antiquarkCount === expectedAntiquarkCount) {
        return hadron
      }
    }
  }
  
  return null
}

/**
 * Validate a quark selection and return detailed feedback
 */
export function validateHadron(quarks: QuarkSelection[]): HadronValidation {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check count
  if (quarks.length === 0) {
    return {
      isValid: false,
      hadron: null,
      errors: ['Select quarks to build a hadron'],
      warnings: [],
    }
  }
  
  if (quarks.length === 1) {
    return {
      isValid: false,
      hadron: null,
      errors: [],
      warnings: ['Add more quarks. Baryons need 3 quarks, mesons need 2 (quark + antiquark).'],
    }
  }
  
  if (quarks.length > 3) {
    return {
      isValid: false,
      hadron: null,
      errors: ['Too many quarks! Maximum is 3 for baryons.'],
      warnings: [],
    }
  }
  
  // Check color confinement
  const colorCharges = quarks.map(q => q.colorCharge)
  const isColorless = isColorNeutral(colorCharges)
  
  if (!isColorless) {
    if (quarks.length === 3) {
      errors.push('Color confinement violated! Baryons must have one red, one green, and one blue quark.')
    } else if (quarks.length === 2) {
      errors.push('Color confinement violated! Mesons must have a color-anticolor pair (e.g., red + antired).')
    }
  }
  
  // Check antiquark rules
  const antiquarkCount = quarks.filter(q => q.isAntiquark).length
  
  if (quarks.length === 3 && antiquarkCount > 0) {
    errors.push('Baryons must have 3 normal quarks (no antiquarks). For antibaryons, use 3 antiquarks.')
  }
  
  if (quarks.length === 2 && antiquarkCount !== 1) {
    errors.push('Mesons require exactly 1 quark and 1 antiquark.')
  }
  
  // If basic rules pass, try to find matching hadron
  if (isColorless && errors.length === 0) {
    const hadron = findMatchingHadron(quarks)
    
    if (hadron) {
      return {
        isValid: true,
        hadron,
        errors: [],
        warnings: [],
      }
    } else {
      // Valid combination but not in our database
      const charge = calculateTotalCharge(quarks)
      warnings.push(
        `This is a valid ${quarks.length === 3 ? 'baryon' : 'meson'} combination (charge ${charge > 0 ? '+' : ''}${charge.toFixed(2)}), but it's not in our database of common hadrons.`
      )
    }
  }
  
  return {
    isValid: false,
    hadron: null,
    errors,
    warnings,
  }
}

/**
 * Get available color charges for the next quark selection
 * Based on current selections and rules
 */
export function getAvailableColors(
  currentQuarks: QuarkSelection[],
  isSelectingAntiquark: boolean
): ColorCharge[] {
  if (currentQuarks.length === 0) {
    // First quark: any color available
    return isSelectingAntiquark
      ? ['antired', 'antigreen', 'antiblue']
      : ['red', 'green', 'blue']
  }
  
  if (currentQuarks.length === 1) {
    const first = currentQuarks[0]
    if (first.isAntiquark && !isSelectingAntiquark) {
      // Building a meson: need matching anticolor
      if (first.colorCharge === 'antired') return ['red']
      if (first.colorCharge === 'antigreen') return ['green']
      if (first.colorCharge === 'antiblue') return ['blue']
    } else if (!first.isAntiquark && isSelectingAntiquark) {
      // Building a meson: need matching anticolor
      if (first.colorCharge === 'red') return ['antired']
      if (first.colorCharge === 'green') return ['antigreen']
      if (first.colorCharge === 'blue') return ['antiblue']
    } else if (!first.isAntiquark && !isSelectingAntiquark) {
      // Building a baryon: need different colors
      const used = first.colorCharge
      return (['red', 'green', 'blue'] as ColorCharge[]).filter(c => c !== used)
    } else if (first.isAntiquark && isSelectingAntiquark) {
      // Building an antibaryon: need different anticolors
      const used = first.colorCharge
      return (['antired', 'antigreen', 'antiblue'] as ColorCharge[]).filter(c => c !== used)
    }
  }
  
  if (currentQuarks.length === 2) {
    if (!isSelectingAntiquark) {
      // Third quark for baryon: complete RGB
      const used = currentQuarks.map(q => q.colorCharge)
      const needed = (['red', 'green', 'blue'] as ColorCharge[]).find(c => !used.includes(c))
      return needed ? [needed] : []
    } else {
      // Third antiquark for antibaryon: complete anti-RGB
      const used = currentQuarks.map(q => q.colorCharge)
      const needed = (['antired', 'antigreen', 'antiblue'] as ColorCharge[]).find(c => !used.includes(c))
      return needed ? [needed] : []
    }
  }
  
  // Default: all available
  return isSelectingAntiquark
    ? ['antired', 'antigreen', 'antiblue']
    : ['red', 'green', 'blue']
}

/**
 * Educational content about QCD and color charge
 */
export const QCD_INFO = {
  title: 'Quantum Chromodynamics (QCD)',
  sections: [
    {
      heading: 'Color Charge',
      content: 'Quarks carry a "colour charge" (red, green, or blue) which of course nothing to do with actual colour! This is the charge of the strong force, analogous to electric charge for electromagnetism.',
    },
    {
      heading: 'Color Confinement',
      content: 'Only "colourless" (white) combinations can exist freely. Baryons combine RGB → white. Mesons combine colour + anticolour → white. Individual quarks cannot be isolated.',
    },
    {
      heading: 'Gluons',
      content: 'Gluons are the force carriers of the strong force. Unlike photons, gluons themselves carry colour charge and can interact with each other, making QCD extremely complex.',
    },
    {
      heading: 'Asymptotic Freedom',
      content: 'At very short distances (high energies), quarks behave almost as free particles. At larger distances, the strong force grows stronger, confining them permanently, which is the opposite of electromagnetism!',
    },
  ],
}

/**
 * Preset hadron recipes for quick building
 */
export const HADRON_RECIPES = [
  {
    name: 'Proton',
    symbol: 'p',
    description: 'Two up quarks + one down quark',
    quarks: [
      { id: 'up', colorCharge: 'red' as ColorCharge },
      { id: 'up', colorCharge: 'green' as ColorCharge },
      { id: 'down', colorCharge: 'blue' as ColorCharge },
    ],
  },
  {
    name: 'Neutron',
    symbol: 'n',
    description: 'One up quark + two down quarks',
    quarks: [
      { id: 'up', colorCharge: 'red' as ColorCharge },
      { id: 'down', colorCharge: 'green' as ColorCharge },
      { id: 'down', colorCharge: 'blue' as ColorCharge },
    ],
  },
  {
    name: 'Pion⁺',
    symbol: 'π⁺',
    description: 'Up quark + anti-down quark',
    quarks: [
      { id: 'up', colorCharge: 'red' as ColorCharge },
      { id: 'down', colorCharge: 'antired' as ColorCharge, isAnti: true },
    ],
  },
  {
    name: 'Lambda',
    symbol: 'Λ⁰',
    description: 'Up + down + strange quarks',
    quarks: [
      { id: 'up', colorCharge: 'red' as ColorCharge },
      { id: 'down', colorCharge: 'green' as ColorCharge },
      { id: 'strange', colorCharge: 'blue' as ColorCharge },
    ],
  },
]
