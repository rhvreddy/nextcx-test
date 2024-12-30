import {useEffect} from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, Button, Grid, Stack, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import { setEditProfile, setEditButton } from 'store/reducers/profile';

// assets
import BackLeft from 'assets/images/profile/UserProfileBackLeft';
import BackRight from 'assets/images/profile/UserProfileBackRight';

// ==============================|| USER PROFILE - TOP CARD ||============================== //

const ProfileCard = ({ focusInput }) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const showEditButton = useSelector((state) => state.profile.showEditButton);

  const dispatch = useDispatch()

  const handleEditProfile = () => {
    dispatch(setEditProfile(true))
    dispatch(setEditButton(false))
  }

  useEffect(() => {
    dispatch(setEditButton(true));
  }, []);

  return (
    <MainCard border={false} content={false} sx={{ bgcolor: 'primary.lighter', position: 'relative' }}>
      <Box sx={{ position: 'absolute', bottom: '-7px', left: 0, zIndex: 1 }}>
        <BackLeft />
      </Box>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ position: 'relative', zIndex: 5 }}>
        <Grid item>
          <Stack direction="row" spacing={matchDownSM ? 1 : 2} alignItems="center">
            <Box sx={{ ml: { xs: 0, sm: 1 } }}>

            </Box>
            <Stack spacing={0.75}>
              <Typography variant="h5">Edit Your Profile</Typography>
              <Typography variant="body2" color="primary">
                Complete your profile to unlock all features
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        {showEditButton && <Grid item sx={{ mx: matchDownSM ? 2 : 3, my: matchDownSM ? 1 : 0, mb: matchDownSM ? 2 : 0 }} xs={matchDownSM ? 12 : 'auto'}>
          <Button variant="contained" fullWidth={matchDownSM} component={Link} to="/apps/profiles/user/personal" onClick={handleEditProfile}>
            Edit Your Profile
          </Button>
        </Grid>}
      </Grid>
      <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
        <BackRight />
      </Box>
    </MainCard>
  );
};

ProfileCard.propTypes = {
  focusInput: PropTypes.func
};

export default ProfileCard;
