import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import ExploreIcon from '@mui/icons-material/Explore';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventIcon from '@mui/icons-material/Event';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import NotificationPanel from './components/NotificationPanel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const drawerWidth = 240;

export default function Layout({ user, onLogout }: { user: any; onLogout: () => void }) {
  const navigate = useNavigate();
  const [showPages, setShowPages] = useState(true);
  const menuItems = [
    { text: 'Home', path: '/home', icon: <HomeIcon /> },
    { text: 'Search', path: '/search', icon: <SearchIcon /> },
    { text: 'Explorer', path: '/explorer', icon: <ExploreIcon /> },
    { text: 'Friends', path: '/friends', icon: <PeopleIcon /> },
    { text: 'Requests', path: '/requests', icon: <PersonAddIcon /> },
    { text: 'Events', path: '/events', icon: <EventIcon /> },
    { text: 'Analytics', path: '/analytics', icon: <BarChartIcon /> },
    { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
    { text: 'Snap', path: '/snap', icon: <PhotoCameraIcon /> },
    { text: 'Messages', path: '/chats', icon: <ChatIcon /> },
  ];
  if (user.isAdmin) {
    menuItems.push({ text: 'Admin', path: '/admin', icon: <SecurityIcon /> });
  }

  return (
    <div style={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setShowPages(prev => !prev)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate(1)} sx={{ mr: 2 }}>
            <ArrowForwardIosIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <BubbleChartIcon sx={{ mr: 1 }} />
            Social Graph Explorer
          </Typography>
          <NotificationPanel user={user} />
          <Typography variant="body1" sx={{ mr: 2 }}>
            <Link to={`/profile/${user.id}`} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
              {user.label}
            </Link>
          </Typography>
          <IconButton color="inherit" onClick={() => { onLogout(); navigate('/login'); }}>
            Logout
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          display: showPages ? 'block' : 'none',
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { display: showPages ? 'block' : 'none', width: drawerWidth, boxSizing: 'border-box', top: 64 }
        }}
      >
        <List>
          {menuItems.map(item => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path}>
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main style={{ flexGrow: 1, padding: '80px 24px 24px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
} 