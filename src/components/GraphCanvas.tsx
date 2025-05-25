import React, { FC, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { NodeData, EdgeData } from '../hooks/useGraphData';
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force';

// Helper to generate Fibonacci sphere positions
function fibonacciSphere(samples: number) {
  const points: { x:number,y:number,z:number }[] = [];
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

interface Props {
  nodes: NodeData[];
  edges: EdgeData[];
  onNodeClick: (node: NodeData) => void;
  centerTrigger?: boolean;
  centerOnMeTrigger?: number;
  currentUserId?: string;
  linkDistance?: number;
  sphereRadius?: number;
}

const NodeSphere: FC<{ node: NodeData; onClick: () => void; onDrag?: (id: string, x: number, y: number) => void; isCurrentUser?: boolean }> = ({ node, onClick, onDrag, isCurrentUser }) => {
  const ref = useRef<any>(null);
  const dragging = useRef(false);
  useFrame(() => {
    ref.current.rotation.y += 0.01;
  });
  return (
    <group position={node.position}>
      <mesh
        ref={ref}
        onClick={onClick}
        onPointerDown={e => { e.stopPropagation(); dragging.current = true; }}
        onPointerUp={e => { e.stopPropagation(); dragging.current = false; }}
        onPointerMove={e => {
          if (dragging.current && onDrag) {
            e.stopPropagation();
            onDrag(node.id, e.point.x, e.point.y);
          }
        }}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={isCurrentUser ? '#00ff00' : '#00aaff'} />
      </mesh>
      <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '2px 4px', borderRadius: '4px', fontSize: '10px' }}>
          {node.id}
        </div>
      </Html>
    </group>
  );
};

const EdgeLine: FC<{ edge: EdgeData; nodeMap: Record<string, NodeData> }> = ({ edge, nodeMap }) => {
  const from = nodeMap[edge.from].position;
  const to = nodeMap[edge.to].position;
  const points = [from, to] as any;
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flat()), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="#888" />
    </line>
  );
};

export default function GraphCanvas({ nodes, edges, onNodeClick, centerTrigger, centerOnMeTrigger, currentUserId, linkDistance = 2, sphereRadius = 5 }: Props) {
  // Maintain simulation state for dynamic layout
  const [simNodes, setSimNodes] = useState<any[]>([]);
  const simulationRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);

  // Initialize and update simulation when nodes or edges change
  useEffect(() => {
    // Centering effect: reapply center force and reset camera
    if (centerTrigger && simulationRef.current && controlsRef.current) {
      simulationRef.current.force('center', forceCenter(0, 0)).alpha(1).restart();
      controlsRef.current.reset();
    }
    try {
      // Arrange first on Fibonacci sphere, scaled by sphereRadius
      const spherePts = fibonacciSphere(nodes.length);
      const simNodesCopy = nodes.map((n, i) => ({
        ...n,
        x: spherePts[i].x * sphereRadius,
        y: spherePts[i].y * sphereRadius,
        position: [spherePts[i].x * sphereRadius, spherePts[i].y * sphereRadius, spherePts[i].z * sphereRadius]
      }));
      setSimNodes(simNodesCopy);
      // Stop previous simulation if exists
      if (simulationRef.current) simulationRef.current.stop();
      // Build link data for d3-force
      const linkData = edges.map(e => ({ source: e.from, target: e.to }));
      // Create force simulation without centering so nodes drift
      simulationRef.current = forceSimulation(simNodesCopy)
        .force('charge', forceManyBody().strength(-50))
        .force('link', forceLink(linkData).id((d: any) => d.id).distance(linkDistance));
      simulationRef.current.on('tick', () => {
        // Update positions from simulation and trigger render
        setSimNodes(simNodesCopy.map(n => ({
          ...n,
          position: [n.x || 0, n.y || 0, (n.position && n.position[2]) || 0]
        })));
      });
    } catch (err) {
      console.error('GraphCanvas simulation error:', err);
      // Fallback: use static nodes
      setSimNodes(nodes);
    }
    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, [nodes, edges, centerTrigger]);

  const nodeMap = Object.fromEntries(simNodes.map(n => [n.id, n]));
  // Handler for dragging nodes
  const handleNodeDrag = (id: string, x: number, y: number) => {
    setSimNodes(prev => prev.map(n => n.id === id ? { ...n, x, y, position: [x, y, n.position[2]] } : n));
    if (simulationRef.current) simulationRef.current.alpha(1).restart();
  };
  // Recentering camera on current user node
  useEffect(() => {
    if (centerOnMeTrigger !== undefined && currentUserId && controlsRef.current) {
      const node = nodeMap[currentUserId];
      if (node && node.position) {
        // Move camera target to user node
        controlsRef.current.target.set(node.position[0], node.position[1], node.position[2] || 0);
        controlsRef.current.update();
      }
    }
  }, [centerOnMeTrigger, currentUserId, nodeMap]);

  return (
    <Canvas style={{ background: '#111' }} camera={{ position: [0, 0, sphereRadius*2] }}>
      {/* Sphere outline */}
      <mesh>
        <sphereGeometry args={[sphereRadius, 32, 32]} />
        <meshBasicMaterial wireframe color="#444" />
      </mesh>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {edges.map((e, i) => {
        const from = nodeMap[e.from]?.position;
        const to = nodeMap[e.to]?.position;
        if (!from || !to) return null;
        return <EdgeLine key={i} edge={e} nodeMap={nodeMap} />;
      })}
      {simNodes.map(n => (
        <NodeSphere
          key={n.id}
          node={n}
          onClick={() => onNodeClick(n)}
          isCurrentUser={n.id === currentUserId}
          onDrag={handleNodeDrag}
        />
      ))}
      <OrbitControls ref={controlsRef} enablePan enableZoom enableRotate />
    </Canvas>
  );
} 