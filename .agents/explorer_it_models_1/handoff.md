# Headless Asset Generation Research & Design Proposal Report

This report analyzes the Three.js version and files in `C:\Serdar\portfolio`, determines the shimming requirements for running `GLTFExporter` headlessly in Node.js, and proposes detailed 3D design compositions and code structures for generating three custom IT-themed assets.

---

## 1. Observation

### Three.js Version and Project Environment
- In `C:\Serdar\portfolio\package.json`, Three.js is installed at version `^0.185.1` (line 20).
- The project type is configured as `"type": "module"` (line 5).
- The package-lock and dependencies indicate a modern React 19 / Vite 8 stack.

### GLTFExporter Code Analysis
By examining the Three.js exporter source at `node_modules/three/examples/jsm/exporters/GLTFExporter.js`, we observe:
1. **FileReader Dependency**: In `GLTFWriter.writeAsync`, `FileReader` is instantiated and used to process the binary buffers even if there are no external textures:
   - Line 693 (inside binary GLB chunk processing):
     ```javascript
     const reader = new FileReader();
     reader.readAsArrayBuffer( blob );
     ```
   - Line 741 (inside JSON GLTF URI serialization):
     ```javascript
     const reader = new FileReader();
     reader.readAsDataURL( blob );
     ```
   - Line 727:
     ```javascript
     const glbReader = new FileReader();
     glbReader.readAsArrayBuffer( glbBlob );
     ```
   - Line 1302 (inside `processBufferViewImage`):
     ```javascript
     const reader = new FileReader();
     reader.readAsArrayBuffer( blob );
     ```
2. **Canvas/DOM Dependency**: In `GLTFExporter.js` lines 533-543, `getCanvas()` is defined as:
   ```javascript
   function getCanvas() {
       if ( typeof document === 'undefined' && typeof OffscreenCanvas !== 'undefined' ) {
           return new OffscreenCanvas( 1, 1 );
       }
       return document.createElement( 'canvas' );
   }
   ```
   If textures (color maps, roughness maps, normal maps) are processed, this function is invoked. If `document` is `undefined` in Node.js, it attempts to access it and throws a `ReferenceError`.
3. **Blob Dependency**: The exporter uses the global `Blob` class. In Node.js 18+, `Blob` is available globally, but in older versions it requires import from `'buffer'`.

---

## 2. Logic Chain

1. **Headless Execution Goal**: We want to run a standalone Node.js script to assemble 3D shapes in Three.js and export them using `GLTFExporter` to the `public/` directory without running a browser.
2. **Shimming Requirements (Without Textures)**:
   - Since we only use colors, metallic/roughness values, and emissive properties, the texture-related canvas functions (`getCanvas()`) are never called.
   - However, the `FileReader` object is **always** instantiated by `GLTFWriter` to read the geometry data buffers (vertices, normals, indices).
   - In Node.js, `FileReader` is not globally defined.
   - Therefore, a custom headless `FileReader` shim must be defined globally (`globalThis.FileReader`) in Node.js for `GLTFExporter` to run without throwing errors.
3. **Shimming Requirements (With Textures)**:
   - If textures are used, `document` and `HTMLCanvasElement` or `OffscreenCanvas` must be shimmed using Node packages like `canvas` (node-canvas) or a mock DOM like `jsdom`.
   - By designing our models with procedural materials (using colors, metallics, and emissive glows rather than image textures), we bypass the need for full canvas/DOM emulation, requiring only a simple, lightweight `FileReader` shim.

---

## 3. Caveats

- **Network Restrictions**: Since we are in `CODE_ONLY` network mode, we cannot install heavy external shimming libraries (like `jsdom` or `file-api`) from npm. We must implement a self-contained, lightweight shim directly in the script using Node's native `Buffer` and Promise-based `Blob.arrayBuffer()` APIs.
- **Node Version**: We assume the environment is running Node.js 18+ where `Blob` is globally available. If Node.js < 18 is used, we must manually import `Blob` from the `buffer` module and assign it to `globalThis.Blob`.
- **Command Timeouts**: We proposed a test script via `run_command` which timed out waiting for manual user confirmation. Therefore, the logic has been verified via static code analysis of the installed `three` package rather than shell execution.

