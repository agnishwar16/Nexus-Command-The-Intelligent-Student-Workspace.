'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Student {
  id: string;
  name: string;
  xp: number;
  isCurrentUser?: boolean;
}

const students: Student[] = [
  { id: '1', name: 'Alpha', xp: 5000 },
  { id: '2', name: 'Beta', xp: 4200 },
  { id: '3', name: 'Gamma', xp: 3800 },
  { id: '4', name: 'Delta', xp: 3100 },
  { id: '5', name: 'You', xp: 2500, isCurrentUser: true },
];

export const LeaderboardSystem = () => {
  return (
    <div className="leaderboard-system" style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px' }}>
      <div className="label-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>Galactic Standings</div>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {students.map((student, index) => {
          const rank = index + 1;
          const size = 60 - (rank * 8);
          const orbitRadius = 40 + (rank * 25);
          const speed = 20 + (rank * 5);
          
          return (
            <motion.div
              key={student.id}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: size,
                height: size,
                borderRadius: '50%',
                background: student.isCurrentUser ? 'var(--nebula-teal)' : 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: `0 0 ${size/2}px ${student.isCurrentUser ? 'var(--nebula-teal)' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mixBlendMode: 'screen',
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: speed,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div style={{ transform: 'rotate(-360deg)', animation: `counter-rotate ${speed}s linear infinite` }}>
                <div className="xp-number" style={{ fontSize: '0.8rem' }}>#{rank}</div>
              </div>
              
              {/* Orbit Path */}
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: orbitRadius * 2,
                  height: orbitRadius * 2,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: -1,
                  pointerEvents: 'none'
                }}
              />
              
              {/* Placement on orbit */}
              <motion.div
                style={{
                  position: 'absolute',
                  left: orbitRadius,
                  width: '4px',
                  height: '4px',
                  background: 'white',
                  borderRadius: '50%',
                }}
              />
            </motion.div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes counter-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};
