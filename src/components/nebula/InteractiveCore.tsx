'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars, Torus } from '@react-three/drei';
import * as THREE from 'three';

// The pulsating central core
const Core = ({ avatarUrl }: { avatarUrl?: string }) => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const torusRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.y = time * 0.2;
    }
    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.5;
      torusRef.current.rotation.y = time * 0.3;
    }
    if (torusRef2.current) {
      torusRef2.current.rotation.x = -time * 0.4;
      torusRef2.current.rotation.z = time * 0.6;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      {/* Outer spinning rings */}
      <Torus ref={torusRef} args={[2.2, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={2} wireframe />
      </Torus>
      
      <Torus ref={torusRef2} args={[1.8, 0.02, 16, 100]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#bc13fe" emissive="#bc13fe" emissiveIntensity={2} />
      </Torus>

      {/* Central Distorted Sphere */}
      <Sphere ref={sphereRef} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#0a0a0a"
          emissive="#bc13fe"
          emissiveIntensity={0.5}
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={1}
        />
      </Sphere>
      
      {/* Intense inner light */}
      <pointLight color="#00f2ff" intensity={50} distance={10} />
      <pointLight color="#bc13fe" intensity={50} distance={10} position={[0, 2, 0]} />
    </Float>
  );
};

interface InteractiveCoreProps {
  avatarUrl?: string;
  xpProgress?: number;
}

export default function InteractiveCore({ avatarUrl }: InteractiveCoreProps) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', cursor: 'grab' }} className="active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        
        <Core avatarUrl={avatarUrl} />
        
        {/* Background stars floating around the core */}
        <Stars radius={10} depth={50} count={1000} factor={4} saturation={1} fade speed={1} />
        
        {/* Allows the user to rotate the core */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={1} 
          maxPolarAngle={Math.PI / 1.5} 
          minPolarAngle={Math.PI / 3} 
        />
      </Canvas>
      
      {/* Overlay the 2D profile image in front of the 3D canvas if desired, or leave it abstract */}
      {avatarUrl && (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10
        }}>
            <img 
                src={avatarUrl} 
                alt="Profile" 
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '2px solid rgba(0, 242, 255, 0.5)',
                    boxShadow: '0 0 20px rgba(0, 242, 255, 0.5)',
                    filter: 'contrast(1.2) saturate(1.2)',
                    mixBlendMode: 'screen',
                    opacity: 0.8
                }}
            />
        </div>
      )}
    </div>
  );
}
