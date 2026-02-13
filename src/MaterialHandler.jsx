import React, { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';

/**
 * Material Handler Component - SAFE VERSION
 * 
 * Always calls useTexture with valid paths to avoid React hook errors
 */
export default function MaterialHandler({ materialType, colorId, onTexturesReady, FABRIC_MATERIALS }) {
  const materialConfig = FABRIC_MATERIALS?.[materialType];
  const colorConfig = materialConfig?.colors?.find(c => c.id === colorId);
  
  // CRITICAL: Always return a valid object, never null
  // This ensures useTexture is always called with the same structure
  const texturePaths = useMemo(() => {
    const baseColor = colorConfig?.baseColor || '/textures/fabric/Fabric062_1K-JPG_Color.jpg';
    
    const paths = { baseColor };
    
    // Add optional paths only if they exist
    if (colorConfig?.normal) paths.normal = colorConfig.normal;
    if (colorConfig?.roughness) paths.roughness = colorConfig.roughness;
    if (colorConfig?.metallic) paths.metallic = colorConfig.metallic;
    if (colorConfig?.ao) paths.ao = colorConfig.ao;
    if (colorConfig?.displacement) paths.displacement = colorConfig.displacement;
    
    return paths;
  }, [colorConfig]);

  // ALWAYS call useTexture - never conditionally
  const textures = useTexture(texturePaths);
  
  useEffect(() => {
    if (textures && colorConfig && materialConfig) {
      onTexturesReady({
        textures,
        config: colorConfig,
        properties: materialConfig.properties
      });
    }
  }, [textures, colorConfig, materialConfig, onTexturesReady]);
  
  return null;
}