import React, { useState } from 'react';
import styled from 'styled-components';
import GraphCanvas from './components/GraphCanvas';
import NodeCard from './components/NodeCard';
import AddPersonForm from './components/AddPersonForm';
import Login from './components/Login';
import { useGraphData, NodeData } from './hooks/useGraphData';

// Mock user database
const mockUsers = [
  { id: '1', email: 'alice@example.com', password: 'alicepwd', label: 'Alice' },
  { id: '2', email: 'bob@example.com', password: 'bobpwd', label: 'Bob' },
  { id: '3', email: 'carol@example.com', password: 'carolpwd', label: 'Carol' }
];

const Header = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.8);
  padding: 4px 8px;
  border-radius: 4px;
  z-index: 10;
`;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

export default function App() {
  const [user, setUser] = useState<{ id: string; email: string; label: string } | null>(null);
  const [selected, setSelected] = useState<NodeData | null>(null);
  const { nodes, edges, addNode, addEdge, removeEdge } = useGraphData(user?.id);

  // If not authenticated, show login screen
  if (!user) {
    return (
      <Login
        onLogin={(email, password) => {
          const found = mockUsers.find(u => u.email === email && u.password === password);
          if (found) setUser(found);
          else alert('Invalid credentials');
        }}
      />
    );
  }

  return (
    <Container>
      <Header>
        <span>Welcome, {user.label}</span>
        <button onClick={() => setUser(null)}>Logout</button>
      </Header>
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