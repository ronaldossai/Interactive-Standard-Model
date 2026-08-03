/**
 * HiggsMechanismLab.tsx
 *
 * A 2D toy model of spontaneous symmetry breaking. Drag a point around a
 * scalar field's potential landscape: moving radially costs energy (the
 * massive "Higgs boson"), moving angularly around the flat valley costs
 * nothing (the massless "Goldstone boson"). The companion "Gauged
 * Symmetry" toggle explains, qualitatively, how the W and Z bosons eat
 * that flat direction and become massive — alongside the real, measured
 * W/Z masses as a fixed reference (not derived from this toy model).
 */

import { useState, useEffect, useMemo } from 'react'
import { useParticle } from '../context/ParticleContext'
import {
  calculateHiggsState,
  generatePotentialCurve,
  potentialV,
  fieldSpacePoint,
  HIGGS_PRESETS,
  WZ_REFERENCE,
  formatMu2,
  formatMass,
  RHO_SLIDER_MAX,
  MU2_MIN,
  MU2_MAX,
  type HiggsPreset,
} from '../utils/higgsMechanism'

const DISC_SIZE = 300
const DISC_CENTER = DISC_SIZE / 2
const PX_PER_UNIT = (DISC_CENTER - 20) / RHO_SLIDER_MAX

const formatNumber = (n: number): string => {
  if (n === 0) return '0'
  if (Math.abs(n) < 0.001 || Math.abs(n) > 10000) return n.toExponential(3)
  return n.toFixed(4)
}

