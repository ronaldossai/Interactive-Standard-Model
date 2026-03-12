# Interactive Standard Model

An interactive 3D visualization of the Standard Model of particle physics, built with Three.js, React, and TypeScript.

## Features

- **3D Particle Visualization**: Interactive representations of quarks, leptons, and bosons
- **Force Field Visualization**: Visual representation of fundamental forces
- **Real-time Animations**: Particle movements and interactions
- **Educational Interface**: Detailed particle information and properties
- **Modern Web Technologies**: Built with Vite, React, TypeScript, and Three.js

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

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Three.js** - 3D graphics and animations
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **Vite** - Fast build tool and dev server

### Future Backend (Python)
- **FastAPI** or **Flask** - REST API for physics calculations
- **NumPy/SciPy** - Scientific computing
- **Particle physics simulations**

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interactive-standard-model
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
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎮 Usage

1. **Navigate the 3D Space**: Use mouse to orbit, zoom, and pan around the particle visualization
2. **Explore Particles**: Click on particles to learn about their properties
3. **Toggle Visualizations**: Use controls to show/hide force fields and interactions
4. **Educational Content**: Read detailed descriptions of each particle and force

## 🔬 Project Structure

```
src/
├── components/
│   ├── StandardModelScene.tsx     # Main 3D scene
│   ├── ParticleInfo.tsx          # Information panel
│   ├── particles/
│   │   ├── QuarkGroup.tsx        # Quark visualizations
│   │   ├── LeptonGroup.tsx       # Lepton visualizations
│   │   └── BosonGroup.tsx        # Boson visualizations
│   └── forces/
│       └── ForceVisualization.tsx # Force field rendering
├── App.tsx                        # Main application
├── main.tsx                       # Application entry point
└── App.css                        # Styling
```

## Future Enhancements

### Phase 1 (Current)
- Basic 3D particle visualization
- Interactive controls
- Educational content

### Phase 2 (Planned)
- Python backend for physics calculations
- Particle interaction simulations
- Advanced animations and effects
- Quantum field visualizations

### Phase 3 (Future)
- Virtual reality support
- Advanced particle collision simulations
- Educational curriculum integration
- Multi-language support

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- CERN for particle physics research and educational resources
- Three.js community for excellent 3D web graphics tools
- React Three Fiber maintainers for the amazing React integration
- Physics educators and researchers making science accessible
