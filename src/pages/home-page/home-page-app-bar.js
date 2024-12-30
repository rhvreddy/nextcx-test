import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Box } from '@mui/system';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
const theme = createTheme({
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          '& a': {
            color: 'white',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'none',
            },
          },
        },
      },
    },
  },
});

const AppBarComponent = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const mobileMenu = (
    <Drawer anchor="top" open={mobileMenuOpen} onClose={handleMobileMenuClose}>
      <Box sx={{ width: 250 }}>
        <List>
          <ListItem button onClick={handleMobileMenuClose}>
            <a href='#vision-section'>
              <ListItemText primary="Vision" />
            </a>
          </ListItem>
          <ListItem button onClick={handleMobileMenuClose}>
            <ListItemText primary="Contact Us" />
          </ListItem>
          <ListItem button onClick={handleMobileMenuClose}>
            <ListItemText primary="About Us" />
          </ListItem>
          <ListItem button onClick={handleClick}>
            <ListItemText primary="Explore" />
          </ListItem>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Simple</MenuItem>
            <MenuItem onClick={handleClose}>Advanced</MenuItem>
          </Menu>
        </List>
      </Box>
    </Drawer>
  );

  return (
    <ThemeProvider theme={theme}>
    <AppBar position="static" sx={{ backgroundColor: 'transparent' }}>
      <Toolbar>
        {/* Logo */}
        <Box component="span" display={{ xs: 'block', sm: 'block' }}>
          <img src="/images/Sia_logo_02.svg" alt="App Logo" style={{ height: '40px' }} />
        </Box>
        {/* Other toolbar items */}
        <Box display={{ xs: 'none', sm: 'block' }} flexGrow={1} />
        <Box
          display={{ xs: 'none', sm: 'flex' }}
          alignItems="center"
          justifyContent="flex-end"
        >
          <Typography
            variant="body1"
            component="div"
            sx={{ marginLeft: 2, marginRight: 2 }}
          >
            <a href='#vision-section'>Vision</a>
          </Typography>
          <Typography
            variant="body1"
            component="div"
            sx={{ marginLeft: 2, marginRight: 2 }}
          >
            Contact Us
          </Typography>

          <Typography
            variant="body1"
            component="div"
            sx={{ marginLeft: 2, marginRight: 2 }}
          >
            About Us
          </Typography>
          <Typography
            variant="body1"
            component="div"
            sx={{ marginLeft: 2, marginRight: 2 }}
            onClick={handleClick}
          >
            Explore
          </Typography>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Simple</MenuItem>
            <MenuItem onClick={handleClose}>Advanced</MenuItem>
          </Menu>
        </Box>
        {/* Mobile menu toggle button */}
        <Box display={{ xs: 'block', sm: 'none' }} flexGrow={1} />
        <Box display={{ xs: 'block', sm: 'none' }}>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
      {mobileMenu}
    </AppBar>
    </ThemeProvider>
  );
};

export default AppBarComponent;
