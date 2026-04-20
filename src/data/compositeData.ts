// Composite (hadron) particle data for the layman composite viewer.
// Each entry lists:
//   quarks      — particle IDs from particleData (used to filter which hadrons
//                 appear when a given quark is selected)
//   quarkSymbols — display symbols, may include antiquark notation (ū, d̄, …)
//   quarkColors  — hex values that MUST stay in sync with particleData colors
//                  so the SVG diagram visually matches the 3‑D scene

export interface CompositeData {
  id: string
  name: string
  symbol: string
  /** Quark particle IDs present in this hadron (antiquarks listed by their matter counterpart) */
  quarks: string[]
  /** Human-readable quark symbols for the diagram, in the same order as `quarks` */
  quarkSymbols: string[]
  /** Hex colours matching those quark IDs in particleData.ts */
  quarkColors: string[]
  mass: string
  charge: string
  category: 'baryon' | 'meson'
  description: string
}

export const COMPOSITE_DATA: CompositeData[] = [
  // ── Baryons ──────────────────────────────────────────────────────────────
  {
    id: 'proton',
    name: 'Proton',
    symbol: 'p',
    quarks: ['up', 'up', 'down'],
    quarkSymbols: ['u', 'u', 'd'],
    quarkColors: ['#ff6b6b', '#ff6b6b', '#4ecdc4'],
    mass: '938.3 MeV/c²',
    charge: '+1',
    category: 'baryon',
    description:
      'Two up quarks and one down quark held together by gluons. The proton is the nucleus of a hydrogen atom and is stable — it has never been observed to decay.',
  },
  {
    id: 'neutron',
    name: 'Neutron',
    symbol: 'n',
    quarks: ['up', 'down', 'down'],
    quarkSymbols: ['u', 'd', 'd'],
    quarkColors: ['#ff6b6b', '#4ecdc4', '#4ecdc4'],
    mass: '939.6 MeV/c²',
    charge: '0',
    category: 'baryon',
    description:
      'One up quark and two down quarks. Free neutrons decay in ~15 minutes, but inside a stable nucleus the protons and neutrons keep each other intact.',
  },
  {
    id: 'delta-plus-plus',
    name: 'Delta⁺⁺',
    symbol: 'Δ⁺⁺',
    quarks: ['up', 'up', 'up'],
    quarkSymbols: ['u', 'u', 'u'],
    quarkColors: ['#ff6b6b', '#ff6b6b', '#ff6b6b'],
    mass: '1232 MeV/c²',
    charge: '+2',
    category: 'baryon',
    description:
      'Three up quarks — the only known hadron with charge +2. It is extremely short-lived (~6×10⁻²⁴ s), decaying almost instantly into a proton and a pion.',
  },
  {
    id: 'lambda',
    name: 'Lambda',
    symbol: 'Λ⁰',
    quarks: ['up', 'down', 'strange'],
    quarkSymbols: ['u', 'd', 's'],
    quarkColors: ['#ff6b6b', '#4ecdc4', '#96ceb4'],
    mass: '1115.7 MeV/c²',
    charge: '0',
    category: 'baryon',
    description:
      'Contains one strange quark alongside an up and a down. The "strangeness" makes it heavier and gives it a longer lifetime than most unstable hadrons (~2.6×10⁻¹⁰ s).',
  },

  // ── Mesons ────────────────────────────────────────────────────────────────
  {
    id: 'pion-plus',
    name: 'Pion⁺',
    symbol: 'π⁺',
    quarks: ['up', 'down'],
    quarkSymbols: ['u', 'd̄'],
    quarkColors: ['#ff6b6b', '#4ecdc4'],
    mass: '139.6 MeV/c²',
    charge: '+1',
    category: 'meson',
    description:
      'An up quark paired with an anti-down quark. Pions are the lightest mesons and are the main carriers of the residual strong force that holds atomic nuclei together.',
  },
  {
    id: 'pion-minus',
    name: 'Pion⁻',
    symbol: 'π⁻',
    quarks: ['up', 'down'],
    quarkSymbols: ['ū', 'd'],
    quarkColors: ['#ff6b6b', '#4ecdc4'],
    mass: '139.6 MeV/c²',
    charge: '-1',
    category: 'meson',
    description:
      'An anti-up quark paired with a down quark — the antiparticle of the π⁺. Like all charged pions it decays (~26 ns) predominantly into a muon and a neutrino.',
  },
  {
    id: 'kaon-plus',
    name: 'Kaon⁺',
    symbol: 'K⁺',
    quarks: ['up', 'strange'],
    quarkSymbols: ['u', 's̄'],
    quarkColors: ['#ff6b6b', '#96ceb4'],
    mass: '493.7 MeV/c²',
    charge: '+1',
    category: 'meson',
    description:
      'An up quark and an anti-strange quark. Kaons were the first particles with "strangeness" ever observed and played a crucial role in the development of the quark model.',
  },
  {
    id: 'd-meson-plus',
    name: 'D Meson⁺',
    symbol: 'D⁺',
    quarks: ['charm', 'down'],
    quarkSymbols: ['c', 'd̄'],
    quarkColors: ['#45b7d1', '#4ecdc4'],
    mass: '1869.7 MeV/c²',
    charge: '+1',
    category: 'meson',
    description:
      'A charm quark and an anti-down quark. D mesons were the first particles confirmed to contain a charm quark, discovered in 1976 and known as the "November Revolution" aftermath.',
  },
]
