import { Canvas } from '@react-three/fiber'
// import { Stats } from '@react-three/drei'
import { Suspense } from 'react'
import './App.css'
import StandardModelScene from './components/StandardModelScene'
import ParticleInfo from './components/ParticleInfo'
import MassComparison from './components/MassComparison'
import SpinExplainer from './components/SpinExplainer'
import CompositeHint from './components/CompositeHint'
import { CurrentParticlePopup } from './components/particles/DetailedParticleView'
import { ParticleProvider, useParticle } from './context/ParticleContext'
import { CameraController } from './components/CameraController'

function AppContent() {
  const { showCurrentParticlePopup } = useParticle()
  
  return (
    <div className="app">
      {/* Full-viewport canvas */}
      <div className="canvas-fullscreen">
        <Canvas camera={{ position: [0, 0, 18], fov: 55 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={0.3} />
            <StandardModelScene />
            <CameraController />
            {/* <Stats /> */}
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay header */}
      <header className="app-header">
        <h1>INTERACTIVE STANDARD MODEL</h1>
        <p>Explore the fundamental particles and forces of the universe</p>
      </header>
      
      {/* Overlay info panel */}
      <aside className="info-panel">
        <ParticleInfo />
      </aside>

      {/* Mass Comparison Overlay */}
      <MassComparison />

      {/* Spin Explainer Overlay */}
      <SpinExplainer />

      {/* Composite particle hint — bottom-left, quark-only */}
      <CompositeHint />
      
      {/* Current Particle Popup */}
      <CurrentParticlePopup show={showCurrentParticlePopup} />
    </div>
  )
}

function App() {
  return (
    <ParticleProvider>
      <AppContent />
    </ParticleProvider>
  )
}

export default App
