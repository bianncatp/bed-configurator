import React, { useState, useEffect } from 'react';
import Scene from './Scene';
import './BedConfigurator.css';

// Fabric Materials Configuration
const FABRIC_MATERIALS = {
  boucle: {
    name: 'Boucle Fabric',
    colors: [
      {
        id: 'boucle_bubbly',
        name: 'Bubbly Beige',
        baseColor: '/textures/boucle/Poliigon_BoucleFabricBubbly_7827_BaseColor.jpg',
        normal: '/textures/boucle/Poliigon_BoucleFabricBubbly_7827_Normal.png',
        roughness: '/textures/boucle/Poliigon_BoucleFabricBubbly_7827_Roughness.jpg',
        metallic: '/textures/boucle/Poliigon_BoucleFabricBubbly_7827_Metallic.jpg',
      }
    ],
    properties: {
      roughness: 0.95,
      metalness: 0.0,
      normalScale: 1.8,
      repeat:2  // Changed from 0.5 to 2 for better performance
    }
  },
  fabric: {
    name: 'Classic Fabric',
    colors: [
      // {
      //   id: 'fabric_062',
      //   name: 'Natural Linen',
      //   baseColor: '/textures/fabric/Fabric062_1K-JPG_Color.jpg',
      //   normal: '/textures/fabric/Fabric062_1K-JPG_NormalGL.jpg',
      //   roughness: '/textures/fabric/Fabric062_1K-JPG_Roughness.jpg',
      //   ao: '/textures/fabric/Fabric062_1K-JPG_AmbientOcclusion.jpg',
      // },
      {
        id: 'fabric_063',
        name: 'Warm Sand',
        baseColor: '/textures/fabric/Fabric063_1K-JPG_Color.jpg',
      },
      {
        id: 'fabric_066',
        name: 'Soft Gray',
        baseColor: '/textures/fabric/Fabric066_1K-JPG_Color.jpg',
      },
      {
        id: 'fabric_061',
        name: 'Deep Charcoal',
        baseColor: '/textures/fabric/Fabric061_1K-JPG_Color.jpg',
      },
      {
        id: 'fabric_029',
        name: 'Muted Taupe',
        baseColor: '/textures/fabric/D151.jpg',
         normal: '/textures/fabric/Fabric062_1K-JPG_NormalGL.jpg',
        roughness: '/textures/fabric/Fabric062_1K-JPG_Roughness.jpg',
        ao: '/textures/fabric/Fabric062_1K-JPG_AmbientOcclusion.jpg',
      },
      {
        id: 'fabric_045',
        name: 'Earthy Clay',
        baseColor: '/textures/fabric/D152.jpg',
      },

        {
        id: 'fabric_047',
        name: 'Earthy Clay',
        baseColor: '/textures/fabric/D153.png',
      },
       
       
    ],
    properties: {
      roughness: 0.9,
      metalness: 0.0,
      normalScale: 1.5,
      repeat: 0.5// Changed from 0.05 to 3 for better performance
    }
  }
};

// Headboard types configuration
const HEADBOARD_TYPES = {
  '01': { label: 'Classic Upholstered', description: 'Timeless padded design' },
  '02': { label: 'Modern Panel', description: 'Clean minimalist style' },
  // '03': { label: 'Tall Statement', description: 'Bold architectural piece' }
};

