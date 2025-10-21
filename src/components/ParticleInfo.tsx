import { useState } from 'react'

interface ParticleData {
  name: string
  type: 'quark' | 'lepton' | 'boson'
  mass: string
  charge: string
  spin: string
  description: string
}

const ParticleInfo = () => {
  const [selectedParticle] = useState<ParticleData | null>(null)

  const defaultInfo: ParticleData = {
    name: "Standard Model",
    type: "boson",
    mass: "Various",
    charge: "Various", 
    spin: "Various",
    description: "The Standard Model describes three of the four fundamental forces and classifies all known elementary particles. Click on a particle to learn more about its properties."
  }

  const currentParticle = selectedParticle || defaultInfo

  return (
    <div className="particle-info">
      <h2>{currentParticle.name}</h2>
      <div className="particle-properties">
        <div className="property">
          <label>Type:</label>
          <span className={`particle-type ${currentParticle.type}`}>
            {currentParticle.type.charAt(0).toUpperCase() + currentParticle.type.slice(1)}
          </span>
        </div>
        <div className="property">
          <label>Mass:</label>
          <span>{currentParticle.mass}</span>
        </div>
        <div className="property">
          <label>Charge:</label>
          <span>{currentParticle.charge}</span>
        </div>
        <div className="property">
          <label>Spin:</label>
          <span>{currentParticle.spin}</span>
        </div>
      </div>
      <div className="particle-description">
        <p>{currentParticle.description}</p>
      </div>
      
      <div className="controls">
        <h3>Visualization Controls</h3>
        <div className="control-group">
          <label>
            <input type="checkbox" defaultChecked />
            Show Force Fields
          </label>
          <label>
            <input type="checkbox" defaultChecked />
            Show Particle Interactions
          </label>
          <label>
            <input type="checkbox" />
            Animate Particles
          </label>
        </div>
      </div>
    </div>
  )
}

export default ParticleInfo