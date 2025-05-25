import React, { FC, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { NodeData, EdgeData } from '../hooks/useGraphData';
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force';

interface Props {
  nodes: NodeData[];
  edges: EdgeData[];
  onNodeClick: (node: NodeData) => void;
  centerTrigger?: boolean;
  centerOnMeTrigger?: number;
  currentUserId?: string;
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

export default function GraphCanvas({ nodes, edges, onNodeClick, centerTrigger, centerOnMeTrigger, currentUserId }: Props) {
  // Maintain simulation state for dynamic layout
  const [simNodes, setSimNodes] = useState<NodeData[]>([]);
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
      // Initialize simulation nodes with random x/y coordinates for free movement
      const simNodesCopy: any[] = nodes.map(n => ({
        ...n,
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10
      }));
      setSimNodes(simNodesCopy);
      // Stop previous simulation if exists
      if (simulationRef.current) simulationRef.current.stop();
      // Build link data for d3-force
      const linkData = edges.map(e => ({ source: e.from, target: e.to }));
      // Create force simulation without centering so nodes drift
      simulationRef.current = forceSimulation(simNodesCopy)
        .force('charge', forceManyBody().strength(-50))
        .force('link', forceLink(linkData).id((d: any) => d.id).distance(2));
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

  const nodeMap = Object.fromEntries(simNodes.map((n: any) => [n.id, n]));
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
    <Canvas camera={{ position: [0, 0, 5] }}>
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