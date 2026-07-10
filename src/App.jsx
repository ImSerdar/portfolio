import React from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
}

export default App;
