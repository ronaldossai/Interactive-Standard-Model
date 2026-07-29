/**
 * HadronLab Component
 * 
 * Interactive hadron builder where users can:
 * - Select quarks (up, down, charm, strange, top, bottom)
 * - Choose color charges (red, green, blue or anti-versions)
 * - Toggle antiquark mode
 * - Build baryons (3 quarks) or mesons (quark + antiquark)
 * - See real-time validation based on QCD rules
 * - Learn about color confinement and the strong force
 */

import { useState, useEffect } from 'react'
import { useParticle } from '../context/ParticleContext'
import {
  type QuarkSelection,
  type ColorCharge,
  validateHadron,
  getAvailableColors,
  calculateTotalCharge,
  QCD_INFO,
  HADRON_RECIPES,
} from '../utils/hadronBuilder'
import hadronLabIcon from '../assets/hadron-lab-icon.png'

// Quark flavor data
const QUARK_FLAVORS = [
  { id: 'up', symbol: 'u', name: 'Up', color: '#ff6b6b' },
  { id: 'down', symbol: 'd', name: 'Down', color: '#4ecdc4' },
  { id: 'charm', symbol: 'c', name: 'Charm', color: '#45b7d1' },
  { id: 'strange', symbol: 's', name: 'Strange', color: '#96ceb4' },
  { id: 'top', symbol: 't', name: 'Top', color: '#f39c12' },
  { id: 'bottom', symbol: 'b', name: 'Bottom', color: '#a29bfe' },
]

// Color charge visualization colors
const COLOR_CHARGE_COLORS: Record<ColorCharge, string> = {
  'red': '#ef4444',
  'green': '#22c55e',
  'blue': '#3b82f6',
  'antired': '#fca5a5',
  'antigreen': '#86efac',
  'antiblue': '#93c5fd',
}

