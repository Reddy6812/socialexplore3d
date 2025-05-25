import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 240;

export default function Layout({ user, onLogout }: { user: any; onLogout: () => void }) {
  const navigate = useNavigate();
  const menuItems = [
    { text: 'Home', path: '/home' },
    { text: 'Explorer', path: '/explorer' },
    { text: 'Friends', path: '/friends' },
    { text: 'Settings', path: '/settings' },
  ];
  if (user.isAdmin) {
    menuItems.push({ text: 'Admin', path: '/admin' });
  }

  return (
    <div style={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => { }} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            3D Social Graph Explorer
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user.label}
          </Typography>
          <IconButton color="inherit" onClick={onLogout}>
            Logout
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', top: 64 } }}>
        <List>
          {menuItems.map(item => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path}>
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