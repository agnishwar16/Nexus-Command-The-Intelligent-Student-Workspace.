'use client';

import React from 'react';

export const NebulaBackground = () => {
  return (
    <>
      <div className="nebula-background" />
      <svg style={{ display: 'none' }}>
        <filter id="nebula-filter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.015" 
            numOctaves="3" 
            seed="2"
          >
            <animate 
              attributeName="baseFrequency" 
              values="0.01;0.015;0.01" 
              dur="30s" 
              repeatCount="indefinite" 
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="30" />
        </filter>
        
        <filter id="gravitational-lens">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix 
            in="blur" 
            mode="matrix" 
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" 
            result="lens" 
          />
          <feComposite in="SourceGraphic" in2="lens" operator="atop" />
        </filter>
      </svg>
    </>
  );
};
