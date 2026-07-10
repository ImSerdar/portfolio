import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Float, Sparkles, PerspectiveCamera } from '@react-three/drei';

function MovingObjects() {
  const group = useRef();
  const mesh1 = useRef();
  const mesh2 = useRef();
  
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress (0 to ~1 depending on document height)
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      setScrollY(maxScroll > 0 ? window.scrollY / maxScroll : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state, delta) => {
    // Smoothly interpolate current rotation/position to target scrollY
    if (group.current) {
      // target rotation
      const targetRotY = scrollY * Math.PI * 2;
      group.current.rotation.y += (targetRotY - group.current.rotation.y) * 0.05;
      
      const targetPosY = -scrollY * 15;
      group.current.position.y += (targetPosY - group.current.position.y) * 0.05;
    }
    
    // Spin individual meshes constantly
    if (mesh1.current) mesh1.current.rotation.x += delta * 0.5;
    if (mesh2.current) mesh2.current.rotation.y += delta * 0.2;
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={2} floatIntensity={2}>
        <mesh ref={mesh1} position={[2, 1, -5]}>
          <torusKnotGeometry args={[1, 0.3, 128, 32]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.1} metalness={0.8} />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={3} floatIntensity={4}>
        <mesh ref={mesh2} position={[-2, -3, -8]}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.2} metalness={0.5} wireframe />
        </mesh>
      </Float>
    </group>
  );
}

export default function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      
      <color attach="background" args={['#050810']} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#06b6d4" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#8b5cf6" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={10} size={2} speed={0.4} opacity={0.5} color="#06b6d4" />

      <MovingObjects />
    </>
  );
}
