import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * OPTIMIZED - Apply only baseColor texture for performance
 */
function applyTexturesToMaterial(textures, properties) {
  const baseColorTex = textures.baseColor.clone();
  baseColorTex.wrapS = baseColorTex.wrapT = THREE.RepeatWrapping;
  baseColorTex.repeat.set(properties.repeat, properties.repeat);
  baseColorTex.anisotropy = 2; // Reduced from 4 for performance
  baseColorTex.needsUpdate = true;

  const material = new THREE.MeshStandardMaterial({
    map: baseColorTex,
    roughness: properties.roughness,
    metalness: properties.metalness,
  });

  // REMOVED for performance: normal map, roughness map, ao map, displacement
  
  return material;
}

/**
 * OPTIMIZED Bed Component
 */
export function Bed({ config, selectedComponent, cadruTextures, capatTextures, headboardType = '01' }) {
  const { nodes, materials } = useGLTF('/BedM.glb');
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
          color: 0xD4C5A9,
          roughness: 0.9,
          metalness: 0.0,
        });
      }
      nodes.CadruPat.material = material;
      nodes.CadruPat.material.needsUpdate = true;
    }

    // Apply material to ALL headboard variants (01, 02)
    ['01', '02'].forEach((type) => {
      const headboardNode = nodes[`CapatPat${type}`];
      if (headboardNode) {
        let material;
        if (capatTextures && capatTextures.textures) {
          material = applyTexturesToMaterial(capatTextures.textures, capatTextures.properties);
        } else {
          material = new THREE.MeshStandardMaterial({
            color: 0xB8A88A,
            roughness: 0.9,
            metalness: 0.0,
          });
        }
        headboardNode.material = material;
        headboardNode.material.needsUpdate = true;
      }
    });

    // Apply dimensions scaling
    if (groupRef.current && config && config.dimensions) {
      const scaleX = config.dimensions.width / 160;
      const scaleY = config.dimensions.height / 120;
      const scaleZ = config.dimensions.length / 200;
      
      groupRef.current.scale.set(scaleX, scaleY, scaleZ);
    }
  }, [nodes, cadruTextures, capatTextures, config, headboardType]);

  return (
    <group ref={groupRef} dispose={null}>
      <mesh geometry={nodes.BED_CLOTHES.geometry} material={materials['03 - Default']} position={[-0.006, 0.385, -0.062]} rotation={[Math.PI / 2, 0, 0]} scale={[1.013, 1.081, 1]} >
        <meshStandardMaterial color="#695034" roughness={1.2} metalness={0.1} />
      </mesh>
      <mesh geometry={nodes.Object075.geometry} material={materials['03 - Default']} position={[-0.006, 0.385, -0.062]} rotation={[Math.PI / 2, 0, 0]} scale={[1.013, 1.081, 1]} >
        <meshStandardMaterial color="#fdedd7" roughness={1.5} metalness={0.1} />
      </mesh>
      <mesh geometry={nodes.CadruPat.geometry} material={nodes.CadruPat.material} position={[-0.003, 0.05, -0.02]} rotation={[0, 1.57, 0]} />
      <mesh geometry={nodes.Pillows02.geometry} material={nodes.Pillows02.material} position={[0.017, 0.592, -0.766]} rotation={[Math.PI / 2, 0, 0]} scale={[1.008, 1.058, 1]}>
        <meshStandardMaterial color="#fdedd7" roughness={1.2} metalness={0.1} />
      </mesh>
      <mesh geometry={nodes.Pillows01.geometry} material={materials['03 - Default']} position={[0.017, 0.592, -0.766]} rotation={[Math.PI / 2, 0, 0]} scale={[1.008, 1.058, 1]} >
        <meshStandardMaterial color="#fdedd7" roughness={1.2} metalness={0.1} />
      </mesh>
      <mesh geometry={nodes.Box005.geometry} material={nodes.Box005.material} position={[-0.839, 0, -1.01]} rotation={[-Math.PI, 0, 0]} scale={[1, -1, 1]} >
        <meshStandardMaterial color="#000000" roughness={1.2} metalness={0.1} />
      </mesh>
      <mesh geometry={nodes.Box006.geometry} material={nodes.Box006.material} position={[0.832, 0, -1.008]} rotation={[-Math.PI, 0, -Math.PI]} >
        <meshStandardMaterial color="#000000" roughness={1.2} metalness={0.1} />
      </mesh>
      <mesh geometry={nodes.Box004.geometry} material={nodes.Box004.material} position={[0.833, 0, 0.972]} rotation={[0, 0, -Math.PI]} scale={[1, -1, 1]} >
        <meshStandardMaterial color="#000000" roughness={1.2} metalness={0.1} />
      </mesh>
      <mesh geometry={nodes.Box003.geometry} material={nodes.Box003.material} position={[-0.845, 0, 0.977]} >
        <meshStandardMaterial color="#000000" roughness={1.2} metalness={0.1} />
      </mesh>
      
      {headboardType === '02' && (
        <mesh geometry={nodes.CapatPat02.geometry} material={nodes.CapatPat02.material} position={[-0.008, 0.50, -1.148]} />
      )}
      
      {headboardType === '01' && (
        <mesh geometry={nodes.CapatPat01.geometry} material={nodes.CapatPat01.material} position={[-0.015, 0.717, -1.104]} rotation={[Math.PI / 2, 0, 0]} scale={[0.098, 0.099, 0.078]} />
      )}
    </group>
  )
}

useGLTF.preload('/BedM.glb');

export default Bed;