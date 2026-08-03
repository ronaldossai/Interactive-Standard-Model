/**
 * GluonConfinementLab.tsx
 *
 * Two faces of the gluon's self-interaction, in two switchable sections:
 * (1) the Cornell potential — why quarks can never be pulled apart, the
 * "string" between them snapping into two new mesons instead of stretching
 * forever; (2) the one-loop running coupling — asymptotic freedom, the
 * coupling getting weaker at short distance, the opposite of how electric
 * charge screening works. Both are two views of the same running coupling.
 */

import { useState, useEffect, useMemo } from 'react'
import { useParticle } from '../context/ParticleContext'
import {
  calculateCornellState,
  generateCornellCurve,
  cornellPotential,
  CORNELL_PRESETS,
  ALPHA_S_MIN,
  ALPHA_S_MAX,
  SIGMA_MIN,
  SIGMA_MAX,
  MESON_MASS_MIN,
  MESON_MASS_MAX,
  R_MAX_SLIDER,
  betaCoefficient,
  runningCoupling,
  computeLandauPoleQ,
  generateRunningCouplingCurve,
  generateQEDIllustrativeCurve,
  sliderToQ,
  qToSlider,
  formatDistance,
  formatEnergy,
  formatAlpha,
  formatQ,
  Q0,
  ALPHA_S_AT_Q0,
  Q_SLIDER_MIN,
  Q_SLIDER_MAX,
  NF_OPTIONS,
  type CornellPreset,
} from '../utils/gluonQCD'

type Section = 'confinement' | 'asymptotic-freedom'

const RUN_GRAPH_Y_MAX = 2

const formatNumber = (n: number): string => {
  if (n === 0) return '0'
  if (Math.abs(n) < 0.001 || Math.abs(n) > 10000) return n.toExponential(3)
  return n.toFixed(4)
}

