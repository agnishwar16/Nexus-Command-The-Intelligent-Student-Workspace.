'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BlackHoleProps {
  avatarUrl?: string;
  xpProgress: number; // 0 to 1
}

export const BlackHole: React.FC<BlackHoleProps> = ({ avatarUrl, xpProgress }) => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 4;
    const y = (e.clientY - rect.top - rect.height / 2) / 4;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Shared color spectrum for the whole reactor
  const colorSpectrum = [
    "rgba(0, 242, 255, 0.4)", // Cyan
    "rgba(188, 19, 254, 0.4)", // Purple
    "rgba(255, 0, 255, 0.4)", // Magenta
    "rgba(0, 242, 255, 0.4)"  // Back to Cyan
  ];

  const solidSpectrum = [
    "#00f2ff", // Cyan
    "#bc13fe", // Purple
    "#ff00ff", // Magenta
    "#00f2ff"  // Back to Cyan
  ];

  return (
    <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="black-hole-container" 
        style={{ 
            position: 'relative', 
            width: '280px', 
            height: '280px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            perspective: '1200px'
        }}
    >
      
      {/* Chromatic Shifting Aura (Outer Glow) */}
      <motion.div 
        animate={{ 
            scale: [1, 1.2, 1],
            background: [
                `radial-gradient(circle, ${colorSpectrum[0]} 0%, transparent 75%)`,
                `radial-gradient(circle, ${colorSpectrum[1]} 0%, transparent 75%)`,
                `radial-gradient(circle, ${colorSpectrum[2]} 0%, transparent 75%)`,
                `radial-gradient(circle, ${colorSpectrum[0]} 0%, transparent 75%)`,
            ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{
            position: 'absolute',
            inset: '0px',
            borderRadius: '50%',
            filter: 'blur(60px)',
            zIndex: 0
        }}
      />

      {/* 3D Reactor Sphere */}
      <motion.div 
        animate={{ 
            rotateY: mousePos.x,
            rotateX: -mousePos.y,
            borderColor: [solidSpectrum[0], solidSpectrum[1], solidSpectrum[2], solidSpectrum[0]],
            boxShadow: `
              ${-mousePos.x}px ${mousePos.y}px 40px rgba(0, 242, 255, 0.2),
              inset ${mousePos.x/2}px ${-mousePos.y/2}px 30px rgba(255, 255, 255, 0.1)
            `
        }}
        transition={{ 
            rotateY: { type: 'spring', stiffness: 120, damping: 15 },
            rotateX: { type: 'spring', stiffness: 120, damping: 15 },
            borderColor: { duration: 10, repeat: Infinity, ease: "linear" }
        }}
        style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(10, 20, 30, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Specular Highlight */}
        <motion.div 
            animate={{ x: mousePos.x * 2, y: mousePos.y * 2 }}
            style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: '60px',
                height: '60px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                filter: 'blur(10px)',
                borderRadius: '50%',
                zIndex: 15,
                pointerEvents: 'none'
            }}
        />

        {/* Shifting Liquid Energy */}
        <div style={{ position: 'absolute', inset: -20, opacity: 0.6, mixBlendMode: 'screen' }}>
            <svg width="100%" height="100%">
                <filter id="energy-flux">
                    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" seed="1">
                        <animate attributeName="baseFrequency" dur="15s" values="0.02;0.03;0.02" repeatCount="indefinite" />
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" scale="30" />
                </filter>
                <motion.circle 
                    cx="100" cy="100" r="90" 
                    animate={{ fill: solidSpectrum }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    filter="url(#energy-flux)" 
                />
            </svg>
        </div>

        {avatarUrl && (
          <motion.div
            animate={{
                filter: [
                    'contrast(1.2) brightness(1.2) drop-shadow(0 0 10px rgba(0, 242, 255, 0.5))',
                    'contrast(1.2) brightness(1.2) drop-shadow(0 0 25px rgba(188, 19, 254, 0.5))',
                    'contrast(1.2) brightness(1.2) drop-shadow(0 0 10px rgba(0, 242, 255, 0.5))'
                ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
                width: '82%',
                height: '82%',
                borderRadius: '50%',
                overflow: 'hidden',
                zIndex: 10,
                transform: `translateZ(40px) scale(1.05)`,
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                }} 
              />
          </motion.div>
        )}

        {/* Abyss Depth Shadow */}
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 50px #000', zIndex: 5, pointerEvents: 'none' }} />
      </motion.div>
      
      {/* Chromatic XP Orbital Ring */}
      <svg width="280" height="280" style={{ position: 'absolute', transform: 'rotate(-90deg)', zIndex: 2 }}>
          <motion.circle 
            cx="140" cy="140" r="110" 
            fill="none" 
            animate={{ stroke: solidSpectrum }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            strokeWidth="3" 
            strokeDasharray="690" 
            strokeDashoffset={690 - (690 * xpProgress)}
            strokeLinecap="round"
            style={{ 
                opacity: 0.8, 
                transition: 'stroke-dashoffset 1s ease' 
            }}
          />
      </svg>

      {/* UI Label */}
      <div style={{ position: 'absolute', bottom: '-20px', textAlign: 'center', width: '100%' }}>
        <motion.div 
            animate={{ color: solidSpectrum }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="cyber-text" 
            style={{ fontSize: '10px', letterSpacing: '6px', opacity: 0.6 }}
        >
            NEURAL CORE
        </motion.div>
      </div>
    </div>
  );
};