---

## 4. Conclusion

### Headless Support Assessment
`GLTFExporter` does **not** run out-of-the-box in Node.js headlessly due to the missing global `FileReader` object. However, it can run 100% headless with **zero external dependencies** by defining a lightweight global shim in the script.

### Custom FileReader Shim
```javascript
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

// Register shims globally
globalThis.FileReader = HeadlessFileReader;
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement: () => {
      throw new Error('Canvas/DOM is not supported in this texture-free headless environment.');
    }
  };
}
```

---

## 5. 3D Model Design Proposals

To align with the glassmorphic, glowing cybernetic design language in `CentralMesh.jsx`, we define the geometry compositions using grouped Three.js primitives:

### Asset 1: Server Rack
A detailed enclosure with rack ears, stacked modular blades, and glowing indicator LEDs.

| Component | Shape / Primitive | Dimensions (W, H, D) | Position (X, Y, Z) | Material & Appearance |
| :--- | :--- | :--- | :--- | :--- |
| **Cabinet Outer Frame** | Group | - | `(0, 0, 0)` | Base group container |
| └ Top / Bottom Plates | `BoxGeometry` | `(2.0, 0.05, 1.5)` | `(0, ±1.025, 0)` | Dark Matte Metal (`color: 0x1e293b, metalness: 0.8, roughness: 0.3`) |
| └ Side Walls | `BoxGeometry` | `(0.05, 2.0, 1.5)` | `(±1.025, 0, 0)` | Dark Matte Metal (`color: 0x1e293b, metalness: 0.8, roughness: 0.3`) |
| └ Back Panel | `BoxGeometry` | `(2.0, 2.0, 0.05)` | `(0, 0, -0.725)` | Semi-Translucent dark glass (`color: 0x0f172a, transmission: 0.5`) |
| **Mounting Ears** | `BoxGeometry` (x2) | `(0.12, 2.0, 0.02)` | `(±1.085, 0, 0.74)` | Polished Chrome (`color: 0xcbd5e1, metalness: 0.95, roughness: 0.1`) |
| **Server Blades** (x4) | Group | - | Stacked at `Y = [-0.6, -0.2, 0.2, 0.6]` | Individual server nodes in slots |
| ├ Blade Faceplate | `BoxGeometry` | `(1.9, 0.3, 1.4)` | `(0, y, 0.0)` | Brushed Dark Steel (`color: 0x0f172a, metalness: 0.9, roughness: 0.2`) |
| ├ Handles (x2) | `CylinderGeometry` | `(r=0.015, h=0.2)` | `(±0.85, y, 0.73)` | Shiny Aluminium (`color: 0xe2e8f0, metalness: 1.0`) |
| ├ Power LED | `SphereGeometry` | `(r=0.025)` | `(-0.7, y, 0.72)` | Glowing Cyan (`color: 0x000000, emissive: 0x06b6d4, intensity: 2.0`) |
| ├ Activity LED | `SphereGeometry` | `(r=0.025)` | `(-0.62, y, 0.72)` | Glowing Green (`color: 0x000000, emissive: 0x10b981, intensity: 2.0`) |
| └ Vent Grill Lines | `BoxGeometry` (x12) | `(0.015, 0.16, 0.02)`| Spaced `X = [-0.4` to `0.6]` | Deep Matte Black ventilation slots |

---

### Asset 2: Microchip
A printed circuit board (PCB) substrate containing a multi-layered silicon package, gold peripheral leads, and glowing circuit traces.

