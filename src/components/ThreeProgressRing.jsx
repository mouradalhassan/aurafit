import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus } from '@react-three/drei';

const ProgressRing = ({ color, percentage, radius, tube }) => {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    meshRef.current.rotation.z = clock.getElapsedTime() * 0.5;
  });

  // Calculate arc length based on percentage
  const arc = (percentage / 100) * Math.PI * 2;

  return (
    <Torus ref={meshRef} args={[radius, tube, 16, 100, arc]} rotation={[0, 0, Math.PI / 2]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </Torus>
  );
};

const BackgroundRing = ({ radius, tube }) => {
  return (
    <Torus args={[radius, tube, 16, 100, Math.PI * 2]} rotation={[0, 0, Math.PI / 2]}>
      <meshStandardMaterial color="#1F2633" transparent opacity={0.5} />
    </Torus>
  );
};

const ThreeProgressRing = ({ percentage = 75, color = '#00E676' }) => {
  return (
    <div style={{ height: '150px', width: '150px', margin: '0 auto' }}>
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 0, 2]} intensity={1} />
        
        <BackgroundRing radius={1.2} tube={0.15} />
        <ProgressRing color={color} percentage={percentage} radius={1.2} tube={0.16} />
      </Canvas>
    </div>
  );
};

export default ThreeProgressRing;
