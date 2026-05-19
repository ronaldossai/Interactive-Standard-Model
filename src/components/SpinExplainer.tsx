/**
 * SpinExplainer.tsx
 *
 * Full-page overlay (same pattern as MassComparison) that visually explains
 * all quantum spin values: 0, 1/2, 1, 3/2, 2.
 * Opens when the user clicks the Spin card in QuantumPropertyIndicators.
 * State is managed via ParticleContext (spinExplainerSpin / closeSpinExplainer).
 */

import { useParticle } from '../context/ParticleContext'

interface SpinEntry {
  value: string
  label: string
  category: string
  color: string
  examples: string
  description: string
  symmetryNote: string
  visual: React.ReactNode
}

// SVG visuals 

const Spin0Visual = ({ color }: { color: string }) => (
  <svg viewBox="0 0 80 80" className="spin-svg">
    <circle cx="40" cy="40" r="28" fill={color} opacity="0.1" />
    <circle cx="40" cy="40" r="20" fill={color} opacity="0.25" stroke={color} strokeWidth="1.5" />
    <circle cx="40" cy="40" r="5" fill={color} opacity="0.8" />
    <text x="40" y="72" textAnchor="middle" fontSize="9" fill={color} opacity="0.7">looks same every angle</text>
  </svg>
)

const Spin12Visual = ({ color }: { color: string }) => (
  <svg viewBox="0 0 80 80" className="spin-svg spin-svg--half">
    <circle cx="27" cy="40" r="13" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 2" />
    <circle cx="53" cy="40" r="13" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 2" />
    <line x1="40" y1="55" x2="40" y2="25" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <polygon points="40,18 35,27 45,27" fill={color} />
    <line x1="40" y1="25" x2="40" y2="55" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <polygon points="40,62 35,53 45,53" fill={color} opacity="0.3" />
    <text x="40" y="74" textAnchor="middle" fontSize="9" fill={color} opacity="0.7">720° to restore</text>
  </svg>
)

const Spin1Visual = ({ color }: { color: string }) => (
  <svg viewBox="0 0 80 80" className="spin-svg spin-svg--one">
    <circle cx="40" cy="40" r="22" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
    {/* Static Z4 markers (four equivalent positions) */}
    <polygon points="40,14 36,21 44,21" fill={color} opacity="0.85" />
    <polygon points="66,40 59,36 59,44" fill={color} opacity="0.6" />
    <polygon points="40,66 36,59 44,59" fill={color} opacity="0.45" />
    <polygon points="14,40 21,36 21,44" fill={color} opacity="0.6" />

    {/* Static center pivot */}
    <circle cx="40" cy="40" r="2.2" fill={color} opacity="0.9" />

    {/* Rotating arrow (360°) */}
    <g className="spin1-rotor">
      <line x1="40" y1="40" x2="40" y2="18" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <polygon points="40,14 36,21 44,21" fill={color} />
    </g>

    <text x="40" y="74" textAnchor="middle" fontSize="9" fill={color} opacity="0.78">360° to restore</text>
  </svg>
)

const Spin32Visual = ({ color }: { color: string }) => (
  <svg viewBox="0 0 80 80" className="spin-svg spin-svg--threehalf">
    <circle cx="40" cy="40" r="22" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
    
    {/* Static 4 quantum state markers (m = -3/2, -1/2, +1/2, +3/2) */}
    <circle cx="24" cy="24" r="4" fill={color} opacity="0.4" />
    <circle cx="56" cy="24" r="4" fill={color} opacity="0.5" />
    <circle cx="56" cy="56" r="4" fill={color} opacity="0.6" />
    <circle cx="24" cy="56" r="4" fill={color} opacity="0.7" />
    
    {/* Static center pivot */}
    <circle cx="40" cy="40" r="2.2" fill={color} opacity="0.9" />
    
    {/* Rotating arrow (240° per cycle) */}
    <g className="spin32-rotor">
      <line x1="40" y1="40" x2="40" y2="18" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <polygon points="40,14 36,21 44,21" fill={color} />
    </g>
    
    {/* Static label */}
    <text x="40" y="74" textAnchor="middle" fontSize="9" fill={color} opacity="0.78">240° per cycle • 4 states</text>
  </svg>
)

const Spin2Visual = ({ color }: { color: string }) => (
  <svg viewBox="0 0 80 80" className="spin-svg spin-svg--two">
    {/* Rotating elements */}
    <g className="spin2-rotor">
      <line x1="26" y1="54" x2="54" y2="26" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="54,26 46,26 54,34" fill={color} />
      <line x1="54" y1="54" x2="26" y2="26" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <polygon points="26,26 34,26 26,34" fill={color} opacity="0.5" />
      <line x1="40" y1="18" x2="40" y2="62" stroke={color} strokeWidth="1" opacity="0.25" />
      <line x1="18" y1="40" x2="62" y2="40" stroke={color} strokeWidth="1" opacity="0.25" />
    </g>
    {/* Static label */}
    <text x="40" y="74" textAnchor="middle" fontSize="9" fill={color} opacity="0.7">180° to restore</text>
  </svg>
)

