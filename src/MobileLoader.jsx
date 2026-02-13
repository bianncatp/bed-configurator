import React, { useState, useEffect } from 'react';
import './MobileLoader.css';

/**
 * Mobile Loading Screen - FIXED VERSION
 * Shows a progress bar for 10 seconds while model and materials load
 * Only displays on mobile devices
 */
export default function MobileLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Check if mobile - ONCE on mount
  useEffect(() => {
    const mobile = window.innerWidth <= 1024;
    setIsMobile(mobile);
    
    if (!mobile) {
      setIsVisible(false);
      setHasCompleted(true);
      onComplete();
    }
  }, []); // Empty dependency - only run once

  // Progress animation - ONCE when isMobile is set
  useEffect(() => {
    if (!isMobile || hasCompleted) return;

    let currentProgress = 0;
    
    // Update every 100ms for 10 seconds
    const timer = setInterval(() => {
      currentProgress += 1; // 1% per 100ms = 100 * 100ms = 10 seconds
      
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(timer);
        
        // Fade out and complete
        setTimeout(() => {
          setIsVisible(false);
          setHasCompleted(true);
          onComplete();
        }, 500);
      } else {
        setProgress(currentProgress);
      }
    }, 100);

    // Cleanup
    return () => {
      clearInterval(timer);
    };
  }, [isMobile]); // Only depend on isMobile

  if (!isVisible) return null;

  return (
    <div className="mobile-loader-overlay">
      <div className="mobile-loader-content">
        {/* Brand */}
        <div className="loader-brand">
          <h1 className="loader-title">BED ATELIER</h1>
          <div className="loader-divider"></div>
          <p className="loader-subtitle">Loading your experience</p>
        </div>

        {/* Progress Bar */}
        <div className="loader-progress-container">
          <div className="loader-progress-bar">
            <div 
              className="loader-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="loader-progress-text">
            {progress}%
          </div>
        </div>

        {/* Loading Messages */}
        <div className="loader-message">
          {progress < 30 && "Loading 3D models..."}
          {progress >= 30 && progress < 60 && "Preparing materials..."}
          {progress >= 60 && progress < 90 && "Setting up scene..."}
          {progress >= 90 && "Almost ready..."}
        </div>
      </div>
    </div>
  );
}