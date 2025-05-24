import React, { useState } from 'react';
import styled from 'styled-components';
import GraphCanvas from './components/GraphCanvas';
import NodeCard from './components/NodeCard';
import Login from './components/Login';
import { useGraphData, NodeData } from './hooks/useGraphData';
import { usePostData } from './hooks/usePostData';

// Initial mock users (admin & regular)
const initialUsers = [
  { id: '0', email: 'admin@example.com', password: 'adminpwd', label: 'Admin', showConnections: true, isAdmin: true },
  { id: '1', email: 'alice@example.com', password: 'alicepwd', label: 'Alice', showConnections: true, isAdmin: false },
  { id: '2', email: 'bob@example.com', password: 'bobpwd', label: 'Bob', showConnections: true, isAdmin: false },
  { id: '3', email: 'carol@example.com', password: 'carolpwd', label: 'Carol', showConnections: true, isAdmin: false }
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

const SearchPanel = styled.div`
  position: absolute;
  top: 80px;
  left: 10px;
  background: white;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 4px;
  z-index: 10;
  ul { list-style: none; margin: 4px 0 0; padding: 0; }
  li { margin: 4px 0; }
  button { background: none; border: none; text-align: left; padding: 4px; cursor: pointer; width: 100%; }
`;

export default function App() {
  const [users, setUsers] = useState(initialUsers);
  const [user, setUser] = useState<{ id: string; email: string; label: string; showConnections: boolean; isAdmin: boolean } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selected, setSelected] = useState<NodeData | null>(null);
  const { nodes, edges, friendRequests, sendFriendRequest, approveFriendRequest, declineFriendRequest, addNode, addEdge, removeEdge, updateNode } = useGraphData(user?.isAdmin ? undefined : user?.id);
  const { posts, addPost } = usePostData();

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
    const newUser = { id, email, password, label, showConnections: true, isAdmin: false };
    setUsers(prev => [...prev, newUser]);
    // Create node in graph for this user
    addNode({ label, phone, address });
    setUser(newUser);
  };
  // If not authenticated, show login/signup screen
  if (!user) {
    return <Login onLogin={loginHandler} onSignup={signupHandler} />;
  }

  // Admin search results (search by name, id, or email)
  const searchResults = user.isAdmin && searchTerm
    ? users.filter(u =>
        u.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Container>
      <Header>
        <span>Welcome, {user.label}</span>
        <button onClick={() => setUser(null)}>Logout</button>
        <button onClick={() => setShowSettings(prev => !prev)}>Settings</button>
      </Header>
      {user.isAdmin && (
        <SearchPanel>
          <input
            type="text"
            placeholder="Search users"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ul>
              {searchResults.map(u => {
                const node = nodes.find(n => n.id === u.id);
                if (!node) return null;
                return (
                  <li key={u.id}>
                    <button
                      onClick={() => {
                        setSelected(node);
                        setSearchTerm('');
                      }}
                    >
                      {u.label} ({u.email})
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </SearchPanel>
      )}
      {showSettings && user && (
        <SettingsPanel>
          <label>
            <input
              type="checkbox"
              checked={user.showConnections}
              onChange={() => {
                if (!user) return;
                const newShow = !user.showConnections;
                setUser({ ...user, showConnections: newShow, isAdmin: user.isAdmin });
                setUsers(prev =>
                  prev.map(u =>
                    u.id === user.id ? { ...u, showConnections: newShow, isAdmin: u.isAdmin } : u
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
          friendRequests={friendRequests}
          sendRequest={sendFriendRequest}
          approveRequest={approveFriendRequest}
          declineRequest={declineFriendRequest}
          addEdge={addEdge}
          removeEdge={removeEdge}
          updateNode={updateNode}
          userId={user.id}
          isAdmin={user.isAdmin}
          posts={posts}
          onAddPost={addPost}
          onClose={() => setSelected(null)}
        />
      )}
    </Container>
  );
} 