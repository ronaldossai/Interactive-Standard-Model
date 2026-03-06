import { Particle } from './Particle'
import { QUARK_DATA } from '../../data/particleData'

const QuarkGroup = () => {
  return (
    <group>
      {/* Render all quarks */}
      {QUARK_DATA.map((quark) => (
        <Particle key={quark.id} data={quark} geometry="sphere" />
      ))}
    </group>
  )
}

export default QuarkGroup