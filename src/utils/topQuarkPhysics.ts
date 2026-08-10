/**
 * topQuarkPhysics.ts
 *
 * The top quark is the only quark heavy enough that it decays (t -> Wb, an
 * on-shell two-body channel since m_top > m_W + m_b) faster than the
 * strong force can bind it into a hadron. Rather than extrapolating an
 * approximate decay-width formula outside the mass range it's valid for,
 * this uses only real, verified numbers: the top's measured lifetime, the
 * confinement/hadronization timescale hbar/Lambda_QCD (with Lambda_QCD's
 * real quoted range left adjustable, since the conclusion holds across all
 * of it), and the real lifetimes of B and D mesons as the contrasting case
 * of quarks that DO hadronize first.
 */

export const TOP_LIFETIME_S = 4.99e-25 // Standard Model prediction, PDG top-quark review
export const HBAR_GEV_S = 6.582e-25 // reduced Planck constant, GeV*s

export const LAMBDA_QCD_MIN_GEV = 0.15
export const LAMBDA_QCD_MAX_GEV = 0.4
export const LAMBDA_QCD_DEFAULT_GEV = 0.3

export const B_MESON_LIFETIME_S = 1.5e-12 // charged/neutral B mesons, ~1.5-1.6 ps
export const D_MESON_LIFETIME_S = 0.41e-12 // D0 meson

export interface HadronizationState {
  hadronizationTimeS: number
  ratio: number // hadronization time / top lifetime
  topDecaysFirst: boolean
}

export function calculateHadronizationState(lambdaQcdGeV: number): HadronizationState {
  const clampedLambda = Math.max(lambdaQcdGeV, 0.01)
  const hadronizationTimeS = HBAR_GEV_S / clampedLambda
  return {
    hadronizationTimeS,
    ratio: hadronizationTimeS / TOP_LIFETIME_S,
    topDecaysFirst: TOP_LIFETIME_S < hadronizationTimeS,
  }
}

export function formatTime(s: number): string {
  if (s === 0) return '0 s'
  if (s >= 1e-9) return `${(s * 1e9).toFixed(2)} ns`
  if (s >= 1e-12) return `${(s * 1e12).toFixed(2)} ps`
  if (s >= 1e-15) return `${(s * 1e15).toFixed(2)} fs`
  return `${s.toExponential(2)} s`
}

export function formatLambda(lambdaGeV: number): string {
  return `${(lambdaGeV * 1000).toFixed(0)} MeV`
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(1)}×`
}

export interface LambdaPreset {
  id: string
  name: string
  description: string
  lambdaQcdGeV: number
}

export const LAMBDA_PRESETS: LambdaPreset[] = [
  {
    id: 'low',
    name: 'Low Estimate (~200 MeV)',
    description: 'A commonly quoted lower-end extraction of the QCD scale',
    lambdaQcdGeV: 0.2,
  },
  {
    id: 'typical',
    name: 'Typical MS-bar (~340 MeV)',
    description: 'Where most modern determinations of Lambda_QCD cluster',
    lambdaQcdGeV: 0.34,
  },
  {
    id: 'high',
    name: 'High Estimate (~400 MeV)',
    description: 'A commonly quoted upper-end extraction of the QCD scale',
    lambdaQcdGeV: 0.4,
  },
]
