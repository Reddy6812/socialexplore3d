import React, { useState } from 'react';
import styled from 'styled-components';
import GraphCanvas from './components/GraphCanvas';
import NodeCard from './components/NodeCard';
import Login from './components/Login';
import { useGraphData, NodeData } from './hooks/useGraphData';

// Initial mock users
const initialUsers = [
  { id: '1', email: 'alice@example.com', password: 'alicepwd', label: 'Alice', showConnections: true },
  { id: '2', email: 'bob@example.com', password: 'bobpwd', label: 'Bob', showConnections: true },
  { id: '3', email: 'carol@example.com', password: 'carolpwd', label: 'Carol', showConnections: true }
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

const SettingsPanel = styled.div`
  position: absolute;
  top: 50px;
  left: 10px;
  background: white;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 4px;
  z-index: 10;
`;

export default function App() {
  const [users, setUsers] = useState(initialUsers);
  const [user, setUser] = useState<{ id: string; email: string; label: string; showConnections: boolean } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
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
    const newUser = { id, email, password, label, showConnections: true };
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
        <button onClick={() => setShowSettings(prev => !prev)}>Settings</button>
      </Header>
      {showSettings && user && (
        <SettingsPanel>
          <label>
            <input
              type="checkbox"
              checked={user.showConnections}
              onChange={() => {
                if (!user) return;
                const newShow = !user.showConnections;
                setUser({ ...user, showConnections: newShow });
                setUsers(prev =>
                  prev.map(u =>
                    u.id === user.id ? { ...u, showConnections: newShow } : u
                  )
                );
              }}
            />{' '}
            Allow others to see my connections
          </label>
        </SettingsPanel>
      )}
      <GraphCanvas
        nodes={nodes}
        edges={user?.showConnections ? edges : []}
        onNodeClick={setSelected}
      />
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