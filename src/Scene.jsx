import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

import CameraController from './CameraController';
import MaterialHandler from './MaterialHandler';
import Bed from './BedMlt';
import { Showroom } from './Bedroom';

/**
 * SCENE WITH ENVIRONMENT TOGGLE
 * Switch between Minimalist Studio and Bedroom Showroom
 */

// Minimalist Environment
function MinimalistEnvironment() {
  return (
    <>
      {/* MINIMALIST LIGHTING */}
      <directionalLight position={[5, 10, 5]} intensity={0.5} color="#ffffff" />
      <directionalLight position={[-5, 8, 3]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" />
      <ambientLight intensity={0.8} />
      <hemisphereLight skyColor="#ffffff" groundColor="#f8f8f8" intensity={0.6} />
      
      {/* Light Gray Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.1} metalness={0.0} />
      </mesh>
      
      {/* Soft Contact Shadows */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.9}
        scale={15}
        blur={1.5}
        far={10}
        resolution={512}
        color="#000000"
      />
    </>
  );
}

function SceneContent({ 
  config, 
  selectedComponent, 
  headboardType,
  cameraView,
  showBedroom,
  onCadruTexturesReady,
  onCapatTexturesReady,
  FABRIC_MATERIALS,
  cadruTextures,
  capatTextures
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[4, 2, 5]} />
      
      {/* Material Handlers */}
      <MaterialHandler 
        materialType={config.cadruPat.materialType}
        colorId={config.cadruPat.colorId}
        onTexturesReady={onCadruTexturesReady}
        FABRIC_MATERIALS={FABRIC_MATERIALS}
      />
      <MaterialHandler 
        materialType={config.capatPat.materialType}
        colorId={config.capatPat.colorId}
        onTexturesReady={onCapatTexturesReady}
        FABRIC_MATERIALS={FABRIC_MATERIALS}
      />
      
      {/* ENVIRONMENT TOGGLE - Bedroom or Minimalist Studio */}
      {/* {showBedroom ? (
        <Showroom />
        
      ) : (
        <MinimalistEnvironment />
      )} */}
          <MinimalistEnvironment />
      {/* Bed Model */}
      <Bed
        config={config}
        selectedComponent={selectedComponent}
        cadruTextures={cadruTextures}
        capatTextures={capatTextures}
        headboardType={headboardType}
      />
      {/* {showBedroom && (
        
      <Showroom/>
      )} */}
      {/* Camera Controls */}
      <CameraController cameraView={cameraView} />
      
      {/* Orbit Controls */}
      <OrbitControls 
        makeDefault  
        enablePan 
        enableZoom 
        enableRotate 
        minDistance={2} 
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2 - 0.1}
        target={[0, 0.7, 0]}
      />
    </>
  );
}

export default function Scene({ 
  config, 
  selectedComponent, 
  headboardType,
  cameraView,
  showBedroom = false, // NEW PROP!
  onCadruTexturesReady,
  onCapatTexturesReady,
  FABRIC_MATERIALS
}) {
  const [cadruTextures, setCadruTextures] = useState(null);
  const [capatTextures, setCapatTextures] = useState(null);

  const handleCadruTextures = (textures) => {
    setCadruTextures(textures);
    if (onCadruTexturesReady) onCadruTexturesReady(textures);
  };

  const handleCapatTextures = (textures) => {
    setCapatTextures(textures);
    if (onCapatTexturesReady) onCapatTexturesReady(textures);
  };

  return (
    <Canvas
      shadows={showBedroom} // Enable shadows only in bedroom mode
      camera={{ position: [4, 2, 5], fov: 50 }}
      className="canvas-container"
      gl={{ 
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping, 
        toneMappingExposure: showBedroom ? 0.9 : 1.05,
        outputEncoding: THREE.sRGBEncoding,
      }}
      dpr={[1, 2]}
      frameloop="demand"
      performance={{ min: 0.1 }}
    >
      {/* Dynamic background */}
      {/* <color attach="background" args={[showBedroom ? '#e8e8e8' : '#fafafa']} />
      {!showBedroom && <fog attach="fog" args={['#fafafa', 15, 50]} />} */}
      
      <Suspense fallback={null}>
        <SceneContent
          config={config}
          selectedComponent={selectedComponent}
          headboardType={headboardType}
          cameraView={cameraView}
          showBedroom={showBedroom}
          onCadruTexturesReady={handleCadruTextures}
          onCapatTexturesReady={handleCapatTextures}
          FABRIC_MATERIALS={FABRIC_MATERIALS}
          cadruTextures={cadruTextures}
          capatTextures={capatTextures}
        />
      </Suspense>
    </Canvas>
  );
}