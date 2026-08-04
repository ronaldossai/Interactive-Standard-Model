/**
 * TauDecayLab.tsx
 *
 * The flip side of the Muon Decay Lab's cosmic-ray argument: the tau's
 * proper lifetime is 7,600x shorter than the muon's, so even a highly
 * boosted tau decays after only microns to millimeters instead of
 * kilometers. That's why taus are never detected directly at colliders —
 * experiments reconstruct a displaced secondary vertex from the decay
 * products instead (see the Decay panel for tau's actual channels).
 */

import { useState, useEffect, useMemo } from 'react'
import { useParticle } from '../context/ParticleContext'
import { formatGamma, formatSpeed } from '../utils/relativisticEM'
import {
  calculateTauState,
  generateDecayLengthCurve,
  formatEnergy,
  formatDecayLength,
  formatRatio,
  sliderToEnergy,
  energyToSlider,
  TAU_PRESETS,
  TAU_TAU0_PS,
  C_MM_PER_PS,
  VERTEX_RESOLUTION_MM,
  FIRST_LAYER_MM,
  E_MIN,
  E_MAX,
  type TauPreset,
} from '../utils/tauDecay'

const SCALE_MIN_MM = 0.001
const SCALE_MAX_MM = 100
const GRAPH_Y_MIN_MM = 0.01
const GRAPH_Y_MAX_MM = 20

const logPercent = (mm: number, min: number, max: number): number => {
  const clamped = Math.min(Math.max(mm, min), max)
  return ((Math.log10(clamped) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 100
}

const TauDecayLab = () => {
  const { tauLabOpen, closeTauLab } = useParticle()

  const [energy, setEnergy] = useState(45)

  const state = useMemo(() => calculateTauState(energy), [energy])
  const decayLengthCurve = useMemo(() => generateDecayLengthCurve(), [])
  const properDecayLengthMm = TAU_TAU0_PS * C_MM_PER_PS

  const loadPreset = (preset: TauPreset) => {
    setEnergy(preset.energy)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && tauLabOpen) {
        closeTauLab()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tauLabOpen, closeTauLab])

  if (!tauLabOpen) return null

  const graphX = (e: number) => 50 + (logPercent(e, E_MIN, E_MAX) / 100) * 540
  const graphY = (mm: number) => 250 - (logPercent(mm, GRAPH_Y_MIN_MM, GRAPH_Y_MAX_MM) / 100) * 200

  return (
    <div className="tau-lab-overlay">
      <div className="tau-lab-backdrop" onClick={closeTauLab} />

      <div className="tau-lab-container">
        <div className="tau-lab-header">
          <h2>Tau Decay Length Lab</h2>
          <button className="close-button" onClick={closeTauLab} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="tau-lab-content">
          {/* Left Panel: Controls */}
          <div className="tau-lab-controls">
            <section className="control-section">
              <h3>Tau Energy</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={energyToSlider(energy)}
                  onChange={(e) => setEnergy(sliderToEnergy(parseFloat(e.target.value)))}
                  className="slider"
                  aria-label="Tau energy"
                  aria-valuetext={formatEnergy(energy)}
                />
                <div className="slider-value">{formatEnergy(energy)}</div>
                <div className="slider-hint">
                  Collider-produced taus typically range from a few GeV to hundreds of GeV
                </div>
              </div>
            </section>

            <section className="control-section">
              <h3>Presets</h3>
              <div className="preset-buttons">
                {TAU_PRESETS.map((preset) => (
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
                  <span className="param-label">γ = E/m_τ</span>
                  <span className="param-value">{formatGamma(state.gamma)}</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">β = √(1−1/γ²)</span>
                  <span className="param-value">{formatSpeed(state.beta)}</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">cτ0 (proper decay length)</span>
                  <span className="param-value">{formatDecayLength(properDecayLengthMm)}</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">L = γβ·cτ0 (lab frame)</span>
                  <span className="param-value">{formatDecayLength(state.tauDecayLengthMm)}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Panel: Visualization */}
          <div className="tau-lab-viz">
            <section className="viz-section">
              <h3>Distance From the Collision Point</h3>
              <div className="detector-scale-visual">
                <div className="detector-scale-line">
                  <span
                    className="detector-scale-marker vertex-marker"
                    style={{ left: `${logPercent(VERTEX_RESOLUTION_MM, SCALE_MIN_MM, SCALE_MAX_MM)}%` }}
                    title="Typical silicon vertex-detector resolution"
                  >
                    <span className="detector-scale-marker-label">
                      Vertex resolution
                      <br />
                      {formatDecayLength(VERTEX_RESOLUTION_MM)}
                    </span>
                  </span>
                  <span
                    className="detector-scale-marker tau-marker"
                    style={{ left: `${logPercent(state.tauDecayLengthMm, SCALE_MIN_MM, SCALE_MAX_MM)}%` }}
                    title="Mean tau decay length at this energy"
                  >
                    <span className="detector-scale-marker-label">
                      Tau decay length
                      <br />
                      {formatDecayLength(state.tauDecayLengthMm)}
                    </span>
                  </span>
                  <span
                    className="detector-scale-marker layer-marker"
                    style={{ left: `${logPercent(FIRST_LAYER_MM, SCALE_MIN_MM, SCALE_MAX_MM)}%` }}
                    title="Illustrative first tracking-layer radius"
                  >
                    <span className="detector-scale-marker-label">
                      First tracking layer
                      <br />
                      {formatDecayLength(FIRST_LAYER_MM)}
                    </span>
                  </span>
                </div>
                <div className="detector-scale-axis-labels">
                  <span>Collision point</span>
                  <span>{formatDecayLength(SCALE_MAX_MM)}</span>
                </div>
              </div>
            </section>

            <section className="viz-section">
              <h3>Decay Length vs. Energy</h3>
              <div className="tau-decay-graph">
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

                  <text x="35" y="254" fontSize="10" fill="#888" textAnchor="end">{formatDecayLength(GRAPH_Y_MIN_MM)}</text>
                  <text x="35" y="54" fontSize="10" fill="#888" textAnchor="end">{formatDecayLength(GRAPH_Y_MAX_MM)}</text>
                  <text x="15" y="150" fontSize="11" fill="#aaa" textAnchor="middle" transform="rotate(-90, 15, 150)">
                    Tau decay length (log)
                  </text>
                  <text x="320" y="280" fontSize="11" fill="#aaa" textAnchor="middle">
                    Tau energy, GeV (log)
                  </text>

                  <line
                    x1="50"
                    y1={graphY(VERTEX_RESOLUTION_MM)}
                    x2="590"
                    y2={graphY(VERTEX_RESOLUTION_MM)}
                    stroke="#e74c3c"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  />
                  <text x="580" y={graphY(VERTEX_RESOLUTION_MM) - 6} fontSize="9" fill="#e74c3c" textAnchor="end">
                    vertex resolution
                  </text>

                  <polyline
                    points={decayLengthCurve.map((p) => `${graphX(p.energy)},${graphY(p.tauDecayLengthMm)}`).join(' ')}
                    fill="none"
                    stroke="#5f2d27"
                    strokeWidth="2.5"
                    opacity="0.9"
                  />

                  <line
                    x1={graphX(energy)}
                    y1="50"
                    x2={graphX(energy)}
                    y2="250"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.5"
                  />
                  <circle
                    cx={graphX(energy)}
                    cy={graphY(state.tauDecayLengthMm)}
                    r="6"
                    fill="#5f2d27"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                </svg>
                <p className="graph-note">Both axes are log-scaled — the tau's decay length spans two orders of magnitude across this energy range.</p>
              </div>
            </section>

            <section className="viz-section">
              <div className="force-comparison">
                <div className="force-panel">
                  <span className="force-panel-title">Tau — Flight Distance</span>
                  <span className="force-panel-value">{formatDecayLength(state.tauDecayLengthMm)}</span>
                  <span className="force-panel-detail">L = γβ·cτ0(τ)</span>
                </div>
                <div className="force-panel">
                  <span className="force-panel-title">Muon — Flight Distance (same γ)</span>
                  <span className="force-panel-value">{formatDecayLength(state.muonDecayLengthMm)}</span>
                  <span className="force-panel-detail">L = γβ·cτ0(μ)</span>
                </div>
              </div>
              <div className="force-match-badge match">
                The muon travels {formatRatio(state.ratio)} farther than the tau at the same γ
              </div>
            </section>

            <section className="viz-section educational-content">
              <h3>Why Taus Need Vertex Detectors</h3>
              <p>
                Like the muon, a moving tau's own clock runs slow, and its lifetime is dilated by
                the same factor γ. But the tau's proper lifetime is only 2.9×10⁻¹³s, about 7,600
                times shorter than the muon's 2.2μs. Time dilation still applies exactly the same
                way, it just isn't enough to help: even a 200 GeV collider tau, with γ over 100,
                travels only about a centimeter before decaying.
              </p>
              <p>
                <strong>Why it matters:</strong> A muon produced in a collision can cross an entire
                detector before decaying, so it is picked up directly by the outer muon chambers.
                A tau decays almost immediately, essentially at the collision point on any
                human-relatable scale, so it's never seen directly. Instead, physicists reconstruct
                a "secondary vertex", a decay point measurably offset from the collision point, using
                high-precision silicon trackers, combined with the pattern of decay products shown
                in the Decay panel above.
              </p>
              <div className="educational-highlight">
                <strong>Try this:</strong> Load "Near Rest Mass" and watch the tau marker sit right
                on top of the vertex-resolution line, then load "High-Energy Collider Tau" and watch
                it move out past the first tracking layer, while the muon's distance (same γ) is
                always measured in kilometers.
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TauDecayLab
