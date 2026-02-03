import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Texture Loader Component (separate for better error handling)
function TextureLoader({ onLoad }) {
  try {
    const textures = useTexture({
      color1: '/textures/1770041740337_32049model_textile_color1.jpg',
      color2: '/textures/1770041740336_32049model_textile_color2.jpg',
      normal: '/textures/1770041740337_32049model_textile_normal.jpg',
      fabricNormal: '/textures/1770041740337_32049model_fabric_normal.jpg',
      bump: '/textures/1770041740337_32049model_textile_bump.jpg',
    });
    
    useEffect(() => {
      if (textures) {
        onLoad(textures);
      }
    }, [textures, onLoad]);
    
    return null;
  } catch (error) {
    console.error('Texture loading failed:', error);
    return null;
  }
}

// Bed Model Component with realistic textures
function BedModel({ url, config, selectedComponent }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef();
  const cadruRef = useRef();
  const capatRef = useRef();
  const [fabricTextures, setFabricTextures] = useState(null);

  useEffect(() => {
    if (scene && modelRef.current) {
      scene.traverse((child) => {
        if (child.isMesh) {
          const meshName = child.name.toLowerCase();
          
          // Apply materials to CadruPat (frame)
          if (meshName.includes('cadru') || meshName.includes('frame') || meshName.includes('bed')) {
            const isSelected = selectedComponent === 'cadruPat';
            
            let material;
            if (config.cadruPat.material === 'stofa') {
              material = new THREE.MeshStandardMaterial({
                color: config.cadruPat.color,
                metalness: 0.0,
                roughness: 0.5,
                emissive: isSelected ? new THREE.Color(config.cadruPat.color) : new THREE.Color(0x000000),
                emissiveIntensity: isSelected ? 0.3 : 0,
              });
            } else {
              // Wood material
              material = new THREE.MeshStandardMaterial({
                color: config.cadruPat.color,
                metalness: 0.0,
                roughness: 0.8,
                emissive: isSelected ? new THREE.Color(config.cadruPat.color) : new THREE.Color(0x000000),
                emissiveIntensity: isSelected ? 0.3 : 0,
              });
            }
            
            child.material = material;
            cadruRef.current = child;
            child.scale.setScalar(isSelected ? 1 : 1);
          }
          
          // Apply materials to CapatPat (headboard) with textures
          if (meshName.includes('capat') || meshName.includes('head') || meshName.includes('backrest')) {
            const isSelected = selectedComponent === 'capatPat';
            
            let material;
            if (config.capatPat.material === 'fabric' && fabricTextures) {
              // Fabric with realistic textures
              const colorTexture = fabricTextures.color1.clone();
              colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
              colorTexture.repeat.set(10, 10);
              colorTexture.needsUpdate = true;
              
              const normalTexture = fabricTextures.fabricNormal.clone();
              normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
              normalTexture.repeat.set(0.1, 0.1);
              normalTexture.needsUpdate = true;
              
              const bumpTexture = fabricTextures.bump.clone();
              bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;
              bumpTexture.repeat.set(3, 3);
              bumpTexture.needsUpdate = true;
              
              material = new THREE.MeshStandardMaterial({
                color: config.capatPat.color,
                map: colorTexture,
                normalMap: normalTexture,
                normalScale: new THREE.Vector2(0.8, 0.8),
                bumpMap: bumpTexture,
                bumpScale: 1,
                metalness: 0.0,
                roughness: 1,
                emissive: isSelected ? new THREE.Color(config.capatPat.color) : new THREE.Color(0x000000),
                emissiveIntensity: isSelected ? 0.15 : 0,
              });
            } else if (config.capatPat.material === 'stofa') {
              // Fabric without textures (fallback)
              material = new THREE.MeshStandardMaterial({
                color: config.capatPat.color,
                metalness: 0.0,
                roughness: 1,
                emissive: isSelected ? new THREE.Color(config.capatPat.color) : new THREE.Color(0x000000),
                emissiveIntensity: isSelected ? 0.15 : 0,
              });
            } else {
              // Leather material
              material = new THREE.MeshStandardMaterial({
                color: config.capatPat.color,
                metalness: 0.0,
                roughness: 1,
                emissive: isSelected ? new THREE.Color(config.capatPat.color) : new THREE.Color(0x000000),
                emissiveIntensity: isSelected ? 0.2 : 0,
              });
            }
            
            child.material = material;
            child.material.needsUpdate = true;
            capatRef.current = child;
            child.scale.setScalar(isSelected ? 1 : 1);
          }
        }
      });

      // Apply scaling
      modelRef.current.scale.set(
        config.dimensions.width / 100,
        config.dimensions.height / 100,
        config.dimensions.length / 100
      );
    }
  }, [scene, config, selectedComponent, fabricTextures]);

  return (
    <>
      <Suspense fallback={null}>
        <TextureLoader onLoad={setFabricTextures} />
      </Suspense>
      <primitive ref={modelRef} object={scene} />
    </>
  );
}

