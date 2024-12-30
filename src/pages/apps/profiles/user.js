import { useRef } from 'react';
import {useLocation} from "react-router-dom";

// material-ui
import { Grid } from '@mui/material';
import { Outlet } from 'react-router';

// project import
import ProfileCard from 'sections/apps/profiles/user/ProfileCard';
import ProfileTabs from 'sections/apps/profiles/user/ProfileTabs';

// ==============================|| PROFILE - USER ||============================== //

const UserProfile = () => {
  const inputRef = useRef(null);
  const location = useLocation()
  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <Grid container spacing={3} sx={{height:"100%",overflowY:"auto", p: 3}}>
      {location.pathname === "/apps/profiles/user/personal" &&
        <Grid item xs={12}>
          <ProfileCard focusInput={focusInput} />
        </Grid>
      }
      <Grid item xs={12} md={3}>
        <ProfileTabs focusInput={focusInput} />
      </Grid>
      <Grid item xs={12} md={9}>
        <Outlet context={inputRef} />
      </Grid>
    </Grid>
  );
};

export default UserProfile;
