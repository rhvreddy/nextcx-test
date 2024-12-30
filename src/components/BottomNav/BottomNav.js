import {Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';
import * as Icons from '@mui/icons-material';
import Avatar from '../@extended/Avatar';
import {makeStyles} from '@mui/styles';
import {drawerWidth} from '../../config';
import {dispatch, useDispatch} from "../../store";
import {logout} from "../../store/reducers/profile";
import {useEffect, useState} from 'react';
import {resetBotRecords} from "../../store/reducers/botRecords";
import {useNavigate} from "react-router-dom";
import {fetchMenuItems} from "../../store/reducers/menuItems";
import {useSelector} from "react-redux";
import {useTheme} from "@mui/material/styles";

const useStyles = makeStyles((theme) => ({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  profileContainer: {
    margin: theme.spacing(1),
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    width: "100%"
  },
  moreOptions: {
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden'
  },
  moreOptionsList: {
    position: 'absolute',
    bottom: '125%',
    right: 0,
    left: 0,
    backgroundColor: 'rgba(230,247,255,0.6)',
    backdropFilter: 'blur(16px)',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(1),
    zIndex: 1
  },
  moreOptionsListItem: {
    gap: '4px'
  },
  name: {
    // marginTop: theme.spacing(1),
  }
}));
const handleLogout = () => {
  dispatch((resetBotRecords([])));
  dispatch(logout());
};


const BottomNav = ({open, user}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const classes = useStyles();
  const [avatar, setAvatar] = useState("")
  const userDetails = useSelector((state) => state.profile);


  const handleOpenAllChat = () => {
    dispatch(fetchMenuItems(userDetails?.user))
    navigate("/bot/wizard");
  };

  const bottomNavItems = [
    // {
    //   id: 'logout',
    //   title: 'Logout',
    //   icon: 'LogoutOutlined',
    //   type: 'item',
    //   onClick: handleLogout
    // },
    {
      id: 'builder-widget',
      title: 'Create GPT',
      icon: 'SmartToyOutlined',
      type: 'item',
      onClick: handleOpenAllChat
    }
  ];
  useEffect(() => {
    if (user?.userAvatar) {
      setAvatar(user.userAvatar)
    }
  }, [user]);

  const capitalize = (str) => {
    if (str) {
      let words = str.split(" ")
      let capitalizedName = ""
      words.map(word => {
        const updatedWord = word.charAt(0).toUpperCase() + word.slice(1)
        capitalizedName += updatedWord
        capitalizedName += " "
      })
      return capitalizedName.trim()
    }
  }

  return (
    <div className={classes.bottomNav}>
      <Divider/>
      <List className='bottom-nav-container' sx={{paddingTop: "0", paddingBottom: "0"}}>
        {bottomNavItems?.map((navItem, index) => {
          const IconComponent = Icons[navItem.icon]
          return (
            <ListItemButton key={`bottomNav-${index}`} sx={{
              gap: "8px",
              backgroundColor: theme.palette.primary.lighter,
              color: theme.palette.primary.main,
              fontWeight: 600
            }} onClick={navItem.onClick}>
              <ListItemIcon sx={{color: theme.palette.primary.main}}>
                <IconComponent/>
              </ListItemIcon>
              {open && <ListItemText sx={{
                '& .MuiTypography-root': {fontWeight: 600}
              }}>{navItem.title}</ListItemText>}
            </ListItemButton>
          );
        })}
      </List>
      <Divider/>
      {/*<div className={classes.profileContainer}>*/}
      {/*  <div className={classes.userInfo} style={!open ? {justifyContent: "center"} : {gap: '8px'}}>*/}
      {/*    {avatar ? <Avatar alt="Avatar 1" src={avatar} sx={{border: "1px solid #80808059"}} size='sm'/> : (*/}
      {/*      <Avatar alt={user?.name} user={{showInitials: "true", name: capitalize(user?.name)}} border={"1px solid #80808059"}*/}
      {/*              size='sm'/>*/}
      {/*    )}*/}
      {/*    {open && <p className={classes.name}>{capitalize(user?.name)}</p>}*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  )
}

export default BottomNav
