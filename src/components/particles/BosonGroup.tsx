import { Particle } from './Particle'
import { BOSON_DATA } from '../../data/particleData'

const BosonGroup = () => {
  // Map boson IDs to their geometries
  const geometryMap: Record<string, 'sphere' | 'box' | 'octahedron' | 'icosahedron'> = {
    'photon': 'icosahedron',
    'gluon': 'octahedron',
    'w-boson': 'box',
    'z-boson': 'box',
    'higgs': 'sphere',
  }

  return (
    <group>
      {/* Render all bosons */}
      {BOSON_DATA.map((boson) => (
        <Particle
          key={boson.id}
          data={boson}
          geometry={geometryMap[boson.id] || 'sphere'}
          scale={1.1}
        />
      ))}
    </group>
  )
}

export default BosonGroup