const GluonConfinementLab = () => {
  const { gluonLabOpen, closeGluonLab } = useParticle()

  const [section, setSection] = useState<Section>('confinement')

  // Section 1: confinement
  const [alphaS, setAlphaS] = useState(0.3)
  const [sigma, setSigma] = useState(1.0)
  const [mMeson, setMMeson] = useState(0.5)
  const [r, setR] = useState(1)

  // Section 2: asymptotic freedom
  const [nf, setNf] = useState(5)
  const [q, setQ] = useState(1)

  const cornellState = useMemo(() => calculateCornellState(alphaS, sigma, mMeson), [alphaS, sigma, mMeson])
  const cornellCurve = useMemo(
    () => generateCornellCurve(alphaS, sigma, mMeson, R_MAX_SLIDER),
    [alphaS, sigma, mMeson]
  )

  const b0 = useMemo(() => betaCoefficient(nf), [nf])
  const runningCurve = useMemo(() => generateRunningCouplingCurve(nf), [nf])
  const qedCurve = useMemo(() => generateQEDIllustrativeCurve(), [])
  const landauPoleQ = useMemo(() => computeLandauPoleQ(b0, Q0, ALPHA_S_AT_Q0), [b0])
  const currentAlphaS = useMemo(() => runningCoupling(q, Q0, ALPHA_S_AT_Q0, b0), [q, b0])

  const loadPreset = (preset: CornellPreset) => {
    setAlphaS(preset.alphaS)
    setSigma(preset.sigma)
    setMMeson(preset.mMeson)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gluonLabOpen) {
        closeGluonLab()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gluonLabOpen, closeGluonLab])

  if (!gluonLabOpen) return null

  const isBroken = r >= cornellState.rBreak

  // Potential graph scaling
  const vValues = cornellCurve.map((p) => p.v)
  const vMin = Math.min(...vValues)
  const vMax = Math.max(...vValues)
  const vRange = vMax - vMin || 1
  const potGraphX = (rv: number) => 50 + (rv / R_MAX_SLIDER) * 540
  const potGraphY = (v: number) => 250 - ((v - vMin) / vRange) * 200

  // Running coupling graph scaling (log-x)
  const logMin = Math.log10(Q_SLIDER_MIN)
  const logMax = Math.log10(Q_SLIDER_MAX)
  const runGraphX = (qv: number) => 50 + ((Math.log10(qv) - logMin) / (logMax - logMin)) * 540
  const runGraphY = (a: number) => {
    const y = 250 - (a / RUN_GRAPH_Y_MAX) * 200
    return Math.max(50, Math.min(250, y))
  }

  // Flux tube visual: gap in px scales with r, clamped to a sane range
  const fluxGapPx = Math.min(r * 50, 400)
  const currentV = isBroken ? cornellState.ePlateau : cornellPotential(r, alphaS, sigma)

  return (
    <div className="gluon-lab-overlay">
      <div className="gluon-lab-backdrop" onClick={closeGluonLab} />

      <div className="gluon-lab-container">
        <div className="gluon-lab-header">
          <h2>Gluon Confinement Lab</h2>
          <button className="close-button" onClick={closeGluonLab} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="gluon-lab-tabs">
          <button
            className={`gluon-lab-tab ${section === 'confinement' ? 'active' : ''}`}
            onClick={() => setSection('confinement')}
          >
            Confinement
          </button>
          <button
            className={`gluon-lab-tab ${section === 'asymptotic-freedom' ? 'active' : ''}`}
            onClick={() => setSection('asymptotic-freedom')}
          >
            Asymptotic Freedom
          </button>
        </div>

        <div className="gluon-lab-content">
          {section === 'confinement' ? (
            <>
              {/* Left Panel: Controls */}
              <div className="gluon-lab-controls">
                <section className="control-section">
                  <h3>Separation Distance</h3>
                  <div className="slider-control">
                    <input
                      type="range"
                      min="0.05"
                      max={R_MAX_SLIDER}
                      step="0.02"
                      value={r}
                      onChange={(e) => setR(parseFloat(e.target.value))}
                      className="slider"
                      aria-label="Quark-antiquark separation"
                      aria-valuetext={formatDistance(r)}
                    />
                    <div className="slider-value">{formatDistance(r)}</div>
                    <div className="slider-hint">How far apart you're pulling the quark and antiquark</div>
                  </div>
                </section>

                <section className="control-section">
                  <h3>Potential Parameters</h3>
                  <div className="slider-control">
                    <input
                      type="range"
                      min={ALPHA_S_MIN}
                      max={ALPHA_S_MAX}
                      step="0.01"
                      value={alphaS}
                      onChange={(e) => setAlphaS(parseFloat(e.target.value))}
                      className="slider"
                      aria-label="Short-distance coupling"
                      aria-valuetext={alphaS.toFixed(2)}
                    />
                    <div className="slider-value">αs = {alphaS.toFixed(2)}</div>
                    <div className="slider-hint">Short-distance (Coulomb-like) coupling strength</div>
                  </div>
                  <div className="slider-control">
                    <input
                      type="range"
                      min={SIGMA_MIN}
                      max={SIGMA_MAX}
                      step="0.01"
                      value={sigma}
                      onChange={(e) => setSigma(parseFloat(e.target.value))}
                      className="slider"
                      aria-label="String tension"
                      aria-valuetext={sigma.toFixed(2)}
                    />
                    <div className="slider-value">σ = {sigma.toFixed(2)}</div>
                    <div className="slider-hint">String tension — how fast the potential rises with distance</div>
                  </div>
                  <div className="slider-control">
                    <input
                      type="range"
                      min={MESON_MASS_MIN}
                      max={MESON_MASS_MAX}
                      step="0.01"
                      value={mMeson}
                      onChange={(e) => setMMeson(parseFloat(e.target.value))}
                      className="slider"
                      aria-label="New meson mass"
                      aria-valuetext={mMeson.toFixed(2)}
                    />
                    <div className="slider-value">m_meson = {mMeson.toFixed(2)}</div>
                    <div className="slider-hint">Rest mass of each new meson formed when the string snaps</div>
                  </div>
                </section>

                <section className="control-section">
                  <h3>Presets</h3>
                  <div className="preset-buttons">
                    {CORNELL_PRESETS.map((preset) => (
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
                      <span className="param-label">V(r) = −(4/3)(αs/r) + σr</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">E_plateau = 2·m_meson</span>
                      <span className="param-value">{formatNumber(cornellState.ePlateau)}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">r_break</span>
                      <span className="param-value">{formatNumber(cornellState.rBreak)}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Panel: Visualization */}
              <div className="gluon-lab-viz">
                <section className="viz-section">
                  <h3>Flux Tube</h3>
                  <div className="flux-tube-visual">
                    {!isBroken ? (
                      <div className="flux-tube-pair" style={{ gap: `${fluxGapPx}px` }}>
                        <span className="quark-dot quark" title="Quark" />
                        <span className="flux-tube-line" />
                        <span className="quark-dot antiquark" title="Antiquark" />
                      </div>
                    ) : (
                      <div className="flux-tube-broken">
                        <div className="flux-tube-pair small-gap">
                          <span className="quark-dot quark" title="Original quark" />
                          <span className="flux-tube-line short" />
                          <span className="quark-dot antiquark" title="New antiquark" />
                        </div>
                        <div className="flux-tube-pair small-gap">
                          <span className="quark-dot quark" title="New quark" />
                          <span className="flux-tube-line short" />
                          <span className="quark-dot antiquark" title="Original antiquark" />
                        </div>
                      </div>
                    )}
                  </div>
                  {isBroken && (
                    <div className="higgs-status-badge broken">
                      The string snapped, hence a new quark-antiquark pair formed two separate mesons!
                    </div>
                  )}
                </section>

                <section className="viz-section">
                  <h3>Confining Potential</h3>
                  <div className="gluon-potential-graph">
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
                        Separation, r
                      </text>
                      <text x="15" y="150" fontSize="11" fill="#aaa" textAnchor="middle" transform="rotate(-90, 15, 150)">
                        V(r)
                      </text>

                      <polyline
                        points={cornellCurve.map((p) => `${potGraphX(p.r)},${potGraphY(p.v)}`).join(' ')}
                        fill="none"
                        stroke="#f44336"
                        strokeWidth="2"
                        opacity="0.85"
                      />

                      <line
                        x1={potGraphX(cornellState.rBreak)}
                        y1="50"
                        x2={potGraphX(cornellState.rBreak)}
                        y2="250"
                        stroke="#f44336"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                        opacity="0.5"
                      />

                      <circle
                        cx={potGraphX(r)}
                        cy={potGraphY(currentV)}
                        r="6"
                        fill="#3498db"
                        stroke="#fff"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <p className="graph-note">
                      Real lattice QCD shows this as a smooth crossover: this plot shows a
                      simplified sharp transition for clarity.
                    </p>
                  </div>
                </section>

                <section className="viz-section educational-content">
                  <h3>Why Quarks Are Never Alone</h3>
                  <p>
                    Unlike the photon, the gluon carries color charge itself. Gluons attract each
                    other, collimating the force field between a quark and antiquark into a narrow
                    "flux tube" instead of spreading out like an electric field. That's the linear
                    σr term: pulling the quarks apart costs a constant amount of extra energy per
                    unit distance, forever (or so it seems).
                  </p>
                  <p>
                    <strong>Why it matters:</strong> Past some separation, it's cheaper for the
                    vacuum to produce a new quark-antiquark pair than to keep stretching the tube.
                    The string snaps, and you're left with two separate, color-neutral mesons which implies that there can
                    never be a lone, isolated quark. This is confinement: the reason free quarks have
                    never been observed.
                  </p>
                  <div className="educational-highlight">
                    <strong>Try this:</strong> Load "Light New Quark" and slowly increase the
                    separation. You will notice the string snap much sooner than with "Heavy New Quark."
                  </div>
                </section>
              </div>
            </>
          ) : (
            <>
              {/* Left Panel: Controls */}
              <div className="gluon-lab-controls">
                <section className="control-section">
                  <h3>Energy Scale</h3>
                  <div className="slider-control">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.001"
                      value={qToSlider(q)}
                      onChange={(e) => setQ(sliderToQ(parseFloat(e.target.value)))}
                      className="slider"
                      aria-label="Energy scale Q"
                      aria-valuetext={formatQ(q)}
                    />
                    <div className="slider-value">Q = {formatQ(q)}</div>
                    <div className="slider-hint">Higher Q = shorter distance / higher-energy collision</div>
                  </div>
                </section>

                <section className="control-section">
                  <h3>Active Quark Flavors</h3>
                  <div className="preset-buttons">
                    {NF_OPTIONS.map((option) => (
                      <button
                        key={option}
                        className={`preset-button ${nf === option ? 'active' : ''}`}
                        onClick={() => setNf(option)}
                      >
                        nf = {option}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="control-section pmns-section">
                  <h3>Formulas</h3>
                  <div className="pmns-params">
                    <div className="pmns-param">
                      <span className="param-label">b0 = 11 − (2/3)nf</span>
                      <span className="param-value">{b0.toFixed(3)}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">C_F (color factor)</span>
                      <span className="param-value">1.333</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">αs(Q)</span>
                      <span className="param-value">{formatAlpha(currentAlphaS)}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">Q_pole (breakdown scale)</span>
                      <span className="param-value">{formatQ(landauPoleQ)}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Panel: Visualization */}
              <div className="gluon-lab-viz">
                <section className="viz-section">
                  <h3>Running Coupling</h3>
                  <div className="gluon-running-graph">
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
                        Energy scale, Q (log)
                      </text>
                      <text x="15" y="150" fontSize="11" fill="#aaa" textAnchor="middle" transform="rotate(-90, 15, 150)">
                        Coupling strength
                      </text>

                      <polyline
                        points={runningCurve.map((p) => `${runGraphX(p.Q)},${runGraphY(p.alphaS)}`).join(' ')}
                        fill="none"
                        stroke="#f44336"
                        strokeWidth="2"
                        opacity="0.85"
                      />
                      <polyline
                        points={qedCurve.map((p) => `${runGraphX(p.Q)},${runGraphY(p.alphaEm)}`).join(' ')}
                        fill="none"
                        stroke="#ffeb3b"
                        strokeWidth="2"
                        strokeDasharray="5 3"
                        opacity="0.7"
                      />

                      {landauPoleQ >= Q_SLIDER_MIN && (
                        <line
                          x1={runGraphX(Math.max(landauPoleQ, Q_SLIDER_MIN))}
                          y1="50"
                          x2={runGraphX(Math.max(landauPoleQ, Q_SLIDER_MIN))}
                          y2="250"
                          stroke="#f44336"
                          strokeWidth="1"
                          strokeDasharray="4 2"
                          opacity="0.5"
                        />
                      )}

                      <line
                        x1={runGraphX(q)}
                        y1="50"
                        x2={runGraphX(q)}
                        y2="250"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        opacity="0.5"
                      />
                    </svg>
                    <div className="graph-legend">
                      <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#f44336' }} />
                        <span className="legend-label">αs (QCD: gluon self-interaction)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#ffeb3b' }} />
                        <span className="legend-label">αem (illustrative QED contrast)</span>
                      </div>
                    </div>
                    <p className="graph-note">
                      Not calibrated to real GeV/ΛQCD values. This is a clean one-loop illustration of the
                      shape and direction of running, in arbitrary units.
                    </p>
                  </div>
                </section>

                <section className="viz-section educational-content">
                  <h3>Asymptotic Freedom</h3>
                  <p>
                    Because gluons carry color charge and interact with each other, adding more
                    gluon screening around a color charge actually makes the effective coupling
                    weaker at short distance. This is the opposite of how virtual electron-positron pairs
                    screen an electric charge in QED, where the effective coupling grows at short
                    distance. This is why b0 = 11 − (2/3)nf comes out positive: the gluon
                    self-interaction term (11, from the gauge group itself) wins over the
                    quark-screening term (2nf/3) for any realistic number of flavors.
                  </p>
                  <p>
                    <strong>Why it matters:</strong> At high energy (small Q here), quarks and
                    gluons behave almost like free particles and it is this that lets physicists at
                    particle colliders treat them perturbatively at all. At low energy (large
                    distance), the same coupling grows large. This is actually the same confinement you
                    just explored in the other section, viewed from the opposite end.
                  </p>
                  <div className="educational-highlight">
                    <strong>Try this:</strong> Drag Q down toward the marked breakdown scale and
                    watch αs shoot up. What is happening is; that scale is this toy model's stand-in for the
                    confinement scale from the other tab.
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default GluonConfinementLab
