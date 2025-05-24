import React, { useState } from 'react';
import styled from 'styled-components';
import GraphCanvas from './components/GraphCanvas';
import NodeCard from './components/NodeCard';
import AddPersonForm from './components/AddPersonForm';
import Login from './components/Login';
import { useGraphData, NodeData } from './hooks/useGraphData';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

export default function App() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [selected, setSelected] = useState<NodeData | null>(null);
  const { nodes, edges, addNode, addEdge, removeEdge } = useGraphData();

  if (!user) {
    return <Login onLogin={(email, password) => setUser({ email })} />;
  }

  return (
    <Container>
      <AddPersonForm onAdd={addNode} />
      <GraphCanvas nodes={nodes} edges={edges} onNodeClick={setSelected} />
      {selected && (
        <NodeCard
          node={selected}
          nodes={nodes}
          edges={edges}
          addEdge={addEdge}
          removeEdge={removeEdge}
          onClose={() => setSelected(null)}
        />
      )}
    </Container>
  );
} 