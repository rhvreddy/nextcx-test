import { Link } from 'react-router-dom';

// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';
import { useSelector,useDispatch } from 'react-redux';
import {useEffect} from "react";
import {logout} from "../../store/reducers/profile";
import { GoogleOAuthProvider } from '@react-oauth/google';
import {toast} from "react-toastify";
import {resetBotRecords} from "../../store/reducers/botRecords";


// ================================|| LOGIN ||================================ //

const Login = () => {
  const { isLoggedIn } = useSelector(state => state.profile)
  const dispatch = useDispatch();
  useEffect(() => {
    if(!navigator.onLine) {
      handleLinkClick(e)
    } else {
      const handleLogout = async () => {
        try {
          dispatch((resetBotRecords([])));
          dispatch(logout());
        } catch (err) {
          console.error(err);
        }
      }
      handleLogout();
    }
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
              <Typography variant="h1" className={"h3tag"} color="#fff">Login</Typography>
              {/*              <Typography
                component={Link}
                to={isLoggedIn ? '/auth/register' : '/register'}
                variant="body1"
                sx={{ textDecoration: 'none' }}
                color="primary"
                onClick={handleLinkClick}
              >
                Don&apos;t have an account?
              </Typography>*/}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <GoogleOAuthProvider clientId="932191385587-15fsuuoru999ap2ig5limag3eo09uu7n.apps.googleusercontent.com">
              <AuthLogin />
            </GoogleOAuthProvider>
          </Grid>
        </Grid>
      </AuthWrapper>
    </>
  );
};

export default Login;
