import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Box, MeshTransmissionMaterial } from '@react-three/drei';

const AnatomyAbstract = () => {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    // Slight breathing effect
    const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
    groupRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <Sphere args={[0.3, 32, 32]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#00E676" wireframe />
      </Sphere>
      
      {/* Torso */}
      <Box args={[1, 1.5, 0.5]} position={[0, 0.5, 0]} radius={0.1}>
        <MeshTransmissionMaterial 
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={1}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.2}
          color="#2979FF"
        />
      </Box>

      {/* Arms */}
      <Cylinder args={[0.15, 0.1, 1.2]} position={[-0.7, 0.5, 0]} rotation={[0, 0, 0.2]}>
        <meshStandardMaterial color="#ffffff" wireframe />
      </Cylinder>
      <Cylinder args={[0.15, 0.1, 1.2]} position={[0.7, 0.5, 0]} rotation={[0, 0, -0.2]}>
        <meshStandardMaterial color="#ffffff" wireframe />
      </Cylinder>

      {/* Legs */}
      <Cylinder args={[0.2, 0.15, 1.5]} position={[-0.25, -1, 0]}>
        <meshStandardMaterial color="#ffffff" wireframe />
      </Cylinder>
      <Cylinder args={[0.2, 0.15, 1.5]} position={[0.25, -1, 0]}>
        <meshStandardMaterial color="#ffffff" wireframe />
      </Cylinder>
    </group>
  );
};

const ThreeAnatomy = () => {
  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 5, 2]} intensity={2} />
        <AnatomyAbstract />
      </Canvas>
    </div>
  );
};

export default ThreeAnatomy;
