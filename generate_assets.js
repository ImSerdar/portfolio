/**
 * Headless 3D Asset Generator for Portfolio Oryzo
 * Uses Three.js and GLTFExporter to export Server Rack, Microchip, and Brackets.
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

// ==========================================
// 1. HEADLESS ENVIRONMENT SHIMS
// ==========================================
class HeadlessFileReader {
  constructor() {
    this.onloadend = null;
    this.result = null;
  }

  async readAsArrayBuffer(blob) {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      this.result = arrayBuffer;
      if (typeof this.onloadend === 'function') this.onloadend();
    } catch (err) {
      console.error('FileReader error:', err);
    }
  }

  async readAsDataURL(blob) {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${base64}`;
      if (typeof this.onloadend === 'function') this.onloadend();
    } catch (err) {
      console.error('FileReader error:', err);
    }
  }
}

globalThis.FileReader = HeadlessFileReader;
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement: (name) => {
      throw new Error(`Canvas/DOM is not supported in this headless environment. Cannot create <${name}>.`);
    }
  };
}

// ==========================================
// 2. MATERIAL LIBRARY DEFINITIONS
// ==========================================
const Materials = {
  darkSteel: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.3,
    name: 'DarkSteel'
  }),
  brushedAluminium: new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.2,
    name: 'BrushedAluminium'
  }),
  goldPlated: new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.15,
    name: 'GoldPlated'
  }),
  slateCeramic: new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.2,
    roughness: 0.5,
    name: 'SlateCeramic'
  }),
  pcbBase: new THREE.MeshStandardMaterial({
    color: 0x1e1b4b, // Dark purple/indigo
    roughness: 0.6,
    metalness: 0.1,
    name: 'PCBSubstrate'
  }),
  matteBlack: new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.8,
    metalness: 0.1,
    name: 'MatteBlack'
  }),
  // Neon glows
  cyanGlow: new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0x06b6d4,
    emissiveIntensity: 3.0,
    name: 'CyanGlow'
  }),
  greenGlow: new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0x10b981,
    emissiveIntensity: 3.0,
    name: 'GreenGlow'
  }),
  orangeGlow: new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.5,
    name: 'OrangeGlow'
  }),
  purpleGlow: new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0x8b5cf6,
    emissiveIntensity: 3.0,
    name: 'PurpleGlow'
  }),
  // Refractive Glass (Note: physical attributes fall back elegantly in standard GLTF)
  glassPhysical: new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    transmission: 0.9,
    roughness: 0.1,
    ior: 1.5,
    thickness: 1.0,
    name: 'GlassPhysical'
  }),
  cyanWireframe: new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
    name: 'CyanWireframe'
  })
};

// ==========================================
// 3. ASSET GENERATORS
// ==========================================

/**
 * Generates the Server Rack asset
 */
function createServerRack() {
  const group = new THREE.Group();
  group.name = 'ServerRack';

  // 1. Cabinet Outer Enclosure
  const topPlate = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 1.5), Materials.darkSteel);
  topPlate.position.set(0, 1.025, 0);
  group.add(topPlate);

  const bottomPlate = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 1.5), Materials.darkSteel);
  bottomPlate.position.set(0, -1.025, 0);
  group.add(bottomPlate);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.0, 1.5), Materials.darkSteel);
  leftWall.position.set(-1.025, 0, 0);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.0, 1.5), Materials.darkSteel);
  rightWall.position.set(1.025, 0, 0);
  group.add(rightWall);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 0.05), Materials.glassPhysical);
  backWall.position.set(0, 0, -0.725);
  group.add(backWall);

  // 2. Mounting Ears (Brackets)
  const leftEar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 0.02), Materials.brushedAluminium);
  leftEar.position.set(-1.085, 0, 0.74);
  group.add(leftEar);

  const rightEar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 0.02), Materials.brushedAluminium);
  rightEar.position.set(1.085, 0, 0.74);
  group.add(rightEar);

  // 3. Horizontal Server Blades (Stacked)
  const bladeHeights = [-0.6, -0.2, 0.2, 0.6];
  bladeHeights.forEach((y, index) => {
    const bladeGroup = new THREE.Group();
    bladeGroup.name = `Blade_${index}`;
    bladeGroup.position.set(0, y, 0.02);

    // Blade Faceplate
    const faceplate = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.3, 1.4), Materials.matteBlack);
    bladeGroup.add(faceplate);

    // Right and Left Handles
    const leftHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8), Materials.brushedAluminium);
    leftHandle.rotation.x = Math.PI / 2;
    leftHandle.position.set(-0.85, 0, 0.72);
    bladeGroup.add(leftHandle);

    const rightHandle = leftHandle.clone();
    rightHandle.position.set(0.85, 0, 0.72);
    bladeGroup.add(rightHandle);

    // LED Indicators (Power, Activity, Error Status)
    const ledPower = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), Materials.cyanGlow);
    ledPower.position.set(-0.7, 0, 0.71);
    bladeGroup.add(ledPower);

    const ledActivity = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), Materials.greenGlow);
    ledActivity.position.set(-0.62, 0, 0.71);
    bladeGroup.add(ledActivity);

    // Alternating error LED activity
    if (index % 2 === 0) {
      const ledError = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), Materials.orangeGlow);
      ledError.position.set(-0.54, 0, 0.71);
      bladeGroup.add(ledError);
    }

    // Vent Slots (Grill pattern)
    for (let xOffset = -0.3; xOffset <= 0.7; xOffset += 0.08) {
      const ventSlot = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.16, 0.02), Materials.darkSteel);
      ventSlot.position.set(xOffset, 0, 0.71);
      bladeGroup.add(ventSlot);
    }

    group.add(bladeGroup);
  });

  return group;
}