// Data

const SPIN_DATA: SpinEntry[] = [
  {                                                                   
    value: '0',
    label: 'Spin-0',
    category: 'Scalar Boson',
    color: '#c084fc',
    examples: 'Higgs boson',
    description: 'A spin-0 particle looks identical from every direction as it has no preferred axis. This is the simplest possible quantum field (scalar field).',
    symmetryNote: 'Symmetric under any rotation = infinite rotational symmetry.',
    visual: <Spin0Visual color="#c084fc" />,
  },
  {
    value: '1/2',
    label: 'Spin-½',
    category: 'Fermion',
    color: '#60a5fa',
    examples: 'Quarks, Electrons, Neutrinos, Muons, Taus',
    description: 'A spin-½ particle must rotate 720° to return to its original quantum state. This underlies the Pauli exclusion principle that no two fermions can occupy the same quantum state.',
    symmetryNote: 'Requires a full double rotation (720°) to restore original state.',
    visual: <Spin12Visual color="#60a5fa" />,
  },
  {
    value: '1',
    label: 'Spin-1',
    category: 'Vector (Gauge) Boson',
    color: '#fbbf24',
    examples: 'Photon (γ), Gluon (g), W boson, Z boson',
    description: 'A spin-1 particle behaves like a 3D arrow which rotating it 360° restores its original state. These particles are the force carriers of the Standard Model.',
    symmetryNote: 'One full rotation (360°) restores original state.',
    visual: <Spin1Visual color="#fbbf24" />,
  },
  {
    value: '3/2',
    label: 'Spin-3/2',
    category: 'Rarita-Schwinger Field',
    color: '#f87171',
    examples: 'Gravitino (hypothetical, supersymmetry)',
    description: 'Spin-3/2 particles carry four quantum states (m = −3/2, −1/2, +1/2, +3/2). They are predicted by supersymmetric theories but have never been observed.',
    symmetryNote: 'Requires 240° effective rotation per cycle = 4 spin eigenstates.',
    visual: <Spin32Visual color="#f87171" />,
  },
  {
    value: '2',
    label: 'Spin-2',
    category: 'Tensor Boson',
    color: '#34d399',
    examples: 'Graviton (hypothetical)',
    description: 'A spin-2 particle has the same state after only 180° of rotation. General Relativity predicts the graviton must be spin-2, matching the tensor nature of spacetime curvature.',
    symmetryNote: 'Only 180° needed to restore original state & this is the highest symmetry of all spins.',
    visual: <Spin2Visual color="#34d399" />,
  },
]

// Main component

export default function SpinExplainer() {
  const { spinExplainerSpin, closeSpinExplainer } = useParticle()

  if (!spinExplainerSpin) return null

  return (
    <div className="spin-explainer-overlay" onClick={closeSpinExplainer}>
      <div className="spin-explainer-modal" onClick={e => e.stopPropagation()}>

        {/* Sticky header */}
        <div className="spin-explainer-header">
          <div className="spin-explainer-title-block">
            <span className="spin-explainer-eyebrow">QUANTUM MECHANICS</span>
            <h2 className="spin-explainer-title">What is Spin?</h2>
            <p className="spin-explainer-subtitle">
              Quantum spin is intrinsic angular momentum, the best way to think about it is as a fundamental property with no
              classical counterpart. Each value determines how a particle transforms under rotation.
            </p>
          </div>
          <button className="spin-explainer-close" onClick={closeSpinExplainer} aria-label="Close">✕</button>
        </div>

        {/* Spin cards */}
        <div className="spin-explainer-grid">
          {SPIN_DATA.map(entry => (
            <div
              key={entry.value}
              className={`spin-entry-card${spinExplainerSpin === entry.value ? ' spin-entry-card--active' : ''}`}
              style={{ '--spin-color': entry.color } as React.CSSProperties}
            >
              {spinExplainerSpin === entry.value && (
                <span className="spin-entry-badge">THIS PARTICLE</span>
              )}
              <div className="spin-entry-visual">{entry.visual}</div>
              <div className="spin-entry-info">
                <div className="spin-entry-header">
                  <span className="spin-entry-value">{entry.label}</span>
                  <span className="spin-entry-category">{entry.category}</span>
                </div>
                <p className="spin-entry-description">{entry.description}</p>
                <div className="spin-entry-symmetry">{entry.symmetryNote}</div>
                <div className="spin-entry-examples">
                  <span className="spin-entry-examples-label">Examples: </span>
                  {entry.examples}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="spin-explainer-footer">
          <p>
            Particles with half-integer spin (½, 3/2…) are <strong>fermions</strong> because they obey
            the Pauli exclusion principle. Particles with integer spin (0, 1, 2…) are <strong>bosons</strong> as they
            can occupy the same quantum state.
          </p>
          <button className="spin-explainer-close-footer" onClick={closeSpinExplainer}>Close</button>
        </div>
      </div>
    </div>
  )
}


