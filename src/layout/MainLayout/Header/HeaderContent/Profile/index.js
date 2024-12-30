import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  ButtonBase,
  CardContent,
  ClickAwayListener,
  Grid,
  Paper,
  Popper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';

// project import
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import IconButton from 'components/@extended/IconButton';
import ProfileTab from './ProfileTab';
import SettingTab from './SettingTab';
import { logout } from '../../../../../store/reducers/profile';

// assets
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {resetBotRecords} from "../../../../../store/reducers/botRecords";

// tab panel wrapper
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role='tabpanel' hidden={value !== index} id={`profile-tabpanel-${index}`}
         aria-labelledby={`profile-tab-${index}`} {...other}>
      {value === index && children}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`
  };
}

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const Profile = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.profile)
  const [ avatar, setAvatar ] = useState('')
  const handleLogout = async () => {
    try {
      dispatch((resetBotRecords([])));
      dispatch(logout());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if(user?.userAvatar) {
      setAvatar(user.userAvatar)
    }
  }, [user]);

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const capitalize= (str) =>{
    if(str){
      let words = str.split(" ")
      let capitalizedName = ""
      words.map(word => {
        const updatedWord = word.charAt(0).toUpperCase() + word.slice(1)
        capitalizedName +=updatedWord
        capitalizedName += " "
      })
      return capitalizedName.trim()
    }
  }

  const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={{
          p: 0.25,
          bgcolor: open ? iconBackColorOpen : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'secondary.light' : 'secondary.lighter' },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2
          }
        }}
        aria-label='open profile'
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup='true'
        onClick={handleToggle}
      >
        <Stack direction='row' spacing={2} alignItems='center' sx={{ p: 0.5 }}>
          {user?.userAvatar ? <Avatar alt="Avatar 1" src={user?.userAvatar} sx={{ border: "1px solid #80808059" }} size='sm' /> : (
            <Avatar alt={user?.name} user={{showInitials : "true", name:capitalize(user?.name)}} border={"1px solid #80808059"}  size='sm' />
          )}
          <Typography variant='subtitle1'>{capitalize(user?.name)}</Typography>
        </Stack>
      </ButtonBase>
      <Popper
        placement='bottom-end'
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type='fade' in={open} {...TransitionProps}>
            {open && (
              <Paper
                sx={{
                  boxShadow: theme.customShadows.z1,
                  minWidth: 220,
                  maxWidth: 330,
                  [theme.breakpoints.down('md')]: {
                    maxWidth: 250
                  }
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <MainCard elevation={0} border={false} content={false}>
                    <CardContent sx={{ px: 2.5, pt: 3 }}>
                      <Grid container justifyContent='center' alignItems='center'>
                        <Grid item>
                          <Stack direction='row' spacing={1.25} alignItems='center'>
                            {user?.userAvatar ? <Avatar alt="Avatar 1" src={user?.userAvatar} sx={{ border: "1px solid #80808059" }} size='sm' /> : (
                              <Avatar alt={user?.name} user={{showInitials : "true", name:capitalize(user?.name)}} border={"1px solid #80808059"}  size='sm' />
                            )}
                            <Stack>
                              <Typography variant='h6'>{capitalize(user?.name)}</Typography>
                              <Typography variant='body2' color='textSecondary'>
                                {user?.role ? user?.role : ''}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        {/*<Grid item>*/}
                        {/*  <Tooltip title='Logout'>*/}
                        {/*    <IconButton size='large' sx={{ color: 'text.primary' }} onClick={handleLogout}>*/}
                        {/*      <LogoutOutlined />*/}
                        {/*    </IconButton>*/}
                        {/*  </Tooltip>*/}
                        {/*</Grid>*/}
                      </Grid>
                    </CardContent>
                    {open && (
                      <>
                        {/*<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>*/}
                        {/*  <Tabs variant='fullWidth' value={value} onChange={handleChange} aria-label='profile tabs'>*/}
                        {/*    <Tab*/}
                        {/*      sx={{*/}
                        {/*        display: 'flex',*/}
                        {/*        flexDirection: 'row',*/}
                        {/*        justifyContent: 'center',*/}
                        {/*        alignItems: 'center',*/}
                        {/*        textTransform: 'capitalize'*/}
                        {/*      }}*/}
                        {/*      icon={<UserOutlined style={{ marginBottom: 0, marginRight: '10px' }} />}*/}
                        {/*      label='Profile'*/}
                        {/*      {...a11yProps(0)}*/}
                        {/*    />*/}
                        {/*  </Tabs>*/}
                        {/*</Box>*/}
                        <TabPanel value={value} index={0} dir={theme.direction}>
                          <ProfileTab handleLogout={handleLogout} handleClose={handleClose} />
                        </TabPanel>
                        <TabPanel value={value} index={1} dir={theme.direction}>
                          <SettingTab />
                        </TabPanel>
                      </>
                    )}
                  </MainCard>
                </ClickAwayListener>
              </Paper>
            )}
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Profile;
