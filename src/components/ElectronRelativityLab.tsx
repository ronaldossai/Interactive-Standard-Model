/**
 * ElectronRelativityLab.tsx
 *
 * Interactive demonstration that magnetism is what electrostatics looks
 * like from a moving reference frame (the Purcell/Feynman textbook
 * argument, thematically descended from the reasoning Einstein pioneered
 * in his 1905 relativity paper). A current-carrying wire is neutral in
 * the lab frame, but boosting into the drift electrons' rest frame reveals
 * a net charge density — and the resulting electric force, transformed
 * back, exactly reproduces the "magnetic" force computed in the lab frame.
 */

import { useState, useEffect, useMemo } from 'react'
import { useParticle } from '../context/ParticleContext'
import {
  calculateWireState,
  generateFieldCurve,
  formatSpeed,
  formatGamma,
  sliderToV,
  vToSlider,
  RELATIVISTIC_EM_PRESETS,
  type RelativisticEMPreset,
} from '../utils/relativisticEM'

type Frame = 'lab' | 'electron'

const DOT_COUNT = 24
const PX_PER_UNIT = 18
const MIN_GAP_PX = 4
const MAX_GAP_PX = 48

const spacingToPx = (spacing: number): number => {
  const raw = PX_PER_UNIT * Math.sqrt(spacing)
  return Math.min(Math.max(raw, MIN_GAP_PX), MAX_GAP_PX)
}

const formatNumber = (n: number): string => {
  if (n === 0) return '0'
  if (Math.abs(n) < 0.001 || Math.abs(n) > 10000) return n.toExponential(3)
  return n.toFixed(4)
}

const WireRow = ({ spacing, className, label }: { spacing: number; className: string; label: string }) => (
  <div className="wire-row-container">
    <div className="wire-row" style={{ gap: `${spacingToPx(spacing)}px` }}>
      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <span key={i} className={`wire-dot ${className}`} />
      ))}
    </div>
    <span className="wire-row-label">{label}</span>
  </div>
)

