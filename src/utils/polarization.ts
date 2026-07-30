/**
 * polarization.ts
 *
 * Light polarization physics for the Photon Lab: Malus's Law and the
 * "polarization paradox" (a third polarizer between two crossed ones
 * lets light back through).
 *
 * Physics: unpolarized light through a polarizer transmits at exactly 50%
 * (the ensemble average of cos² over a uniformly random incident angle).
 * Every subsequent polarizer applies Malus's Law relative to the axis of
 * the previous *enabled* stage: I_out = I_in × cos²(Δθ). Only relative
 * angles between successive stages matter — cos²(θ) has period 180° and
 * is symmetric about 90°, so no wraparound/normalization logic is needed
 * for angles already confined to [0, 180].
 */

export const I0 = 100
const ANGLE_A = 0 // Polarizer A's fixed reference axis, degrees

export type StageId = 'A' | 'B' | 'C'

export interface TransmissionStage {
  id: StageId
  label: string
  enabled: boolean
  angle: number // 0-180
  relativeAngle: number | null // vs previous enabled stage; null for A
  intensityIn: number
  intensityOut: number
  transmittance: number
}

/**
 * Malus's Law: fraction of intensity transmitted through a polarizer
 * whose axis is offset by relativeAngleDeg from the incoming light's
 * polarization axis.
 */
export function malusTransmittance(relativeAngleDeg: number): number {
  const rad = (relativeAngleDeg * Math.PI) / 180
  return Math.cos(rad) ** 2
}

export function calculateTransmissionChain(
  angleB: number,
  bEnabled: boolean,
  angleC: number,
  incidentIntensity: number = I0
): TransmissionStage[] {
  // Polarizer A: unpolarized light in, transmits at exactly 50% regardless
  // of axis, and sets the polarization axis for everything downstream.
  const intensityA = incidentIntensity * 0.5
  const stageA: TransmissionStage = {
    id: 'A',
    label: 'Polarizer A',
    enabled: true,
    angle: ANGLE_A,
    relativeAngle: null,
    intensityIn: incidentIntensity,
    intensityOut: intensityA,
    transmittance: incidentIntensity > 0 ? intensityA / incidentIntensity : 0,
  }

  // Polarizer B: optional. Disabled acts as identity so C still measures
  // its angle against A, not against a phantom zero.
  const axisBeforeB = ANGLE_A
  const relativeB = bEnabled ? angleB - axisBeforeB : null
  const transmittanceB = bEnabled && relativeB !== null ? malusTransmittance(relativeB) : 1
  const intensityB = stageA.intensityOut * transmittanceB
  const stageB: TransmissionStage = {
    id: 'B',
    label: 'Polarizer B',
    enabled: bEnabled,
    angle: angleB,
    relativeAngle: relativeB,
    intensityIn: stageA.intensityOut,
    intensityOut: intensityB,
    transmittance: stageA.intensityOut > 0 ? intensityB / stageA.intensityOut : 0,
  }

  // Polarizer C (analyzer): always present. Measures its angle against
  // whichever stage last actually set a polarization axis (B if enabled,
  // otherwise A).
  const axisBeforeC = bEnabled ? angleB : axisBeforeB
  const relativeC = angleC - axisBeforeC
  const transmittanceC = malusTransmittance(relativeC)
  const intensityC = stageB.intensityOut * transmittanceC
  const stageC: TransmissionStage = {
    id: 'C',
    label: 'Polarizer C (Analyzer)',
    enabled: true,
    angle: angleC,
    relativeAngle: relativeC,
    intensityIn: stageB.intensityOut,
    intensityOut: intensityC,
    transmittance: stageB.intensityOut > 0 ? intensityC / stageB.intensityOut : 0,
  }

  return [stageA, stageB, stageC]
}

/**
 * The cos² transmittance curve vs. relative angle (0-180°). This shape is
 * a mathematical constant, independent of any lab state — compute once.
 */
export function generateMalusCurve(
  numPoints: number = 181
): Array<{ angle: number; transmittance: number }> {
  const curve = []
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / (numPoints - 1)) * 180
    curve.push({ angle, transmittance: malusTransmittance(angle) })
  }
  return curve
}

export const MALUS_CURVE = generateMalusCurve()

export interface PolarizationPreset {
  id: string
  name: string
  description: string
  angleB: number
  bEnabled: boolean
  angleC: number
}

export const POLARIZATION_PRESETS: PolarizationPreset[] = [
  {
    id: 'aligned',
    name: 'Aligned',
    description: 'Analyzer aligned with the first polarizer — maximum transmission',
    angleB: 45,
    bEnabled: false,
    angleC: 0,
  },
  {
    id: 'crossed',
    name: 'Crossed (Blocked)',
    description: 'Analyzer at 90° to the first polarizer — light is fully blocked',
    angleB: 45,
    bEnabled: false,
    angleC: 90,
  },
  {
    id: 'paradox',
    name: 'The Paradox',
    description: 'A middle polarizer at 45° between two "crossed" polarizers lets light back through',
    angleB: 45,
    bEnabled: true,
    angleC: 90,
  },
  {
    id: 'partial',
    name: 'Partial',
    description: 'Analyzer at 30° — partial transmission',
    angleB: 45,
    bEnabled: false,
    angleC: 30,
  },
]
