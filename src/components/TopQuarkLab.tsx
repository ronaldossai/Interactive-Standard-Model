/**
 * TopQuarkLab.tsx
 *
 * The top quark is the only quark that never hadronizes: it decays
 * (~5e-25s) faster than the strong force can bind it into a hadron
 * (~10^-24s). Bottom and charm quarks are the opposite case — light enough
 * to hadronize first, then living roughly a billion times longer as B/D
 * mesons before they weak-decay.
 */

import { useState, useEffect, useMemo } from 'react'
import { useParticle } from '../context/ParticleContext'
import {
  calculateHadronizationState,
  formatTime,
  formatLambda,
  formatRatio,
  TOP_LIFETIME_S,
  B_MESON_LIFETIME_S,
  D_MESON_LIFETIME_S,
  LAMBDA_QCD_MIN_GEV,
  LAMBDA_QCD_MAX_GEV,
  LAMBDA_QCD_DEFAULT_GEV,
  LAMBDA_PRESETS,
  type LambdaPreset,
} from '../utils/topQuarkPhysics'

const SCALE_MIN_S = 1e-25
const SCALE_MAX_S = 1e-11

const logPercent = (value: number, min: number, max: number): number => {
  const clamped = Math.min(Math.max(value, min), max)
  return ((Math.log10(clamped) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 100
}

const TopQuarkLab = () => {
  const { topQuarkLabOpen, closeTopQuarkLab } = useParticle()

  const [lambdaQcd, setLambdaQcd] = useState(LAMBDA_QCD_DEFAULT_GEV)

  const state = useMemo(() => calculateHadronizationState(lambdaQcd), [lambdaQcd])

  const loadPreset = (preset: LambdaPreset) => {
    setLambdaQcd(preset.lambdaQcdGeV)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && topQuarkLabOpen) {
        closeTopQuarkLab()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [topQuarkLabOpen, closeTopQuarkLab])

  if (!topQuarkLabOpen) return null

  return (
    <div className="top-quark-lab-overlay">
      <div className="top-quark-lab-backdrop" onClick={closeTopQuarkLab} />

      <div className="top-quark-lab-container">
        <div className="top-quark-lab-header">
          <h2>Top Quark Lab — The One That Never Hadronizes</h2>
          <button className="close-button" onClick={closeTopQuarkLab} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="top-quark-lab-content">
          {/* Left Panel: Controls */}
          <div className="top-quark-lab-controls">
            <section className="control-section">
              <h3>QCD Scale (Λ_QCD)</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min={LAMBDA_QCD_MIN_GEV}
                  max={LAMBDA_QCD_MAX_GEV}
                  step="0.005"
                  value={lambdaQcd}
                  onChange={(e) => setLambdaQcd(parseFloat(e.target.value))}
                  className="slider"
                  aria-label="QCD confinement scale"
                  aria-valuetext={formatLambda(lambdaQcd)}
                />
                <div className="slider-value">{formatLambda(lambdaQcd)}</div>
                <div className="slider-hint">
                  Real extractions of Λ_QCD range from about 150-400MeV depending on scheme — drag
                  across the whole range and see if the conclusion below ever changes.
                </div>
              </div>
            </section>

            <section className="control-section">
              <h3>Presets</h3>
              <div className="preset-buttons">
                {LAMBDA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className="preset-button"
                    onClick={() => loadPreset(preset)}
                    title={preset.description}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="control-section pmns-section">
              <h3>Formulas</h3>
              <div className="pmns-params">
                <div className="pmns-param">
                  <span className="param-label">τ_top (measured)</span>
                  <span className="param-value">{formatTime(TOP_LIFETIME_S)}</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">τ_had = ℏ/Λ_QCD</span>
                  <span className="param-value">{formatTime(state.hadronizationTimeS)}</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">τ_had / τ_top</span>
                  <span className="param-value">{formatRatio(state.ratio)}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Panel: Visualization */}
          <div className="top-quark-lab-viz">
            <section className="viz-section">
              <h3>Timescales, Top Quark to Meson (log scale)</h3>
              <div className="detector-scale-visual">
                <div className="detector-scale-line">
                  <span
                    className="detector-scale-marker top-quark-marker"
                    style={{ left: `${logPercent(TOP_LIFETIME_S, SCALE_MIN_S, SCALE_MAX_S)}%` }}
                    title="Top quark lifetime — measured"
                  >
                    <span className="detector-scale-marker-label">
                      Top quark
                      <br />
                      {formatTime(TOP_LIFETIME_S)}
                    </span>
                  </span>
                  <span
                    className="detector-scale-marker hadronization-marker"
                    style={{ left: `${logPercent(state.hadronizationTimeS, SCALE_MIN_S, SCALE_MAX_S)}%` }}
                    title="Hadronization timescale at this Λ_QCD"
                  >
                    <span className="detector-scale-marker-label">
                      Hadronization
                      <br />
                      {formatTime(state.hadronizationTimeS)}
                    </span>
                  </span>
                  <span
                    className="detector-scale-marker d-meson-marker"
                    style={{ left: `${logPercent(D_MESON_LIFETIME_S, SCALE_MIN_S, SCALE_MAX_S)}%` }}
                    title="D0 meson lifetime — measured"
                  >
                    <span className="detector-scale-marker-label">
                      D⁰ meson
                      <br />
                      {formatTime(D_MESON_LIFETIME_S)}
                    </span>
                  </span>
                  <span
                    className="detector-scale-marker b-meson-marker"
                    style={{ left: `${logPercent(B_MESON_LIFETIME_S, SCALE_MIN_S, SCALE_MAX_S)}%` }}
                    title="B meson lifetime — measured"
                  >
                    <span className="detector-scale-marker-label">
                      B meson
                      <br />
                      {formatTime(B_MESON_LIFETIME_S)}
                    </span>
                  </span>
                </div>
                <div className="detector-scale-axis-labels">
                  <span>{formatTime(SCALE_MIN_S)}</span>
                  <span>{formatTime(SCALE_MAX_S)}</span>
                </div>
              </div>
            </section>

            <section className="viz-section">
              <div className={`force-match-badge ${state.topDecaysFirst ? 'match' : 'mismatch'}`}>
                {state.topDecaysFirst
                  ? `✓ The top quark decays ${formatRatio(state.ratio)} faster than hadronization can occur`
                  : '✗ At this Λ_QCD, hadronization would win — outside the physically supported range'}
              </div>
            </section>

            <section className="viz-section educational-content">
              <h3>Too Fast to Hadronize</h3>
              <p>
                Every other quark, once produced, gets bound into a colorless hadron within roughly
                the confinement timescale ℏ/Λ_QCD — a few times 10⁻²⁴ seconds. Bottom and charm
                quarks hadronize into B and D mesons on that timescale, and only then does the
                resulting hadron decay via the weak interaction, roughly a billion times later.
              </p>
              <p>
                <strong>Why it matters:</strong> The top quark is uniquely heavy enough that its
                decay t → Wb produces a real, on-shell W boson (m_top exceeds m_W + m_b, unlike any
                lighter quark) — an unsuppressed two-body channel that finishes in about 5×10⁻²⁵
                seconds. That's faster than hadronization can even begin, so top quarks decay as
                bare quarks, and their spin and other properties pass directly to their decay
                products instead of being scrambled by confinement first.
              </p>
              <div className="educational-highlight">
                <strong>Try this:</strong> Drag Λ_QCD across its entire real quoted range — the top
                quark marker never catches up to the hadronization marker. The conclusion isn't a
                delicate coincidence of exactly which number you pick for Λ_QCD.
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopQuarkLab
