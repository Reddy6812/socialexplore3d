import { useState } from 'react';

/** Node data with optional contact info and 3D position */
export interface NodeData {
  id: string;
  label: string;
  phone?: string;
  address?: string;
  position: [number, number, number];
}

/** Edge representing a bidirectional friendship between two node IDs */
export interface EdgeData {
  from: string;
  to: string;
}

/** Default global node list (mock) */
const initialNodesGlobal: NodeData[] = [
  { id: '1', label: 'Alice', phone: '', address: '', position: [0, 0, 0] },
  { id: '2', label: 'Bob', phone: '', address: '', position: [2, 1, 0] },
  { id: '3', label: 'Carol', phone: '', address: '', position: [-2, 1, 0] }
];

/** Default global edge list (mock friendships) */
const initialEdgesGlobal: EdgeData[] = [
  { from: '1', to: '2' },
  { from: '1', to: '3' }
];

/**
 * Hook to manage graph data. Optionally scopes to a user by ID.
 * @param userId if provided, only include that user's node and direct friends
 */
export function useGraphData(userId?: string) {
  // Determine initial nodes/edges based on logged-in user
  let initNodes = initialNodesGlobal;
  let initEdges = initialEdgesGlobal;
  if (userId) {
    // filter edges to those involving the user
    const userEdges = initialEdgesGlobal.filter(
      e => e.from === userId || e.to === userId
    );
    // determine neighbor IDs
    const neighborIds = new Set<string>(
      userEdges.map(e => (e.from === userId ? e.to : e.from))
    );
    initNodes = initialNodesGlobal.filter(
      n => n.id === userId || neighborIds.has(n.id)
    );
    initEdges = userEdges;
  }
  const [nodes, setNodes] = useState<NodeData[]>(initNodes);
  const [edges, setEdges] = useState<EdgeData[]>(initEdges);

  /** Add a new node (friend) with auto-generated unique ID */
  const addNode = (node: Omit<NodeData, 'id' | 'position'>) => {
    const id = Date.now().toString();
    const position: [number, number, number] = [
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      0
    ];
    setNodes(prev => [...prev, { id, ...node, position }]);
  };

  /** Add a friendship edge if not already present */
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