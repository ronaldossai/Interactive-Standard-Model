/**
 * NeutrinoOscillation.tsx
 *
 * Interactive neutrino oscillation simulator showing how neutrino flavors
 * transform as they travel through space. Users can adjust distance, energy,
 * and initial flavor to see real-time probability changes.
 *
 * Physics: Three-flavor oscillation with PMNS matrix (PDG 2024 values)
 */

import { useState, useEffect, useMemo } from 'react'
import { useParticle } from '../context/ParticleContext'
import {
  calculateOscillationProbabilities,
  generateOscillationCurve,
  OSCILLATION_PRESETS,
  THETA_12,
  THETA_23,
  THETA_13,
  DELTA_M21_SQ,
  DELTA_M31_SQ,
  type NeutrinoFlavor,
  type OscillationPreset,
} from '../utils/neutrinoOscillation'

const NeutrinoOscillation = () => {
  const { neutrinoOscillationOpen, closeNeutrinoOscillation } = useParticle()

  // Simulation parameters
  const [initialFlavor, setInitialFlavor] = useState<NeutrinoFlavor>('muon')
  const [distance, setDistance] = useState(500) // km
  const [energy, setEnergy] = useState(1.0) // GeV
  const [maxDistance, setMaxDistance] = useState(13000) // km (for graph)

  // Calculate current probabilities
  const probabilities = useMemo(
    () => calculateOscillationProbabilities(initialFlavor, distance, energy),
    [initialFlavor, distance, energy]
  )

  // Generate oscillation curves for graph
  const curves = useMemo(
    () => generateOscillationCurve(initialFlavor, energy, maxDistance, 200),
    [initialFlavor, energy, maxDistance]
  )

  // Load preset scenario
  const loadPreset = (preset: OscillationPreset) => {
    setInitialFlavor(preset.initialFlavor)
    setEnergy(preset.energy)
    setDistance(preset.distance)
    setMaxDistance(preset.maxDistance)
  }

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && neutrinoOscillationOpen) {
        closeNeutrinoOscillation()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [neutrinoOscillationOpen, closeNeutrinoOscillation])

  if (!neutrinoOscillationOpen) return null

  // Flavor colors matching particleData.ts
  const flavorColors: Record<NeutrinoFlavor, string> = {
    electron: '#f39c12',
    muon: '#e74c3c',
    tau: '#9b59b6',
  }

  const flavorSymbols: Record<NeutrinoFlavor, string> = {
    electron: 'νₑ',
    muon: 'νμ',
    tau: 'ντ',
  }

  const flavorNames: Record<NeutrinoFlavor, string> = {
    electron: 'Electron',
    muon: 'Muon',
    tau: 'Tau',
  }

  // Format distance for display
  const formatDistance = (d: number): string => {
    if (d >= 1e6) return `${(d / 1e6).toFixed(1)} Mm`
    if (d >= 1000) return `${(d / 1000).toFixed(1)} Mm`
    if (d >= 1) return `${d.toFixed(1)} km`
    return `${(d * 1000).toFixed(0)} m`
  }

  // Format energy for display
  const formatEnergy = (e: number): string => {
    if (e >= 1) return `${e.toFixed(2)} GeV`
    return `${(e * 1000).toFixed(1)} MeV`
  }

  return (
    <div className="neutrino-oscillation-overlay">
      <div className="neutrino-oscillation-backdrop" onClick={closeNeutrinoOscillation} />
      
      <div className="neutrino-oscillation-container">
        {/* Header */}
        <div className="neutrino-oscillation-header">
          <h2>Neutrino Oscillation Simulator</h2>
          <button className="close-button" onClick={closeNeutrinoOscillation} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="neutrino-oscillation-content">
          {/* Left Panel: Controls */}
          <div className="neutrino-oscillation-controls">
            <section className="control-section">
              <h3>Initial Flavor</h3>
              <div className="flavor-selector">
                {(['electron', 'muon', 'tau'] as NeutrinoFlavor[]).map((flavor) => (
                  <button
                    key={flavor}
                    className={`flavor-button ${initialFlavor === flavor ? 'active' : ''}`}
                    onClick={() => setInitialFlavor(flavor)}
                    style={{
                      borderColor: flavorColors[flavor],
                      backgroundColor: initialFlavor === flavor ? `${flavorColors[flavor]}22` : 'transparent',
                    }}
                  >
                    <span className="flavor-symbol" style={{ color: flavorColors[flavor] }}>
                      {flavorSymbols[flavor]}
                    </span>
                    <span className="flavor-name">{flavorNames[flavor]}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="control-section">
              <h3>Distance</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max={maxDistance}
                  step={maxDistance / 200}
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value))}
                  className="slider"
                />
                <div className="slider-value">{formatDistance(distance)}</div>
                <div className="slider-hint">How far the neutrino travels</div>
              </div>
            </section>

            <section className="control-section">
              <h3>Energy</h3>
              <div className="slider-control">
                <input
                  type="range"
                  min="-3"
                  max="1"
                  step="0.05"
                  value={Math.log10(energy)}
                  onChange={(e) => setEnergy(Math.pow(10, parseFloat(e.target.value)))}
                  className="slider"
                />
                <div className="slider-value">{formatEnergy(energy)}</div>
                <div className="slider-hint">Neutrino energy (log scale)</div>
              </div>
            </section>

            <section className="control-section">
              <h3>Presets</h3>
              <div className="preset-buttons">
                {OSCILLATION_PRESETS.map((preset) => (
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

            {/* PMNS Matrix Display */}
            <section className="control-section pmns-section">
              <h3>PMNS Matrix Parameters</h3>
              <div className="pmns-params">
                <div className="pmns-param">
                  <span className="param-label">θ₁₂</span>
                  <span className="param-value">{THETA_12.toFixed(2)}°</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">θ₂₃</span>
                  <span className="param-value">{THETA_23.toFixed(2)}°</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">θ₁₃</span>
                  <span className="param-value">{THETA_13.toFixed(2)}°</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">Δm²₂₁</span>
                  <span className="param-value">{DELTA_M21_SQ.toExponential(2)} eV²</span>
                </div>
                <div className="pmns-param">
                  <span className="param-label">Δm²₃₁</span>
                  <span className="param-value">{DELTA_M31_SQ.toExponential(3)} eV²</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Panel: Visualization */}
          <div className="neutrino-oscillation-viz">
            {/* Current Probabilities */}
            <section className="viz-section">
              <h3>Flavor Probabilities at {formatDistance(distance)}</h3>
              <div className="probability-bars">
                {(['electron', 'muon', 'tau'] as NeutrinoFlavor[]).map((flavor) => (
                  <div key={flavor} className="probability-bar-container">
                    <div className="probability-label">
                      <span className="flavor-symbol" style={{ color: flavorColors[flavor] }}>
                        {flavorSymbols[flavor]}
                      </span>
                      <span className="probability-percent">
                        {(probabilities[flavor] * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="probability-bar-track">
                      <div
                        className="probability-bar-fill"
                        style={{
                          width: `${probabilities[flavor] * 100}%`,
                          backgroundColor: flavorColors[flavor],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Oscillation Graph */}
            <section className="viz-section">
              <h3>Oscillation vs Distance</h3>
              <div className="oscillation-graph">
                <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
                  {/* Grid lines */}
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

                  {/* Axes */}
                  <line x1="50" y1="250" x2="590" y2="250" stroke="#666" strokeWidth="1.5" />
                  <line x1="50" y1="50" x2="50" y2="250" stroke="#666" strokeWidth="1.5" />

                  {/* Y-axis labels */}
                  <text x="35" y="254" fontSize="10" fill="#888" textAnchor="end">0</text>
                  <text x="35" y="154" fontSize="10" fill="#888" textAnchor="end">0.5</text>
                  <text x="35" y="54" fontSize="10" fill="#888" textAnchor="end">1.0</text>
                  <text x="15" y="150" fontSize="11" fill="#aaa" textAnchor="middle" transform="rotate(-90, 15, 150)">
                    Probability
                  </text>

                  {/* X-axis label */}
                  <text x="320" y="280" fontSize="11" fill="#aaa" textAnchor="middle">
                    Distance ({maxDistance >= 1000 ? 'km' : 'm'})
                  </text>

                  {/* Plot curves */}
                  {(['electron', 'muon', 'tau'] as NeutrinoFlavor[]).map((flavor) => {
                    const points = curves
                      .map((point, i) => {
                        const x = 50 + (i / (curves.length - 1)) * 540
                        const y = 250 - point.probabilities[flavor] * 200
                        return `${x},${y}`
                      })
                      .join(' ')

                    return (
                      <polyline
                        key={flavor}
                        points={points}
                        fill="none"
                        stroke={flavorColors[flavor]}
                        strokeWidth="2"
                        opacity="0.85"
                      />
                    )
                  })}

                  {/* Current distance indicator */}
                  <line
                    x1={50 + (distance / maxDistance) * 540}
                    y1="50"
                    x2={50 + (distance / maxDistance) * 540}
                    y2="250"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.5"
                  />
                </svg>

                {/* Legend */}
                <div className="graph-legend">
                  {(['electron', 'muon', 'tau'] as NeutrinoFlavor[]).map((flavor) => (
                    <div key={flavor} className="legend-item">
                      <span
                        className="legend-color"
                        style={{ backgroundColor: flavorColors[flavor] }}
                      />
                      <span className="legend-label">{flavorSymbols[flavor]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Educational Content */}
            <section className="viz-section educational-content">
              <h3>About Neutrino Oscillation</h3>
              <p>
                Neutrinos are what we describe as "flavor eigenstates" (νₑ, νμ, ντ) when produced, but they propagate
                as "mass eigenstates" (ν₁, ν₂, ν₃). The mismatch between these bases , which is described
                by the <strong>PMNS matrix</strong> , causes neutrinos to oscillate between flavors
                as they travel.
              </p>
              <p>
                <strong>Why it matters:</strong> Neutrino oscillation proves neutrinos have mass
                (Nobel Prize 2015), solves the solar neutrino problem, and hints at physics beyond
                the Standard Model. The oscillation probability depends on the ratio L/E (distance
                over energy) and the mass-squared differences Δm².
              </p>
              <div className="educational-highlight">
                <strong>Try this:</strong> Select "Solar Neutrinos" preset to see why only ~1/3 of
                expected electron neutrinos from the Sun reach Earth, they've oscillated into other
                flavors during their journey!
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NeutrinoOscillation
