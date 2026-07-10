import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, Stars, Float, Sparkles, PerspectiveCamera, Text, Html } from '@react-three/drei';
import { PORTFOLIO_DATA } from '../data';

// Scene depths
const SCENE_DEPTHS = {
  HERO: 0,
  WORK: -30,
  CONTACT: -60,
  END: -80
};

function CameraController() {
  const scroll = useScroll();
  const cameraGroup = useRef();

  useFrame((state, delta) => {
    if (cameraGroup.current) {
      // scroll.offset goes from 0 to 1
      const targetZ = scroll.offset * SCENE_DEPTHS.END;
      // Interpolate camera Z position
      cameraGroup.current.position.z += (targetZ - cameraGroup.current.position.z) * 0.05;
    }
  });

  return (
    <group ref={cameraGroup}>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
    </group>
  );
}

function HeroScene() {
  return (
    <group position={[0, 0, SCENE_DEPTHS.HERO]}>
      <Float speed={2} rotationIntensity={2} floatIntensity={2}>
        <mesh position={[4, 0, -5]}>
          <torusKnotGeometry args={[1.5, 0.4, 128, 32]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.1} metalness={0.8} />
        </mesh>
      </Float>
      
      <Text
        position={[-2, 1, 0]}
        fontSize={1}
        color="#ffffff"
        font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4-0IA.woff"
        maxWidth={6}
        lineHeight={1.1}
      >
        I solve{'\n'}technical problems.
      </Text>
      
      <Html position={[-2, -1, 0]} transform distanceFactor={5}>
        <div style={{ color: '#9CA3AF', width: '400px', fontSize: '18px', fontFamily: 'Inter' }}>
          {PORTFOLIO_DATA.hero.tagline}
        </div>
      </Html>
    </group>
  );
}

function WorkScene() {
  return (
    <group position={[0, 0, SCENE_DEPTHS.WORK]}>
      <Text
        position={[0, 3, 0]}
        fontSize={1.5}
        color="#8b5cf6"
        font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4-0IA.woff"
        anchorX="center"
      >
        Sample Builds
      </Text>
      
      {/* 3D Carousel of Projects */}
      {PORTFOLIO_DATA.work.projects.slice(0, 3).map((project, index) => {
        const xPos = (index - 1) * 6;
        return (
          <Float key={project.id} speed={1.5} rotationIntensity={0.5} floatIntensity={1} position={[xPos, -1, 0]}>
            <Html transform distanceFactor={10}>
              <div className="glass" style={{ width: '300px', padding: '20px', borderRadius: '16px', color: 'white' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{project.title}</h3>
                <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#ccc' }}>{project.description}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {project.tags.map(tag => (
                    <span key={tag} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Html>
          </Float>
        );
      })}
    </group>
  );
}

function ContactScene() {
  return (
    <group position={[0, 0, SCENE_DEPTHS.CONTACT]}>
      <Float speed={1} rotationIntensity={3} floatIntensity={4}>
        <mesh position={[0, 0, -10]}>
          <octahedronGeometry args={[5, 0]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.2} metalness={0.5} wireframe />
        </mesh>
      </Float>
      
      <Text
        position={[0, 2, 0]}
        fontSize={2}
        color="#ffffff"
        font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4-0IA.woff"
        anchorX="center"
      >
        Get In Touch
      </Text>
      
      <Html position={[0, -1, 0]} transform distanceFactor={8} center>
        <div className="glass" style={{ width: '400px', padding: '40px', textAlign: 'center', borderRadius: '24px', color: 'white' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '28px' }}>{PORTFOLIO_DATA.contact.headline}</h2>
          <p style={{ marginBottom: '30px', color: '#ccc' }}>{PORTFOLIO_DATA.contact.text}</p>
          <a href={PORTFOLIO_DATA.contact.primaryCta.href} className="cta-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
            {PORTFOLIO_DATA.contact.primaryCta.text}
          </a>
        </div>
      </Html>
    </group>
  );
}

export default function Scene() {
  return (
    <>
      <color attach="background" args={['#050810']} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#06b6d4" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#8b5cf6" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={30} size={2} speed={0.4} opacity={0.5} color="#06b6d4" />

      {/* 
        ScrollControls creates an invisible DOM container over the canvas 
        that catches scroll events and maps them to scroll.offset 
      */}
      <ScrollControls pages={6} damping={0.1}>
        <CameraController />
        <HeroScene />
        <WorkScene />
        <ContactScene />
      </ScrollControls>
    </>
  );
}
