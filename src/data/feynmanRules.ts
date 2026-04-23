/**
 * feynmanRules.ts
 *
 * Pure lookup table for tree-level (lowest-order) interactions.
 *
 * Design principle — EFT framing:
 *   We deliberately show only the dominant vertex. This is conceptually
 *   equivalent to an effective field theory: loop corrections are "integrated
 *   out" because they're suppressed at the energy scales a layman thinks about.
 *   The UI copy surfaces this idea without using the jargon.
 *
 * Rules encoded here:
 *   1. Electromagnetic  — photon exchange between charged particles
 *   2. Strong           — gluon exchange between colour-charged (quark) particles
 *   3. Weak charged     — W⁻/W⁺ exchange, changes flavour, requires charge difference
 *   4. Weak neutral     — Z⁰ exchange, same flavour, any two particles with Weak
 *   5. Higgs            — scalar coupling proportional to mass (special-cased)
 *   6. No interaction   — no shared force at tree level
 */

import type { ParticleData } from '../types/particle'

// ── Mediator descriptor ───────────────────────────────────────────────────────

export type LineStyle = 'sine' | 'spring' | 'straight' | 'dashed' | 'zigzag'

export interface Mediator {
  /** Boson particle ID matching particleData */
  bosonId: string
  /** Display symbol */
  symbol: string
  /** Force name for caption */
  force: string
  /** SVG line style */
  style: LineStyle
  /** Hex colour for the propagator line */
  color: string
}

export const MEDIATORS: Record<string, Mediator> = {
  photon: {
    bosonId: 'photon',
    symbol: 'γ',
    force: 'Electromagnetic',
    style: 'sine',
    color: '#ffdd57',
  },
  gluon: {
    bosonId: 'gluon',
    symbol: 'g',
    force: 'Strong',
    style: 'spring',
    color: '#ff6b6b',
  },
  'w-minus': {
    bosonId: 'w-boson',
    symbol: 'W⁻',
    force: 'Weak',
    style: 'zigzag',
    color: '#a78bfa',
  },
  'w-plus': {
    bosonId: 'w-boson',
    symbol: 'W⁺',
    force: 'Weak',
    style: 'zigzag',
    color: '#a78bfa',
  },
  z: {
    bosonId: 'z-boson',
    symbol: 'Z⁰',
    force: 'Weak',
    style: 'zigzag',
    color: '#c084fc',
  },
  higgs: {
    bosonId: 'higgs',
    symbol: 'H',
    force: 'Higgs',
    style: 'dashed',
    color: '#34d399',
  },
}

// ── Interaction result ────────────────────────────────────────────────────────

export interface InteractionResult {
  /** Does an interaction exist at tree level? */
  interacts: boolean
  mediator: Mediator | null
  /** Human-readable caption for laymen */
  caption: string
  /** Secondary line — the EFT hint */
  subCaption: string
}

// ── Helper: parse charge string → sign integer ────────────────────────────────

function chargeSign(charge: string): number {
  if (charge.startsWith('+')) return 1
  if (charge.startsWith('-')) return -1
  return 0
}

// ── Main rule engine ──────────────────────────────────────────────────────────

export function resolveInteraction(
  a: ParticleData,
  b: ParticleData,
): InteractionResult {
  const aForces = a.interactions ?? []
  const bForces = b.interactions ?? []

  const hasEM     = aForces.includes('Electromagnetic') && bForces.includes('Electromagnetic')
  const hasStrong = aForces.includes('Strong') && bForces.includes('Strong')
  const hasWeak   = aForces.includes('Weak') && bForces.includes('Weak')
  const hasHiggs  = aForces.includes('Higgs field') || bForces.includes('Higgs field')

  // Priority: Strong > EM > Weak > Higgs (dominant at everyday energies)

  if (hasStrong) {
    return {
      interacts: true,
      mediator: MEDIATORS.gluon,
      caption: `${a.symbol} and ${b.symbol} exchange a gluon — this is the Strong force.`,
      subCaption: 'Gluons carry colour charge and bind quarks inside hadrons.',
    }
  }

  if (hasEM) {
    const aCharge = chargeSign(a.charge)
    const bCharge = chargeSign(b.charge)
    const sameSign = aCharge !== 0 && bCharge !== 0 && aCharge === bCharge
    const verb = sameSign ? 'repel each other' : 'interact'
    return {
      interacts: true,
      mediator: MEDIATORS.photon,
      caption: `${a.symbol} and ${b.symbol} ${verb} via photon exchange — the Electromagnetic force.`,
      subCaption: 'Photons are massless, giving electromagnetism its infinite range.',
    }
  }

  if (hasWeak) {
    const aCharge = chargeSign(a.charge)
    const bCharge = chargeSign(b.charge)
    const chargesAreDifferent = aCharge !== bCharge

    // Charged current (W) requires charge transfer to conserve charge
    if (chargesAreDifferent) {
      const w = aCharge > bCharge ? MEDIATORS['w-plus'] : MEDIATORS['w-minus']
      return {
        interacts: true,
        mediator: w,
        caption: `${a.symbol} and ${b.symbol} interact via ${w.symbol} exchange — charged weak current.`,
        subCaption: 'W bosons can change a particle\'s flavour — the only force that does this.',
      }
    }

    // Neutral current (Z)
    return {
      interacts: true,
      mediator: MEDIATORS.z,
      caption: `${a.symbol} and ${b.symbol} interact via Z⁰ exchange — neutral weak current.`,
      subCaption: 'The Z boson is like a heavy, short-range photon that can also reach neutrinos.',
    }
  }

  // Higgs coupling — special case (massive particles only)
  if (hasHiggs) {
    return {
      interacts: true,
      mediator: MEDIATORS.higgs,
      caption: `${a.symbol} acquires mass through the Higgs field.`,
      subCaption: 'The Higgs doesn\'t push or pull — it gives particles inertia.',
    }
  }

  return {
    interacts: false,
    mediator: null,
    caption: `${a.symbol} and ${b.symbol} do not directly interact at tree level.`,
    subCaption: 'No force carrier is exchanged between these two particles.',
  }
}