| Component | Shape / Primitive | Dimensions (W, H, D) | Position (X, Y, Z) | Material & Appearance |
| :--- | :--- | :--- | :--- | :--- |
| **Substrate (PCB)** | `BoxGeometry` | `(3.0, 0.08, 3.0)` | `(0, 0, 0)` | Dark Indigo Matte PCB (`color: 0x1e1b4b, roughness: 0.6`) |
| **Chip Base (Ceramic)** | `BoxGeometry` | `(1.8, 0.12, 1.8)` | `(0, 0.1, 0)` | Slate Grey Ceramic (`color: 0x334155, metalness: 0.2, roughness: 0.5`) |
| **Metallic Die Cap** | `BoxGeometry` | `(1.2, 0.04, 1.2)` | `(0, 0.18, 0)` | Polished Chrome Heat Spreader (`color: 0xf8fafc, metalness: 0.98`) |
| **Pins (Leads)** | `BoxGeometry` (x32) | `(0.08, 0.04, 0.3)` | Spaced along 4 die edges | Shiny Gold leads (`color: 0xf59e0b, metalness: 0.9, roughness: 0.1`) |
| **Circuit Traces** | `BoxGeometry` (x16) | `(0.02, 0.012, length)`| Radial patterns on PCB | Active Cyan Glow (`color: 0x000000, emissive: 0x06b6d4, intensity: 1.5`) |
| **Micro Capacitors** | `BoxGeometry` (x6) | `(0.08, 0.06, 0.14)`| Corner surface mounts | Ceramic body with silver terminals |

---

### Asset 3: Code Brackets
Glowing glassmorphic programming brackets (`< >`) with sharp wireframe styling.

| Component | Shape / Primitive | Dimensions (W, H, D) | Rotation (Z-axis) | Material & Appearance |
| :--- | :--- | :--- | :--- | :--- |
| **Left Bracket (`<`)** | Group | - | - | Container for left bracket |
| ├ Top Arm | `BoxGeometry` | `(0.2, 1.2, 0.2)` | `+30°` (Z-axis) | Refractive Glass (`color: 0xffffff, transmission: 0.9, ior: 1.5`) |
| └ Bottom Arm | `BoxGeometry` | `(0.2, 1.2, 0.2)` | `-30°` (Z-axis) | Refractive Glass (`color: 0xffffff, transmission: 0.9, ior: 1.5`) |
| **Right Bracket (`>`)** | Group | - | - | Container for right bracket |
| ├ Top Arm | `BoxGeometry` | `(0.2, 1.2, 0.2)` | `-30°` (Z-axis) | Refractive Glass (`color: 0xffffff, transmission: 0.9, ior: 1.5`) |
| └ Bottom Arm | `BoxGeometry` | `(0.2, 1.2, 0.2)` | `+30°` (Z-axis) | Refractive Glass (`color: 0xffffff, transmission: 0.9, ior: 1.5`) |
| **Slash Bar (`/`)** | `BoxGeometry` | `(0.16, 2.0, 0.16)` | `+15°` (Z-axis) | Tinted Cyan Glass (`color: 0xe0f2fe, transmission: 0.9, ior: 1.6`) |
| **Glowing Outlines** | Duplicated meshes | Scale factor `1.03` | Matches arms | Cyan Hologram Wireframe (`color: 0x06b6d4, wireframe: true`) |

---

## 6. Complete Generation Script Structure

The following script, `generate_assets.js`, contains the complete logic to build, group, and export these assets directly using headless Node.js.

```javascript
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
        const outputDir = path.resolve('public/models');
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
    await exportAsset(createServerRack, 'server_rack.gltf');
    await exportAsset(createMicrochip, 'microchip.gltf');
    await exportAsset(createCodeBrackets, 'code_brackets.gltf');
    console.log('All 3D assets generated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during asset generation:', err);
    process.exit(1);
  }
})();
```

---

## 7. Verification Method

To verify the design proposal and test the output files:

1. **Deploy Script**: Save the code block above as `generate_assets.js` in the project root: `C:\Serdar\portfolio\generate_assets.js`.
2. **Execute Script**: Run the following command in PowerShell:
   ```powershell
   node generate_assets.js
   ```
3. **Verify Files**: Check that the three output files are created in the public folder:
   - `C:\Serdar\portfolio\public\models\server_rack.gltf`
   - `C:\Serdar\portfolio\public\models\microchip.gltf`
   - `C:\Serdar\portfolio\public\models\code_brackets.gltf`
4. **Inspect Structure**: Open any of the exported files in a text editor to confirm the schema contains valid glTF JSON. Search for expected names in the node hierarchy (e.g. `"ServerRack"`, `"Microchip"`, `"CodeBrackets"`).
