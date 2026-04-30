'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { NebulaBackground } from './NebulaBackground';
import { BlackHole } from './BlackHole';
import { CourseMonolith } from './CourseMonolith';
import { LeaderboardSystem } from './LeaderboardSystem';
import { CometStreak } from './CometStreak';
import '@/app/nebula.css';

interface NebulaDashboardProps {
  children?: React.ReactNode;
}

export default function NebulaDashboard({ children }: NebulaDashboardProps) {
  const [streak, setStreak] = useState(15);
  const [isInactive, setIsInactive] = useState(false);
  const [rank, setRank] = useState(5); // 1 is top
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Zoom on scroll
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 2]);
  const smoothScale = useSpring(scale, { damping: 20, stiffness: 50 });

  // Inactivity logic
  const resetInactivity = () => {
    setIsInactive(false);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => setIsInactive(true), 60000);
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetInactivity);
    resetInactivity();
    return () => window.removeEventListener('mousemove', resetInactivity);
  }, []);

  // Gravity/Drift physics
  const driftX = useSpring(isInactive ? 100 : 0, { damping: 10, stiffness: 20 });
  const gravityY = rank === 1 ? -50 : (rank === 5 ? 50 : 0);
  const smoothGravityY = useSpring(gravityY, { damping: 15, stiffness: 30 });

  // Color temperature based on streak
  const nebulaColor = streak > 20 ? 'var(--nebula-amber)' : (streak > 5 ? 'var(--nebula-teal)' : 'var(--nebula-blue)');

  return (
    <div className="nebula-container" style={{ height: '200vh' }}>
      <NebulaBackground />
      
      <motion.div 
        style={{ 
          scale: smoothScale,
          x: driftX,
          y: smoothGravityY,
          width: '100%',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          transition: { duration: 0.5 }
        }}
      >
        {/* Central Black Hole */}
        <BlackHole xpProgress={0.65} avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
        
        {/* Dynamic Content */}
        {children ? (
          children
        ) : (
          <>
            <CourseMonolith title="Advanced Quantum JS" xpValue={850} orbitRadius={250} orbitSpeed={0.5} angleOffset={0} />
            <CourseMonolith title="Neural CSS Architectures" xpValue={1200} orbitRadius={350} orbitSpeed={0.3} angleOffset={Math.PI / 2} />
            <CourseMonolith title="Void Data Structures" xpValue={600} orbitRadius={450} orbitSpeed={0.2} angleOffset={Math.PI} />
          </>
        )}
        
        {/* Leaderboard System */}
        <LeaderboardSystem />
        
        {/* Comet Streaks */}
        <CometStreak streakCount={streak} />
        
        {/* Dynamic Color Overlay */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at center, transparent, ${nebulaColor} 150%)`,
            pointerEvents: 'none',
            mixBlendMode: 'multiply',
            opacity: 0.4
          }}
        />
      </motion.div>

      {/* Scroll Indicator */}
      <div 
        className="label-text" 
        style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          left: '50%', 
          transform: 'translateX(-50%)',
          opacity: 0.5,
          pointerEvents: 'none'
        }}
      >
        Scroll to enter the void
      </div>

      <div className="sr-only">
        [Sound Intentions: 
        - Hovering center: Low resonant hum
        - Scrolling: Deep atmospheric whoosh
        - Completing course: Crystalline ping followed by deep whomp
        - Long inactivity: Soundscape fades to silence, then snaps back with a sudden cosmic reverb]
      </div>
    </div>
  );
}
