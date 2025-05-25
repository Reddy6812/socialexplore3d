import React, { FC, ReactNode, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { NodeData, EdgeData } from '../hooks/useGraphData';

// Generate points on a sphere via Fibonacci method
function fibonacciSphere(samples: number) {
  const points: { x: number; y: number; z: number }[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    points.push({ x, y, z });
  }
  return points;
}

interface NodeSphereProps {
  id: string;
  position: [number, number, number];
  onClick: () => void;
  onDrag: (id: string, pos: [number, number, number]) => void;
  isCurrentUser: boolean;
  sphereRadius: number;
}
const NodeSphere: FC<NodeSphereProps> = ({ id, position, onClick, onDrag, isCurrentUser, sphereRadius }) => {
  const ref = useRef<any>(null);
  const dragging = useRef(false);
  useFrame(() => { ref.current.rotation.y += 0.01; });
  return (
    <group position={position}>
      <mesh
        ref={ref}
        onClick={onClick}
        onPointerDown={e => { e.stopPropagation(); dragging.current = true; }}
        onPointerUp={e => { e.stopPropagation(); dragging.current = false; }}
        onPointerMove={e => {
          if (dragging.current) {
            e.stopPropagation();
            const p = e.point;
            // Project onto sphere surface
            const len = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z) || 1;
            const newPos: [number, number, number] = [p.x/len*sphereRadius, p.y/len*sphereRadius, p.z/len*sphereRadius];
            onDrag(id, newPos);
          }
        }}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={isCurrentUser ? '#00ff00' : '#00aaff'} />
      </mesh>
      <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 4px', borderRadius: '4px', fontSize: '10px' }}>
          {id}
        </div>
      </Html>
    </group>
  );
};

const EdgeLine: FC<{ from: [number, number, number]; to: [number, number, number] }> = ({ from, to }) => (
  <line>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[new Float32Array([...from, ...to]), 3]} />
    </bufferGeometry>
    <lineBasicMaterial attach="material" color="#888" />
  </line>
);

interface Props {
  nodes: NodeData[];
  edges: EdgeData[];
  onNodeClick: (node: NodeData) => void;
  autoRotate?: boolean;
  currentUserId: string;
  sphereRadius?: number;
}

// Component to auto-rotate its children
const RotatingGroup: FC<{ autoRotate: boolean; children?: ReactNode }> = ({ autoRotate, children }) => {
  const ref = useRef<any>(null);
  useFrame(() => { if (autoRotate && ref.current) ref.current.rotation.y += 0.002; });
  return <group ref={ref}>{children}</group>;
}

export default function GraphCanvas({ nodes, edges, onNodeClick, autoRotate = false, currentUserId, sphereRadius = 5 }: Props) {
  // Initial radial positions: center + sphere
  const positions = useMemo(() => {
    const map: Record<string, [number, number, number]> = {};
    // Center user at [0,0,0]
    map[currentUserId] = [0, 0, 0];
    // Others on sphere
    const others = nodes.filter(n => n.id !== currentUserId);
    const pts = fibonacciSphere(others.length);
    others.forEach((n, i) => {
      const { x, y, z } = pts[i];
      map[n.id] = [x * sphereRadius, y * sphereRadius, z * sphereRadius];
    });
    return map;
  }, [nodes, currentUserId, sphereRadius]);

  // Draggable positions state
  const [dragPositions, setDragPositions] = useState<Record<string, [number, number, number]>>(positions);
  // Sync dragPositions when nodes change
  useEffect(() => { setDragPositions(positions); }, [positions]);

  const handleNodeDrag = (id: string, pos: [number, number, number]) => {
    setDragPositions(prev => ({ ...prev, [id]: pos }));
  };

  return (
    <Canvas style={{ background: '#111' }} camera={{ position: [0, 0, sphereRadius * 2], fov: 50 }}>
      <RotatingGroup autoRotate={autoRotate}>
        {/* Outline sphere */}
        <mesh>
          <sphereGeometry args={[sphereRadius, 32, 32]} />
          <meshBasicMaterial wireframe color="#444" />
        </mesh>
        {/* Edges to center for each friend */}
        {edges.map((e, i) => {
          // Only show edges radiating from/to center
          if (e.from !== currentUserId && e.to !== currentUserId) return null;
          const otherId = e.from === currentUserId ? e.to : e.from;
          const fromPos = dragPositions[currentUserId];
          const toPos = dragPositions[otherId];
          return <EdgeLine key={i} from={fromPos} to={toPos} />;
        })}
        {/* Nodes */}
        {nodes.map(n => (
          <NodeSphere
            key={n.id}
            id={n.id}
            position={dragPositions[n.id]}
            onClick={() => onNodeClick(n)}
            onDrag={handleNodeDrag}
            isCurrentUser={n.id === currentUserId}
            sphereRadius={sphereRadius}
          />
        ))}
      </RotatingGroup>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls enablePan enableZoom enableRotate />
    </Canvas>
  );
} 