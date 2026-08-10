/**
 * GravitonLab.tsx
 *
 * The graviton has never been observed — nothing here simulates detecting
 * one. Instead, two real, checkable facts about why that is:
 * (1) gravity is 10^36-10^42x weaker than electromagnetism between real
 * particle pairs, at every distance, since both forces fall off as 1/r^2;
 * (2) a real LIGO detection implies an astronomical number of gravitons
 * (E = Nhf, same math as counting photons in a laser pulse) — a classical
 * gravitational wave is a coherent state of gravitons, which is why LIGO
 * can detect the wave even though a single graviton stays undetectable.
 */

import { useState, useEffect, useMemo } from 'react'
import { useParticle } from '../context/ParticleContext'
import {
  calculateForcePairState,
  generateForceCurve,
  calculateGravitonBurstState,
  sliderToDistance,
  distanceToSlider,
  sliderToEnergy,
  energyToSlider,
  sliderToFrequency,
  frequencyToSlider,
  formatForce,
  formatRatio,
  formatGravitonCount,
  formatDistance,
  formatEnergySolarMasses,
  formatFrequency,
  formatScientific,
  PARTICLE_PAIRS,
  GW_PRESETS,
  R_MIN,
  R_MAX,
  R_DEFAULT,
  type GWPreset,
} from '../utils/gravitonPhysics'

type Section = 'hierarchy' | 'wave'

const GRAPH_Y_MIN = 1e-72
const GRAPH_Y_MAX = 1e3

