import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ComputerIcon from '@mui/icons-material/Computer';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ChatIcon from '@mui/icons-material/Chat';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { UserButton } from '@clerk/clerk-react';
import type { ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme as useAppTheme } from '../hooks/useTheme';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const drawerWidth = 240;

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const { theme: themeMode, setTheme } = useAppTheme();
  const selectedBackground =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.16)
      : '#f4f4f4';
  const selectedHoverBackground =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.24)
      : '#e8e8e8';
  const hoverBackground = alpha(theme.palette.primary.main, 0.08);

  const handleThemeToggle = async () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Create new thread mutation
  const createThread = useMutation(api.threads.createNewThread);

  const handleCreateThread = async () => {
    try {
      const newThreadId = await createThread({});
      navigate(`/chats/${encodeURIComponent(newThreadId)}`);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  // All menu items are visible to all users
  const menuItems: Array<{
    text: string;
    icon: React.ReactNode;
    path: string;
  }> = [
    { text: 'Chats', icon: <ChatIcon />, path: '/chats' },
    { text: 'My Assets', icon: <InventoryIcon />, path: '/my-assets' },
    {
      text: 'My Tickets',
      icon: <SupportAgentIcon />,
      path: '/my-tickets',
    },
    {
      text: 'Machines',
      icon: <ComputerIcon />,
      path: '/machines',
    },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    {
      text: 'Tickets',
      icon: <SupportAgentIcon />,
      path: '/tickets',
    },
  ];

  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme => theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          pt: 3,
          pb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          PippaOS ITSM
        </Typography>
      </Box>
      <Box sx={{ px: 3, pb: 1.5 }}>
        <Button
          variant={theme.palette.mode === 'dark' ? 'contained' : 'outlined'}
          fullWidth
          startIcon={<ChatIcon />}
          onClick={handleCreateThread}
          sx={{
            mb: 1,
            borderRadius: 4,
            textTransform: 'none',
            ...(theme.palette.mode === 'dark'
              ? {
                  boxShadow: t => t.shadows[4],
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                  },
                }
              : {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  backgroundColor: 'transparent',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }),
          }}
        >
          New chat
        </Button>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5 }}>
        <List disablePadding sx={{ py: 1 }}>
          {menuItems.map(item => {
            const isSelected = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    px: 2,
                    transition: t => t.transitions.create(['background-color']),
                    backgroundColor: isSelected
                      ? selectedBackground
                      : 'transparent',
                    color: isSelected
                      ? theme.palette.mode === 'dark'
                        ? '#ffffff'
                        : 'text.primary'
                      : 'text.primary',
                    '&:hover': {
                      backgroundColor: isSelected
                        ? selectedHoverBackground
                        : hoverBackground,
                    },
                    '&.Mui-selected': {
                      backgroundColor: selectedBackground,
                      color:
                        theme.palette.mode === 'dark'
                          ? '#ffffff'
                          : 'text.primary',
                      '&:hover': {
                        backgroundColor: selectedHoverBackground,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected
                        ? theme.palette.mode === 'dark'
                          ? '#ffffff'
                          : 'text.primary'
                        : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      sx: { fontWeight: isSelected ? 500 : 400 },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Divider />
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        <Tooltip
          title={
            themeMode === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
        >
          <IconButton
            onClick={handleThemeToggle}
            sx={{
              color: 'text.primary',
              '&:hover': {
                backgroundColor: hoverBackground,
              },
            }}
          >
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
        <UserButton />
      </Box>
    </Box>
  );

  const container =
    typeof window !== 'undefined' ? () => window.document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: theme.palette.background.paper,
            },
          }}
          slotProps={{
            root: {
              keepMounted: true,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: theme.palette.background.paper,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          position: 'relative',
          backgroundColor: 'background.default',
        }}
      >
        <Fab
          color="primary"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            display: { xs: 'flex', sm: 'none' },
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            },
          }}
        >
          <MenuIcon />
        </Fab>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: 'background.default',
          }}
        >
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
}
