import { Vector3 } from 'three'
import type { ParticleData } from '../types/particle'

// Standard Model grid layout:
// Columns: Generation I, II, III, Gauge Bosons (+ Higgs)
// Rows: Up-type quarks, Down-type quarks, Charged leptons, Neutrinos

export const COL_SPACING = 2.5
export const ROW_SPACING = 2.5
export const GRID_START_X = -6.0
export const GRID_START_Y = 4.15

// Extra vertical gap between quarks and leptons
export const SECTION_GAP = 0.8

export const QUARK_DATA: ParticleData[] = [
  // Generation I
  {
    id: 'up',
    name: 'UP QUARK',
    symbol: 'u',
    type: 'quark',
    mass: '2.2 MeV/c²',
    charge: '+2/3',
    spin: '1/2',
    color: '#ff6b6b',
    generation: 1,
    position: new Vector3(GRID_START_X, GRID_START_Y, 0),
    description: 'The up quark is the lightest quark. Protons contain two up quarks and one down quark, while neutrons contain one up and two down quarks.',
    interactions: ['Strong', 'Weak', 'Electromagnetic'],
    discovered: '1968 (SLAC)',
    lifetime: 'Stable',
  },
  {
    id: 'down',
    name: 'DOWN QUARK',
    symbol: 'd',
    type: 'quark',
    mass: '4.7 MeV/c²',
    charge: '-1/3',
    spin: '1/2',
    color: '#4ecdc4',
    generation: 1,
    position: new Vector3(GRID_START_X, GRID_START_Y - ROW_SPACING, 0),
    description: 'The down quark is the second-lightest quark. Along with the up quark, it forms the building blocks of protons and neutrons.',
    interactions: ['Strong', 'Weak', 'Electromagnetic'],
    discovered: '1968 (SLAC)',
    lifetime: 'Stable',
  },
  // Generation II
  {
    id: 'charm',
    name: 'CHARM QUARK',
    symbol: 'c',
    type: 'quark',
    mass: '1.27 GeV/c²',
    charge: '+2/3',
    spin: '1/2',
    color: '#45b7d1',
    generation: 2,
    position: new Vector3(GRID_START_X + COL_SPACING, GRID_START_Y, 0),
    description: 'The charm quark is a second-generation quark with a relatively large mass. Its discovery in 1974 confirmed the quark model.',
    interactions: ['Strong', 'Weak', 'Electromagnetic'],
    discovered: '1974 (November Revolution)',
    lifetime: '~10⁻¹² s',
  },
  {
    id: 'strange',
    name: 'STRANGE QUARK',
    symbol: 's',
    type: 'quark',
    mass: '95 MeV/c²',
    charge: '-1/3',
    spin: '1/2',
    color: '#96ceb4',
    generation: 2,
    position: new Vector3(GRID_START_X + COL_SPACING, GRID_START_Y - ROW_SPACING, 0),
    description: 'The strange quark was the first quark to be theorized. It gives "strangeness" to particles like kaons.',
    interactions: ['Strong', 'Weak', 'Electromagnetic'],
    discovered: '1968',
    lifetime: '~10⁻¹⁰ s',
  },
  // Generation III
  {
    id: 'top',
    name: 'TOP QUARK',
    symbol: 't',
    type: 'quark',
    mass: '173 GeV/c²',
    charge: '+2/3',
    spin: '1/2',
    color: '#feca57',
    generation: 3,
    position: new Vector3(GRID_START_X + COL_SPACING * 2, GRID_START_Y, 0),
    description: 'The top quark is the heaviest known elementary particle, with a mass similar to a gold atom. It decays before forming hadrons.',
    interactions: ['Strong', 'Weak', 'Electromagnetic'],
    discovered: '1995 (Fermilab)',
    lifetime: '~5×10⁻²⁵ s',
  },
  {
    id: 'bottom',
    name: 'BOTTOM QUARK',
    symbol: 'b',
    type: 'quark',
    mass: '4.18 GeV/c²',
    charge: '-1/3',
    spin: '1/2',
    color: '#ff9ff3',
    generation: 3,
    position: new Vector3(GRID_START_X + COL_SPACING * 2, GRID_START_Y - ROW_SPACING, 0),
    description: 'The bottom quark (also called beauty quark) is important for studying CP violation and matter-antimatter asymmetry.',
    interactions: ['Strong', 'Weak', 'Electromagnetic'],
    discovered: '1977 (Fermilab)',
    lifetime: '~10⁻¹² s',
  },
]

