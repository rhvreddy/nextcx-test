import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  main: {
    position: 'relative',
    textAlign: 'center',
    background: `url('img/bg-main.jpg') no-repeat center center`,
    backgroundSize: 'cover',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  scroll: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(2),
  },
  scrollIcon: {
    marginRight: theme.spacing(1),
  },
}));

const MainComponent = () => {
  const classes = useStyles();

  return (
    <Box className={classes.main}>
      <Typography variant="h2" className={classes.title}>
        Hello, my name's Jack. <br />
        I'm a Visual Designer.
      </Typography>
      <Button variant="outlined" color="inherit">
        Scroll down
      </Button>
    </Box>
  );
};

export default MainComponent;
