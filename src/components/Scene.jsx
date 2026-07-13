import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Sparkles, PerspectiveCamera } from '@react-three/drei';
import CentralMesh from './CentralMesh';

function SceneCamera() {
  const cameraRef = useRef();

  useFrame((state) => {
    if (!cameraRef.current) return;
    // Mouse parallax to make the scene feel interactive and deep
    const targetX = state.pointer.x * 0.4;
    const targetY = state.pointer.y * 0.3;
    cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.05;
    cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.05;
    cameraRef.current.lookAt(0, 0, 0);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0, 5.5]}
      fov={50}
      near={0.1}
      far={100}
    />
  );
}

export default function Scene({ scrollSmooth }) {
  return (
    <>
      <color attach="background" args={['#03050c']} />
      
      {/* Lights Setup */}
      <ambientLight intensity={0.15} />
      
      {/* Key Directional Light (Cyan) */}
      <directionalLight 
        position={[10, 10, 8]} 
        color="#06b6d4" 
        intensity={1.8} 
      />
      
      {/* Fill Directional Light (Purple) */}
      <directionalLight 
        position={[-10, -10, -8]} 
        color="#8b5cf6" 
        intensity={1.2} 
      />
      
      {/* Back/Rim Light (White/Gold Fresnel) */}
      <directionalLight 
        position={[0, 5, -10]} 
        color="#ffffff" 
        intensity={2.2} 
      />

      {/* Environment Map for Transmission Refraction */}
      <Environment preset="city" />

      {/* Floating Particles / Sparkles */}
      <Sparkles 
        count={250} 
        scale={12} 
        size={2.5} 
        speed={0.4} 
        opacity={0.6} 
        color="#06b6d4" 
      />
      
      <Sparkles 
        count={150} 
        scale={10} 
        size={1.5} 
        speed={0.2} 
        opacity={0.4} 
        color="#8b5cf6" 
      />

      {/* Central Morphing 3D Mesh */}
      <Suspense fallback={null}>
        <CentralMesh scrollSmooth={scrollSmooth} />
      </Suspense>
    </>
  );
}
