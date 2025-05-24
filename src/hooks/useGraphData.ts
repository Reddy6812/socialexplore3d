export interface NodeData {
  id: string;
  label: string;
  position: [number, number, number];
}

export interface EdgeData {
  from: string;
  to: string;
}

// Mock data loader
export function useGraphData() {
  // TODO: replace with real API + WebSocket updates
  const nodes: NodeData[] = [
    { id: '1', label: 'Alice', position: [0, 0, 0] },
    { id: '2', label: 'Bob', position: [2, 1, 0] },
    { id: '3', label: 'Carol', position: [-2, 1, 0] }
  ];
  const edges: EdgeData[] = [
    { from: '1', to: '2' },
    { from: '1', to: '3' }
  ];
  return { nodes, edges };
} 