const logPercent = (value: number, min: number, max: number): number => {
  const clamped = Math.min(Math.max(value, min), max)
  return ((Math.log10(clamped) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 100
}

const GravitonLab = () => {
  const { gravitonLabOpen, closeGravitonLab } = useParticle()

  const [section, setSection] = useState<Section>('hierarchy')

  // Section 1: force hierarchy
  const [pairId, setPairId] = useState(PARTICLE_PAIRS[0].id)
  const [r, setR] = useState(R_DEFAULT)

  // Section 2: graviton wave
  const [energy, setEnergy] = useState(3)
  const [frequency, setFrequency] = useState(250)

  const forceState = useMemo(() => calculateForcePairState(pairId, r), [pairId, r])
  const forceCurve = useMemo(() => generateForceCurve(pairId), [pairId])
  const burstState = useMemo(() => calculateGravitonBurstState(energy, frequency), [energy, frequency])

  const loadGWPreset = (preset: GWPreset) => {
    setEnergy(preset.energySolarMasses)
    setFrequency(preset.frequencyHz)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gravitonLabOpen) {
        closeGravitonLab()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gravitonLabOpen, closeGravitonLab])

  if (!gravitonLabOpen) return null

  const graphX = (rv: number) => 50 + (logPercent(rv, R_MIN, R_MAX) / 100) * 540
  const graphY = (force: number) => 250 - (logPercent(force, GRAPH_Y_MIN, GRAPH_Y_MAX) / 100) * 200

  return (
    <div className="graviton-lab-overlay">
      <div className="graviton-lab-backdrop" onClick={closeGravitonLab} />

      <div className="graviton-lab-container">
        <div className="graviton-lab-header">
          <h2>Graviton Lab : Why It Can't Be Caught</h2>
          <button className="close-button" onClick={closeGravitonLab} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="graviton-lab-tabs">
          <button
            className={`graviton-lab-tab ${section === 'hierarchy' ? 'active' : ''}`}
            onClick={() => setSection('hierarchy')}
          >
            Force Hierarchy
          </button>
          <button
            className={`graviton-lab-tab ${section === 'wave' ? 'active' : ''}`}
            onClick={() => setSection('wave')}
          >
            A Wave of Gravitons
          </button>
        </div>

        <div className="graviton-lab-content">
          {section === 'hierarchy' ? (
            <>
              {/* Left Panel: Controls */}
              <div className="graviton-lab-controls">
                <section className="control-section">
                  <h3>Particle Pair</h3>
                  <div className="preset-buttons">
                    {PARTICLE_PAIRS.map((pair) => (
                      <button
                        key={pair.id}
                        className={`preset-button ${pairId === pair.id ? 'active' : ''}`}
                        onClick={() => setPairId(pair.id)}
                        title={pair.description}
                      >
                        {pair.name}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="control-section">
                  <h3>Separation Distance</h3>
                  <div className="slider-control">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.001"
                      value={distanceToSlider(r)}
                      onChange={(e) => setR(sliderToDistance(parseFloat(e.target.value)))}
                      className="slider"
                      aria-label="Separation distance"
                      aria-valuetext={formatDistance(r)}
                    />
                    <div className="slider-value">{formatDistance(r)}</div>
                    <div className="slider-hint">
                      Both forces scale as 1/r² : try moving this and watch the ratio below stay
                      exactly the same.
                    </div>
                  </div>
                </section>

                <section className="control-section pmns-section">
                  <h3>Formulas</h3>
                  <div className="pmns-params">
                    <div className="pmns-param">
                      <span className="param-label">F_grav = Gm₁m₂/r²</span>
                      <span className="param-value">{formatForce(forceState.forceGrav)}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">F_em = kq₁q₂/r²</span>
                      <span className="param-value">{formatForce(forceState.forceEm)}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">F_em / F_grav</span>
                      <span className="param-value">{formatRatio(forceState.ratioEmOverGrav)}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Panel: Visualization */}
              <div className="graviton-lab-viz">
                <section className="viz-section">
                  <h3>Force vs. Distance (log-log)</h3>
                  <div className="graviton-force-graph">
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
                        Separation, r (log scale)
                      </text>
                      <text x="15" y="150" fontSize="11" fill="#aaa" textAnchor="middle" transform="rotate(-90, 15, 150)">
                        Force, N (log scale)
                      </text>

                      <polyline
                        points={forceCurve.map((p) => `${graphX(p.r)},${graphY(p.forceEm)}`).join(' ')}
                        fill="none"
                        stroke="#3498db"
                        strokeWidth="2"
                        opacity="0.85"
                      />
                      <polyline
                        points={forceCurve.map((p) => `${graphX(p.r)},${graphY(p.forceGrav)}`).join(' ')}
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="2"
                        opacity="0.85"
                      />

                      <line
                        x1={graphX(r)}
                        y1="50"
                        x2={graphX(r)}
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
                        <span className="legend-label">Electromagnetic force</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#34d399' }} />
                        <span className="legend-label">Gravitational force</span>
                      </div>
                    </div>
                    <p className="graph-note">
                      The two lines run perfectly parallel : the vertical gap between them (the
                      ratio) never changes, at any distance.
                    </p>
                  </div>
                </section>

                <section className="viz-section">
                  <div className="force-match-badge match">
                    Electromagnetism is {formatRatio(forceState.ratioEmOverGrav)} stronger than
                    gravity for this pair , at any distance
                  </div>
                </section>

                <section className="viz-section educational-content">
                  <h3>Gravity Is Absurdly Weak</h3>
                  <p>
                    Newton's law of gravitation and Coulomb's law both fall off as 1/r², so their
                    ratio is fixed by the masses and charges involved alone; distance cancels out
                    completely. For two protons, electromagnetism wins by a factor of roughly
                    10³⁶. If the graviton exists as the quantized carrier of gravity, it couples to
                    mass this feebly everywhere, not just up close or far away.
                  </p>
                  <p>
                    <strong>Why it matters:</strong> Every other force in the Standard Model has a
                    Lab in this app because it's strong enough to visibly shape matter at particle
                    scales. Gravity's coupling is so many orders of magnitude weaker that no
                    tabletop or particle-collider experiment could ever isolate its quantum
                    behavior , that's the real reason a graviton has never been observed.
                  </p>
                  <div className="educational-highlight">
                    <strong>Try this:</strong> Switch to "Two Electrons" and watch the ratio jump
                    to ~10⁴², since the electron's mass is nearly 2,000x smaller than the proton's
                    , a lighter particle feels even less gravity relative to its charge.
                  </div>
                </section>
              </div>
            </>
          ) : (
            <>
              {/* Left Panel: Controls */}
              <div className="graviton-lab-controls">
                <section className="control-section">
                  <h3>Wave Energy</h3>
                  <div className="slider-control">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.001"
                      value={energyToSlider(energy)}
                      onChange={(e) => setEnergy(sliderToEnergy(parseFloat(e.target.value)))}
                      className="slider"
                      aria-label="Gravitational wave energy"
                      aria-valuetext={formatEnergySolarMasses(energy)}
                    />
                    <div className="slider-value">{formatEnergySolarMasses(energy)} c²</div>
                    <div className="slider-hint">Total energy radiated as gravitational waves during the event</div>
                  </div>
                </section>

                <section className="control-section">
                  <h3>Peak Frequency</h3>
                  <div className="slider-control">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.001"
                      value={frequencyToSlider(frequency)}
                      onChange={(e) => setFrequency(sliderToFrequency(parseFloat(e.target.value)))}
                      className="slider"
                      aria-label="Gravitational wave frequency"
                      aria-valuetext={formatFrequency(frequency)}
                    />
                    <div className="slider-value">{formatFrequency(frequency)}</div>
                    <div className="slider-hint">LIGO is sensitive from roughly 10Hz to a few kHz</div>
                  </div>
                </section>

                <section className="control-section">
                  <h3>Presets</h3>
                  <div className="preset-buttons">
                    {GW_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        className="preset-button"
                        onClick={() => loadGWPreset(preset)}
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
                      <span className="param-label">E_wave = Mc²</span>
                      <span className="param-value">{formatScientific(burstState.energyJoules, 'J')}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">E_graviton = hf</span>
                      <span className="param-value">{formatScientific(burstState.gravitonEnergyJoules, 'J')}</span>
                    </div>
                    <div className="pmns-param">
                      <span className="param-label">N = E_wave / E_graviton</span>
                      <span className="param-value">{formatGravitonCount(burstState.numGravitons)}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Panel: Visualization */}
              <div className="graviton-lab-viz">
                <section className="viz-section">
                  <h3>Gravitons in This Wave</h3>
                  <div className="graviton-count-readout">{formatGravitonCount(burstState.numGravitons)}</div>
                  <p className="graph-note">
                    Exactly the same math as counting photons in a laser pulse: N = E / hf.
                  </p>
                </section>

                <section className="viz-section">
                  <div className="force-comparison">
                    <div className="force-panel">
                      <span className="force-panel-title">Single Graviton : Energy</span>
                      <span className="force-panel-value">
                        {formatScientific(burstState.gravitonEnergyJoules, 'J')}
                      </span>
                      <span className="force-panel-detail">hf</span>
                    </div>
                    <div className="force-panel">
                      <span className="force-panel-title">Total Wave : Energy</span>
                      <span className="force-panel-value">
                        {formatScientific(burstState.energyJoules, 'J')}
                      </span>
                      <span className="force-panel-detail">Mc²</span>
                    </div>
                  </div>
                </section>

                <section className="viz-section educational-content">
                  <h3>Detectable as a Wave, Not as a Particle</h3>
                  <p>
                    LIGO doesn't detect individual gravitons any more than your eye detects
                    individual photons from a light bulb. A classical gravitational wave is a
                    coherent state made of an astronomical number of gravitons, all in step, and
                    it's that coherence that produces a strain large enough to physically stretch
                    LIGO's mirrors by a fraction of a proton's width.
                  </p>
                  <p>
                    <strong>Why it matters:</strong> A single graviton would carry a genuinely tiny
                    amount of energy, and separating that from ambient noise is a different problem
                    entirely than detecting a wave. Physicist Freeman Dyson has argued that a
                    detector sensitive enough to register one graviton at a time would need to be so
                    massive and so cold that it would collapse into a black hole under its own
                    gravity, before it ever recorded a single event.
                  </p>
                  <div className="educational-highlight">
                    <strong>Try this:</strong> Load "GW150914" , the real 2016 detection , and see
                    that a single, real gravitational-wave event implies roughly 10⁷⁸ gravitons, a
                    number so large that "coherent wave" and "single particle" are two entirely
                    different regimes of the same field.
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

export default GravitonLab