/**
 * Generates the Microchip asset
 */
function createMicrochip() {
  const group = new THREE.Group();
  group.name = 'Microchip';

  // 1. PCB Substrate
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 3.0), Materials.pcbBase);
  group.add(pcb);

  // 2. Chip Package Ceramic Base
  const chipBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 1.8), Materials.slateCeramic);
  chipBase.position.set(0, 0.1, 0);
  group.add(chipBase);

  // 3. Metallic Heat Spreader Cap
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 1.2), Materials.brushedAluminium);
  cap.position.set(0, 0.18, 0);
  group.add(cap);

  // 4. Perimeter Pins (8 per edge)
  const pinSpacing = [-0.7, -0.5, -0.3, -0.1, 0.1, 0.3, 0.5, 0.7];
  
  // North / South Edges
  pinSpacing.forEach((x) => {
    // North Pin
    const pinN = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.3), Materials.goldPlated);
    pinN.position.set(x, 0.08, -0.95);
    group.add(pinN);

    // South Pin
    const pinS = pinN.clone();
    pinS.position.z = 0.95;
    group.add(pinS);
  });

  // West / East Edges
  pinSpacing.forEach((z) => {
    // West Pin
    const pinW = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.06), Materials.goldPlated);
    pinW.position.set(-0.95, 0.08, z);
    group.add(pinW);

    // East Pin
    const pinE = pinW.clone();
    pinE.position.x = 0.95;
    group.add(pinE);
  });

  // 5. Active PCB Copper Traces (Glow lines)
  // Horizontal traces
  const trace1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 1.2), Materials.cyanGlow);
  trace1.position.set(-1.1, 0.046, -1.1);
  group.add(trace1);

  const trace2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.012, 0.02), Materials.cyanGlow);
  trace2.position.set(1.1, 0.046, 1.1);
  group.add(trace2);

  // Decorative corner capacitors
  const capCoords = [
    [-1.2, 1.2], [1.2, -1.2], [-1.2, -1.2], [1.2, 1.2]
  ];
  capCoords.forEach(([cx, cz], i) => {
    const capacitor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.2), i % 2 === 0 ? Materials.darkSteel : Materials.slateCeramic);
    capacitor.position.set(cx, 0.08, cz);
    group.add(capacitor);
  });

  return group;
}

/**
 * Generates the Code Brackets asset
 */
function createCodeBrackets() {
  const group = new THREE.Group();
  group.name = 'CodeBrackets';

  // Helper to build bracket arms
  const buildArmMesh = (w, h, d, zRot, px, py) => {
    const armGroup = new THREE.Group();

    // Inner Glass Body
    const glass = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), Materials.glassPhysical);
    glass.rotation.z = zRot;
    glass.position.set(px, py, 0);
    armGroup.add(glass);

    // Outer Cyber Wireframe Outline
    const outline = new THREE.Mesh(new THREE.BoxGeometry(w * 1.03, h * 1.03, d * 1.03), Materials.cyanWireframe);
    outline.rotation.z = zRot;
    outline.position.set(px, py, 0);
    armGroup.add(outline);

    return armGroup;
  };

  // 1. Left Bracket '<'
  const leftBracket = new THREE.Group();
  leftBracket.name = 'LeftBracket';
  leftBracket.add(buildArmMesh(0.18, 1.2, 0.22, Math.PI / 6, -0.6, 0.45));   // Upper left arm (+30 deg)
  leftBracket.add(buildArmMesh(0.18, 1.2, 0.22, -Math.PI / 6, -0.6, -0.45)); // Lower left arm (-30 deg)
  group.add(leftBracket);

  // 2. Right Bracket '>'
  const rightBracket = new THREE.Group();
  rightBracket.name = 'RightBracket';
  rightBracket.add(buildArmMesh(0.18, 1.2, 0.22, -Math.PI / 6, 0.6, 0.45));  // Upper right arm (-30 deg)
  rightBracket.add(buildArmMesh(0.18, 1.2, 0.22, Math.PI / 6, 0.6, -0.45));  // Lower right arm (+30 deg)
  group.add(rightBracket);

  // 3. Central Slash '/'
  const slash = new THREE.Group();
  slash.name = 'CentralSlash';
  slash.add(buildArmMesh(0.15, 2.0, 0.18, Math.PI / 12, 0.0, 0.0)); // Center bar tilted 15 degrees
  group.add(slash);

  return group;
}

// ==========================================
// 4. EXPORT ENGINE
// ==========================================
async function exportAsset(createFn, filename) {
  const scene = new THREE.Scene();
  const asset = createFn();
  scene.add(asset);

  const exporter = new GLTFExporter();
  
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        const outputDir = path.resolve('public');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputPath = path.join(outputDir, filename);
        fs.writeFileSync(outputPath, JSON.stringify(gltf, null, 2));
        console.log(`Successfully exported: ${outputPath}`);
        resolve();
      },
      (error) => {
        console.error(`Export failed for ${filename}:`, error);
        reject(error);
      },
      { binary: false } // Export as human-readable JSON (.gltf)
    );
  });
}

// ==========================================
// 5. MAIN EXECUTION TRIGGER
// ==========================================
(async () => {
  console.log('Initiating Headless 3D Asset Generation...');
  try {
    await exportAsset(createServerRack, 'server.gltf');
    await exportAsset(createMicrochip, 'microchip.gltf');
    await exportAsset(createCodeBrackets, 'brackets.gltf');
    console.log('All 3D assets generated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during asset generation:', err);
    process.exit(1);
  }
})();
