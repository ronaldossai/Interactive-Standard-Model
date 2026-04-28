/**
 * decayData.ts
 *
 * Tree-level decay modes for all unstable Standard Model particles.
 * Only the dominant / most pedagogically interesting modes are listed —
 * the same EFT philosophy as the Feynman diagram viewer: show the
 * leading contribution, not the full branching-ratio table.
 *
 * Stable particles (electron, up, down, photon, gluon, neutrinos, proton)
 * have no entry — their absence is the signal.
 *
 * Product colours are kept in sync with particleData.ts so the animation
 * circles visually match the 3-D scene.
 */

export interface DecayProduct {
  symbol: string
  label: string        // short name for the animation label
  color: string        // hex, matching particleData
  isAnti?: boolean     // render with overbar styling
}

export interface DecayMode {
  id: string
  branchingRatio: string   // e.g. "~100%", "17.4%", "dominant"
  products: DecayProduct[]
  caption: string          // one plain-English sentence
}

export interface DecayInfo {
  particleId: string
  modes: DecayMode[]
  /** Short note explaining why this particle decays */
  whyItDecays: string
}

// ── Colour palette (mirrors particleData.ts exactly) ─────────────────────────
const C = {
  up:              '#ff6b6b',
  down:            '#4ecdc4',
  charm:           '#45b7d1',
  strange:         '#96ceb4',
  bottom:          '#ff9ff3',
  electron:        '#07ff6e',
  muon:            '#9b59b6',
  tau:             '#5f2d27',
  electronNeutrino:'#f39c12',
  muonNeutrino:    '#3498db',
  tauNeutrino:     '#1abc9c',
  photon:          '#ffeb3b',
  wBoson:          '#2196f3',
  zBoson:          '#3f51b5',
  higgs:           '#9c27b0',
  pion:            '#ff8c42',   // no 3-D particle, use warm orange
  proton:          '#e74c3c',   // composite — red
  neutron:         '#bdc3c7',   // composite — grey
}

// ── Decay table ───────────────────────────────────────────────────────────────

