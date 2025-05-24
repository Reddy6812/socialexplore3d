import { useState } from 'react';

export interface NodeData {
  id: string;
  label: string;
  position: [number, number, number];
}

export interface EdgeData {
  from: string;
  to: string;
}

const initialNodes: NodeData[] = [
  { id: '1', label: 'Alice', position: [0, 0, 0] },
  { id: '2', label: 'Bob', position: [2, 1, 0] },
  { id: '3', label: 'Carol', position: [-2, 1, 0] }
];

const initialEdges: EdgeData[] = [
  { from: '1', to: '2' },
  { from: '1', to: '3' }
];

export function useGraphData() {
  const [nodes, setNodes] = useState<NodeData[]>(initialNodes);
  const [edges] = useState<EdgeData[]>(initialEdges);

  const addNode = (label: string) => {
    const id = Date.now().toString();
    const position: [number, number, number] = [
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      0
    ];
    setNodes(prev => [...prev, { id, label, position }]);
  };

  return { nodes, edges, addNode };
} 