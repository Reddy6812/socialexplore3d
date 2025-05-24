import React, { useState } from 'react';
import styled from 'styled-components';
import GraphCanvas from './components/GraphCanvas';
import NodeCard from './components/NodeCard';
import Login from './components/Login';
import { useGraphData, NodeData } from './hooks/useGraphData';

// Initial mock users
const initialUsers = [
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
  const [users, setUsers] = useState(initialUsers);
  const [user, setUser] = useState<{ id: string; email: string; label: string } | null>(null);
  const [selected, setSelected] = useState<NodeData | null>(null);
  const { nodes, edges, addNode, addEdge, removeEdge, updateNode } = useGraphData(user?.id);

  // Authentication handlers
  const loginHandler = (email: string, password: string): boolean => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };
  const signupHandler = (
    email: string,
    password: string,
    label: string,
    phone?: string,
    address?: string
  ) => {
    const id = Date.now().toString();
    const newUser = { id, email, password, label };
    setUsers(prev => [...prev, newUser]);
    // Create node in graph for this user
    addNode({ label, phone, address });
    setUser(newUser);
  };
  // If not authenticated, show login/signup screen
  if (!user) {
    return <Login onLogin={loginHandler} onSignup={signupHandler} />;
  }

  return (
    <Container>
      <Header>
        <span>Welcome, {user.label}</span>
        <button onClick={() => setUser(null)}>Logout</button>
      </Header>
      <GraphCanvas nodes={nodes} edges={edges} onNodeClick={setSelected} />
      {selected && (
        <NodeCard
          node={selected}
          nodes={nodes}
          edges={edges}
          addEdge={addEdge}
          removeEdge={removeEdge}
          updateNode={updateNode}
          userId={user.id}
          onClose={() => setSelected(null)}
        />
      )}
    </Container>
  );
} 