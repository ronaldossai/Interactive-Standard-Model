import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { Suspense } from 'react'
import './App.css'
import StandardModelScene from './components/StandardModelScene'
import ParticleInfo from './components/ParticleInfo'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Interactive Standard Model</h1>
        <p>Explore the fundamental particles and forces of the universe</p>
      </header>
      
      <main className="app-main">
        <div className="visualization-container">
          <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <StandardModelScene />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              <Stats />
            </Suspense>
          </Canvas>
        </div>
        
        <aside className="info-panel">
          <ParticleInfo />
        </aside>
      </main>
    </div>
  )
}

export default App
