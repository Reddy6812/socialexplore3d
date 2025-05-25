import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import LoginPage from './pages/LoginPage.tsx';
import HomePage from './pages/HomePage.tsx';
import ExplorerPage from './pages/ExplorerPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import SearchPage from './pages/SearchPage.tsx';
import FriendsPage from './pages/FriendsPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import { useGraphData, NodeData } from './hooks/useGraphData';
import { usePostData } from './hooks/usePostData';

// Define user type
interface AppUser {
  id: string;
  email: string;
  password: string;
  label: string;
  showConnections: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
  isAdmin: boolean;
}

// Initial mock users (admin & regular)
const initialUsers: AppUser[] = [
  { id: '0', email: 'admin@example.com', password: 'adminpwd', label: 'Admin', showConnections: true, profileVisibility: 'public', isAdmin: true },
  { id: '1', email: 'alice@example.com', password: 'alicepwd', label: 'Alice', showConnections: true, profileVisibility: 'public', isAdmin: false },
  { id: '2', email: 'bob@example.com', password: 'bobpwd', label: 'Bob', showConnections: true, profileVisibility: 'public', isAdmin: false },
  { id: '3', email: 'carol@example.com', password: 'carolpwd', label: 'Carol', showConnections: true, profileVisibility: 'public', isAdmin: false }
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
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [user, setUser] = useState<AppUser | null>(() => {
    const stored = localStorage.getItem('socialexplore3d_currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selected, setSelected] = useState<NodeData | null>(null);
  const graph = useGraphData(user?.isAdmin ? undefined : user?.id);
  const { addNode } = graph;
  const postData = usePostData();

  useEffect(() => {
    if (user) {
      localStorage.setItem('socialexplore3d_currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('socialexplore3d_currentUser');
    }
  }, [user]);

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
    const newUser: AppUser = { id, email, password, label, showConnections: true, profileVisibility: 'public', isAdmin: false };
    setUsers(prev => [...prev, newUser]);
    // Create node in graph for this user
    addNode({ label, phone, address });
    setUser({ ...newUser });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={loginHandler} onSignup={signupHandler} />} />
        <Route path="/" element={user ? <Layout user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" /> }>
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={<HomePage user={user} users={users} postData={postData} graph={graph} />} />
          <Route path="explorer" element={<ExplorerPage user={user} users={users} graph={graph} postData={postData} />} />
          <Route path="search" element={<SearchPage users={users} graphEdges={graph.edges} currentUserId={user!.id} />} />
          <Route path="friends" element={<FriendsPage user={user} />} />
          <Route path="settings" element={<SettingsPage user={user} users={users} setUsers={setUsers} setCurrentUser={setUser} />} />
          {user?.isAdmin && <Route path="admin" element={<AdminPage user={user} graph={graph} users={users} postData={postData} />} />}
        </Route>
        <Route path="*" element={<Navigate to={user ? "/explorer" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
} 