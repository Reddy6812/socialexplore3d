import React, { FC, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { NodeData, EdgeData, FriendRequest } from '../hooks/useGraphData';

// Generate points on a sphere via Fibonacci method
function fibonacciSphere(samples: number) {
  // Handle single point case: place on x-axis to avoid NaN
  if (samples === 1) {
    return [{ x: 1, y: 0, z: 0 }];
  }
  // Handle two-point case: opposite points on equator for visibility
  if (samples === 2) {
    return [
      { x: 1, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 }
    ];
  }
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
  hasTag?: boolean;
  isHighlighted?: boolean;
}
const NodeSphere: FC<NodeSphereProps> = ({ id, position, onClick, onDrag, isCurrentUser, sphereRadius, hasTag = false, isHighlighted = false }) => {
  const ref = useRef<any>(null);
  const dragging = useRef(false);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
    }
  });
  let color = '#00aaff';
  if (isHighlighted) color = '#ffff00';
  else if (isCurrentUser) color = '#00ff00';
  return (
    <group position={position}>
      <mesh
        ref={ref}
        onClick={onClick}
        onPointerDown={e => { if (isCurrentUser) return; e.stopPropagation(); dragging.current = true; }}
        onPointerUp={e => { if (isCurrentUser) return; e.stopPropagation(); dragging.current = false; }}
        onPointerMove={e => {
          if (isCurrentUser || !dragging.current) return;
          e.stopPropagation();
          const p = e.point;
          // Project onto sphere surface
          const len = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z) || 1;
          const newPos: [number, number, number] = [p.x/len*sphereRadius, p.y/len*sphereRadius, p.z/len*sphereRadius];
          onDrag(id, newPos);
        }}
      >
        <sphereGeometry args={[isCurrentUser ? 0.5 : 0.3, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 4px', borderRadius: '4px', fontSize: '10px' }}>
          {id}
        </div>
      </Html>
      {/* Tag badge */}
      {hasTag && (
        <Html position={[0, sphereRadius*0.15, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <span role="img" aria-label="tag" style={{ fontSize: '12px' }}>🏷️</span>
        </Html>
      )}
    </group>
  );
};

interface EdgeLineProps {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
}
const EdgeLine: FC<EdgeLineProps> = ({ from, to, color = '#888' }) => (
  <line>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[new Float32Array([...from, ...to]), 3]} />
    </bufferGeometry>
    <lineBasicMaterial attach="material" color={color} />
  </line>
);

interface Props {
  nodes: NodeData[];
  edges: EdgeData[];
  onNodeClick: (node: NodeData) => void;
  autoRotate?: boolean;
  currentUserId: string;
  sphereRadius?: number;
  showAllEdges?: boolean;
  taggedNodeIds?: string[];
  highlightNodeIds?: string[];
  highlightEdgePairs?: [string, string][];
  presenceMap?: Record<string, string | null>;
  friendRequests?: FriendRequest[];
}

export default function GraphCanvas({ nodes, edges, onNodeClick, autoRotate = false, currentUserId, sphereRadius = 5, showAllEdges = false, taggedNodeIds = [], highlightNodeIds = [], highlightEdgePairs = [], presenceMap = {}, friendRequests = [] }: Props) {
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
    <Canvas style={{ background: '#111', width: '100%', height: '100%' }} camera={{ position: [0, 0, sphereRadius * 2], fov: 50 }}>
      <group>
        {/* Edges */}
        {edges.map((e, i) => {
          // Determine if edge highlighted
          const isHighlighted = highlightEdgePairs.some(
            ([a, b]) => (a === e.from && b === e.to) || (a === e.to && b === e.from)
          );
          const color = isHighlighted ? '#ffff00' : '#888';
          // If not showing all, only render radial edges
          if (!showAllEdges) {
            if (e.from !== currentUserId && e.to !== currentUserId) return null;
            const otherId = e.from === currentUserId ? e.to : e.from;
            const fromPos = dragPositions[currentUserId];
            const toPos = dragPositions[otherId];
            return <EdgeLine key={i} from={fromPos} to={toPos} color={color} />;
          }
          // showAllEdges: render every edge connecting any two nodes
          const fromPos = dragPositions[e.from];
          const toPos = dragPositions[e.to];
          return <EdgeLine key={i} from={fromPos} to={toPos} color={color} />;
        })}
        {/* Pending friend request edges (dashed) */}
        {friendRequests.map((req, idx) => {
          const fromPos = dragPositions[req.from];
          const toPos = dragPositions[req.to];
          // only draw if both endpoints are in the current graph positions
          if (!fromPos || !toPos) return null;
          return (
            // @ts-ignore: using three-fiber line element
            <line key={'req'+idx} onUpdate={self => self.computeLineDistances()}>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[new Float32Array([...fromPos, ...toPos]), 3]} />
              </bufferGeometry>
              <lineDashedMaterial attach="material" color="#ff0" dashSize={0.1} gapSize={0.1} />
            </line>
          );
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
            hasTag={taggedNodeIds.includes(n.id)}
            isHighlighted={highlightNodeIds.includes(n.id)}
          />
        ))}
      </group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls enablePan enableZoom enableRotate autoRotate={autoRotate} autoRotateSpeed={1.0} />
    </Canvas>
  );
} 