import PropTypes from 'prop-types';
import {useEffect, useMemo, useRef, useState} from 'react';

// material-ui
import {useTheme} from '@mui/material/styles';
import Avatar from 'components/@extended/Avatar';
import {
  Box,
  Button,
  Divider,
  Drawer,
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery
} from '@mui/material';
import {makeStyles} from '@mui/styles';

// project import
import MiniChatDrawerStyled from './MiniChatDrawerStyled';
import {drawerWidth} from 'config';
import DynamicNavDrawerHeader from './DynamicNavDrawerHeader';
import DynamicNavDrawerContent from './DynamicNavDrawerContent';
import {fetchMenuItems, selectOption} from '../../../store/reducers/menuItems';
import {useDispatch} from 'store';
import {useSelector} from 'react-redux';
import BottomNav from '../../../components/BottomNav/BottomNav';
import {logout} from '../../../store/reducers/profile';
import {resetBotRecords} from "../../../store/reducers/botRecords";
import {useLocation} from "react-router-dom";
// ==============================|| MAIN LAYOUT - DRAWER ||============================== //

const useStyles = makeStyles((theme) => ({
  loadNavButton: {
    margin: theme.spacing(1)
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  avatar: {
    margin: theme.spacing(1)
  },
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

const MainChatDrawer = ({open, handleDrawerToggle, window}) => {
  const location = useLocation();
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('lg'));
  const classes = useStyles();
  const {user} = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const [openSettings, setOpenSettings] = useState(false);
  const [loadNavItems, setLoadNavItems] = useState(false);
  const selectedOption = useSelector((state) => state.menuItems.selectedOption);
  const menuItems = useSelector((state) => state.menuItems.items);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchMenuItems(user));
    }
  }, [user])

  useEffect(() => {
    setLoadNavItems(true);
  }, [menuItems]);

  const handleOptionChange = (option) => {
    dispatch(selectOption(option));
  };

  const handleMoreOptions = () => {
    setOpenSettings(prevState => !prevState);
  };

  // responsive drawer container
  const container = window !== undefined ? () => window().document.body : undefined;
  // header content
  const drawerContent = (<DynamicNavDrawerContent menuItems={menuItems}/>);
  const drawerHeader = useMemo(() => <DynamicNavDrawerHeader open={open} menuItems={menuItems}/>, []);

  return (
    <Box component='nav' sx={{flexShrink: {md: 0}, zIndex: 1200}} aria-label='mailbox folders'>
      {!matchDownMD ? (
        <MiniChatDrawerStyled variant='permanent' open={open}>
          {loadNavItems && drawerHeader}
          {loadNavItems && drawerContent}

          {userId && location.pathname.includes("/bot/all-chatbot-agents") &&
            <BottomNav open={open} user={user ? user : {}}/>}
        </MiniChatDrawerStyled>
      ) : (
        <Drawer
          container={container}
          variant='temporary'
          onClose={handleDrawerToggle}
          ModalProps={{keepMounted: true}}
          open={open}
          sx={{
            display: {xs: 'block', lg: 'none'},
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              // borderRight: `1px solid ${theme.palette.divider}`,
              backgroundImage: 'none',
              boxShadow: 'inherit'
            }
          }}
        >
          {loadNavItems && drawerHeader}
          {loadNavItems && drawerContent}
          {userId && location.pathname.includes("/bot/all-chatbot-agents") &&
            <BottomNav open={open} user={user ? user : {}}/>}
        </Drawer>
      )}
    </Box>
  );
};

MainChatDrawer.propTypes = {
  open: PropTypes.bool,
  window: PropTypes.object,
  handleDrawerToggle: PropTypes.func
};

export default MainChatDrawer;
