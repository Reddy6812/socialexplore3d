import React, { FC, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface IntroSceneProps {
  onFinish: () => void;
}

// Nested content component for Canvas context
const SceneContent: FC<IntroSceneProps> = ({ onFinish }) => {
  const { camera } = useThree();
  const nodes = useMemo(
    () => Array.from({ length: 200 }).map(() => ({
      x: (Math.random() - 0.5) * 20,
      y: Math.random() * 20,
      z: (Math.random() - 0.5) * 20,
    })),
    []
  );
  const clouds = useMemo(
    () => Array.from({ length: 30 }).map(() => ({
      x: (Math.random() - 0.5) * 25,
      y: Math.random() * 20,
      z: (Math.random() - 0.5) * 25,
      scale: 2 + Math.random() * 4,
    })),
    []
  );
  useFrame((_, delta) => {
    camera.position.y -= delta * 4;
    if (camera.position.y < -5) onFinish();
  });
  return (
    <>
      <fogExp2 attach="fog" args={[ '#000', 0.05 ]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      {nodes.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#0ff" />
        </mesh>
      ))}
      {clouds.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} scale={[c.scale, c.scale, c.scale]}> 
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#888" transparent opacity={0.2} />
        </mesh>
      ))}
      <Html center style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>
        <div>Welcome to the world of Nodes.</div>
      </Html>
    </>
  );
};

const IntroScene: FC<IntroSceneProps> = ({ onFinish }) => (
  <Canvas
    style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000' }}
    camera={{ position: [0, 10, 30], fov: 60 }}
  >
    <SceneContent onFinish={onFinish} />
  </Canvas>
);

export default IntroScene; 