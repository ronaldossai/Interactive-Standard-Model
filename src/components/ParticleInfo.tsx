import { useParticle } from '../context/ParticleContext'
import { toAntimatter } from '../data/particleData'

const ParticleInfo = () => {
  const { selectedParticle, hoveredParticle, isZoomedIn, zoomOut, showAntimatter, toggleAntimatter, addToComparison, comparisonParticles, clearComparison } = useParticle()

  // Priority: selected > hovered > default
  const rawParticle = selectedParticle || hoveredParticle
  
  // Apply antimatter transformation if enabled
  const displayParticle = rawParticle && showAntimatter 
    ? toAntimatter(rawParticle) 
    : rawParticle

  const defaultInfo = {
    name: "STANDARD MODEL",
    type: "overview" as const,
    mass: "—",
    charge: "—", 
    spin: "—",
    description: "The Standard Model describes three of the four fundamental forces and classifies all known elementary particles. Click on any particle to explore its properties in detail.",
  }

  const currentInfo = displayParticle || defaultInfo

  const handleAddToComparison = () => {
    if (displayParticle) {
      addToComparison(displayParticle)
    }
  }

  // Check if current particle is already in comparison (match by id regardless of matter/antimatter)
  const isInComparison = rawParticle && comparisonParticles.some(p => p?.id === rawParticle.id) || false
  const comparisonCount = comparisonParticles.filter(p => p !== null).length

  return (
    <div className="particle-info">
      {/* Antimatter Toggle */}
      <div className="antimatter-toggle">
        <span className="toggle-label">Matter</span>
        <button 
          className={`toggle-switch ${showAntimatter ? 'active' : ''}`}
          onClick={toggleAntimatter}
          aria-label="Toggle antimatter view"
        >
          <span className="toggle-slider" />
        </button>
        <span className="toggle-label">Antimatter</span>
      </div>

      {isZoomedIn && (
        <button className="back-button" onClick={zoomOut}>
          ← Back to Overview
        </button>
      )}

      {displayParticle && (
        <button 
          className="compare-button" 
          onClick={handleAddToComparison}
          disabled={isInComparison}
        >
          {isInComparison 
            ? '✓ Added to Comparison' 
            : comparisonCount === 0 
              ? 'Add to Comparison' 
              : `Compare with ${comparisonParticles[0]?.name}`
          }
        </button>
      )}

      {comparisonCount > 0 && (
        <button 
          className="clear-comparison-button" 
          onClick={clearComparison}
        >
          🗑️ Clear Comparison ({comparisonCount})
        </button>
      )}
      
      <h2>{currentInfo.name}</h2>
      
      <div className="particle-properties">
        <div className="property">
          <label>Type:</label>
          <span className={`particle-type ${currentInfo.type}`}>
            {currentInfo.type.charAt(0).toUpperCase() + currentInfo.type.slice(1)}
          </span>
        </div>
        {displayParticle && (
          <>
            <div className="property">
              <label>Symbol:</label>
              <span className="particle-symbol">{displayParticle.symbol}</span>
            </div>
            <div className="property">
              <label>Mass:</label>
              <span>{displayParticle.mass}</span>
            </div>
            <div className="property">
              <label>Charge:</label>
              <span>{displayParticle.charge}</span>
            </div>
            <div className="property">
              <label>Spin:</label>
              <span>{displayParticle.spin}</span>
            </div>
            {displayParticle.generation && (
              <div className="property">
                <label>Generation:</label>
                <span>{displayParticle.generation}</span>
              </div>
            )}
            {displayParticle.lifetime && (
              <div className="property">
                <label>Lifetime:</label>
                <span>{displayParticle.lifetime}</span>
              </div>
            )}
            {displayParticle.discovered && (
              <div className="property">
                <label>Discovered:</label>
                <span>{displayParticle.discovered}</span>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="particle-description">
        <p>{currentInfo.description}</p>
      </div>
      
      {displayParticle?.interactions && (
        <div className="particle-interactions">
          <h3>Interactions</h3>
          <div className="interaction-tags">
            {displayParticle.interactions.map((interaction) => (
              <span key={interaction} className={`interaction-tag ${interaction.toLowerCase().replace(' ', '-')}`}>
                {interaction}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {!displayParticle && (
        <div className="instructions">
          <h3>How to Use</h3>
          <ul>
            <li>Hover over particles to see their names</li>
            <li>Click on a particle to zoom in and explore</li>
            <li>Click "Back to Overview" to return</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ParticleInfo