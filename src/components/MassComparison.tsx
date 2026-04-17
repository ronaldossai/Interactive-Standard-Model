import { useParticle } from '../context/ParticleContext'
import { toAntimatter } from '../data/particleData'

const MassComparison = () => {
  const { comparisonParticles, clearComparison, showAntimatter } = useParticle()
  
  const [particle1Raw, particle2Raw] = comparisonParticles
  
  // Apply antimatter transformation if enabled
  const particle1 = particle1Raw && showAntimatter ? toAntimatter(particle1Raw) : particle1Raw
  const particle2 = particle2Raw && showAntimatter ? toAntimatter(particle2Raw) : particle2Raw

  // Don't render if we don't have both particles
  if (!particle1 || !particle2) return null

  // Parse mass values (remove units like MeV, GeV, etc.)
  const parseMass = (massStr: string): number => {
    const match = massStr.match(/([\d.]+)\s*([A-Za-z\/]+)/)
    if (!match) return 0
    
    const value = parseFloat(match[1])
    const unit = match[2].toLowerCase()
    
    // Convert to MeV for comparison
    if (unit.includes('gev')) return value * 1000
    if (unit.includes('tev')) return value * 1000000
    if (unit.includes('mev')) return value
    return value
  }

  const mass1 = parseMass(particle1.mass)
  const mass2 = parseMass(particle2.mass)

  const bothMassless = mass1 === 0 && mass2 === 0
  const oneMassless = (mass1 === 0) !== (mass2 === 0)

  // Calculate ratio (heavier / lighter)
  const ratio = mass1 > mass2 ? mass1 / mass2 : mass2 / mass1
  const heavierParticle = mass1 >= mass2 ? particle1 : particle2
  const lighterParticle = mass1 >= mass2 ? particle2 : particle1
  const masslessParticle = mass1 === 0 ? particle1 : particle2

  // Format ratio with order-of-magnitude context
  const formatRatio = (r: number): string => {
    if (r >= 1e9) return `${(r / 1e9).toFixed(1)}B×`
    if (r >= 1e6) return `${(r / 1e6).toFixed(1)}M×`
    if (r >= 1e3) return `${(r / 1e3).toFixed(1)}k×`
    if (r >= 100) return `${r.toFixed(0)}×`
    if (r >= 10) return `${r.toFixed(1)}×`
    return `${r.toFixed(2)}×`
  }

  const getRatioLabel = (): string => {
    if (bothMassless) return 'Both massless'
    if (oneMassless) return 'Massless'
    return formatRatio(ratio)
  }

  const getRatioSubtext = (): { line1: string; line2: string } => {
    if (bothMassless) return {
      line1: 'Both particles are massless.',
      line2: 'They travel at the speed of light.'
    }
    if (oneMassless) return {
      line1: `${masslessParticle.name} carries no rest mass —`,
      line2: 'no numerical ratio exists.'
    }
    return {
      line1: `${heavierParticle.name} is`,
      line2: `heavier than ${lighterParticle.name}`
    }
  }

  const { line1, line2 } = getRatioSubtext()

  // Convert mass to different units
  const convertMass = (massInMeV: number) => {
    const kg = massInMeV * 1.783e-30 // MeV to kg conversion
    const energy = massInMeV // E=mc², energy in MeV
    
    return {
      MeV: massInMeV.toExponential(3),
      GeV: (massInMeV / 1000).toExponential(3),
      kg: kg.toExponential(3),
      energy: energy.toExponential(3)
    }
  }

  const mass1Units = convertMass(mass1)
  const mass2Units = convertMass(mass2)

  return (
    <div className="mass-comparison-overlay">
      <div className="mass-comparison-container">
        <div className="comparison-header">
          <h2>Mass Comparison</h2>
          <button className="close-comparison" onClick={clearComparison}>
            ✕
          </button>
        </div>

        <div className="comparison-particles">
          {/* Particle 1 */}
          <div className="comparison-particle">
            <div 
              className="comparison-particle-sphere" 
              style={{ background: particle1.color }}
            />
            <h3>{particle1.name}</h3>
            <div className="comparison-symbol">{particle1.symbol}</div>
            <div className="comparison-type">{particle1.type}</div>
            
            <div className="mass-details">
              <div className="mass-row">
                <span className="mass-label">Mass:</span>
                <span className="mass-value">{particle1.mass}</span>
              </div>
              <div className="mass-row secondary">
                <span className="mass-label">Energy:</span>
                <span className="mass-value">{mass1Units.energy} MeV</span>
              </div>
              <div className="mass-row secondary">
                <span className="mass-label">SI Units:</span>
                <span className="mass-value">{mass1Units.kg} kg</span>
              </div>
            </div>
          </div>

          {/* Ratio Display */}
          <div className="comparison-ratio">
            <div className="ratio-symbol">⚖️</div>
            <div className="ratio-number">{getRatioLabel()}</div>
            <div className="ratio-text">{line1}</div>
            <div className="ratio-text"><strong>{line2}</strong></div>
          </div>

          {/* Particle 2 */}
          <div className="comparison-particle">
            <div 
              className="comparison-particle-sphere" 
              style={{ background: particle2.color }}
            />
            <h3>{particle2.name}</h3>
            <div className="comparison-symbol">{particle2.symbol}</div>
            <div className="comparison-type">{particle2.type}</div>
            
            <div className="mass-details">
              <div className="mass-row">
                <span className="mass-label">Mass:</span>
                <span className="mass-value">{particle2.mass}</span>
              </div>
              <div className="mass-row secondary">
                <span className="mass-label">Energy:</span>
                <span className="mass-value">{mass2Units.energy} MeV</span>
              </div>
              <div className="mass-row secondary">
                <span className="mass-label">SI Units:</span>
                <span className="mass-value">{mass2Units.kg} kg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="comparison-footer">
          <p className="comparison-note">
            <strong>E=mc²:</strong> The energy equivalent of a particle's mass. 
            Particle masses are often expressed in MeV/c² or GeV/c² (energy units) 
            because E=mc² makes energy and mass interchangeable.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MassComparison
