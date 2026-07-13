import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 1. Preload models at the module scope to avoid duplicate loadings and fetch early
useGLTF.preload('/brackets.gltf');
useGLTF.preload('/microchip.gltf');
useGLTF.preload('/server.gltf');

const DESKTOP_PROPERTIES = [
  { position: new THREE.Vector3(3.0, 0, -1.0), scale: 1.4, opacity: 0.7 },     // 0. Hero
  { position: new THREE.Vector3(3.2, 0.4, -1.0), scale: 1.1, opacity: 0.7 },   // 1. Stats
  { position: new THREE.Vector3(3.0, -0.2, -1.0), scale: 1.2, opacity: 0.7 },  // 2. Services
  { position: new THREE.Vector3(3.2, -0.1, -1.0), scale: 1.1, opacity: 0.7 },  // 3. Process
  { position: new THREE.Vector3(3.0, 0.2, -1.0), scale: 1.3, opacity: 0.7 },   // 4. Work
  { position: new THREE.Vector3(3.4, 0.0, -1.5), scale: 1.0, opacity: 0.6 },   // 5. Elevate (CTA)
  { position: new THREE.Vector3(0, 1.8, -4.0), scale: 0.6, opacity: 0.15 },    // 6. Showcase
  { position: new THREE.Vector3(3.0, -0.3, -1.0), scale: 0.9, opacity: 0.5 }   // 7. Contact
];

const MOBILE_PROPERTIES = [
  { position: new THREE.Vector3(0, -2.0, -3.0), scale: 1.0, opacity: 0.12 },
  { position: new THREE.Vector3(0, -2.0, -3.0), scale: 1.0, opacity: 0.12 },
  { position: new THREE.Vector3(0, -2.0, -3.0), scale: 1.0, opacity: 0.12 },
  { position: new THREE.Vector3(0, -2.0, -3.0), scale: 1.0, opacity: 0.12 },
  { position: new THREE.Vector3(0, -2.0, -3.0), scale: 1.0, opacity: 0.12 },
  { position: new THREE.Vector3(0, -2.0, -3.0), scale: 1.0, opacity: 0.12 }, // Elevate
  { position: new THREE.Vector3(0, 2.2, -5.0), scale: 0.6, opacity: 0.05 },
  { position: new THREE.Vector3(0, -2.2, -2.0), scale: 0.8, opacity: 0.18 }
];

const DEFAULT_PROPERTY = { position: new THREE.Vector3(0, 0, 0), scale: 1.0, opacity: 1.0 };

function getSectionProperties(index, isMobile) {
  const props = isMobile ? MOBILE_PROPERTIES[index] : DESKTOP_PROPERTIES[index];
  return props || DEFAULT_PROPERTY;
}

// Pre-allocated Vector3 instances for useFrame animation loop
const tempStartPos = new THREE.Vector3();
const tempEndPos = new THREE.Vector3();
const tempLocalPos = new THREE.Vector3();
const tempOffset = new THREE.Vector3();
const CENTER_SPOTLIGHT_POS = new THREE.Vector3(0, 0.1, 0.8);
const LOCAL_SPOTLIGHT_OUT = new THREE.Vector3(0, 0.1, 1.2);
const LOCAL_SPOTLIGHT_IN = new THREE.Vector3(0, 0.1, 0.4);