const HadronLab = () => {
  const { hadronLabOpen, closeHadronLab } = useParticle()
  const [selectedQuarks, setSelectedQuarks] = useState<QuarkSelection[]>([])
  const [isAntiquarkMode, setIsAntiquarkMode] = useState(false)
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<ColorCharge | null>(null)

  // Validate current selection
  const validation = validateHadron(selectedQuarks)

  // Close on ESC
  useEffect(() => {
    if (!hadronLabOpen) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeHadronLab()
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [hadronLabOpen, closeHadronLab])

  if (!hadronLabOpen) return null

  const addQuark = () => {
    if (!selectedFlavor || !selectedColor) return
    if (selectedQuarks.length >= 3) return

    const flavor = QUARK_FLAVORS.find(q => q.id === selectedFlavor)
    if (!flavor) return

    const newQuark: QuarkSelection = {
      id: flavor.id,
      symbol: isAntiquarkMode ? flavor.symbol + '\u0304' : flavor.symbol, // combining overline for antiquark
      color: flavor.color,
      colorCharge: selectedColor,
      isAntiquark: isAntiquarkMode,
    }

    setSelectedQuarks([...selectedQuarks, newQuark])
    setSelectedFlavor(null)
    setSelectedColor(null)
  }

  const removeQuark = (index: number) => {
    setSelectedQuarks(selectedQuarks.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setSelectedQuarks([])
    setSelectedFlavor(null)
    setSelectedColor(null)
    setIsAntiquarkMode(false)
  }

  const loadRecipe = (recipeIndex: number) => {
    const recipe = HADRON_RECIPES[recipeIndex]
    if (!recipe) return

    const quarks: QuarkSelection[] = recipe.quarks.map(q => {
      const flavor = QUARK_FLAVORS.find(f => f.id === q.id)!
      const isAnti = 'isAnti' in q && q.isAnti
      return {
        id: q.id,
        symbol: isAnti ? flavor.symbol + '\u0304' : flavor.symbol,
        color: flavor.color,
        colorCharge: q.colorCharge,
        isAntiquark: isAnti || false,
      }
    })

    setSelectedQuarks(quarks)
  }

  const availableColors = getAvailableColors(selectedQuarks, isAntiquarkMode)
  const totalCharge = calculateTotalCharge(selectedQuarks)

  return (
    <div className="hadron-lab-overlay">
      <div className="hadron-lab-backdrop" onClick={closeHadronLab} />
      <div className="hadron-lab-container">
        {/* Header */}
        <div className="hadron-lab-header">
          <h2>
            <img src={hadronLabIcon} alt="Lab" style={{ width: '32px', height: '32px', marginRight: '12px', verticalAlign: 'middle' }} />
            Hadron Lab
          </h2>
          <button className="close-button" onClick={closeHadronLab} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="hadron-lab-content">
          {/* Left Panel: Builder */}
          <div className="hadron-lab-builder">
            {/* Current Selection Display */}
            <div className="builder-section">
              <h3>Build Your Hadron</h3>
              <div className="quark-slots">
                {[0, 1, 2].map(index => (
                  <div
                    key={index}
                    className={`quark-slot ${selectedQuarks[index] ? 'filled' : 'empty'}`}
                  >
                    {selectedQuarks[index] ? (
                      <>
                        <div
                          className="quark-display"
                          style={{
                            background: `linear-gradient(135deg, ${selectedQuarks[index].color}, ${COLOR_CHARGE_COLORS[selectedQuarks[index].colorCharge]})`,
                          }}
                        >
                          <span className="quark-symbol">{selectedQuarks[index].symbol}</span>
                          <span className="quark-color-label">
                            {selectedQuarks[index].colorCharge}
                          </span>
                        </div>
                        <button
                          className="remove-quark"
                          onClick={() => removeQuark(index)}
                          aria-label="Remove quark"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="empty-slot-text">
                        {index === 0 ? 'Add Quark' : index === 1 ? 'Quark 2' : 'Quark 3'}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedQuarks.length > 0 && (
                <div className="selection-info">
                  <div className="info-item">
                    <span className="info-label">Count:</span>
                    <span className="info-value">{selectedQuarks.length} quark{selectedQuarks.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Charge:</span>
                    <span className="info-value">
                      {totalCharge > 0 ? '+' : ''}{totalCharge.toFixed(2)} e
                    </span>
                  </div>
                  <button className="clear-button" onClick={clearAll}>
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Flavor Selection */}
            <div className="builder-section">
              <h3>1. Choose Flavor</h3>
              <div className="flavor-grid">
                {QUARK_FLAVORS.map(flavor => (
                  <button
                    key={flavor.id}
                    className={`flavor-option ${selectedFlavor === flavor.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFlavor(flavor.id)}
                    style={{ borderColor: flavor.color }}
                    disabled={selectedQuarks.length >= 3}
                  >
                    <span className="flavor-symbol" style={{ color: flavor.color }}>
                      {isAntiquarkMode ? flavor.symbol + '\u0304' : flavor.symbol}
                    </span>
                    <span className="flavor-name">{flavor.name}</span>
                  </button>
                ))}
              </div>

              <label className="antiquark-toggle">
                <input
                  type="checkbox"
                  checked={isAntiquarkMode}
                  onChange={(e) => {
                    setIsAntiquarkMode(e.target.checked)
                    setSelectedColor(null)
                    // If we have quarks already, changing mode might invalidate color selection
                    if (selectedQuarks.length > 0) {
                      setSelectedFlavor(null)
                    }
                  }}
                />
                <span>Antiquark Mode</span>
              </label>
            </div>

            {/* Color Charge Selection */}
            <div className="builder-section">
              <h3>2. Choose Color Charge</h3>
              {!selectedFlavor && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
                  Select a flavor first
                </p>
              )}
              <div className="color-grid">
                {(isAntiquarkMode
                  ? ['antired', 'antigreen', 'antiblue']
                  : ['red', 'green', 'blue']
                ).map(colorCharge => {
                  const isAvailable = availableColors.includes(colorCharge as ColorCharge)
                  const isDisabled = !isAvailable || !selectedFlavor
                  return (
                    <button
                      key={colorCharge}
                      className={`color-option ${selectedColor === colorCharge ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedColor(colorCharge as ColorCharge)
                        }
                      }}
                      style={{
                        background: COLOR_CHARGE_COLORS[colorCharge as ColorCharge],
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <span className="color-name">{colorCharge}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Add Button */}
            <div className="builder-section" style={{ padding: '1rem' }}>
              <button
                className="add-quark-button"
                onClick={addQuark}
                disabled={!selectedFlavor || !selectedColor || selectedQuarks.length >= 3}
              >
                ➕ Add Quark
              </button>
              {(!selectedFlavor || !selectedColor) && selectedQuarks.length < 3 && (
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-tertiary)', 
                  marginTop: '0.75rem',
                  marginBottom: 0,
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}>
                  {!selectedFlavor ? 'Choose a flavor and color to add a quark' : 'Select a color charge to continue'}
                </p>
              )}
            </div>

            {/* Quick Recipes */}
            <div className="builder-section recipes-section">
              <h3>Quick Recipes</h3>
              <div className="recipe-buttons">
                {HADRON_RECIPES.map((recipe, index) => (
                  <button
                    key={index}
                    className="recipe-button"
                    onClick={() => loadRecipe(index)}
                  >
                    <span className="recipe-symbol">{recipe.symbol}</span>
                    <span className="recipe-name">{recipe.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Results & Education */}
          <div className="hadron-lab-results">
            {/* Validation Feedback */}
            <div className="results-section">
              <h3>Validation</h3>
              {validation.errors.length > 0 && (
                <div className="validation-errors">
                  {validation.errors.map((error, i) => (
                    <div key={i} className="error-message">
                      ❌ {error}
                    </div>
                  ))}
                </div>
              )}
              {validation.warnings.length > 0 && (
                <div className="validation-warnings">
                  {validation.warnings.map((warning, i) => (
                    <div key={i} className="warning-message">
                      ⚠️ {warning}
                    </div>
                  ))}
                </div>
              )}
              {validation.isValid && validation.hadron && (
                <div className="validation-success">
                  <div className="success-icon">✓</div>
                  <div className="success-message">
                    Valid hadron created!
                  </div>
                </div>
              )}
              {selectedQuarks.length === 0 && (
                <div className="validation-hint">
                  Select quarks to start building a hadron. Try the quick recipes below!
                </div>
              )}
            </div>

            {/* Hadron Preview */}
            {validation.hadron && (
              <div className="results-section hadron-preview">
                <h3>Result: {validation.hadron.name}</h3>
                <div className="hadron-card">
                  <div className="hadron-header">
                    <span className="hadron-symbol">{validation.hadron.symbol}</span>
                    <span className="hadron-category">{validation.hadron.category}</span>
                  </div>
                  <div className="hadron-properties">
                    <div className="hadron-prop">
                      <span className="prop-label">Mass:</span>
                      <span className="prop-value">{validation.hadron.mass}</span>
                    </div>
                    <div className="hadron-prop">
                      <span className="prop-label">Charge:</span>
                      <span className="prop-value">{validation.hadron.charge}</span>
                    </div>
                    <div className="hadron-prop">
                      <span className="prop-label">Quarks:</span>
                      <span className="prop-value">
                        {validation.hadron.quarkSymbols.join(' ')}
                      </span>
                    </div>
                  </div>
                  <p className="hadron-description">{validation.hadron.description}</p>
                </div>
              </div>
            )}

            {/* Educational Content */}
            <div className="results-section educational-section">
              <h3>{QCD_INFO.title}</h3>
              <div className="qcd-info">
                {QCD_INFO.sections.map((section, index) => (
                  <div key={index} className="qcd-section">
                    <h4>{section.heading}</h4>
                    <p>{section.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Confinement Visual */}
            <div className="results-section">
              <h3>Color Confinement Rules</h3>
              <div className="confinement-rules">
                <div className="rule-item">
                  <div className="rule-visual">
                    <div className="mini-quark" style={{ background: '#ef4444' }}>R</div>
                    <div className="mini-quark" style={{ background: '#22c55e' }}>G</div>
                    <div className="mini-quark" style={{ background: '#3b82f6' }}>B</div>
                    <span className="rule-arrow">→</span>
                    <span className="rule-result">⚪ Baryon</span>
                  </div>
                  <p className="rule-desc">Three quarks with RGB colors</p>
                </div>
                <div className="rule-item">
                  <div className="rule-visual">
                    <div className="mini-quark" style={{ background: '#ef4444' }}>R</div>
                    <div className="mini-quark" style={{ background: '#fca5a5' }}>R̄</div>
                    <span className="rule-arrow">→</span>
                    <span className="rule-result">⚪ Meson</span>
                  </div>
                  <p className="rule-desc">Quark + antiquark (color + anticolor)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HadronLab
