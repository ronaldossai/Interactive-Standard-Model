/**
 * QuantumPropertyIndicators.tsx
 *
 * Visual indicators for quantum properties:
 *  - Spin arrows (1/2 up/down, spin-1 circulation, spin-0 scalar)
 *  - Helicity (left/right-handed chirality, especially for neutrinos)
 *  - Charge visualization (color-coded symbols)
 *  - Color charge for quarks (R/G/B visualization)
 */

import type { ParticleData } from '../types/particle'

interface QuantumPropertyIndicatorsProps {
  particle: ParticleData
  showAntimatter?: boolean
}

const QuantumPropertyIndicators = ({ particle, showAntimatter = false }: QuantumPropertyIndicatorsProps) => {
  
  // Parse spin value
  const spinValue = particle.spin
  const isSpinHalf = spinValue === '1/2'
  const isSpinOne = spinValue === '1'
  const isSpinZero = spinValue === '0'
  
  // Determine helicity (neutrinos are always left-handed, antineutrinos right-handed)
  const isNeutrino = particle.id.includes('Neutrino')
  const helicity = isNeutrino ? (showAntimatter ? 'right' : 'left') : null
  
  // Parse charge
  const parseCharge = (chargeStr: string): number | null => {
    if (chargeStr === '0') return 0
    if (chargeStr === '+1' || chargeStr === '+1e') return 1
    if (chargeStr === '-1' || chargeStr === '-1e') return -1
    if (chargeStr === '+2/3') return 2/3
    if (chargeStr === '-1/3') return -1/3
    if (chargeStr === '+2') return 2
    if (chargeStr === '-2') return -2
    return null
  }
  
  const charge = parseCharge(particle.charge)
  const isCharged = charge !== null && charge !== 0
  
  // Color charge for quarks
  const isQuark = particle.type === 'quark'
  const colorCharges = isQuark ? ['red', 'green', 'blue'] : []
  
  return (
    <div className="quantum-indicators">
      <h3>Quantum Properties</h3>
      
      <div className="quantum-indicators-grid">
        
        {/* Spin Indicator */}
        <div className="quantum-property-card">
          <div className="quantum-property-label">Spin</div>
          <div className="quantum-property-value">{spinValue}</div>
          <div className="quantum-property-visual">
            {isSpinHalf && (
              <div className="spin-half-arrows">
                <div className="spin-arrow spin-up" title="Spin up">↑</div>
                <div className="spin-arrow-divider">/</div>
                <div className="spin-arrow spin-down" title="Spin down">↓</div>
              </div>
            )}
            {isSpinOne && (
              <div className="spin-one-circle" title="Spin-1 vector boson">
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle 
                    cx="25" cy="25" r="18" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <path 
                    d="M 25 7 L 28 12 L 22 12 Z" 
                    fill="currentColor"
                    transform="rotate(-30 25 25)"
                  />
                  <path 
                    d="M 25 7 L 28 12 L 22 12 Z" 
                    fill="currentColor"
                    transform="rotate(60 25 25)"
                  />
                  <path 
                    d="M 25 7 L 28 12 L 22 12 Z" 
                    fill="currentColor"
                    transform="rotate(150 25 25)"
                  />
                  <path 
                    d="M 25 7 L 28 12 L 22 12 Z" 
                    fill="currentColor"
                    transform="rotate(240 25 25)"
                  />
                </svg>
              </div>
            )}
            {isSpinZero && (
              <div className="spin-zero-scalar" title="Spin-0 scalar">
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle 
                    cx="25" cy="25" r="15" 
                    fill="currentColor" 
                    opacity="0.3"
                  />
                  <text 
                    x="25" y="32" 
                    textAnchor="middle" 
                    fontSize="20" 
                    fill="currentColor"
                    fontWeight="bold"
                  >0</text>
                </svg>
              </div>
            )}
          </div>
          <div className="quantum-property-description">
            {isSpinHalf && 'Fermion - half-integer spin'}
            {isSpinOne && 'Gauge boson - vector field'}
            {isSpinZero && 'Scalar boson - no intrinsic angular momentum'}
          </div>
        </div>
        
        {/* Helicity Indicator (neutrinos only) */}
        {helicity && (
          <div className="quantum-property-card">
            <div className="quantum-property-label">Helicity</div>
            <div className="quantum-property-value">{helicity}-handed</div>
            <div className="quantum-property-visual">
              <div className={`helicity-indicator helicity-${helicity}`}>
                <svg width="50" height="50" viewBox="0 0 50 50">
                  {/* Arrow along direction of motion */}
                  <line x1="10" y1="25" x2="40" y2="25" stroke="currentColor" strokeWidth="2" />
                  <path d="M 35 20 L 40 25 L 35 30" fill="currentColor" />
                  
                  {/* Circular spin indicator */}
                  {helicity === 'left' ? (
                    <>
                      <path 
                        d="M 25 15 A 10 10 0 1 0 25 35" 
                        fill="none" 
                        stroke="#42a5f5" 
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path d="M 20 16 L 25 15 L 24 20" fill="#42a5f5" />
                    </>
                  ) : (
                    <>
                      <path 
                        d="M 25 15 A 10 10 0 1 1 25 35" 
                        fill="none" 
                        stroke="#ff6b6b" 
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path d="M 30 16 L 25 15 L 26 20" fill="#ff6b6b" />
                    </>
                  )}
                </svg>
              </div>
            </div>
            <div className="quantum-property-description">
              {helicity === 'left' 
                ? 'Spin antiparallel to momentum (only left-handed neutrinos exist in nature)'
                : 'Spin parallel to momentum (antineutrinos are right-handed)'
              }
            </div>
          </div>
        )}
        
        {/* Charge Indicator */}
        <div className="quantum-property-card">
          <div className="quantum-property-label">Electric Charge</div>
          <div className="quantum-property-value">{particle.charge}</div>
          <div className="quantum-property-visual">
            <div className={`charge-indicator ${isCharged ? (charge! > 0 ? 'positive' : 'negative') : 'neutral'}`}>
              {charge === 0 && <span className="charge-symbol neutral-symbol">0</span>}
              {charge !== null && charge > 0 && (
                <span className="charge-symbol positive-symbol">+</span>
              )}
              {charge !== null && charge < 0 && (
                <span className="charge-symbol negative-symbol">−</span>
              )}
            </div>
          </div>
          <div className="quantum-property-description">
            {charge === 0 && 'No electric charge - no EM interaction'}
            {charge && charge > 0 && `Positive charge - repels other positive charges`}
            {charge && charge < 0 && `Negative charge - attracts positive charges`}
          </div>
        </div>
        
        {/* Color Charge (quarks only) */}
        {isQuark && (
          <div className="quantum-property-card">
            <div className="quantum-property-label">Color Charge</div>
            <div className="quantum-property-value">R / G / B</div>
            <div className="quantum-property-visual">
              <div className="color-charges">
                {colorCharges.map((color) => (
                  <div key={color} className={`color-charge-orb color-${color}`} title={`${color} color charge`}>
                    <div className="color-charge-inner" />
                  </div>
                ))}
              </div>
            </div>
            <div className="quantum-property-description">
              Quarks carry one of three color charges (red, green, or blue) - the source of the strong force
            </div>
          </div>
        )}
        
        {/* Lepton Number (leptons only) */}
        {particle.type === 'lepton' && (
          <div className="quantum-property-card">
            <div className="quantum-property-label">Lepton Number</div>
            <div className="quantum-property-value">{showAntimatter ? '-1' : '+1'}</div>
            <div className="quantum-property-visual">
              <div className="lepton-number">
                <span className="quantum-number-symbol">L</span>
                <span className="quantum-number-value">{showAntimatter ? '= -1' : '= +1'}</span>
              </div>
            </div>
            <div className="quantum-property-description">
              Conserved in all interactions - leptons and antileptons must balance
            </div>
          </div>
        )}
        
        {/* Baryon Number (quarks only) */}
        {isQuark && (
          <div className="quantum-property-card">
            <div className="quantum-property-label">Baryon Number</div>
            <div className="quantum-property-value">{showAntimatter ? '-1/3' : '+1/3'}</div>
            <div className="quantum-property-visual">
              <div className="baryon-number">
                <span className="quantum-number-symbol">B</span>
                <span className="quantum-number-value">{showAntimatter ? '= -1/3' : '= +1/3'}</span>
              </div>
            </div>
            <div className="quantum-property-description">
              Each quark contributes 1/3 baryon number - protons and neutrons have B = +1
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}

export default QuantumPropertyIndicators
