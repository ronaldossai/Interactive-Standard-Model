import { Canvas } from '@react-three/fiber'
// import { Stats } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'
import './App.css'
import StandardModelScene from './components/StandardModelScene'
import ParticleInfo from './components/ParticleInfo'
import MassComparison from './components/MassComparison'
import SpinExplainer from './components/SpinExplainer'
import CompositeHint from './components/CompositeHint'
import { CurrentParticlePopup } from './components/particles/DetailedParticleView'
import { ParticleProvider, useParticle } from './context/ParticleContext'
import { CameraController } from './components/CameraController'

const MIN_WIDTH = 1200

function ScreenSizeWarning() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const check = () => setShow(window.innerWidth < MIN_WIDTH)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!show) return null

  return (
    <div className="screen-size-warning">
      <span className="screen-size-warning__icon">⚠️</span>
      <span className="screen-size-warning__text">
        <strong>Best viewed at 900px+</strong>
        This experience is designed for wider screens. UI based bugs may occur on narrow viewports.  
      </span>
      <button className="screen-size-warning__close" onClick={() => setShow(false)} aria-label="Dismiss">✕</button>
    </div>
  )
}

function AppContent() {
  const { showCurrentParticlePopup, selectedParticle } = useParticle()
  
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
      <CurrentParticlePopup show={showCurrentParticlePopup} color={selectedParticle?.color} />

      {/* Screen size warning for narrow viewports */}
      <ScreenSizeWarning />
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
