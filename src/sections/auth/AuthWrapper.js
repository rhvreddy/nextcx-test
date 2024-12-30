import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react'

// material-ui
import {Box, CircularProgress, Grid} from '@mui/material';

// project import
import AuthFooter from 'components/cards/AuthFooter';
import Logo from 'components/logo';
import AuthCard from './AuthCard';

// assets
import AuthBackground from 'assets/images/auth/AuthBackground';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const AuthWrapper = ({ children }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = 'https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/nextcx-signin-background.png';
    img.onload = () => {
      setIsImageLoaded(true);
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isImageLoaded
          ? `url(https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/nextcx-signin-background.png)`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background 0.5s ease-in-out',
      }}
    >
      {isImageLoaded ? (
        <>
          <AuthBackground />
          <Grid
            container
            direction="column"
            justifyContent="flex-end"
            sx={{ minHeight: '100vh' }}
          >
            <Grid item xs={12} sx={{ ml: 3, mt: 3 }}>
              <Logo />
            </Grid>
            <Grid item xs={12}>
              <Grid
                item
                xs={12}
                container
                justifyContent="center"
                alignItems="center"
                sx={{
                  minHeight: {
                    xs: 'calc(100vh - 210px)',
                    sm: 'calc(100vh - 134px)',
                    md: 'calc(100vh - 112px)',
                  },
                }}
              >
                <Grid item>
                  <AuthCard>{children}</AuthCard>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
              <AuthFooter />
            </Grid>
          </Grid>
        </>
      ) : (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: '100vh' }}
        >
          <CircularProgress />
        </Grid>
      )}
    </Box>
  );
};

AuthWrapper.propTypes = {
  children: PropTypes.node
};

export default AuthWrapper;
