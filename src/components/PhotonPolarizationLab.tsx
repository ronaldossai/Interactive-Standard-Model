/**
 * PhotonPolarizationLab.tsx
 *
 * Interactive Malus's Law polarization simulator. Demonstrates the
 * "polarization paradox": two crossed polarizers block all light, but
 * inserting a third polarizer at 45° between them lets light back through,
 * because each polarizer projects onto a new axis rather than just
 * attenuating what came before.
 */

import { useState, useEffect, useMemo } from 'react'
import { useParticle } from '../context/ParticleContext'
import {
  calculateTransmissionChain,
  MALUS_CURVE,
  POLARIZATION_PRESETS,
  I0,
  type PolarizationPreset,
} from '../utils/polarization'

const PolarizerDisk = ({ angle, dimmed }: { angle: number; dimmed?: boolean }) => (
  <svg viewBox="0 0 50 50" className={`polarizer-disk ${dimmed ? 'dimmed' : ''}`}>
    <circle cx="25" cy="25" r="22" fill="none" stroke="currentColor" strokeWidth="2" />
    <line
      x1="25"
      y1="6"
      x2="25"
      y2="44"
      stroke="currentColor"
      strokeWidth="2.5"
      transform={`rotate(${angle}, 25, 25)`}
    />
  </svg>
)

