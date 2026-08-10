/**
 * MuonDecayLab.tsx
 *
 * The classic cosmic-ray-muon argument for special relativity: muons
 * produced ~15km up have a mean lifetime of just 2.2μs, and classically
 * almost none should survive the trip to sea level, yet they're detected
 * constantly. Time dilation (ground frame) and length contraction (muon
 * frame) are two descriptions of the same effect, shown side by side, and
 * are checked against each other for consistency.
 */

import { useState, useEffect, useMemo } from 'react'
import { useParticle } from '../context/ParticleContext'
import { formatSpeed, formatGamma, sliderToV, vToSlider } from '../utils/relativisticEM'
import {
  calculateMuonState,
  generateSurvivalCurve,
  formatFraction,
  formatMicroseconds,
  formatDepth,
  MUON_PRESETS,
  H_MIN,
  H_MAX,
  H_DEFAULT,
  type MuonPreset,
} from '../utils/muonDecay'

type Frame = 'ground' | 'muon'

const ATMOSPHERE_PX = 320

const MuonDecayLab = () => {
  const { muonLabOpen, closeMuonLab } = useParticle()

  const [v, setV] = useState(0.999)
  const [h, setH] = useState(H_DEFAULT)
  const [frame, setFrame] = useState<Frame>('ground')

  const state = useMemo(() => calculateMuonState(v, h), [v, h])
  const survivalCurve = useMemo(() => generateSurvivalCurve(v, H_MAX), [v])

  const loadPreset = (preset: MuonPreset) => {
    setV(preset.v)
    setH(preset.h)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && muonLabOpen) {
        closeMuonLab()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [muonLabOpen, closeMuonLab])

  if (!muonLabOpen) return null

  const graphX = (depth: number) => 50 + (depth / H_MAX) * 540
  const graphY = (fraction: number) => 250 - fraction * 200

  const classicalMarkerPx = Math.min((state.meanDecayDepthClassical / h) * ATMOSPHERE_PX, ATMOSPHERE_PX)
  const relativisticMarkerPx = Math.min((state.meanDecayDepthRelativistic / h) * ATMOSPHERE_PX, ATMOSPHERE_PX)
  const classicalReachesGround = state.meanDecayDepthClassical >= h
  const relativisticReachesGround = state.meanDecayDepthRelativistic >= h

  return (
    <div className="muon-lab-overlay">
      <div className="muon-lab-backdrop" onClick={closeMuonLab} />

      <div className="muon-lab-container">
        <div className="muon-lab-header">
          <h2>Muon Decay Lab</h2>
          <button className="close-button" onClick={closeMuonLab} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="muon-lab-content">
          {/* Left Panel: Controls */}
          <div className="muon-lab-controls">
            <section className="control-section">
              <h3>Muon Speed</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={vToSlider(v)}
                  onChange={(e) => setV(sliderToV(parseFloat(e.target.value)))}
                  className="slider"
                  aria-label="Muon speed"
                  aria-valuetext={formatSpeed(v)}
                />
                <div className="slider-value">{formatSpeed(v)}</div>
                <div className="slider-hint">
                  Real cosmic-ray muons typically have γ of 10-40, push the slider toward the
                  right to reach that regime.
                </div>
              </div>
            </section>

            <section className="control-section">
              <h3>Production Altitude</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min={H_MIN}
                  max={H_MAX}
                  step="0.5"
                  value={h}
                  onChange={(e) => setH(parseFloat(e.target.value))}
                  className="slider"
                  aria-label="Production altitude"
                  aria-valuetext={formatDepth(h)}
                />
                <div className="slider-value">{formatDepth(h)}</div>
                <div className="slider-hint">How high up the muon is created, cosmic ray showers peak around 15km</div>
              </div>
            </section>

            <section className="control-section">
              <h3>Reference Frame</h3>
              <div className="antimatter-toggle">
                <span className="toggle-label">Ground Frame</span>
                <button
                  className={`toggle-switch ${frame === 'muon' ? 'active' : ''}`}
                  onClick={() => setFrame((f) => (f === 'ground' ? 'muon' : 'ground'))}
                  aria-label="Toggle reference frame"
                >
                  <span className="toggle-slider" />
                </button>
                <span className="toggle-label">Muon Frame</span>
              </div>
              <div className="slider-hint">
                {frame === 'ground'
                  ? "The atmosphere is its full height here as the muon's own clock runs slow, dilating its lifetime."
                  : "The muon's clock runs at its normal rate here as the atmosphere rushing past it is length-contracted, shrinking the distance it must cross."}
              </div>
            </section>

            <section className="control-section">
              <h3>Presets</h3>
              <div className="preset-buttons">
                {MUON_PRESETS.map((preset) => (
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
                  <span className="param-value">{formatGamma(state.gamma)}</span>
                </div>
                {frame === 'ground' ? (
                  <>
                    <div className="pmns-param">
                      <span className="param-label">τ′ = γτ0 (dilated lifetime)</span>
                      <span className="param-value">{formatMicroseconds(state.dilatedLifetime)}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">t = h/v (ground time)</span>
                      <span className="param-value">{formatMicroseconds(state.groundTime)}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">Survival = e^(−t/τ′)</span>
                      <span className="param-value">{formatFraction(state.survivalFractionRelativisticGroundFrame)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pmns-param">
                      <span className="param-label">h′ = h/γ (contracted height)</span>
                      <span className="param-value">{formatDepth(state.contractedHeight)}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">t′ = h′/v (muon-frame time)</span>
                      <span className="param-value">{formatMicroseconds(state.muonFrameTime)}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">Survival = e^(−t′/τ0)</span>
                      <span className="param-value">{formatFraction(state.survivalFractionRelativisticMuonFrame)}</span>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Right Panel: Visualization */}
          <div className="muon-lab-viz">
            <section className="viz-section">
              <h3>Through the Atmosphere</h3>
              <div className="muon-atmosphere-visual">
                <div className="atmosphere-column" style={{ height: `${ATMOSPHERE_PX}px` }}>
                  <span className="atmosphere-label atmosphere-label-top">Production : {formatDepth(h)}</span>
                  <span
                    className="altitude-marker classical-marker"
                    style={{ top: `${classicalMarkerPx}px` }}
                    title="Mean classical decay point"
                  >
                    <span className="altitude-marker-label">
                      {classicalReachesGround ? 'Classical: reaches ground' : 'Classical mean decay'}
                    </span>
                  </span>
                  <span
                    className="altitude-marker relativistic-marker"
                    style={{ top: `${relativisticMarkerPx}px` }}
                    title="Mean relativistic decay point"
                  >
                    <span className="altitude-marker-label">
                      {relativisticReachesGround ? 'Relativistic: reaches ground' : 'Relativistic mean decay'}
                    </span>
                  </span>
                  <span className="atmosphere-label atmosphere-label-bottom">Ground : 0km</span>
                </div>
              </div>
            </section>

            <section className="viz-section">
              <h3>Survival Fraction vs. Distance Traveled</h3>
              <div className="muon-survival-graph">
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
                  <text x="35" y="54" fontSize="10" fill="#888" textAnchor="end">100%</text>
                  <text x="15" y="150" fontSize="11" fill="#aaa" textAnchor="middle" transform="rotate(-90, 15, 150)">
                    Fraction surviving
                  </text>
                  <text x="320" y="280" fontSize="11" fill="#aaa" textAnchor="middle">
                    Distance traveled (km)
                  </text>

                  <polyline
                    points={survivalCurve
                      .map((p) => `${graphX(p.depth)},${graphY(p.survivalClassical)}`)
                      .join(' ')}
                    fill="none"
                    stroke="#ffeb3b"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                    opacity="0.85"
                  />
                  <polyline
                    points={survivalCurve
                      .map((p) => `${graphX(p.depth)},${graphY(p.survivalRelativistic)}`)
                      .join(' ')}
                    fill="none"
                    stroke="#3498db"
                    strokeWidth="2"
                    opacity="0.85"
                  />

                  <line
                    x1={graphX(h)}
                    y1="50"
                    x2={graphX(h)}
                    y2="250"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.5"
                  />
                </svg>

                <div className="graph-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#ffeb3b' }} />
                    <span className="legend-label">Classical (no relativity)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#3498db' }} />
                    <span className="legend-label">Relativistic (actual)</span>
                  </div>
                </div>
                <p className="graph-note">
                  The dashed white line marks the chosen production altitude : where it crosses each
                  curve is the predicted fraction of muons reaching the ground.
                </p>
              </div>
            </section>

            <section className="viz-section">
              <div className="force-comparison">
                <div className="force-panel">
                  <span className="force-panel-title">Ground Frame : Dilated Lifetime</span>
                  <span className="force-panel-value">
                    {formatFraction(state.survivalFractionRelativisticGroundFrame)}
                  </span>
                  <span className="force-panel-detail">e^(−t/γτ0)</span>
                </div>
                <div className="force-panel">
                  <span className="force-panel-title">Muon Frame : Contracted Height</span>
                  <span className="force-panel-value">
                    {formatFraction(state.survivalFractionRelativisticMuonFrame)}
                  </span>
                  <span className="force-panel-detail">e^(−t′/τ0)</span>
                </div>
              </div>
              <div className={`force-match-badge ${state.survivalMatch ? 'match' : 'mismatch'}`}>
                {state.survivalMatch
                  ? '✓ Consistent: both frames predict the same survival fraction'
                  : '✗ Something is off'}
              </div>
            </section>

            <section className="viz-section educational-content">
              <h3>Why Muons Prove Special Relativity</h3>
              <p>
                Muons are created when cosmic rays slam into the upper atmosphere, roughly 15km up,
                and decay with a mean lifetime of just 2.2μs. Even at nearly the speed of light,
                classical physics says a muon should travel only a few hundred meters before
                decaying, far short of reaching the ground.
              </p>
              <p>
                <strong>Why it matters:</strong> Yet muons are detected at sea level all the time.
                From the ground, the resolution is that the muon's own clock runs slow, so its
                lifetime is dilated to γτ0. From the muon's own point of view, its clock runs
                normally, instead it's the atmosphere that is length-contracted to h/γ, a much
                shorter distance to cross. Both descriptions, worked out independently, predict the
                exact same fraction of muons surviving the trip.
              </p>
              <div className="educational-highlight">
                <strong>Try this:</strong> Load "Classical Regime" and watch almost every muon decay
                before the ground. Then load "Typical Cosmic-Ray Muon" and watch the relativistic
                curve stay high across the whole trip while the classical curve collapses to zero.
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MuonDecayLab