export const DECAY_DATA: DecayInfo[] = [

  // ── QUARKS ────────────────────────────────────────────────────────────────

  {
    particleId: 'top',
    whyItDecays: 'The top quark is so massive it decays before it can form a bound hadron — the only quark to do this.',
    modes: [
      {
        id: 'top-wb',
        branchingRatio: '~100%',
        products: [
          { symbol: 'W⁺', label: 'W⁺', color: C.wBoson },
          { symbol: 'b',  label: 'b',  color: C.bottom },
        ],
        caption: 'Top quark decays almost exclusively into a W⁺ boson and a bottom quark.',
      },
    ],
  },

  {
    particleId: 'bottom',
    whyItDecays: 'The bottom quark is heavy enough to decay weakly, changing into a charm quark via W boson emission.',
    modes: [
      {
        id: 'bottom-cw',
        branchingRatio: 'dominant',
        products: [
          { symbol: 'W⁻', label: 'W⁻', color: C.wBoson },
          { symbol: 'c',  label: 'c',  color: C.charm },
        ],
        caption: 'Bottom quark emits a W⁻ and becomes a charm quark (flavour-changing weak decay).',
      },
    ],
  },

  {
    particleId: 'charm',
    whyItDecays: 'The charm quark decays weakly, producing a strange quark and a virtual W boson.',
    modes: [
      {
        id: 'charm-sw',
        branchingRatio: 'dominant',
        products: [
          { symbol: 'W⁺', label: 'W⁺', color: C.wBoson },
          { symbol: 's',  label: 's',  color: C.strange },
        ],
        caption: 'Charm quark emits a W⁺ and becomes a strange quark.',
      },
    ],
  },

  {
    particleId: 'strange',
    whyItDecays: 'The strange quark is the lightest quark that can decay — it converts into an up quark via the weak force.',
    modes: [
      {
        id: 'strange-uw',
        branchingRatio: 'dominant',
        products: [
          { symbol: 'W⁻', label: 'W⁻', color: C.wBoson },
          { symbol: 'u',  label: 'u',  color: C.up },
        ],
        caption: 'Strange quark emits a W⁻ and converts into an up quark.',
      },
    ],
  },

  // ── LEPTONS ───────────────────────────────────────────────────────────────

  {
    particleId: 'muon',
    whyItDecays: 'The muon is 207× heavier than the electron, giving it enough mass to decay via the weak force.',
    modes: [
      {
        id: 'muon-decay',
        branchingRatio: '~100%',
        products: [
          { symbol: 'e⁻',  label: 'e⁻',  color: C.electron },
          { symbol: 'ν̄e', label: 'ν̄e', color: C.electronNeutrino, isAnti: true },
          { symbol: 'νμ',  label: 'νμ',  color: C.muonNeutrino },
        ],
        caption: 'The muon decays into an electron, an electron antineutrino, and a muon neutrino.',
      },
    ],
  },

  {
    particleId: 'tau',
    whyItDecays: 'The tau is the heaviest lepton — heavy enough to decay into hadrons as well as lighter leptons.',
    modes: [
      {
        id: 'tau-leptonic',
        branchingRatio: '35%',
        products: [
          { symbol: 'e⁻',  label: 'e⁻',  color: C.electron },
          { symbol: 'ν̄e', label: 'ν̄e', color: C.electronNeutrino, isAnti: true },
          { symbol: 'ντ',  label: 'ντ',  color: C.tauNeutrino },
        ],
        caption: 'Leptonic decay: tau → electron + electron antineutrino + tau neutrino.',
      },
      {
        id: 'tau-hadronic',
        branchingRatio: '65%',
        products: [
          { symbol: 'π⁻', label: 'π⁻', color: C.pion },
          { symbol: 'ντ', label: 'ντ', color: C.tauNeutrino },
        ],
        caption: 'Hadronic decay: tau → pion + tau neutrino (most common single channel).',
      },
    ],
  },

  // ── BOSONS ────────────────────────────────────────────────────────────────

  {
    particleId: 'w-boson',
    whyItDecays: 'The W boson is massive — it must decay almost instantly into lighter fermions.',
    modes: [
      {
        id: 'w-leptonic',
        branchingRatio: '~33%',
        products: [
          { symbol: 'e⁻',  label: 'e⁻',  color: C.electron },
          { symbol: 'ν̄e', label: 'ν̄e', color: C.electronNeutrino, isAnti: true },
        ],
        caption: 'W⁻ decays leptonically into an electron and an electron antineutrino.',
      },
      {
        id: 'w-hadronic',
        branchingRatio: '~67%',
        products: [
          { symbol: 'u',  label: 'u', color: C.up },
          { symbol: 'd̄', label: 'd̄', color: C.down, isAnti: true },
        ],
        caption: 'W⁻ decays hadronically into a quark–antiquark pair (most likely ud̄).',
      },
    ],
  },

  {
    particleId: 'z-boson',
    whyItDecays: 'Like the W, the Z boson is very massive and decays almost immediately after being produced.',
    modes: [
      {
        id: 'z-ee',
        branchingRatio: '3.4%',
        products: [
          { symbol: 'e⁻', label: 'e⁻', color: C.electron },
          { symbol: 'e⁺', label: 'e⁺', color: C.electron, isAnti: true },
        ],
        caption: 'Z boson decays into an electron–positron pair — the cleanest signal in a detector.',
      },
      {
        id: 'z-qq',
        branchingRatio: '~70%',
        products: [
          { symbol: 'q',  label: 'q',  color: C.up },
          { symbol: 'q̄', label: 'q̄', color: C.down, isAnti: true },
        ],
        caption: 'Z boson decays into a quark–antiquark pair about 70% of the time.',
      },
      {
        id: 'z-nunu',
        branchingRatio: '~20%',
        products: [
          { symbol: 'ν',  label: 'ν',  color: C.muonNeutrino },
          { symbol: 'ν̄', label: 'ν̄', color: C.muonNeutrino, isAnti: true },
        ],
        caption: 'Z boson decays invisibly into a neutrino–antineutrino pair ~20% of the time.',
      },
    ],
  },

  {
    particleId: 'higgs',
    whyItDecays: 'The Higgs couples to mass — heavier particles draw more of its decay probability.',
    modes: [
      {
        id: 'higgs-bb',
        branchingRatio: '~58%',
        products: [
          { symbol: 'b',  label: 'b',  color: C.bottom },
          { symbol: 'b̄', label: 'b̄', color: C.bottom, isAnti: true },
        ],
        caption: 'Higgs most often decays into a bottom quark–antiquark pair.',
      },
      {
        id: 'higgs-ww',
        branchingRatio: '~21%',
        products: [
          { symbol: 'W⁺', label: 'W⁺', color: C.wBoson },
          { symbol: 'W⁻', label: 'W⁻', color: C.wBoson },
        ],
        caption: 'Higgs decays into two W bosons — one of which must be virtual given the mass.',
      },
      {
        id: 'higgs-gg',
        branchingRatio: '~9%',
        products: [
          { symbol: 'g', label: 'g', color: C.photon },
          { symbol: 'g', label: 'g', color: C.photon },
        ],
        caption: 'Higgs → two gluons via a top quark loop — a rare but important loop-level process.',
      },
      {
        id: 'higgs-yy',
        branchingRatio: '~0.23%',
        products: [
          { symbol: 'γ', label: 'γ', color: C.photon },
          { symbol: 'γ', label: 'γ', color: C.photon },
        ],
        caption: 'H → γγ is rare but was the discovery channel at the LHC — clean two-photon signal.',
      },
    ],
  },
]

/** Fast lookup by particle ID */
export function getDecayInfo(particleId: string): DecayInfo | null {
  return DECAY_DATA.find(d => d.particleId === particleId) ?? null
}
