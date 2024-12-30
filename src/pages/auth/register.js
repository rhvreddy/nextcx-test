import { Link } from 'react-router-dom';

// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import FirebaseRegister from 'sections/auth/auth-forms/AuthRegister';
import {useDispatch, useSelector} from 'react-redux';
import {useEffect} from "react";
import {logout} from "../../store/reducers/profile";
import { GoogleOAuthProvider } from '@react-oauth/google';
import {resetBotRecords} from "../../store/reducers/botRecords";
import {toast} from "react-toastify";


// ================================|| REGISTER ||================================ //

const Register = () => {
  const { isLoggedIn } = useSelector(state => state.profile);
  const dispatch = useDispatch();

  useEffect(() => {
    if(!navigator.onLine) {
      handleLinkClick()
    }
    const handleLogout = async () => {
      try {
        dispatch((resetBotRecords([])));
        dispatch(logout());
      } catch (err) {
        console.error(err);
      }
    }
    handleLogout();
  }, []);

  const handleLinkClick = (e) => {
    if (!navigator.onLine) {
      e.preventDefault();
      toast.error("You are offline. Please check your internet connection.")
    }
  }

  return (
    <>
      <AuthWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
              <Typography variant="h1" className={"h3tag"} color="#fff">Sign up</Typography>
              <Typography
                component={Link}
                to={isLoggedIn ? '/auth/login' : '/login'}
                variant="body1"
                sx={{ textDecoration: 'none' }}
                color="#1890ff"
                onClick={handleLinkClick}
              >
                Already have an account?
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <GoogleOAuthProvider clientId="932191385587-15fsuuoru999ap2ig5limag3eo09uu7n.apps.googleusercontent.com">
              <FirebaseRegister />
            </GoogleOAuthProvider>
          </Grid>
        </Grid>
      </AuthWrapper>
    </>
  );
};

export default Register;