const PhotonPolarizationLab = () => {
  const { photonLabOpen, closePhotonLab } = useParticle()

  const [angleB, setAngleB] = useState(45)
  const [bEnabled, setBEnabled] = useState(false)
  const [angleC, setAngleC] = useState(90)

  const chain = useMemo(
    () => calculateTransmissionChain(angleB, bEnabled, angleC),
    [angleB, bEnabled, angleC]
  )

  const loadPreset = (preset: PolarizationPreset) => {
    setAngleB(preset.angleB)
    setBEnabled(preset.bEnabled)
    setAngleC(preset.angleC)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && photonLabOpen) {
        closePhotonLab()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [photonLabOpen, closePhotonLab])

  if (!photonLabOpen) return null

  const [stageA, stageB, stageC] = chain
  const overallPercent = (stageC.intensityOut / I0) * 100

  return (
    <div className="photon-lab-overlay">
      <div className="photon-lab-backdrop" onClick={closePhotonLab} />

      <div className="photon-lab-container">
        <div className="photon-lab-header">
          <h2>Photon Polarization Lab</h2>
          <button className="close-button" onClick={closePhotonLab} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="photon-lab-content">
          {/* Left Panel: Controls */}
          <div className="photon-lab-controls">
            <section className="control-section">
              <h3>Polarizer B (Optional)</h3>
              <label className="polarizer-toggle">
                <input
                  type="checkbox"
                  checked={bEnabled}
                  onChange={(e) => setBEnabled(e.target.checked)}
                />
                <span>Insert middle polarizer</span>
              </label>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="1"
                  value={angleB}
                  disabled={!bEnabled}
                  onChange={(e) => setAngleB(parseFloat(e.target.value))}
                  className="slider"
                  aria-label="Polarizer B axis angle"
                  aria-valuetext={`${angleB}°`}
                />
                <div className="slider-value">{angleB.toFixed(0)}°</div>
                <div className="slider-hint">Axis angle, relative to Polarizer A</div>
              </div>
            </section>

            <section className="control-section">
              <h3>Polarizer C (Analyzer)</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="1"
                  value={angleC}
                  onChange={(e) => setAngleC(parseFloat(e.target.value))}
                  className="slider"
                  aria-label="Polarizer C axis angle"
                  aria-valuetext={`${angleC}°`}
                />
                <div className="slider-value">{angleC.toFixed(0)}°</div>
                <div className="slider-hint">Axis angle, relative to Polarizer A</div>
              </div>
            </section>

            <section className="control-section">
              <h3>Presets</h3>
              <div className="preset-buttons">
                {POLARIZATION_PRESETS.map((preset) => (
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
              <h3>Malus's Law</h3>
              <div className="pmns-params">
                <div className="pmns-param">
                  <span className="param-label">I = I₀ × cos²(Δθ)</span>
                </div>
                {stageB.enabled && (
                  <div className="pmns-param">
                    <span className="param-label">Δθ (A→B)</span>
                    <span className="param-value">{stageB.relativeAngle?.toFixed(0)}°</span>
                  </div>
                )}
                <div className="pmns-param">
                  <span className="param-label">Δθ (→C)</span>
                  <span className="param-value">{stageC.relativeAngle?.toFixed(0)}°</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">Overall transmission</span>
                  <span className="param-value">{overallPercent.toFixed(1)}%</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Panel: Visualization */}
          <div className="photon-lab-viz">
            <section className="viz-section">
              <h3>Light Path</h3>
              <div className="light-path">
                <div className="light-source" title="Unpolarized source" />

                <PolarizerDisk angle={stageA.angle} />
                <div
                  className="beam-segment"
                  style={{ opacity: stageA.intensityOut / I0 }}
                >
                  <span className="beam-percent">{((stageA.intensityOut / I0) * 100).toFixed(0)}%</span>
                </div>

                <PolarizerDisk angle={stageB.angle} dimmed={!stageB.enabled} />
                <div
                  className="beam-segment"
                  style={{ opacity: stageB.intensityOut / I0 }}
                >
                  <span className="beam-percent">{((stageB.intensityOut / I0) * 100).toFixed(0)}%</span>
                </div>

                <PolarizerDisk angle={stageC.angle} />
                <div
                  className="beam-segment"
                  style={{ opacity: stageC.intensityOut / I0 }}
                >
                  <span className="beam-percent">{overallPercent.toFixed(0)}%</span>
                </div>

                <div className="light-detector" title="Detector" />
              </div>
            </section>

            <section className="viz-section">
              <h3>Malus's Law Curve</h3>
              <div className="malus-graph">
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
                  <text x="35" y="154" fontSize="10" fill="#888" textAnchor="end">0.5</text>
                  <text x="35" y="54" fontSize="10" fill="#888" textAnchor="end">1.0</text>
                  <text x="15" y="150" fontSize="11" fill="#aaa" textAnchor="middle" transform="rotate(-90, 15, 150)">
                    Transmittance
                  </text>
                  <text x="320" y="280" fontSize="11" fill="#aaa" textAnchor="middle">
                    Relative angle Δθ (degrees)
                  </text>

                  <polyline
                    points={MALUS_CURVE.map((p) => `${50 + (p.angle / 180) * 540},${250 - p.transmittance * 200}`).join(' ')}
                    fill="none"
                    stroke="#ffeb3b"
                    strokeWidth="2"
                    opacity="0.85"
                  />

                  {stageB.enabled && stageB.relativeAngle !== null && (
                    <line
                      x1={50 + (Math.abs(stageB.relativeAngle) / 180) * 540}
                      y1="50"
                      x2={50 + (Math.abs(stageB.relativeAngle) / 180) * 540}
                      y2="250"
                      stroke="#e74c3c"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      opacity="0.7"
                    />
                  )}
                  <line
                    x1={50 + (Math.abs(stageC.relativeAngle ?? 0) / 180) * 540}
                    y1="50"
                    x2={50 + (Math.abs(stageC.relativeAngle ?? 0) / 180) * 540}
                    y2="250"
                    stroke="#3498db"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.7"
                  />
                </svg>

                <div className="graph-legend">
                  {stageB.enabled && (
                    <div className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: '#e74c3c' }} />
                      <span className="legend-label">A → B</span>
                    </div>
                  )}
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#3498db' }} />
                    <span className="legend-label">→ C (Analyzer)</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="viz-section educational-content">
              <h3>About Malus's Law</h3>
              <p>
                Light passing through a polarizer is projected onto that polarizer's axis. For
                unpolarized light, the result is always 50% transmission, whatever the axis. Once
                light is polarized, a second polarizer at angle Δθ transmits only{' '}
                <strong>I = I₀ × cos²(Δθ)</strong> of it. This essentially means that it is a full transmission when aligned, but zero
                when crossed at 90°.
              </p>
              <p>
                <strong>Why it matters:</strong> Each polarizer doesn't just block light, it actually also
                resets the reference axis for whatever comes next. That's why a "crossed" pair
                (0° and 90°) blocks everything, but sliding a third polarizer in at 45° between
                them projects the light onto a new axis twice, letting some through both times.
              </p>
              <div className="educational-highlight">
                <strong>Try this:</strong> Load the "Crossed (Blocked)" preset, then check "Insert
                middle polarizer" what you will notice is that light reappears even though the outer two polarizers never
                moved.
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotonPolarizationLab
