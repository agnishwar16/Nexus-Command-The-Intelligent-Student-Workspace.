'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CometStreakProps {
  streakCount: number;
}

export const CometStreak: React.FC<CometStreakProps> = ({ streakCount }) => {
  return (
    <div className="comet-container" style={{ position: 'absolute', top: '15%', left: '15%' }}>
      <div className="label-text" style={{ marginBottom: '0.5rem' }}>Streak Velocity</div>
      <div className="xp-number" style={{ fontSize: '2.5rem', color: 'var(--nebula-amber)' }}>
        {streakCount}
      </div>
      
      {Array.from({ length: Math.min(streakCount, 10) }).map((_, i) => (
        <motion.div
          key={i}
          className="comet"
          initial={{ opacity: 0, x: -100, y: 100, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            x: [0, 200],
            y: [0, -200],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut"
          }}
          style={{
            transform: 'rotate(-45deg)',
            left: `${Math.random() * 50}px`,
            top: `${Math.random() * 50}px`,
            background: `linear-gradient(to bottom, transparent, ${streakCount > 10 ? 'var(--nebula-amber)' : 'var(--nebula-blue)'})`
          }}
        />
      ))}
      <div className="sr-only">[Sound Intention: Periodic crystalline pings synchronized with comet flybys]</div>
    </div>
  );
};
