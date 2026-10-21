import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

const AnimatedSphere = () => {
  const sphereRef = useRef();

  useFrame(({ clock }) => {
    sphereRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    sphereRef.current.rotation.z = clock.getElapsedTime() * 0.1;
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2.5}>
      <MeshDistortMaterial 
        color="#00E676" 
        attach="material" 
        distort={0.4} 
        speed={1.5} 
        roughness={0.2}
        wireframe
      />
    </Sphere>
  );
};

const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[-2, 5, 2]} intensity={1} />
        <AnimatedSphere />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