// Camera Controls Component
function CameraController({ cameraView }) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (!controls) return;
    
    const views = {
      default: { position: [4, 3, 6], target: [0, 1, 0] },
      top: { position: [0, 8, 0.1], target: [0, 0, 0] },
      front: { position: [0, 2, 6], target: [0, 1.2, 0] },
      detail: { position: [2, 1.5, 3], target: [0, 1.2, 0] }
    };
    
    const view = views[cameraView] || views.default;
    
    // Animate camera to new position
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 1200; // ms
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      
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

// Main Configurator Component
export default function BedConfigurator() {
  const [config, setConfig] = useState({
    cadruPat: {
      color: '#8B4513',
      material: 'stofa',
      pricePerUnit: 100
    },
    capatPat: {
      color: '#D2B48C',
      material: 'boucle',
      pricePerUnit: 200
    },
    dimensions: {
      width: 160,
      height: 120,
      length: 200
    },
    basePrices: {
      stofa: 100,
      boucle: 120,
     
    }
  });

  const [selectedComponent, setSelectedComponent] = useState('cadruPat');
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState('queen');
  const [cameraView, setCameraView] = useState('default');

  // Dimension presets
  const dimensionPresets = {
    single: { width: 90, height: 120, length: 190, label: 'Single' },
    queen: { width: 160, height: 120, length: 200, label: 'Queen' },
    king: { width: 180, height: 130, length: 200, label: 'King' }
  };

  // Complete bed configuration presets
  const bedPresets = {
    standard: {
      label: 'Standard',
      description: 'Classic comfort',
      cadruPat: { material: 'stofa', color: '#8B4513', pricePerUnit: 100 },
      capatPat: { material: 'boucle', color: '#D2B48C', pricePerUnit: 200 },
      dimensions: { width: 160, height: 120, length: 200 }
    },
    luxury: {
      label: 'Luxury',
      description: 'Premium materials',
      cadruPat: { material: 'stofa', color: '#2C2C2C', pricePerUnit: 120 },
      capatPat: { material: 'boucle', color: '#654321', pricePerUnit: 200 },
      dimensions: { width: 180, height: 130, length: 200 }
    },
    signature: {
      label: 'Signature',
      description: 'Designer collection',
      cadruPat: { material: 'stofa', color: '#C0C0C0', pricePerUnit: 120 },
      capatPat: { material: 'boucle', color: '#000000', pricePerUnit: 200 },
      dimensions: { width: 180, height: 140, length: 210 }
    }
  };

  // Camera view presets
  const cameraViews = {
    default: { label: 'Default', icon: '🔄' },
    top: { label: 'Top View', icon: '⬇️' },
    front: { label: 'Front View', icon: '👁️' },
    detail: { label: 'Detail View', icon: '🔍' }
  };

  // Available options
  const materials = {
    cadruPat: [
      { name: 'stofa', label: 'Stofa', price: 100 },
      { name: 'boucle', label: 'Boucle', price: 120 }
    ],
    capatPat: [
      { name: 'stofa', label: 'Stofa', price: 100 },
      { name: 'boucle', label: 'Boucle', price: 120 }
    ]
  };

  const colors = {
    stofa: [
      { name: 'Walnut', hex: '#8B4513' },
      { name: 'Oak', hex: '#DEB887' },
      { name: 'Cherry', hex: '#D2691E' },
      { name: 'Mahogany', hex: '#C04000' }
    ],
    boucle: [
      { name: 'Black', hex: '#2C2C2C' },
      { name: 'Silver', hex: '#C0C0C0' },
      { name: 'Gold', hex: '#FFD700' },
      { name: 'Bronze', hex: '#CD7F32' }
    ],
    stofa: [
      { name: 'Beige', hex: '#D2B48C' },
      { name: 'Gray', hex: '#808080' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Cream', hex: '#FFFDD0' }
    ],
    boucle: [
      { name: 'Brown', hex: '#654321' },
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#F5F5DC' },
      { name: 'Tan', hex: '#D2B48C' }
    ]
  };

  // Calculate total price
  useEffect(() => {
    const cadruPrice = config.cadruPat.pricePerUnit * 
      (config.dimensions.width / 100) * 
      (config.dimensions.length / 100);
    
    const capatPrice = config.capatPat.pricePerUnit * 
      (config.dimensions.width / 100) * 
      (config.dimensions.height / 100);
    
    setTotalPrice(Math.round(cadruPrice + capatPrice));
  }, [config]);

  // Update configuration
  const updateConfig = (component, key, value) => {
    setConfig(prev => ({
      ...prev,
      [component]: {
        ...prev[component],
        [key]: value
      }
    }));
  };

  const updateDimension = (dimension, value) => {
    setConfig(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: parseFloat(value) || 100
      }
    }));
    setSelectedPreset(null); // Clear preset when manually adjusting
  };

  const applyPreset = (presetKey) => {
    const preset = dimensionPresets[presetKey];
    setConfig(prev => ({
      ...prev,
      dimensions: {
        width: preset.width,
        height: preset.height,
        length: preset.length
      }
    }));
    setSelectedPreset(presetKey);
  };

  const applyBedPreset = (presetKey) => {
    const preset = bedPresets[presetKey];
    setConfig(prev => ({
      ...prev,
      cadruPat: { ...preset.cadruPat },
      capatPat: { ...preset.capatPat },
      dimensions: { ...preset.dimensions }
    }));
    setSelectedPreset(null); // Clear dimension preset
  };

  // Generate PDF offer
  const generatePDF = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/generate-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          totalPrice,
          cameraView,
          date: new Date().toISOString()
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bed-offer-${Date.now()}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Make sure the backend server is running.');
    }
  };

  // Save to database
  const saveConfiguration = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          totalPrice,
          cameraView,
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Configuration saved successfully!');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration. Make sure the backend server is running.');
    }
  };

  const currentMaterial = selectedComponent === 'cadruPat' 
    ? config.cadruPat.material 
    : config.capatPat.material;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      fontFamily: '"GT Alpina", Georgia, serif',
      backgroundColor: '#FAF9F6',
      color: '#1a1a1a',
      overflow: 'hidden'
    }}>
      {/* Left Panel - Configuration Options */}
      <div style={{
        width: '400px',
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E8E8E8',
        overflowY: 'auto',
        padding: '48px 32px',
        boxShadow: '2px 0 12px rgba(0,0,0,0.03)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '300',
          marginBottom: '8px',
          letterSpacing: '-0.5px'
        }}>
          Bed Configurator
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '48px',
          fontFamily: '"Crimson Pro", serif'
        }}>
          Customize your perfect bed
        </p>

        {/* Bed Presets */}
        <div style={{ marginBottom: '48px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '16px',
            color: '#999'
          }}>
            Quick Presets
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(bedPresets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyBedPreset(key)}
                style={{
                  padding: '16px 20px',
                  border: '1px solid #E8E8E8',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Crimson Pro", serif',
                  borderRadius: '3px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1a1a1a';
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E8E8E8';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  color: '#1a1a1a'
                }}>
                  {preset.label}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#999'
                }}>
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          height: '1px',
          backgroundColor: '#E8E8E8',
          marginBottom: '48px'
        }} />

        {/* Component Selection */}
        <div style={{ marginBottom: '48px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '16px',
            color: '#999'
          }}>
            Selected Component
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['cadruPat', 'capatPat'].map(comp => (
              <button
                key={comp}
                onClick={() => setSelectedComponent(comp)}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: selectedComponent === comp ? '2px solid #1a1a1a' : '1px solid #E8E8E8',
                  backgroundColor: selectedComponent === comp ? '#F8F8F8' : '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: '"Crimson Pro", serif',
                  transition: 'all 0.2s ease',
                  borderRadius: '2px'
                }}
              >
                {comp === 'cadruPat' ? 'Frame (Cadru)' : 'Headboard (Capăt)'}
              </button>
            ))}
          </div>
        </div>

        {/* Material Selection */}
        <div style={{ marginBottom: '48px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '16px',
            color: '#999'
          }}>
            Material
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {materials[selectedComponent].map(mat => (
              <div
                key={mat.name}
                onClick={() => {
                  updateConfig(selectedComponent, 'material', mat.name);
                  updateConfig(selectedComponent, 'pricePerUnit', mat.price);
                }}
                style={{
                  padding: '20px',
                  border: config[selectedComponent].material === mat.name 
                    ? '2px solid #1a1a1a' 
                    : '1px solid #E8E8E8',
                  backgroundColor: config[selectedComponent].material === mat.name 
                    ? '#F8F8F8' 
                    : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: '"Crimson Pro", serif',
                  borderRadius: '4px',
                  boxShadow: config[selectedComponent].material === mat.name 
                    ? '0 4px 12px rgba(0,0,0,0.1)' 
                    : '0 2px 4px rgba(0,0,0,0.05)',
                  transform: config[selectedComponent].material === mat.name 
                    ? 'translateY(-2px)' 
                    : 'translateY(0)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (config[selectedComponent].material !== mat.name) {
                    e.currentTarget.style.borderColor = '#C0C0C0';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (config[selectedComponent].material !== mat.name) {
                    e.currentTarget.style.borderColor = '#E8E8E8';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#1a1a1a'
                }}>
                  {mat.label}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '12px'
                }}>
                  ${mat.price} per unit
                </div>
                {config[selectedComponent].material === mat.name && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#1a1a1a'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div style={{ marginBottom: '48px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '16px',
            color: '#999'
          }}>
            Color
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            {colors[currentMaterial].map(color => (
              <button
                key={color.hex}
                onClick={() => updateConfig(selectedComponent, 'color', color.hex)}
                style={{
                  aspectRatio: '1',
                  backgroundColor: color.hex,
                  border: config[selectedComponent].color === color.hex 
                    ? '3px solid #1a1a1a' 
                    : '1px solid #E8E8E8',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  borderRadius: '2px'
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div style={{ marginBottom: '48px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '16px',
            color: '#999'
          }}>
            Dimensions
          </label>
          
          {/* Preset Buttons */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '8px',
            marginBottom: '24px'
          }}>
            {Object.entries(dimensionPresets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                style={{
                  padding: '14px 12px',
                  border: selectedPreset === key 
                    ? '2px solid #1a1a1a' 
                    : '1px solid #E8E8E8',
                  backgroundColor: selectedPreset === key 
                    ? '#1a1a1a' 
                    : '#FFFFFF',
                  color: selectedPreset === key ? '#FFFFFF' : '#1a1a1a',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: selectedPreset === key ? '500' : '400',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Crimson Pro", serif',
                  borderRadius: '3px',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (selectedPreset !== key) {
                    e.target.style.backgroundColor = '#F8F8F8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPreset !== key) {
                    e.target.style.backgroundColor = '#FFFFFF';
                  }
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Dimensions */}
          <div style={{
            padding: '16px',
            backgroundColor: '#FAFAFA',
            borderRadius: '3px',
            border: '1px solid #E8E8E8'
          }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '16px',
              color: '#999'
            }}>
              Custom Size
            </div>
            {['width', 'height', 'length'].map(dim => (
              <div key={dim} style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontFamily: '"Crimson Pro", serif'
                }}>
                  <span style={{ textTransform: 'capitalize', color: '#666' }}>{dim}</span>
                  <span style={{ fontWeight: '500', color: '#1a1a1a' }}>{config.dimensions[dim]} cm</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="250"
                  value={config.dimensions[dim]}
                  onChange={(e) => updateDimension(dim, e.target.value)}
                  style={{
                    width: '100%',
                    height: '2px',
                    background: '#E8E8E8',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Price Display */}
        <div style={{
          padding: '24px',
          backgroundColor: '#F8F8F8',
          marginBottom: '24px',
          borderRadius: '2px',
          border: '1px solid #E8E8E8'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline'
          }}>
            <span style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: '#999'
            }}>
              Total Price
            </span>
            <span style={{
              fontSize: '32px',
              fontWeight: '300',
              letterSpacing: '-1px'
            }}>
              ${totalPrice}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={saveConfiguration}
            style={{
              padding: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #1a1a1a',
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              transition: 'all 0.2s ease',
              fontFamily: '"GT Alpina", Georgia, serif',
              borderRadius: '2px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1a1a1a';
              e.target.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FFFFFF';
              e.target.style.color = '#1a1a1a';
            }}
          >
            Save Configuration
          </button>
          <button
            onClick={generatePDF}
            style={{
              padding: '16px',
              backgroundColor: '#1a1a1a',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              transition: 'all 0.2s ease',
              fontFamily: '"GT Alpina", Georgia, serif',
              borderRadius: '2px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#333';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#1a1a1a';
            }}
          >
            Download Offer (PDF)
          </button>
        </div>
      </div>

      {/* Right Panel - 3D Viewer */}
      <div style={{
        flex: 1,
        position: 'relative',
        backgroundColor: '#FAF9F6'
      }}>
        <Canvas
          shadows
          camera={{ position: [4, 3, 6], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[4, 3, 6]} />
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <spotLight
              position={[-10, 10, -5]}
              intensity={0.4}
              angle={0.3}
              penumbra={1}
            />
            
            <BedModel url="./Bed.glb" config={config} selectedComponent={selectedComponent} />
            
            <CameraController cameraView={cameraView} />
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={15}
            />
            
            {/* <gridHelper args={[20, 20, '#E8E8E8', '#F0F0F0']} position={[0, -0.01, 0]} /> */}
          </Suspense>
        </Canvas>

        {/* Camera View Controls */}
        <div style={{
          position: 'absolute',
          top: '32px',
          right: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            border: '1px solid #E8E8E8'
          }}>
            <div style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#999',
              marginBottom: '8px',
              paddingLeft: '8px',
              fontFamily: '"Crimson Pro", serif'
            }}>
              Camera Views
            </div>
            {Object.entries(cameraViews).map(([key, view]) => (
              <button
                key={key}
                onClick={() => setCameraView(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: cameraView === key ? '#1a1a1a' : 'transparent',
                  color: cameraView === key ? '#FFFFFF' : '#1a1a1a',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Crimson Pro", serif',
                  borderRadius: '3px',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  if (cameraView !== key) {
                    e.target.style.backgroundColor = '#F8F8F8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (cameraView !== key) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{view.icon}</span>
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Component Labels */}
        <div style={{
          position: 'absolute',
          top: '260px',
          right: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {[
            { name: 'cadruPat', label: 'Frame' },
            { name: 'capatPat', label: 'Headboard' }
          ].map(comp => (
            <button
              key={comp.name}
              onClick={() => setSelectedComponent(comp.name)}
              style={{
                padding: '12px 20px',
                backgroundColor: selectedComponent === comp.name ? '#1a1a1a' : '#FFFFFF',
                color: selectedComponent === comp.name ? '#FFFFFF' : '#1a1a1a',
                border: '1px solid #E8E8E8',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s ease',
                fontFamily: '"Crimson Pro", serif',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: '2px'
              }}
            >
              {comp.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
