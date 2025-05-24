import { useState } from 'react';

export interface NodeData {
  id: string;
  label: string;
  phone?: string;
  address?: string;
  position: [number, number, number];
}

export interface EdgeData {
  from: string;
  to: string;
}

const initialNodes: NodeData[] = [
  { id: '1', label: 'Alice', phone: '', address: '', position: [0, 0, 0] },
  { id: '2', label: 'Bob', phone: '', address: '', position: [2, 1, 0] },
  { id: '3', label: 'Carol', phone: '', address: '', position: [-2, 1, 0] }
];

const initialEdges: EdgeData[] = [
  { from: '1', to: '2' },
  { from: '1', to: '3' }
];

export function useGraphData() {
  const [nodes, setNodes] = useState<NodeData[]>(initialNodes);
  const [edges, setEdges] = useState<EdgeData[]>(initialEdges);

  const addNode = (node: Omit<NodeData, 'id' | 'position'>) => {
    const id = Date.now().toString();
    const position: [number, number, number] = [
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      0
    ];
    setNodes(prev => [...prev, { id, ...node, position }]);
  };

  const addEdge = (from: string, to: string) => {
    setEdges(prev => {
      if (prev.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) {
        return prev;
      }
      return [...prev, { from, to }];
    });
  };

  const removeEdge = (from: string, to: string) => {
    setEdges(prev =>
      prev.filter(e => !((e.from === from && e.to === to) || (e.from === to && e.to === from)))
    );
  };

  return { nodes, edges, addNode, addEdge, removeEdge };
} 