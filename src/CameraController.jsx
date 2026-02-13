import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Camera Controller Component
 * 
 * Handles smooth camera transitions between different view presets
 * 
 * @param {string} cameraView - Current camera view preset name
 */
export default function CameraController({ cameraView }) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (!controls) return;
    
    const views = {
      default: { position: [2, 3, 4], target: [0, 1, 0] },
      top: { position: [0, 5, 0.1], target: [0, 0, 0] },
      front: { position: [0, 2, 4], target: [0, 0.8, 0] },
      detail: { position: [-1.5, 0.5, 2], target: [0, 0.4, 0] }
    };
    
    const view = views[cameraView] || views.default;
    
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 1200;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      camera.position.lerpVectors(
        startPos, 
        new THREE.Vector3(...view.position), 
        eased
      );
      
      controls.target.lerpVectors(
        startTarget, 
        new THREE.Vector3(...view.target), 
        eased
      );
      
      controls.update();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [cameraView, camera, controls]);
  
  return null;
}