'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CourseMonolithProps {
  title: string;
  xpValue?: number;
  orbitRadius: number;
  orbitSpeed: number;
  angleOffset: number;
  children?: React.ReactNode;
}

export const CourseMonolith: React.FC<CourseMonolithProps> = ({ 
  title, 
  xpValue, 
  orbitRadius, 
  orbitSpeed,
  angleOffset,
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Orbit logic
  const time = useMotionValue(0);
  const lastTime = useRef(0);
  const lastTimeRaw = useRef(0);
  
  React.useEffect(() => {
    let frame: number;
    const animate = (t: number) => {
      // Pause orbit when hovered to allow interaction
      if (!isHovered) {
        lastTime.current += (t - (lastTimeRaw.current || t)) * 0.001 * orbitSpeed;
        time.set(lastTime.current + angleOffset);
      }
      lastTimeRaw.current = t;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [orbitSpeed, angleOffset, time, isHovered]);

  const x = useTransform(time, t => Math.cos(t) * orbitRadius);
  const y = useTransform(time, t => Math.sin(t) * orbitRadius);
  
  // Interaction physics
  const springConfig = { damping: 25, stiffness: 120 };
  const scale = useSpring(isHovered ? 1.1 : 0.9, springConfig);
  const zIndex = isHovered ? 100 : 1;

  const handleComplete = () => {
    if (!children) setIsCompleted(true);
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        animate={{ scale: 0, opacity: 0, filter: 'blur(20px)' }}
        style={{ x, y, position: 'absolute', top: '50%', left: '50%' }}
        className="monolith"
      />
    );
  }

  return (
    <motion.div
      className="monolith"
      style={{ 
        x: isHovered ? 0 : x, 
        y: isHovered ? 0 : y, 
        scale, 
        zIndex,
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: children ? '-300px' : '-40px',
        marginLeft: children ? '-350px' : '-60px',
        width: isHovered && children ? '700px' : (children ? '400px' : 'auto'),
        maxHeight: '80vh',
        background: isHovered ? 'rgba(10, 10, 20, 0.95)' : 'rgba(255, 255, 255, 0.05)',
        boxShadow: isHovered ? '0 0 50px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.1)' : 'none',
        borderRadius: '12px',
        padding: isHovered ? '40px' : '20px',
        overflowY: 'auto',
        transition: 'background 0.3s, width 0.4s, margin 0.4s'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleComplete}
    >
      <div className="monolith-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isHovered ? '24px' : '0' }}>
          <div>
            <span className="label-text" style={{ opacity: 0.5 }}>{children ? 'System' : 'Course'}</span>
            <h3 style={{ margin: 0, fontSize: isHovered ? '1.8rem' : '1.2rem', color: 'white' }}>{title}</h3>
          </div>
          {isHovered && <span className="label-text">Active Link</span>}
        </div>
        
        {children && (
          <div style={{ opacity: isHovered ? 1 : 0.2, transition: 'opacity 0.3s' }}>
            {children}
          </div>
        )}
        
        {!children && xpValue && (
          <div style={{ marginTop: '1rem' }}>
            <span className="xp-number" style={{ fontSize: '1.5rem' }}>{xpValue}</span>
            <span className="label-text" style={{ marginLeft: '0.5rem' }}>XP</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