export const LEPTON_DATA: ParticleData[] = [
  // Generation I
  {
    id: 'electron',
    name: 'ELECTRON',
    symbol: 'e',
    type: 'lepton',
    mass: '0.511 MeV/c²',
    charge: '-1',
    spin: '1/2',
    color: '#07ff6e',
    generation: 1,
    position: new Vector3(GRID_START_X, GRID_START_Y - ROW_SPACING * 2 - SECTION_GAP, 0),
    description: 'The electron is the lightest charged lepton and is essential for chemistry and electronics. It orbits atomic nuclei.',
    interactions: ['Weak', 'Electromagnetic'],
    discovered: '1897 (J.J. Thomson)',
    lifetime: 'Stable (>6.6×10²⁸ years)',
  },
  {
    id: 'electron-neutrino',
    name: 'ELECTRON NEUTRINO',
    symbol: 'νe',
    type: 'lepton',
    mass: '<1.0 eV/c²',
    charge: '0',
    spin: '1/2',
    color: '#f39c12',
    generation: 1,
    position: new Vector3(GRID_START_X, GRID_START_Y - ROW_SPACING * 3 - SECTION_GAP, 0),
    description: 'The electron neutrino is produced in beta decay and nuclear reactions in the Sun. Trillions pass through you every second.',
    interactions: ['Weak'],
    discovered: '1956 (Cowan-Reines)',
    lifetime: 'Stable',
  },
  // Generation II
  {
    id: 'muon',
    name: 'MUON',
    symbol: 'μ',
    type: 'lepton',
    mass: '105.7 MeV/c²',
    charge: '-1',
    spin: '1/2',
    color: '#9b59b6',
    generation: 2,
    position: new Vector3(GRID_START_X + COL_SPACING, GRID_START_Y - ROW_SPACING * 2 - SECTION_GAP, 0),
    description: 'The muon is like a heavy electron. Created in cosmic ray showers, they reach Earth\'s surface despite their short lifetime due to time dilation.',
    interactions: ['Weak', 'Electromagnetic'],
    discovered: '1936 (Anderson & Neddermeyer)',
    lifetime: '2.2 μs',
  },
  {
    id: 'muon-neutrino',
    name: 'MUON NEUTRINO',
    symbol: 'νμ',
    type: 'lepton',
    mass: '<0.17 MeV/c²',
    charge: '0',
    spin: '1/2',
    color: '#3498db',
    generation: 2,
    position: new Vector3(GRID_START_X + COL_SPACING, GRID_START_Y - ROW_SPACING * 3 - SECTION_GAP, 0),
    description: 'The muon neutrino is produced in pion decay. It was the second type of neutrino discovered.',
    interactions: ['Weak'],
    discovered: '1962 (Brookhaven)',
    lifetime: 'Stable',
  },
  // Generation III
  {
    id: 'tau',
    name: 'TAU',
    symbol: 'τ',
    type: 'lepton',
    mass: '1.777 GeV/c²',
    charge: '-1',
    spin: '1/2',
    color: '#5f2d27',
    generation: 3,
    position: new Vector3(GRID_START_X + COL_SPACING * 2, GRID_START_Y - ROW_SPACING * 2 - SECTION_GAP, 0),
    description: 'The tau is the heaviest lepton, about 3,500 times more massive than the electron. It can decay into hadrons.',
    interactions: ['Weak', 'Electromagnetic'],
    discovered: '1975 (SLAC)',
    lifetime: '2.9×10⁻¹³ s',
  },
  {
    id: 'tau-neutrino',
    name: 'TAU NEUTRINO',
    symbol: 'ντ',
    type: 'lepton',
    mass: '<18.2 MeV/c²',
    charge: '0',
    spin: '1/2',
    color: '#1abc9c',
    generation: 3,
    position: new Vector3(GRID_START_X + COL_SPACING * 2, GRID_START_Y - ROW_SPACING * 3 - SECTION_GAP, 0),
    description: 'The tau neutrino is the most recently discovered lepton. It was directly observed in 2000 at Fermilab.',
    interactions: ['Weak'],
    discovered: '2000 (Fermilab DONUT)',
    lifetime: 'Stable',
  },
]

