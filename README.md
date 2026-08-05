# Interactive Standard Model

An interactive 3D visualization of the Standard Model of particle physics, built with Three.js, React, and TypeScript. Click any particle to explore its properties, then open a dedicated "Lab" to interact with the physics behind it — Malus's Law, spontaneous symmetry breaking, color confinement, time dilation, and more.

## Features

### 3D Scene
- Interactive 3D representations of all quarks, leptons, bosons, and their antiparticles
- Click-to-zoom camera controller that flies to a selected particle
- Starfield background, force-field visuals, and a mass-comparison / Feynman-diagram overlay for each interaction

### Educational Overlays
- **Particle Info panel**: properties, discovery year, lifetime, and decay modes for every particle
- **Decay Animation**: bubble-chamber-style animated diagrams for unstable particles, driven by real branching ratios
- **Quantum Property Indicators**: spin, helicity/chirality, and color-charge visualizations
- **Spin Explainer**: a full-page overlay walking through spin 0, 1/2, 1, 3/2, and 2
- **Composite Hint**: clicking a quark surfaces the baryons/mesons it participates in, with an inline quark-diagram viewer

### Interactive Labs
Each lab is a focused, self-contained simulation of one real physics concept, opened from the particle info panel:

| Lab | Particle | Concept |
|---|---|---|
| Hadron Lab | Quarks | Building color-neutral baryons and mesons |
| Photon Polarization Lab | Photon | Malus's Law and the polarizer paradox |
| Electron Relativity Lab | Electron | Magnetism as relativistic electrostatics (Purcell/Feynman argument) |
| Higgs Mechanism Lab | Higgs, W/Z bosons | Spontaneous symmetry breaking, mass generation |
| Gluon Confinement Lab | Gluon | The Cornell potential, confinement, and asymptotic freedom |
| Neutrino Oscillation | Neutrinos | Flavor mixing via the PMNS matrix |
| Muon Decay Lab | Muon | Time dilation via the cosmic-ray-muon survival argument |
| Tau Decay Length Lab | Tau | Why the tau's short lifetime demands vertex detectors instead |

## Physics Content

### Particles Visualized
- **Quarks**: Up, Down, Charm, Strange, Top, Bottom
- **Leptons**: Electron, Muon, Tau, and their neutrinos
- **Bosons**: Photon, W/Z bosons, Gluon, Higgs

### Forces Represented
- **Electromagnetic Force**: Mediated by photons
- **Weak Nuclear Force**: Mediated by W and Z bosons
- **Strong Nuclear Force**: Mediated by gluons
- **Mass Generation**: Via the Higgs mechanism

## Technology Stack

- **React 19** with hooks and Context for state
- **TypeScript**
- **Three.js** with **React Three Fiber** and **React Three Drei** for the 3D scene
- **Vite** (via `rolldown-vite`) as the build tool and dev server
- **ESLint** / `typescript-eslint` for linting

All physics: relativity, QCD running coupling, neutrino oscillation, decay lengths, etc. — is computed client-side in TypeScript (`src/utils/`); there is no backend.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation & Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ronaldossai/Interactive-Standard-Model.git
   cd Interactive-Standard-Model
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Type-check (`tsc -b`) and build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

1. **Navigate the 3D Space**: Use mouse to orbit, zoom, and pan around the particle visualization
2. **Explore Particles**: Click on a particle to zoom in and see its properties
3. **Open a Lab**: If the selected particle has an Interactive Lab, a button appears in the info panel
4. **Compare & Learn**: Use Mass Comparison, Spin Explainer, and Composite Hint for cross-particle context

## Project Structure

```
src/
├── components/
│   ├── StandardModelScene.tsx      # Main 3D scene
│   ├── CameraController.tsx        # Click-to-zoom camera behavior
│   ├── ParticleInfo.tsx            # Info panel + Lab launch buttons
│   ├── QuantumPropertyIndicators.tsx
│   ├── MassComparison.tsx / FeynmanDiagram.tsx
│   ├── SpinExplainer.tsx / CompositeHint.tsx / DecayAnimation.tsx
│   ├── particles/                  # Per-type 3D group components
│   ├── forces/                     # Force-field rendering
│   └── *Lab.tsx                    # The 8 Interactive Labs (see table above)
├── context/
│   └── ParticleContext.tsx         # Global selection + lab open/close state
├── data/
│   ├── particleData.ts             # Particle properties & 3D positions
│   ├── decayData.ts                # Decay modes & branching ratios
│   ├── compositeData.ts            # Baryon/meson composition
│   └── feynmanRules.ts             # Interaction vertex lookup table
├── utils/
│   └── *.ts                        # Physics for each Lab (relativity, QCD, oscillation, decay length, ...)
├── App.tsx                         # Main application
├── main.tsx                        # Application entry point
└── App.css                         # Styling
```

## Adding a New Lab

Every lab follows the same recipe, which makes adding another straightforward:
1. A `utils/<topic>.ts` module with a `calculateXState(...)` function, a `generateXCurve(...)` helper for any graph, presets, and display formatters.
2. A `components/<Topic>Lab.tsx` component: overlay/backdrop/container/header, an Escape-to-close effect, controls on the left and visualization on the right, reusing the shared `.control-section` / `.slider-control` / `.pmns-section` / `.force-comparison` CSS classes already defined in `App.css`.
3. `<topic>LabOpen` / `open<Topic>Lab` / `close<Topic>Lab` added to `types/particle.ts` and `context/ParticleContext.tsx`, rendered in `App.tsx`, and a button gated on the relevant particle `id` in `ParticleInfo.tsx`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Educational Resources

- [Standard Model - CERN](https://home.cern/science/physics/standard-model)
- [Particle Physics Basics](https://www.symmetrymagazine.org/article/the-standard-model)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)

## Acknowledgments

- CERN for particle physics research and educational resources
- Three.js community for excellent 3D web graphics tools
- React Three Fiber maintainers for the amazing React integration
- Physics educators and researchers making science accessible
