import React, { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Apply optimized texture to material
 */
function applyTexturesToMaterial(textures, properties) {
  const baseColorTex = textures.baseColor.clone();
  baseColorTex.wrapS = baseColorTex.wrapT = THREE.RepeatWrapping;
  baseColorTex.repeat.set(properties.repeat, properties.repeat);
  baseColorTex.anisotropy = 4; // Reduced for performance
  baseColorTex.needsUpdate = true;

  const material = new THREE.MeshStandardMaterial({
    map: baseColorTex,
    roughness: properties.roughness,
    metalness: properties.metalness,
  });

  if (textures.normal) {
    const normalTex = textures.normal.clone();
    normalTex.wrapS = normalTex.wrapT = THREE.RepeatWrapping;
    normalTex.repeat.set(properties.repeat, properties.repeat);
    normalTex.anisotropy = 4;
    normalTex.needsUpdate = true;
    material.normalMap = normalTex;
    material.normalScale = new THREE.Vector2(properties.normalScale, properties.normalScale);
  }

  if (textures.roughness) {
    const roughnessTex = textures.roughness.clone();
    roughnessTex.wrapS = roughnessTex.wrapT = THREE.RepeatWrapping;
    roughnessTex.repeat.set(properties.repeat, properties.repeat);
    roughnessTex.needsUpdate = true;
    material.roughnessMap = roughnessTex;
  }

  if (textures.ao) {
    const aoTex = textures.ao.clone();
    aoTex.wrapS = aoTex.wrapT = THREE.RepeatWrapping;
    aoTex.repeat.set(properties.repeat, properties.repeat);
    aoTex.needsUpdate = true;
    material.aoMap = aoTex;
    material.aoMapIntensity = 0.3; // Reduced for performance
  }

  return material;
}

/**
 * Bed Component with Material Application and Headboard Selection
 */
export function Bed({ config, selectedComponent, cadruTextures, capatTextures, headboardType = '01' }) {
  const { nodes, materials } = useGLTF('/Bed.glb');
  const groupRef = useRef();

  useEffect(() => {
    if (!nodes) return;

    // Apply material to CadruPat (Bed Frame)
    if (nodes.CadruPat) {
      let material;
      if (cadruTextures && cadruTextures.textures) {
        material = applyTexturesToMaterial(cadruTextures.textures, cadruTextures.properties);
      } else {
        material = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          roughness: 0.9,
          metalness: 0.0,
        });
      }
      nodes.CadruPat.material = material;
    }

    // Apply material to selected CapatPat (Headboard)
    const headboardNode = nodes[`CapatPat${headboardType}`];
    if (headboardNode) {
      let material;
      if (capatTextures && capatTextures.textures) {
        material = applyTexturesToMaterial(capatTextures.textures, capatTextures.properties);
      } else {
        material = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          roughness: 0.9,
          metalness: 0.0,
        });
      }
      headboardNode.material = material;
    }
  }, [nodes, cadruTextures, capatTextures, selectedComponent, headboardType]);

  return (
    <group ref={groupRef} dispose={null}>
      {/* Main bed structure */}
       {headboardType === '02' && (
      <group position={[-0.031, 0.786, -1.071]}>
        <mesh geometry={nodes.Group008.geometry} material={nodes.Group008.material} position={[-0.027, -0.857, 1.129]} scale={10} />
        <mesh geometry={nodes.Plane009.geometry} material={nodes.Plane009.material} position={[-0.027, -0.857, 1.129]} scale={10} />
        <mesh geometry={nodes.Group007.geometry} material={nodes.Group007.material} position={[-0.027, -0.857, 1.129]} scale={10} />
        <mesh geometry={nodes.Object077.geometry} material={nodes.Object077.material} position={[-0.027, -0.857, 1.129]} scale={10} />
        <mesh geometry={nodes.Object076.geometry} material={nodes.Object076.material} position={[-0.027, -0.857, 1.129]} scale={10} />
        <mesh geometry={nodes.Box222.geometry} material={nodes.Box222.material} position={[-0.027, -0.857, 1.129]} scale={10} />
      </group>
       )}

      {/* Bed clothes and mattress */}
      <mesh geometry={nodes.BED_CLOTHES.geometry} material={nodes.BED_CLOTHES.material} position={[-0.006, 0.385, -0.062]} rotation={[Math.PI / 2, 0, 0]} scale={[1.013, 1.081, 1]} />
      <mesh geometry={nodes.Object075.geometry} material={nodes.Object075.material} position={[-0.006, 0.385, -0.062]} rotation={[Math.PI / 2, 0, 0]} scale={[1.013, 1.081, 1]} />

      {/* Bed Frame (CadruPat) */}
      <mesh geometry={nodes.CadruPat.geometry} material={nodes.CadruPat.material} position={[-0.003, 0.05, -0.02]} rotation={[0, 1.57, 0]} />

      {/* Pillows */}
        {headboardType === '02' && (
      <mesh geometry={nodes.Pillows02.geometry} material={nodes.Pillows02.material} position={[0.017, 0.592, -0.766]} rotation={[Math.PI / 2, 0, 0]} scale={[1.008, 1.058, 1]} />
        )}
        
      <mesh geometry={nodes.Pillows01.geometry} material={nodes.Pillows01.material} position={[0.017, 0.592, -0.766]} rotation={[Math.PI / 2, 0, 0]} scale={[1.008, 1.058, 1]} />

      {/* Headboard options - only show selected one */}
      {headboardType === '01' && (
        <mesh geometry={nodes.CapatPat01.geometry} material={nodes.CapatPat01.material} position={[-0.005, 0.211, -1.126]} rotation={[Math.PI / 2, 0, 0]} scale={[0.098, 0.009, 0.231]} />
      )}
      {headboardType === '02' && (
        <mesh geometry={nodes.CapatPat02.geometry} material={nodes.CapatPat02.material} position={[-0.058, -0.071, 0.059]} scale={10} />
      )}
      {headboardType === '03' && (
        <mesh geometry={nodes.CapatPat03.geometry} material={nodes.CapatPat03.material} position={[-0.008, 0.516, -1.158]} />
      )}

      {/* Bed legs/feet */}
      <mesh geometry={nodes.Box005.geometry} material={nodes.Box005.material} position={[-0.839, 0, -1.01]} rotation={[-Math.PI, 0, 0]} scale={[1, -1, 1]} />
      <mesh geometry={nodes.Box006.geometry} material={nodes.Box006.material} position={[0.832, 0, -1.008]} rotation={[-Math.PI, 0, -Math.PI]} />
      <mesh geometry={nodes.Box004.geometry} material={nodes.Box004.material} position={[0.833, 0, 0.972]} rotation={[0, 0, -Math.PI]} scale={[1, -1, 1]} />
      <mesh geometry={nodes.Box003.geometry} material={nodes.Box003.material} position={[-0.845, 0, 0.977]} />
    </group>
  );
}

useGLTF.preload('/Bed.glb');

export default Bed;