export default function CentralMesh({ scrollSmooth }) {
  const groupRef = useRef();

  // Load models using Drei's hook
  const bracketsGLTF = useGLTF('/brackets.gltf');
  const microchipGLTF = useGLTF('/microchip.gltf');
  const serverGLTF = useGLTF('/server.gltf');

  // Shader refs to update uTime for deforming blobs
  const shadersRef = useRef([]);

  const addShaderRef = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = `
      uniform float uTime;
      ${shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float displacement = sin(position.x * 2.5 + uTime * 1.2) * 
                             cos(position.y * 2.5 + uTime * 1.2) * 
                             sin(position.z * 2.5 + uTime * 1.2) * 0.15;
        transformed += normal * displacement;
        `
      )}
    `;
    shadersRef.current.push(shader);
  };

  // Materials definition
  const materials = useMemo(() => {
    return {
      // 0. Hero: Glassmorphic Brackets
      hero: new THREE.MeshPhysicalMaterial({
        transmission: 1.0,
        thickness: 2.5,
        roughness: 0.12,
        ior: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        metalness: 0.05,
        color: '#ffffff',
        attenuationColor: '#ffffff',
        attenuationDistance: 0.5,
        transparent: true,
        emissive: new THREE.Color('#a855f7'),
        emissiveIntensity: 0.0
      }),

      // 1. Stats: Glassmorphic Microchip + Cyan Wireframe
      stats: (() => {
        const mat = new THREE.MeshPhysicalMaterial({
          transmission: 0.8,
          thickness: 1.5,
          roughness: 0.2,
          ior: 1.45,
          clearcoat: 0.5,
          color: '#ffffff',
          transparent: true,
          emissive: new THREE.Color('#06b6d4'),
          emissiveIntensity: 0.0
        });
        mat.onBeforeCompile = addShaderRef;
        return mat;
      })(),
      statsWireframe: (() => {
        const mat = new THREE.MeshBasicMaterial({
          color: '#06b6d4',
          wireframe: true,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        mat.onBeforeCompile = addShaderRef;
        return mat;
      })(),

      // 2. Services: Matte Metal Server
      services: (() => {
        const mat = new THREE.MeshPhysicalMaterial({
          metalness: 0.95,
          roughness: 0.28,
          color: '#a1a1aa',
          envMapIntensity: 1.5,
          transparent: true,
          emissive: new THREE.Color('#a1a1aa'),
          emissiveIntensity: 0.0
        });
        mat.onBeforeCompile = addShaderRef;
        return mat;
      })(),

      // 3. Process: Yellow Glass Brackets
      process: new THREE.MeshPhysicalMaterial({
        transmission: 0.9,
        thickness: 2.0,
        roughness: 0.15,
        color: '#fef08a',
        transparent: true,
        emissive: new THREE.Color('#eab308'),
        emissiveIntensity: 0.0
      }),

      // 4. Work: Heavy Glass Microchip
      work: new THREE.MeshPhysicalMaterial({
        transmission: 1.0,
        thickness: 3.5,
        ior: 1.6,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        color: '#e0f2fe',
        transparent: true,
        emissive: new THREE.Color('#38bdf8'),
        emissiveIntensity: 0.0
      }),

      // 5. Showcase: Dark Glass Server
      showcase: new THREE.MeshPhysicalMaterial({
        transmission: 0.8,
        thickness: 2.0,
        roughness: 0.2,
        color: '#1e1b4b',
        transparent: true,
        emissive: new THREE.Color('#4f46e5'),
        emissiveIntensity: 0.0
      }),

      // 6. Contact: Purple Glowing Emissive Server + Wireframe
      contact: (() => {
        const mat = new THREE.MeshStandardMaterial({
          color: '#1c1917',
          emissive: new THREE.Color('#8b5cf6'),
          emissiveIntensity: 2.5,
          roughness: 0.2,
          transparent: true,
        });
        mat.onBeforeCompile = addShaderRef;
        return mat;
      })(),
      contactWireframe: (() => {
        const mat = new THREE.MeshBasicMaterial({
          color: '#8b5cf6',
          wireframe: true,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        mat.onBeforeCompile = addShaderRef;
        return mat;
      })(),
    };
  }, []);

  // Helper function to clone GLTF scenes and apply materials/traversals
  const createModelClone = useMemo(() => {
    return (gltfSource, material, wireframeMaterial = null) => {
      const mainClone = gltfSource.scene.clone(true);
      mainClone.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      let wireframeClone = null;
      if (wireframeMaterial) {
        wireframeClone = gltfSource.scene.clone(true);
        wireframeClone.traverse((child) => {
          if (child.isMesh) {
            child.material = wireframeMaterial;
          }
        });
      }

      return { main: mainClone, wireframe: wireframeClone };
    };
  }, []);

  // Generate model instances per section to avoid single-parent scene graph bugs
  const models = useMemo(() => {
    return {
      hero: createModelClone(bracketsGLTF, materials.hero),
      stats: createModelClone(microchipGLTF, materials.stats, materials.statsWireframe),
      services: createModelClone(serverGLTF, materials.services),
      process: createModelClone(bracketsGLTF, materials.process),
      work: createModelClone(microchipGLTF, materials.work),
      showcase: createModelClone(serverGLTF, materials.showcase),
      contact: createModelClone(serverGLTF, materials.contact, materials.contactWireframe),
    };
  }, [bracketsGLTF, microchipGLTF, serverGLTF, materials, createModelClone]);

  // Refs for meshes/groups to control opacity and visibility (dynamic refs array)
  const meshRefs = useRef([]);
  const wireframeRefs = useRef([]);

  // --- Interaction Refs ---
  const hoveredRef = useRef(false);
  const hoverScaleRef = useRef(1.0);
  const hoverSpinRef = useRef(0.0);
  const clickSpinVelocityRef = useRef(0.0);
  const hoverIntensityRef = useRef(0.0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const S = scrollSmooth.get(); // Float from 0.0 to 6.0
    const currentSection = Math.max(0, Math.min(5, Math.floor(S)));
    const nextSection = Math.min(6, currentSection + 1);
    
    // Cubic Easing on local transition progress
    const alpha = S - currentSection;
    const easedAlpha = alpha < 0.5 
      ? 4 * alpha * alpha * alpha 
      : 1 - Math.pow(-2 * alpha + 2, 3) / 2;

    const isMobile = window.innerWidth <= 768;

    const currentProps = getSectionProperties(currentSection, isMobile);
    const nextProps = getSectionProperties(nextSection, isMobile);

    const spotlightBlend = Math.sin(alpha * Math.PI);

    // --- INTERACTION LERPING ---
    
    // 1. Decay click spin velocity (exponential decay)
    clickSpinVelocityRef.current = THREE.MathUtils.lerp(clickSpinVelocityRef.current, 0, delta * 4.0);

    // 2. Lerp hover spin boost
    const targetHoverSpin = hoveredRef.current ? 1.0 : 0.0;
    hoverSpinRef.current = THREE.MathUtils.lerp(hoverSpinRef.current, targetHoverSpin, delta * 8.0);

    // 3. Lerp scale factor (target is 1.25x on hover)
    const targetHoverScale = hoveredRef.current ? 1.25 : 1.0;
    hoverScaleRef.current = THREE.MathUtils.lerp(hoverScaleRef.current, targetHoverScale, delta * 8.0);

    // 4. Lerp glow intensity
    const targetHoverIntensity = hoveredRef.current ? 1.0 : 0.0;
    hoverIntensityRef.current = THREE.MathUtils.lerp(hoverIntensityRef.current, targetHoverIntensity, delta * 8.0);

    // Mouse Parallax
    const parallaxX = state.pointer.x * 0.4;
    const parallaxY = state.pointer.y * 0.3;

    // Spin Speed calculation
    const spinSpeed = 0.5 
      + Math.abs(scrollSmooth.getVelocity ? scrollSmooth.getVelocity() * 0.5 : (S - currentSection) * 2.0)
      + hoverSpinRef.current
      + clickSpinVelocityRef.current;

    // Update uTime uniform in deforming shaders
    const elapsedTime = state.clock.getElapsedTime();
    shadersRef.current.forEach((shader) => {
      if (shader.uniforms.uTime) {
        shader.uniforms.uTime.value = elapsedTime;
      }
    });

    // Handle individual position, rotation, scale, and cross-fade opacities
    for (let index = 0; index < 7; index++) {
      const el = meshRefs.current[index];
      if (el) {
        const diff = S - index;
        const absDiff = Math.abs(diff);
        const baseOpacity = getSectionProperties(index, isMobile).opacity;
        const opacity = Math.max(0, baseOpacity * (1 - absDiff));
        
        el.visible = opacity > 0.01;
        
        if (el.visible) {
          const props = getSectionProperties(index, isMobile);
          tempLocalPos.copy(props.position);

          if (index === currentSection) {
            // Transitioning out
            tempStartPos.copy(props.position);
            tempOffset.set(0, 0, 2.0);
            tempEndPos.copy(props.position).add(tempOffset);
            tempLocalPos.lerpVectors(tempStartPos, tempEndPos, easedAlpha);
            tempLocalPos.lerp(LOCAL_SPOTLIGHT_OUT, spotlightBlend * 0.85);
          } else if (index === nextSection) {
            // Transitioning in
            tempOffset.set(0, 0, -2.0);
            tempStartPos.copy(props.position).add(tempOffset);
            tempEndPos.copy(props.position);
            tempLocalPos.lerpVectors(tempStartPos, tempEndPos, easedAlpha);
            tempLocalPos.lerp(LOCAL_SPOTLIGHT_IN, spotlightBlend * 0.85);
          }

          // Apply mouse parallax
          tempLocalPos.x += parallaxX;
          tempLocalPos.y += parallaxY;
          el.position.copy(tempLocalPos);

          // Apply scale interpolation locally
          let targetScale = props.scale;
          if (index === currentSection || index === nextSection) {
            const snappedScale = THREE.MathUtils.lerp(
              currentProps.scale,
              nextProps.scale,
              easedAlpha
            );
            targetScale = snappedScale * (1.0 + spotlightBlend * 0.25) * hoverScaleRef.current;
          } else {
            targetScale = props.scale * hoverScaleRef.current;
          }
          el.scale.setScalar(targetScale);

          // Apply rotation locally
          el.rotation.y += delta * 0.25 * spinSpeed;
          el.rotation.x += delta * 0.12 * spinSpeed;

          // Traverse the cloned scene structure to apply material opacity and emissive glow properties
          el.traverse((child) => {
            if (child.isMesh && child.material) {
              child.material.opacity = opacity;
              child.material.transparent = true;
              child.material.depthWrite = opacity > 0.95;

              // Glow/Emissive reaction:
              if (child.material.emissive) {
                const transitionGlow = spotlightBlend * 2.0; // Boost emissive by up to 2.0 during transition sweep
                if (index === 6) {
                  // Contact model has standard base emissive intensity of 2.5, boosted up to 5.0 on hover
                  child.material.emissiveIntensity = 2.5 + hoverIntensityRef.current * 2.5 + transitionGlow;
                } else {
                  // Standard models have base emissive intensity of 0.0, boosted up to 1.5 on hover
                  child.material.emissiveIntensity = hoverIntensityRef.current * 1.5 + transitionGlow;
                }
              }
            }
          });
        }
      }
    }

    // Handle wireframes opacities by traversing child meshes
    // Stats wireframe (index 1)
    const statsWireframeEl = wireframeRefs.current[0];
    if (statsWireframeEl) {
      const diff = Math.abs(S - 1);
      const baseOpacity = getSectionProperties(1, isMobile).opacity;
      const opacity = Math.max(0, 0.4 * baseOpacity * (1 - diff));
      statsWireframeEl.visible = opacity > 0.01;

      const hoverBoost = 1.0 + hoverIntensityRef.current * 0.5; // up to 1.5x opacity on hover
      if (statsWireframeEl.visible) {
        statsWireframeEl.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.opacity = Math.min(1.0, opacity * hoverBoost);
          }
        });
      }
    }
    // Contact wireframe (index 6)
    const contactWireframeEl = wireframeRefs.current[1];
    if (contactWireframeEl) {
      const diff = Math.abs(S - 6);
      const baseOpacity = getSectionProperties(6, isMobile).opacity;
      const opacity = Math.max(0, 0.6 * baseOpacity * (1 - diff));
      contactWireframeEl.visible = opacity > 0.01;

      const hoverBoost = 1.0 + hoverIntensityRef.current * 0.5; // up to 1.5x opacity on hover
      if (contactWireframeEl.visible) {
        contactWireframeEl.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.opacity = Math.min(1.0, opacity * hoverBoost);
          }
        });
      }
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerEnter={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        hoveredRef.current = true;
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
        hoveredRef.current = false;
      }}
      onClick={(e) => {
        e.stopPropagation();
        clickSpinVelocityRef.current += 6.0; // Click spin impulse
      }}
    >
      {/* 0. Hero: Code Brackets - Glassmorphic */}
      <group ref={el => { meshRefs.current[0] = el; }}>
        <primitive object={models.hero.main} />
      </group>

      {/* 1. Stats: Microchip - Glassmorphic with Cyan Wireframe */}
      <group ref={el => { meshRefs.current[1] = el; }}>
        <primitive object={models.stats.main} />
        <primitive ref={el => { wireframeRefs.current[0] = el; }} object={models.stats.wireframe} raycast={null} />
      </group>

      {/* 2. Services: Server Rack - Matte Metal */}
      <group ref={el => { meshRefs.current[2] = el; }}>
        <primitive object={models.services.main} />
      </group>

      {/* 3. Process: Code Brackets - Semi-glass yellow */}
      <group ref={el => { meshRefs.current[3] = el; }}>
        <primitive object={models.process.main} />
      </group>

      {/* 4. Work: Microchip - Heavy Glass */}
      <group ref={el => { meshRefs.current[4] = el; }}>
        <primitive object={models.work.main} />
      </group>

      {/* 5. Showcase: Server Rack - Dark Glass */}
      <group ref={el => { meshRefs.current[5] = el; }}>
        <primitive object={models.showcase.main} />
      </group>

      {/* 6. Contact: Server Rack - Purple Glowing Emissive with Purple Wireframe */}
      <group ref={el => { meshRefs.current[6] = el; }}>
        <primitive object={models.contact.main} />
        <primitive ref={el => { wireframeRefs.current[1] = el; }} object={models.contact.wireframe} raycast={null} />
      </group>
    </group>
  );
}