const ElectronRelativityLab = () => {
  const { electronLabOpen, closeElectronLab } = useParticle()

  const [v, setV] = useState(0.5)
  const [r, setR] = useState(1.5)
  const [frame, setFrame] = useState<Frame>('lab')

  const wireState = useMemo(() => calculateWireState(v, r), [v, r])
  const fieldCurve = useMemo(() => generateFieldCurve(v, 0.3, 5, 100), [v])

  const loadPreset = (preset: RelativisticEMPreset) => {
    setV(preset.v)
    setR(preset.r)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && electronLabOpen) {
        closeElectronLab()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [electronLabOpen, closeElectronLab])

  if (!electronLabOpen) return null

  const ionSpacing = frame === 'lab' ? wireState.ionSpacingLab : wireState.ionSpacingElectronFrame
  const electronSpacing = frame === 'lab' ? wireState.electronSpacingLab : wireState.electronSpacingElectronFrame
  const netCharge = frame === 'lab' ? wireState.netChargeDensityLab : wireState.netChargeDensityElectronFrame

  const maxB = fieldCurve[0]?.bLab || 1
  const maxE = fieldCurve[0]?.eElectronFrame || 1
  const rMin = 0.3
  const rMax = 5

  return (
    <div className="electron-lab-overlay">
      <div className="electron-lab-backdrop" onClick={closeElectronLab} />

      <div className="electron-lab-container">
        <div className="electron-lab-header">
          <h2>Electron Relativity Lab</h2>
          <button className="close-button" onClick={closeElectronLab} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="electron-lab-content">
          {/* Left Panel: Controls */}
          <div className="electron-lab-controls">
            <section className="control-section">
              <h3>Drift Speed</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={vToSlider(v)}
                  onChange={(e) => setV(sliderToV(parseFloat(e.target.value)))}
                  className="slider"
                  aria-label="Electron drift speed"
                  aria-valuetext={formatSpeed(v)}
                />
                <div className="slider-value">{formatSpeed(v)}</div>
                <div className="slider-hint">
                  Real wires drift at ~mm/s (v/c ≈ 10⁻¹²) — this slider exaggerates v by many
                  orders of magnitude so the effect is visible.
                </div>
              </div>
            </section>

            <section className="control-section">
              <h3>Distance from Wire</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min="0.3"
                  max="5"
                  step="0.05"
                  value={r}
                  onChange={(e) => setR(parseFloat(e.target.value))}
                  className="slider"
                  aria-label="Distance from wire"
                  aria-valuetext={`${r.toFixed(2)} units`}
                />
                <div className="slider-value">{r.toFixed(2)} units</div>
                <div className="slider-hint">Where the test charge sits, in arbitrary units</div>
              </div>
            </section>

            <section className="control-section">
              <h3>Reference Frame</h3>
              <div className="antimatter-toggle">
                <span className="toggle-label">Lab Frame</span>
                <button
                  className={`toggle-switch ${frame === 'electron' ? 'active' : ''}`}
                  onClick={() => setFrame((f) => (f === 'lab' ? 'electron' : 'lab'))}
                  aria-label="Toggle reference frame"
                >
                  <span className="toggle-slider" />
                </button>
                <span className="toggle-label">Electron Frame</span>
              </div>
              <div className="slider-hint">
                {frame === 'lab'
                  ? 'The wire is neutral here — the test charge (moving with the electrons) feels a magnetic force.'
                  : "The test charge is at rest here — it feels a purely electric force from the wire's now-visible net charge."}
              </div>
            </section>

            <section className="control-section">
              <h3>Presets</h3>
              <div className="preset-buttons">
                {RELATIVISTIC_EM_PRESETS.map((preset) => (
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
                  <span className="param-label">γ = 1/√(1−v²)</span>
                  <span className="param-value">{formatGamma(wireState.gamma)}</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">ρ′ = γv² (electron frame)</span>
                  <span className="param-value">{formatNumber(wireState.netChargeDensityElectronFrame)}</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">F_lab = qvB</span>
                  <span className="param-value">{formatNumber(wireState.forceLabMagnetic)}</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">F′_rest/γ</span>
                  <span className="param-value">{formatNumber(wireState.forceLabPredictedFromElectronFrame)}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Panel: Visualization */}
          <div className="electron-lab-viz">
            <section className="viz-section">
              <h3>The Wire — {frame === 'lab' ? 'Lab Frame' : "Electron's Rest Frame"}</h3>
              <div className="wire-visual">
                <WireRow spacing={ionSpacing} className="ion-dot" label="Positive ions" />
                <WireRow spacing={electronSpacing} className="electron-dot" label="Conduction electrons" />
              </div>
              <div className="net-charge-readout">
                <span className="param-label">Net linear charge density</span>
                <span className={`param-value ${netCharge > 1e-9 ? 'charged' : ''}`}>
                  {formatNumber(netCharge)} {netCharge > 1e-9 ? '(wire appears charged!)' : '(neutral)'}
                </span>
              </div>
            </section>

            <section className="viz-section">
              <h3>Force Comparison</h3>
              <div className="force-comparison">
                <div className="force-panel">
                  <span className="force-panel-title">Lab Frame — Magnetic Force</span>
                  <span className="force-panel-value">{formatNumber(wireState.forceLabMagnetic)}</span>
                  <span className="force-panel-detail">F = qvB(r)</span>
                </div>
                <div className="force-panel">
                  <span className="force-panel-title">Electron Frame — Electric Force</span>
                  <span className="force-panel-value">{formatNumber(wireState.forceElectronFrameElectric)}</span>
                  <span className="force-panel-detail">F′ = qE′(r)</span>
                </div>
              </div>
              <div className={`force-match-badge ${wireState.forcesMatch ? 'match' : 'mismatch'}`}>
                {wireState.forcesMatch
                  ? '✓ Consistent — F_lab equals F′_rest / γ'
                  : '✗ Something is off'}
              </div>
            </section>

            <section className="viz-section">
              <h3>Field Strength vs. Distance</h3>
              <div className="electron-field-graph">
                <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
                  <g className="grid">
                    {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                      <line
                        key={y}
                        x1="50"
                        y1={250 - y * 200}
                        x2="590"
                        y2={250 - y * 200}
                        stroke="#333"
                        strokeWidth="0.5"
                        opacity="0.5"
                      />
                    ))}
                  </g>

                  <line x1="50" y1="250" x2="590" y2="250" stroke="#666" strokeWidth="1.5" />
                  <line x1="50" y1="50" x2="50" y2="250" stroke="#666" strokeWidth="1.5" />

                  <text x="35" y="254" fontSize="10" fill="#888" textAnchor="end">0</text>
                  <text x="35" y="54" fontSize="10" fill="#888" textAnchor="end">max</text>
                  <text x="15" y="150" fontSize="11" fill="#aaa" textAnchor="middle" transform="rotate(-90, 15, 150)">
                    Field (normalized to peak)
                  </text>
                  <text x="320" y="280" fontSize="11" fill="#aaa" textAnchor="middle">
                    Distance from wire, r
                  </text>

                  <polyline
                    points={fieldCurve
                      .map((p) => `${50 + ((p.r - rMin) / (rMax - rMin)) * 540},${250 - (p.bLab / maxB) * 200}`)
                      .join(' ')}
                    fill="none"
                    stroke="#3498db"
                    strokeWidth="2"
                    opacity="0.85"
                  />
                  <polyline
                    points={fieldCurve
                      .map(
                        (p) =>
                          `${50 + ((p.r - rMin) / (rMax - rMin)) * 540},${250 - (p.eElectronFrame / maxE) * 200}`
                      )
                      .join(' ')}
                    fill="none"
                    stroke="#e74c3c"
                    strokeWidth="2"
                    opacity="0.85"
                  />

                  <line
                    x1={50 + ((r - rMin) / (rMax - rMin)) * 540}
                    y1="50"
                    x2={50 + ((r - rMin) / (rMax - rMin)) * 540}
                    y2="250"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.5"
                  />
                </svg>

                <div className="graph-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#3498db' }} />
                    <span className="legend-label">B (Lab Frame)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#e74c3c' }} />
                    <span className="legend-label">E′ (Electron Frame)</span>
                  </div>
                </div>
                <p className="graph-note">
                  Each curve is normalized to its own peak to compare the 1/r falloff shape — see
                  Force Comparison above for how their actual magnitudes relate.
                </p>
              </div>
            </section>

            <section className="viz-section educational-content">
              <h3>Why Magnetism Is Relativistic</h3>
              <p>
                A current-carrying wire has equal numbers of positive ions and drifting electrons,
                so it's electrically neutral — no electric field, no electric force on a nearby
                charge. But "equal density" is a frame-dependent statement: length contraction
                affects the ions and the drifting electrons differently, because they're moving at
                different speeds in any given frame.
              </p>
              <p>
                <strong>Why it matters:</strong> Boost into the electrons' own rest frame and the
                ion spacing contracts while the electron spacing relaxes — the wire is no longer
                neutral. What looked like a magnetic force in the lab frame is, in this frame,
                simply the electric force from a charged wire. This is a direct descendant of the
                reasoning Einstein pioneered in his 1905 relativity paper (following the textbook
                treatment popularized by Purcell and Feynman): electricity and magnetism are one
                phenomenon, split into two only because we insist on a single reference frame.
              </p>
              <div className="educational-highlight">
                <strong>Try this:</strong> Load "Near Light Speed," then flip the Reference Frame
                toggle — watch the ion row bunch up, the electron row spread out, and the "Net
                linear charge density" readout jump from zero to positive, while the Force
                Comparison panel stays exactly consistent the whole time.
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ElectronRelativityLab