export const BOSON_DATA: ParticleData[] = [
  {
    id: 'photon',
    name: 'PHOTON',
    symbol: 'γ',
    type: 'boson',
    mass: '0',
    charge: '0',
    spin: '1',
    color: '#ffeb3b',
    position: new Vector3(GRID_START_X + COL_SPACING * 3.5, GRID_START_Y, 0),
    description: 'The photon is the force carrier of electromagnetism. It is massless and travels at the speed of light. (Fun fact: photons are their own antiparticles along with the other bosons!)',
    interactions: ['Electromagnetic'],
    discovered: '1905 (Einstein)',
    lifetime: 'Stable',
  },
  {
    id: 'gluon',
    name: 'GLUON',
    symbol: 'g',
    type: 'boson',
    mass: '0',
    charge: '0',
    spin: '1',
    color: '#f44336',
    position: new Vector3(GRID_START_X + COL_SPACING * 3.5, GRID_START_Y - ROW_SPACING, 0),
    description: 'Gluons carry the strong force between quarks. They carry color charge themselves and can interact with each other.',
    interactions: ['Strong'],
    discovered: '1979 (DESY)',
    lifetime: 'N/A (confined)',
  },
  {
    id: 'w-boson',
    name: 'W BOSON',
    symbol: 'W±',
    type: 'boson',
    mass: '80.4 GeV/c²',
    charge: '±1',
    spin: '1',
    color: '#2196f3',
    position: new Vector3(GRID_START_X + COL_SPACING * 3.5, GRID_START_Y - ROW_SPACING * 2 - SECTION_GAP, 0),
    description: 'The W boson mediates the weak force and is responsible for beta decay. It comes in W⁺ and W⁻ varieties.',
    interactions: ['Weak'],
    discovered: '1983 (CERN)',
    lifetime: '3×10⁻²⁵ s',
  },
  {
    id: 'z-boson',
    name: 'Z BOSON',
    symbol: 'Z',
    type: 'boson',
    mass: '91.2 GeV/c²',
    charge: '0',
    spin: '1',
    color: '#3f51b5',
    position: new Vector3(GRID_START_X + COL_SPACING * 3.5, GRID_START_Y - ROW_SPACING * 3 - SECTION_GAP, 0),
    description: 'The Z boson is the neutral carrier of the weak force. It mediates neutral current interactions.',
    interactions: ['Weak'],
    discovered: '1983 (CERN)',
    lifetime: '3×10⁻²⁵ s',
  },
  {
    id: 'higgs',
    name: 'HIGGS BOSON',
    symbol: 'H',
    type: 'boson',
    mass: '125 GeV/c²',
    charge: '0',
    spin: '0',
    color: '#9c27b0',
    position: new Vector3(GRID_START_X + COL_SPACING * 4.8, GRID_START_Y - ROW_SPACING * 1.5 - SECTION_GAP * 0.5, 0),
    description: 'The Higgs boson is a manifestation of the Higgs field, which gives mass to fundamental particles through the Higgs mechanism.',
    interactions: ['Higgs field'],
    discovered: '2012 (CERN LHC)',
    lifetime: '1.6×10⁻²² s',
  },
]

export const ALL_PARTICLES = [...QUARK_DATA, ...LEPTON_DATA, ...BOSON_DATA]

// Antimatter transformation utilities
const ANTIMATTER_NAMES: Record<string, string> = {
  // Quarks
  'Up Quark': 'Anti-Up Quark',
  'Down Quark': 'Anti-Down Quark',
  'Charm Quark': 'Anti-Charm Quark',
  'Strange Quark': 'Anti-Strange Quark',
  'Top Quark': 'Anti-Top Quark',
  'Bottom Quark': 'Anti-Bottom Quark',
  // Leptons
  'Electron': 'Positron',
  'Muon': 'Antimuon',
  'Tau': 'Antitau',
  'Electron Neutrino': 'Electron Antineutrino',
  'Muon Neutrino': 'Muon Antineutrino',
  'Tau Neutrino': 'Tau Antineutrino',
}

const ANTIMATTER_SYMBOLS: Record<string, string> = {
  // Quarks (with overbar)
  'u': 'ū',
  'd': 'd̄',
  'c': 'c̄',
  's': 's̄',
  't': 't̄',
  'b': 'b̄',
  // Leptons (using standard notation)
  'e': 'e+',
  'μ': 'μ+',
  'τ': 'τ+',
  'νe': 'v̄e',
  'νμ': 'v̄μ',
  'ντ': 'v̄τ',
}

// Flip the sign of a charge string
const flipCharge = (charge: string): string => {
  if (charge === '0' || charge === '±1') return charge
  if (charge.startsWith('+')) return charge.replace('+', '-')
  if (charge.startsWith('-')) return charge.replace('-', '+')
  return charge
}

// Transform a particle to its antiparticle equivalent
export const toAntimatter = (particle: ParticleData): ParticleData => {
  // Bosons are their own antiparticles (except W which is already shown as ±)
  if (particle.type === 'boson') {
    return particle
  }

  return {
    ...particle,
    name: ANTIMATTER_NAMES[particle.name] || `Anti-${particle.name}`,
    symbol: ANTIMATTER_SYMBOLS[particle.symbol] || particle.symbol,
    charge: flipCharge(particle.charge),
  }
}