export default function BedConfigurator() {
  const [config, setConfig] = useState({
    cadruPat: {
      materialType: 'fabric',
      colorId: 'fabric_062',
      pricePerUnit: 60
    },
    capatPat: {
      materialType: 'boucle',
      colorId: 'boucle_bubbly',
      pricePerUnit: 85
    },
    dimensions: {
      width: 160,
      height: 100,
      length: 200
    },
    headboardType: '01' // Default headboard
  });

  const [selectedComponent, setSelectedComponent] = useState('cadruPat');
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState('queen');
  const [cameraView, setCameraView] = useState('default');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBedroom, setShowBedroom] = useState(false);
  const [cadruTextures, setCadruTextures] = useState(null);
  const [capatTextures, setCapatTextures] = useState(null);

  const dimensionPresets = {
    single: { width: 90, height: 100, length: 190, label: 'Single' },
    queen: { width: 160, height: 100, length: 200, label: 'Queen' },
    king: { width: 180, height: 110, length: 200, label: 'King' }
  };

  const cameraViews = {
    default: { label: 'Overview', icon: '○' },
    top: { label: 'Aerial', icon: '⊕' },
    front: { label: 'Frontal', icon: '◐' },
    detail: { label: 'Detail', icon: '◉' }
  };

  useEffect(() => {
    const cadruPrice = config.cadruPat.pricePerUnit * 
      (config.dimensions.width / 100) * 
      (config.dimensions.length / 100);
    
    const capatPrice = config.capatPat.pricePerUnit * 
      (config.dimensions.width / 100) * 
      (config.dimensions.height / 100);
    
    setTotalPrice(Math.round(cadruPrice + capatPrice));
  }, [config]);

  const updateMaterial = (component, materialType, colorId, price) => {
    setConfig(prev => ({
      ...prev,
      [component]: {
        materialType,
        colorId,
        pricePerUnit: price
      }
    }));
  };

  const updateHeadboardType = (type) => {
    setConfig(prev => ({
      ...prev,
      headboardType: type
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
    setSelectedPreset(null);
  };

  const applyPreset = (presetKey) => {
    const preset = dimensionPresets[presetKey];
    setConfig(prev => ({
      ...prev,
      dimensions: { ...preset }
    }));
    setSelectedPreset(presetKey);
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, totalPrice, cameraView, date: new Date().toISOString() })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bed-atelier-proposal-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert('✅ PDF proposal generated successfully!');
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Error generating PDF. Please ensure backend server is running.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:3001/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, totalPrice, cameraView, createdAt: new Date().toISOString() })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Configuration saved!\nID: ${result.id}`);
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('❌ Error saving configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentComponent = config[selectedComponent];
  const currentMaterialConfig = FABRIC_MATERIALS[currentComponent.materialType];

  return (
    <div className="bed-configurator">
      {/* Left Panel */}
      <div className="configurator-panel">
        <div className="panel-header">
          <h1 className="brand-title">BED ATELIER</h1>
          <div className="brand-divider"></div>
          <p className="brand-subtitle">Craft your sanctuary</p>
        </div>

     

        {/* Headboard Type Selection */}
        <div className="section">
          <label className="section-label">Headboard Style</label>
          <div className="headboard-selector">
            {Object.entries(HEADBOARD_TYPES).map(([key, headboard]) => (
              <div
                key={key}
                onClick={() => updateHeadboardType(key)}
                className={`headboard-card ${config.headboardType === key ? 'active' : ''}`}
              >
                <div className="headboard-number">{key}</div>
                <div className="headboard-info">
                  <div className="headboard-label">{headboard.label}</div>
                  <div className="headboard-description">{headboard.description}</div>
                </div>
                {config.headboardType === key && (
                  <div className="material-indicator"></div>
                )}
              </div>
            ))}
          </div>
        </div>
           {/* Component Selection */}
        <div className="section">
          <label className="section-label">Component</label>
          <div className="component-selector">
            <button
              onClick={() => setSelectedComponent('cadruPat')}
              className={`component-button ${selectedComponent === 'cadruPat' ? 'active' : ''}`}
            >
              Frame
            </button>
            <button
              onClick={() => setSelectedComponent('capatPat')}
              className={`component-button ${selectedComponent === 'capatPat' ? 'active' : ''}`}
            >
              Headboard
            </button>
          </div>
        </div>

        {/* Material Type Selection */}
        <div className="section">
          <label className="section-label">Material Type</label>
          <div className="material-grid">
            {Object.entries(FABRIC_MATERIALS).map(([key, material]) => (
              <div
                key={key}
                onClick={() => updateMaterial(
                  selectedComponent,
                  key,
                  material.colors[0].id,
                  key === 'boucle' ? 85 : 60
                )}
                className={`material-card ${currentComponent.materialType === key ? 'active' : ''}`}
              >
                <div className="material-name">{material.name}</div>
                <div className="material-price">${key === 'boucle' ? 85 : 60} per unit</div>
                {currentComponent.materialType === key && (
                  <div className="material-indicator"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Color/Texture Selection */}
        <div className="section">
          <label className="section-label">Fabric Color</label>
          <div className="fabric-color-grid">
            {currentMaterialConfig.colors.map(color => (
              <div
                key={color.id}
                onClick={() => updateMaterial(
                  selectedComponent,
                  currentComponent.materialType,
                  color.id,
                  currentComponent.pricePerUnit
                )}
                className={`fabric-swatch ${currentComponent.colorId === color.id ? 'active' : ''}`}
              >
                <div 
                  className="fabric-preview"
                  style={{ backgroundImage: `url(${color.baseColor})` }}
                ></div>
                <div className="fabric-name">{color.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="section">
          <label className="section-label">Dimensions</label>
          <div className="dimension-presets">
            {Object.entries(dimensionPresets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`dimension-preset ${selectedPreset === key ? 'active' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="dimension-custom">
            <div className="custom-label">Custom Size</div>
            {['width', 'height', 'length'].map(dim => (
              <div key={dim} className="dimension-control">
                <div className="dimension-header">
                  <span className="dimension-name">{dim}</span>
                  <span className="dimension-value">{config.dimensions[dim]} cm</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="250"
                  value={config.dimensions[dim]}
                  onChange={(e) => updateDimension(dim, e.target.value)}
                  className="dimension-slider"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="price-display">
          <span className="price-label">Investment</span>
          <span className="price-amount">${totalPrice}</span>
        </div>

        {/* Actions */}
        <div className="action-buttons">
          <button onClick={saveConfiguration} className="action-button secondary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Preserve Configuration'}
          </button>
          <button onClick={generatePDF} className="action-button primary" disabled={isGeneratingPDF}>
            {isGeneratingPDF ? 'Generating PDF...' : 'Commission Proposal'}
          </button>
        </div>
      </div>

      {/* Right Panel - 3D Viewer */}
      <div className="viewer-panel">
        <Scene 
          config={config}
          selectedComponent={selectedComponent}
          headboardType={config.headboardType}
          cameraView={cameraView}
          onCadruTexturesReady={setCadruTextures}
          onCapatTexturesReady={setCapatTextures}
          FABRIC_MATERIALS={FABRIC_MATERIALS}
           showBedroom={showBedroom}
        />

        {/* Camera Controls */}
        <div className="camera-controls">
          <div className="camera-panel">
            <div className="camera-label">Perspectives</div>
            {Object.entries(cameraViews).map(([key, view]) => (
              <button
                key={key}
                onClick={() => setCameraView(key)}
                className={`camera-button ${cameraView === key ? 'active' : ''}`}
              >
                <span className="camera-icon">{view.icon}</span>
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Component Labels */}
        {/* <div className="component-labels">
          <button
            onClick={() => setSelectedComponent('cadruPat')}
            className={`component-label ${selectedComponent === 'cadruPat' ? 'active' : ''}`}
          >
            Frame
          </button>
          <button
            onClick={() => setSelectedComponent('capatPat')}
            className={`component-label ${selectedComponent === 'capatPat' ? 'active' : ''}`}
          >
            Headboard
          </button>
        </div> */}
        {/* Environment Toggle */}

<div className="environment-toggle">
  <span className="environment-toggle-label">Environment</span>
  <button
    onClick={() => setShowBedroom(false)}
    className={`environment-option ${!showBedroom ? 'active' : ''}`}
  >
    <span className="environment-icon">○</span>
    <span>Studio</span>
  </button>
  <button
    onClick={() => setShowBedroom(true)}
    className={`environment-option ${showBedroom ? 'active' : ''}`}
  >
    <span className="environment-icon">○</span>
    <span>Bedroom</span>
  </button>
</div>
        <div className="watermark">Atelier Collection 2026</div>
      </div>
      
    </div>
  );
}