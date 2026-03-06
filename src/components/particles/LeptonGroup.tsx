import { Particle } from './Particle'
import { LEPTON_DATA } from '../../data/particleData'

const LeptonGroup = () => {
  return (
    <group>
      {/* Render all leptons */}
      {LEPTON_DATA.map((lepton) => (
        <Particle key={lepton.id} data={lepton} geometry="sphere" scale={0.9} />
      ))}
    </group>
  )
}

export default LeptonGroup