import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Divider, FormLabel, Grid, TextField, Menu, MenuItem, Stack, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Avatar from 'components/@extended/Avatar';
import ProfileTab from './ProfileTab';
import {facebookColor, linkedInColor, REACT_APP_APP_BACK_END_BASE_URL, twitterColor} from 'config';

// assets
import { FacebookFilled, LinkedinFilled, MoreOutlined, TwitterSquareFilled, CameraOutlined } from '@ant-design/icons';
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import {getUserInfo, setUserAvatar, setImageUpload} from '../../../../store/reducers/profile';
import { validImageTypes } from '../../../../consts';
import {toast} from "react-toastify";

const avatarImage = require.context('assets/images/users', true);

// ==============================|| USER PROFILE - TAB CONTENT ||============================== //

const ProfileTabs = ({ focusInput }) => {
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState(undefined);
  const dispatch = useDispatch()
  const { user, updatedProfile, editProfile, imageUpload } = useSelector(state => state.profile)
  const [avatar, setAvatar] = useState(user?.userAvatar);
  let userId = localStorage.getItem('userId');

  useEffect(() => {
    if(user?.userAvatar) {
      setAvatar(user.userAvatar)
    }
  }, [user]);

  useEffect(() => {
    if(updatedProfile) {
      dispatch(getUserInfo(userId))
    }
  }, [updatedProfile]);

  useEffect(() => {
    if(!imageUpload) {
      setAvatar(user?.userAvatar ? user?.userAvatar : "")
      dispatch(setUserAvatar(""))
    }
  }, [imageUpload]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = () => {
    dispatch(setImageUpload(true))
  };

  const handleImageUpload = (event) => {
    const file = event.target?.files[0]
    const maxSizeInBytes = 5 * 1024 * 1024;
    if(file) {
      if (file.size > maxSizeInBytes) {
        toast.error("Please insert an image with size lesser than 5 Mb")
        event.target.value = "";
      } else if(validImageTypes.includes(file.type)) {
          setAvatar(URL.createObjectURL(file));
          dispatch(setUserAvatar(file))
      } else {
        toast.error("Please select a valid image type. Supported types: jpg, jpeg, png")
        event.target.value = "";
      }
    }
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Stack spacing={2.5} alignItems="center">
            <FormLabel
              htmlFor="change-avtar"
              sx={{
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden',
                ...(editProfile && {
                  '&:hover .MuiBox-root': { opacity: 1 }
                }),
                cursor: 'pointer'
              }}
              onClick={handleClick}
            >
              {avatar ? <Avatar alt="Avatar 1" src={avatar} sx={{ width: 124, height: 124, border: '1px dashed' }} /> : (
                <Avatar alt='profile user' user={{ showInitials: 'true', name: user?.name }} sx={{ width: 124, height: 124, border: '1px dashed', fontSize: "48px" }} />
              )}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Stack spacing={0.5} alignItems="center">
                  <CameraOutlined style={{ color: theme.palette.secondary.lighter, fontSize: '2rem' }} />
                  <Typography sx={{ color: 'secondary.lighter' }}>Upload</Typography>
                </Stack>
              </Box>
            </FormLabel>
            {editProfile &&
              <TextField
                type="file"
                id="change-avtar"
                label="Outlined"
                variant="outlined"
                sx={{ display: 'none' }}
                onChange={(e) => {
                  handleImageUpload(e);
                }}
                inputProps={{ accept: 'image/*' }}
              />
            }
            <Stack spacing={0.5} alignItems="center">
              <Typography variant="h5">{user?.name}</Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid item sm={3} sx={{ display: { sm: 'block', md: 'none' } }} />
        <Grid item xs={12}>
          <ProfileTab />
        </Grid>
      </Grid>
    </MainCard>
  );
};

ProfileTabs.propTypes = {
  focusInput: PropTypes.func
};

export default ProfileTabs;
