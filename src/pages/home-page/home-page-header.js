import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const HeaderComponent = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            {/* Add your menu icon here */}
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Folio
          </Typography>
          {/* Add additional menu items or buttons here */}
          <Button color="inherit">Contact Me</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default HeaderComponent;
