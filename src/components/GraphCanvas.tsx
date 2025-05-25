import React, { FC, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { NodeData, EdgeData } from '../hooks/useGraphData';
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force';

interface Props {
  nodes: NodeData[];
  edges: EdgeData[];
  onNodeClick: (node: NodeData) => void;
}

const NodeSphere: FC<{ node: NodeData; onClick: () => void }> = ({ node, onClick }) => {
  const ref = useRef<any>(null);
  useFrame(() => {
    ref.current.rotation.y += 0.01;
  });
  return (
    <group position={node.position}>
      <mesh ref={ref} onClick={onClick}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#00aaff" />
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

export default function GraphCanvas({ nodes, edges, onNodeClick }: Props) {
  // Maintain simulation state for dynamic layout
  const [simNodes, setSimNodes] = useState<NodeData[]>([]);
  const simulationRef = useRef<any>(null);

  // Initialize and update simulation when nodes or edges change
  useEffect(() => {
    // Deep copy nodes to avoid mutating props
    const simNodesCopy = nodes.map(n => ({ ...n }));
    setSimNodes(simNodesCopy);
    // Stop previous simulation if exists
    if (simulationRef.current) simulationRef.current.stop();
    // Create force simulation
    simulationRef.current = forceSimulation(simNodesCopy)
      .force('charge', forceManyBody().strength(-50))
      .force('link', forceLink(edges).id((d: any) => d.id).distance(2))
      .force('center', forceCenter(0, 0));
    simulationRef.current.on('tick', () => {
      // Trigger re-render
      setSimNodes([...simNodesCopy]);
    });
    return () => {
      simulationRef.current.stop();
    };
  }, [nodes, edges]);

  const nodeMap = Object.fromEntries(simNodes.map(n => [n.id, n]));

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
        <NodeSphere key={n.id} node={n} onClick={() => onNodeClick(n)} />
      ))}
      <OrbitControls enablePan enableZoom enableRotate />
    </Canvas>
  );
} 