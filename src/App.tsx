import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ExplorerPage from './pages/ExplorerPage';
import SettingsPage from './pages/SettingsPage';
import SearchPage from './pages/SearchPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ChatsPage from './pages/ChatsPage';
import ChatPage from './pages/ChatPage';
import FriendRequestsPage from './pages/FriendRequestsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import EventsPage from './pages/EventsPage';
import EventPage from './pages/EventPage';
import SnapPage from './pages/SnapPage';
import { useGraphData, NodeData } from './hooks/useGraphData';
import { usePostData } from './hooks/usePostData';
import { UserRepository } from './services/userRepository';
import { UserUseCases } from './services/userUseCases';
import CompanyExplorerPage from './pages/CompanyExplorerPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';

// Define user type
interface AppUser {
  id: string;
  email: string;
  password: string;
  label: string;
  showConnections: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
  isAdmin: boolean;
  role: 'general' | 'student' | 'company';
}

// Initial mock users (admin & regular)
const initialUsers: AppUser[] = [
  { id: '0', email: 'admin@example.com', password: 'adminpwd', label: 'Admin', showConnections: true, profileVisibility: 'public', isAdmin: true, role: 'general' },
  { id: '1', email: 'alice@example.com', password: 'alicepwd', label: 'Alice', showConnections: true, profileVisibility: 'public', isAdmin: false, role: 'general' },
  { id: '2', email: 'bob@example.com', password: 'bobpwd', label: 'Bob', showConnections: true, profileVisibility: 'public', isAdmin: false, role: 'general' },
  { id: '3', email: 'carol@example.com', password: 'carolpwd', label: 'Carol', showConnections: true, profileVisibility: 'public', isAdmin: false, role: 'general' }
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
  // Initialize user use-case
  const userRepo = new UserRepository();
  const userUseCases = new UserUseCases(userRepo);
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

  // Persist all user accounts in `users` state to the database whenever it changes
  useEffect(() => {
    users.forEach(u => {
      // seed users with their roles
      userUseCases.createUser(u.id, u.label, u.role).catch(err => console.error(`Failed to seed user ${u.id}`, err));
    });
  }, [users]);

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
      // ensure user exists in DB
      userUseCases.createUser(found.id, found.label, found.role).catch(err => console.error('Failed to sync user to DB', err));
      return true;
    }
    return false;
  };
  const signupHandler = (
    email: string,
    password: string,
    label: string,
    phone?: string,
    address?: string,
    role: 'general' | 'student' | 'company' = 'general'
  ) => {
    const id = Date.now().toString();
    const newUser: AppUser = { id, email, password, label, showConnections: true, profileVisibility: 'public', isAdmin: false, role };
    setUsers(prev => [...prev, newUser]);
    userUseCases.createUser(id, label, role).catch(err => console.error('Failed to create user in DB', err));
    // Create node in graph for this user
    addNode({ label, phone, address });
    setUser({ ...newUser });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={loginHandler} onSignup={signupHandler} />} />
        <Route path="/" element={
          user ? <Layout user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />
        }>
          {user && (
            <>
              <Route index element={<Navigate to="home" />} />
              <Route path="home" element={<HomePage user={user} users={users} postData={postData} graph={graph} />} />
              <Route path="explorer" element={<ExplorerPage user={user} users={users} graph={graph} postData={postData} />} />
              <Route path="search" element={<SearchPage users={users} graphEdges={graph.edges} currentUserId={user.id} />} />
              <Route path="friends" element={<FriendsPage user={user} />} />
              <Route path="requests" element={<FriendRequestsPage user={user} users={users} graph={graph} />} />
              <Route path="snap" element={<SnapPage user={user} />} />
              <Route path="events" element={<EventsPage user={user} />} />
              <Route path="events/:id" element={<EventPage user={user} users={users} />} />
              <Route path="analytics" element={<AnalyticsPage user={user} />} />
              <Route path="profile/:id" element={<ProfilePage user={user} users={users} graph={graph} postData={postData} />} />
              <Route path="chats" element={<ChatsPage user={user} users={users} />} />
              <Route path="chats/:chatId" element={<ChatPage user={user} users={users} />} />
              <Route path="company-explorer" element={<CompanyExplorerPage userId={user.id} userRole={user.role} />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/:id" element={<JobDetailPage />} />
              <Route path="settings" element={<SettingsPage user={user} users={users} setUsers={setUsers} setCurrentUser={setUser} />} />
              {user.isAdmin && (
                <Route path="admin" element={<AdminPage user={user} graph={graph} users={users} postData={postData} />} />
              )}
            </>
          )}
        </Route>
        <Route path="*" element={<Navigate to={user ? "/explorer" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
} 