const HiggsMechanismLab = () => {
  const { higgsLabOpen, closeHiggsLab } = useParticle()

  const [mu2, setMu2] = useState(1)
  const [lambda, setLambda] = useState(0.5)
  const [rho, setRho] = useState(0)
  const [theta, setTheta] = useState(0)
  const [gauged, setGauged] = useState(false)

  const higgsState = useMemo(() => calculateHiggsState(mu2, lambda), [mu2, lambda])
  const curve = useMemo(() => generatePotentialCurve(mu2, lambda), [mu2, lambda])

  const loadPreset = (preset: HiggsPreset) => {
    setMu2(preset.mu2)
    setLambda(preset.lambda)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && higgsLabOpen) {
        closeHiggsLab()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [higgsLabOpen, closeHiggsLab])

  if (!higgsLabOpen) return null

  const thetaRad = (theta * Math.PI) / 180
  const point = fieldSpacePoint(rho, thetaRad)
  const pointPx = { x: DISC_CENTER + point.x * PX_PER_UNIT, y: DISC_CENTER - point.y * PX_PER_UNIT }
  const vacuumRadiusPx = higgsState.rho0 * PX_PER_UNIT

  const vValues = curve.map((p) => p.v)
  const vMin = Math.min(...vValues)
  const vMax = Math.max(...vValues)
  const vRange = vMax - vMin || 1
  const graphX = (r: number) => 50 + (r / RHO_SLIDER_MAX) * 540
  const graphY = (v: number) => 250 - ((v - vMin) / vRange) * 200
  const currentV = potentialV(rho, mu2, lambda)

  return (
    <div className="higgs-lab-overlay">
      <div className="higgs-lab-backdrop" onClick={closeHiggsLab} />

      <div className="higgs-lab-container">
        <div className="higgs-lab-header">
          <h2>Higgs Mechanism Lab</h2>
          <button className="close-button" onClick={closeHiggsLab} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="higgs-lab-content">
          {/* Left Panel: Controls */}
          <div className="higgs-lab-controls">
            <section className="control-section">
              <h3>Potential Shape</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min={MU2_MIN}
                  max={MU2_MAX}
                  step="0.01"
                  value={mu2}
                  onChange={(e) => setMu2(parseFloat(e.target.value))}
                  className="slider"
                  aria-label="Mu squared"
                  aria-valuetext={formatMu2(mu2)}
                />
                <div className="slider-value">μ² = {formatMu2(mu2)}</div>
                <div className="slider-hint">Negative μ² breaks the symmetry</div>
              </div>
              <div className="slider-control">
                <input
                  type="range"
                  min="0.2"
                  max="2"
                  step="0.01"
                  value={lambda}
                  onChange={(e) => setLambda(parseFloat(e.target.value))}
                  className="slider"
                  aria-label="Lambda self-coupling"
                  aria-valuetext={lambda.toFixed(2)}
                />
                <div className="slider-value">λ = {lambda.toFixed(2)}</div>
                <div className="slider-hint">Steepness of the potential</div>
              </div>
              <div className={`higgs-status-badge ${higgsState.isBroken ? 'broken' : 'unbroken'}`}>
                {higgsState.isBroken ? 'Broken — sombrero' : 'Unbroken — symmetric bowl'}
              </div>
            </section>

            <section className="control-section">
              <h3>Field Position</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max={RHO_SLIDER_MAX}
                  step="0.01"
                  value={rho}
                  onChange={(e) => setRho(parseFloat(e.target.value))}
                  className="slider"
                  aria-label="Radial field displacement"
                  aria-valuetext={rho.toFixed(2)}
                />
                <div className="slider-value">ρ = {rho.toFixed(2)}</div>
                <div className="slider-hint">Radial displacement — the "Higgs" direction</div>
              </div>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={theta}
                  onChange={(e) => setTheta(parseFloat(e.target.value))}
                  className="slider"
                  aria-label="Angular field position"
                  aria-valuetext={`${theta}°`}
                />
                <div className="slider-value">θ = {theta.toFixed(0)}°</div>
                <div className="slider-hint">Angular position — the flat "Goldstone" direction</div>
              </div>
            </section>

            <section className="control-section">
              <h3>W/Z Mass Generation</h3>
              <div className="antimatter-toggle">
                <span className="toggle-label">Global Symmetry</span>
                <button
                  className={`toggle-switch ${gauged ? 'active' : ''}`}
                  onClick={() => setGauged((g) => !g)}
                  aria-label="Toggle gauged symmetry"
                >
                  <span className="toggle-slider" />
                </button>
                <span className="toggle-label">Gauged Symmetry</span>
              </div>
              <div className="slider-hint">
                {gauged
                  ? 'The flat direction is eaten by the gauge field — it becomes the W/Z boson\'s longitudinal polarization, giving it mass.'
                  : 'In this global-symmetry toy model, the flat direction is a free, massless Goldstone boson.'}
              </div>
            </section>

            <section className="control-section">
              <h3>Presets</h3>
              <div className="preset-buttons">
                {HIGGS_PRESETS.map((preset) => (
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
                  <span className="param-label">V(ρ) = μ²ρ² + λρ⁴</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">ρ₀ = √(−μ²/2λ)</span>
                  <span className="param-value">{formatNumber(higgsState.rho0)}</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">m²(radial)</span>
                  <span className="param-value">{formatNumber(higgsState.radialMassSquared)}</span>
                </div>
                {gauged && (
                  <>
                    <div className="pmns-param">
                      <span className="param-label">cos θ_W = m_W/m_Z</span>
                      <span className="param-value">{WZ_REFERENCE.cosThetaW.toFixed(4)}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">θ_W</span>
                      <span className="param-value">{WZ_REFERENCE.thetaWDeg.toFixed(2)}°</span>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Right Panel: Visualization */}
          <div className="higgs-lab-viz">
            <section className="viz-section">
              <h3>Field Space (2D)</h3>
              <div className="higgs-field-space">
                <svg viewBox={`0 0 ${DISC_SIZE} ${DISC_SIZE}`} className="higgs-field-space-svg">
                  {[0.5, 1, 1.5, 2, 2.5].map((ring) => (
                    <circle
                      key={ring}
                      cx={DISC_CENTER}
                      cy={DISC_CENTER}
                      r={ring * PX_PER_UNIT}
                      fill="none"
                      stroke="#333"
                      strokeWidth="0.5"
                      opacity="0.4"
                    />
                  ))}

                  {higgsState.isBroken && (
                    <circle
                      cx={DISC_CENTER}
                      cy={DISC_CENTER}
                      r={vacuumRadiusPx}
                      fill="none"
                      stroke="#ffeb3b"
                      strokeWidth="2"
                      strokeDasharray="6 3"
                      opacity="0.8"
                      className="higgs-vacuum-ring"
                    />
                  )}

                  <line
                    x1={DISC_CENTER}
                    y1={DISC_CENTER}
                    x2={pointPx.x}
                    y2={pointPx.y}
                    stroke="#3498db"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />

                  <circle cx={DISC_CENTER} cy={DISC_CENTER} r="3" fill="#666" />

                  <circle
                    cx={pointPx.x}
                    cy={pointPx.y}
                    r="7"
                    fill={gauged ? '#9b59b6' : '#e74c3c'}
                    stroke="#fff"
                    strokeWidth="1.5"
                    className="higgs-field-point"
                  />
                </svg>
                <div className="higgs-field-space-legend">
                  <span>Radial (ρ) → {formatMass(higgsState.radialMass)} — massive, Higgs boson</span>
                  <span>
                    Angular (θ) → {gauged ? 'eaten by W/Z — becomes longitudinal mass' : '0 — massless, Goldstone boson'}
                  </span>
                </div>
              </div>
            </section>

            {gauged && (
              <section className="viz-section">
                <div className="higgs-wz-reference">
                  <div className="higgs-wz-reference-note">Measured value — not derived from the sliders above</div>
                  <div className="higgs-wz-reference-row">
                    <span>m_W</span>
                    <span>{WZ_REFERENCE.mW} GeV/c²</span>
                  </div>
                  <div className="higgs-wz-reference-row">
                    <span>m_Z</span>
                    <span>{WZ_REFERENCE.mZ} GeV/c²</span>
                  </div>
                  <div className="higgs-wz-reference-row">
                    <span>cos θ_W</span>
                    <span>{WZ_REFERENCE.cosThetaW.toFixed(4)}</span>
                  </div>
                </div>
              </section>
            )}

            <section className="viz-section">
              <h3>Potential Cross-Section</h3>
              <div className="higgs-potential-graph">
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

                  <text x="320" y="280" fontSize="11" fill="#aaa" textAnchor="middle">
                    Radial displacement, ρ
                  </text>
                  <text x="15" y="150" fontSize="11" fill="#aaa" textAnchor="middle" transform="rotate(-90, 15, 150)">
                    V(ρ)
                  </text>

                  <polyline
                    points={curve.map((p) => `${graphX(p.rho)},${graphY(p.v)}`).join(' ')}
                    fill="none"
                    stroke="#ffeb3b"
                    strokeWidth="2"
                    opacity="0.85"
                  />

                  {higgsState.isBroken && (
                    <line
                      x1={graphX(higgsState.rho0)}
                      y1="50"
                      x2={graphX(higgsState.rho0)}
                      y2="250"
                      stroke="#ffeb3b"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                      opacity="0.5"
                    />
                  )}

                  <circle cx={graphX(rho)} cy={graphY(currentV)} r="6" fill="#e74c3c" stroke="#fff" strokeWidth="1.5" />
                </svg>
              </div>
            </section>

            <section className="viz-section educational-content">
              <h3>Spontaneous Symmetry Breaking</h3>
              <p>
                This is a toy model ( a single complex scalar field, a genuine 2D field space ) of
                the same mechanism behind the real Higgs field. When μ² is negative, the origin
                becomes an unstable hilltop and the field settles somewhere on a circular valley of
                equally-good minima. Which point on that circle it picks is arbitrary, funnily enough that's the
                "spontaneous" part.
              </p>
              <p>
                <strong>Why it matters:</strong> Displacing the field radially (up the wall) costs
                real energy which corresponds to a real, massive excitation, the Higgs boson. Displacing it angularly
                (around the flat valley) costs nothing at all, since the potential doesn't care
                which point on the circle you're at. In this simple global-symmetry model, that
                flat direction is a genuine massless particle (a Goldstone boson). Once you gauge
                the symmetry (which is coupling this field to the W and Z bosons, as the real electroweak
                theory does) that flat direction has nowhere left to go as an independent particle:
                it's absorbed as the longitudinal polarization of the gauge bosons, and that's
                literally why the W and Z are heavy while the photon, whose symmetry stays
                unbroken, remains massless.
              </p>
              <div className="educational-highlight">
                <strong>Try this:</strong> Drag μ² from positive to negative and watch the vacuum
                ring appear; then flip on "Gauged Symmetry" and see the angular direction's fate
                change from "free massless particle" to "eaten, becomes mass."
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HiggsMechanismLab
