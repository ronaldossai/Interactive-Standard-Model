/**
 * ParityViolationLab.tsx
 *
 * The Wu experiment (1957): polarized cobalt-60 emits beta-decay electrons
 * asymmetrically relative to nuclear spin, proving the weak interaction is
 * not mirror-symmetric. The polar plot shows the real angular distribution
 * next to its parity-mirrored counterpart — the visual gap between the two
 * lobes is the violation itself.
 */

import { useState, useEffect, useMemo } from 'react'
import { useParticle } from '../context/ParticleContext'
import { formatSpeed, sliderToV, vToSlider } from '../utils/relativisticEM'
import {
  calculateAngularState,
  generateAngularDistribution,
  formatPolarization,
  formatW,
  PARITY_PRESETS,
  type ParityPreset,
} from '../utils/parityViolation'

const CENTER = 200
const BASE_RADIUS = 20
const RADIUS_SCALE = 70
const MATCH_EPSILON = 1e-3

const ParityViolationLab = () => {
  const { parityLabOpen, closeParityLab } = useParticle()

  const [polarization, setPolarization] = useState(0.6)
  const [beta, setBeta] = useState(0.6)

  const angularState = useMemo(() => calculateAngularState(polarization, beta), [polarization, beta])
  const distribution = useMemo(() => generateAngularDistribution(polarization, beta), [polarization, beta])

  const loadPreset = (preset: ParityPreset) => {
    setPolarization(preset.polarization)
    setBeta(preset.beta)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && parityLabOpen) {
        closeParityLab()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [parityLabOpen, closeParityLab])

  if (!parityLabOpen) return null

  const radiusOf = (w: number) => BASE_RADIUS + w * RADIUS_SCALE
  const xOf = (angleDeg: number, w: number) => CENTER + radiusOf(w) * Math.sin((angleDeg * Math.PI) / 180)
  const yOf = (angleDeg: number, w: number) => CENTER - radiusOf(w) * Math.cos((angleDeg * Math.PI) / 180)

  const separation = Math.abs(polarization * beta)
  const curvesCoincide = separation < MATCH_EPSILON

  return (
    <div className="parity-lab-overlay">
      <div className="parity-lab-backdrop" onClick={closeParityLab} />

      <div className="parity-lab-container">
        <div className="parity-lab-header">
          <h2>Parity Violation Lab</h2>
          <button className="close-button" onClick={closeParityLab} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="parity-lab-content">
          {/* Left Panel: Controls */}
          <div className="parity-lab-controls">
            <section className="control-section">
              <h3>Nuclear Polarization</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={polarization}
                  onChange={(e) => setPolarization(parseFloat(e.target.value))}
                  className="slider"
                  aria-label="Nuclear polarization"
                  aria-valuetext={formatPolarization(polarization)}
                />
                <div className="slider-value">{formatPolarization(polarization)}</div>
                <div className="slider-hint">How well-aligned the Co-60 nuclear spins are , higher polarization needs a colder sample</div>
              </div>
            </section>

            <section className="control-section">
              <h3>Electron Speed</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={vToSlider(beta)}
                  onChange={(e) => setBeta(sliderToV(parseFloat(e.target.value)))}
                  className="slider"
                  aria-label="Electron speed"
                  aria-valuetext={formatSpeed(beta)}
                />
                <div className="slider-value">{formatSpeed(beta)}</div>
                <div className="slider-hint">Beta-decay electrons are mildly to strongly relativistic depending on their energy</div>
              </div>
            </section>

            <section className="control-section">
              <h3>Presets</h3>
              <div className="preset-buttons">
                {PARITY_PRESETS.map((preset) => (
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
                  <span className="param-label">A (asymmetry parameter)</span>
                  <span className="param-value">−1 (Co-60, fixed)</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">W(0°) : along spin</span>
                  <span className="param-value">{formatW(angularState.wAligned)}</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">W(180°) : opposite spin</span>
                  <span className="param-value">{formatW(angularState.wOpposed)}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Panel: Visualization */}
          <div className="parity-lab-viz">
            <section className="viz-section">
              <h3>Angular Distribution : Real vs. Mirror Image</h3>
              <div className="parity-polar-graph">
                <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={radiusOf(1)}
                    fill="none"
                    stroke="#666"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.5"
                  />
                  <line x1={CENTER} y1="20" x2={CENTER} y2="380" stroke="#444" strokeWidth="1" opacity="0.4" />
                  <text x={CENTER} y="14" fontSize="11" fill="#aaa" textAnchor="middle">↑ Spin direction</text>
                  <text x={CENTER} y="394" fontSize="11" fill="#aaa" textAnchor="middle">↓ Opposite spin</text>

                  <polyline
                    points={distribution.map((p) => `${xOf(p.angleDeg, p.wMirror)},${yOf(p.angleDeg, p.wMirror)}`).join(' ')}
                    fill="none"
                    stroke="#e74c3c"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    opacity="0.85"
                  />
                  <polyline
                    points={distribution.map((p) => `${xOf(p.angleDeg, p.w)},${yOf(p.angleDeg, p.w)}`).join(' ')}
                    fill="none"
                    stroke="#2196f3"
                    strokeWidth="2.5"
                    opacity="0.95"
                  />
                </svg>
                <div className="graph-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#2196f3' }} />
                    <span className="legend-label">Real distribution (as observed)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#e74c3c' }} />
                    <span className="legend-label">Mirror image (parity-flipped)</span>
                  </div>
                </div>
                <p className="graph-note">The dashed grey circle marks W = 1 : the isotropic pattern a parity-conserving process would produce.</p>
              </div>
            </section>

            <section className="viz-section">
              <div className={`force-match-badge ${curvesCoincide ? 'match' : 'mismatch'}`}>
                {curvesCoincide
                  ? '✓ No polarization or no electron speed, the real and mirror patterns coincide (parity-conserving edge case)'
                  : '✗ The real and mirror patterns differ, this is parity violation, made visible'}
              </div>
            </section>

            <section className="viz-section educational-content">
              <h3>Nature Doesn't Match Its Mirror Image</h3>
              <p>
                Before 1956, physicists assumed every interaction was symmetric under parity ; that
                a mirror-image version of any process would be equally valid physics. Theorists T.D.
                Lee and C.N. Yang pointed out that this had never actually been tested for the weak
                interaction, and proposed cobalt-60 beta decay as a clean test.
              </p>
              <p>
                <strong>Why it matters:</strong> Chien-Shiung Wu's 1957 experiment cooled polarized
                Co-60 nuclei to a fraction of a degree above absolute zero and counted decay
                electrons along versus against the nuclear spin. They came out lopsided — mostly
                opposite the spin direction. Momentum flips under a mirror reflection but spin
                doesn't, so a truly parity-symmetric process would show the same pattern either way.
                It didn't, settling the question immediately and reshaping how physicists thought
                about the weak force ever since.
              </p>
              <div className="educational-highlight">
                <strong>Try this:</strong> Drag Polarization down to 0 and watch the two lobes snap
                into a single perfect circle ; with no aligned spins, there's no axis left to measure
                a handed effect against, so parity violation becomes invisible even though the
                underlying physics hasn't changed.
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParityViolationLab
