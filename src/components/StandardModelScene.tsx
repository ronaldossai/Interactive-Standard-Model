import { Text, Line } from '@react-three/drei'
import { Vector3 } from 'three'
import QuarkGroup from './particles/QuarkGroup'
import LeptonGroup from './particles/LeptonGroup'
import BosonGroup from './particles/BosonGroup'
import { DetailedParticleView } from './particles/DetailedParticleView'
import { useParticle } from '../context/ParticleContext'
import { COL_SPACING, ROW_SPACING, GRID_START_X, GRID_START_Y, SECTION_GAP } from '../data/particleData'

// Derived positions
const GEN_1_X = GRID_START_X                    // -3.75
const GEN_2_X = GRID_START_X + COL_SPACING       // -1.25
const GEN_3_X = GRID_START_X + COL_SPACING * 2   // 1.25
const BOSON_X = GRID_START_X + COL_SPACING * 3.5  // 5.0

const QUARK_ROW_1 = GRID_START_Y                 // 3.75 (up-type)
const QUARK_ROW_2 = GRID_START_Y - ROW_SPACING   // 1.25 (down-type)
const LEPTON_ROW_1 = GRID_START_Y - ROW_SPACING * 2 - SECTION_GAP  // -1.55 (charged)
const LEPTON_ROW_2 = GRID_START_Y - ROW_SPACING * 3 - SECTION_GAP  // -4.05 (neutrinos)

const HEADER_Y = GRID_START_Y + 1.5              // 5.25
const LABEL_X = GRID_START_X - 2.0               // -5.75

// Horizontal divider between quarks and leptons
const DIVIDER_Y = (QUARK_ROW_2 + LEPTON_ROW_1) / 2  // midpoint

const StandardModelScene = () => {
  const { isZoomedIn } = useParticle()

  return (
    <group>
      {/* Labels & grid structure - only show when not zoomed */}
      {!isZoomedIn && (
        <group>
          {/* === GENERATION COLUMN HEADERS === */}
          <Text position={[GEN_1_X, HEADER_Y, 0]} fontSize={0.22} color="#888888" anchorX="center" anchorY="middle">
            Generation I
          </Text>
          <Text position={[GEN_2_X, HEADER_Y, 0]} fontSize={0.22} color="#888888" anchorX="center" anchorY="middle">
            Generation II
          </Text>
          <Text position={[GEN_3_X, HEADER_Y, 0]} fontSize={0.22} color="#888888" anchorX="center" anchorY="middle">
            Generation III
          </Text>
          <Text position={[BOSON_X, HEADER_Y, 0]} fontSize={0.22} color="#888888" anchorX="center" anchorY="middle">
            Force Carriers
          </Text>
          
          {/* === ROW LABELS (charge) === */}
          <Text position={[LABEL_X, QUARK_ROW_1, 0]} fontSize={0.18} color="#666666" anchorX="right" anchorY="middle">
            +2/3
          </Text>
          <Text position={[LABEL_X, QUARK_ROW_2, 0]} fontSize={0.18} color="#666666" anchorX="right" anchorY="middle">
            -1/3
          </Text>
          <Text position={[LABEL_X, LEPTON_ROW_1, 0]} fontSize={0.18} color="#666666" anchorX="right" anchorY="middle">
            -1
          </Text>
          <Text position={[LABEL_X, LEPTON_ROW_2, 0]} fontSize={0.18} color="#666666" anchorX="right" anchorY="middle">
            0
          </Text>

          {/* === SECTION LABELS (QUARKS / LEPTONS) === */}
          <Text
            position={[LABEL_X - 0.8, (QUARK_ROW_1 + QUARK_ROW_2) / 2, 0]}
            fontSize={0.28}
            color="#ff6b6b"
            anchorX="center"
            anchorY="middle"
            rotation={[0, 0, Math.PI / 2]}
          >
            QUARKS
          </Text>
          <Text
            position={[LABEL_X - 0.8, (LEPTON_ROW_1 + LEPTON_ROW_2) / 2, 0]}
            fontSize={0.28}
            color="#4ecdc4"
            anchorX="center"
            anchorY="middle"
            rotation={[0, 0, Math.PI / 2]}
          >
            LEPTONS
          </Text>

          {/* === HORIZONTAL DIVIDER between quarks & leptons === */}
          <Line
            points={[
              new Vector3(LABEL_X - 1.5, DIVIDER_Y, 0),
              new Vector3(BOSON_X + 1.5, DIVIDER_Y, 0),
            ]}
            color="#444444"
            lineWidth={1}
            transparent
            opacity={0.4}
          />

          {/* === VERTICAL DIVIDER between fermions & bosons === */}
          <Line
            points={[
              new Vector3((GEN_3_X + BOSON_X) / 2, HEADER_Y + 0.6, 0),
              new Vector3((GEN_3_X + BOSON_X) / 2, LEPTON_ROW_2 - 1.2, 0),
            ]}
            color="#444444"
            lineWidth={1}
            transparent
            opacity={0.4}
          />
        </group>
      )}

      {/* Particle groups */}
      <QuarkGroup />
      <LeptonGroup />
      <BosonGroup />

      {/* Detailed view when zoomed into a particle */}
      <DetailedParticleView />

      {/* Grid background - only show when not zoomed */}
      {!isZoomedIn && (
        <mesh position={[0, 0, -1]} rotation={[0, 0, 0]}>
          <planeGeometry args={[22, 14]} />
          <meshBasicMaterial color="#0a1628" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}

export default StandardModelScene