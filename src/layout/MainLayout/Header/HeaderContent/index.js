import {useEffect, useMemo, useState} from 'react';

// material-ui
import {Box, ListItemButton, ListItemText, useMediaQuery} from '@mui/material';

// project import
import useConfig from 'hooks/useConfig';
import Search from './Search';
import Message from './Message';
import Profile from './Profile';
import Localization from './Localization';
import Notification from './Notification';
import Customization from './Customization';
import MobileSection from './MobileSection';
import MegaMenuSection from './MegaMenuSection';
import Notifications from 'components/Notifications/Notifications';
import {footerDisabledPages} from "../../../../config";

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { i18n } = useConfig();
  const userId = localStorage.getItem('userId');
  const [showNotifications, setShowNotifications] = useState(true);
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const localization = useMemo(() => <Localization />, [i18n]);

  const megaMenu = useMemo(() => <MegaMenuSection />, []);

  useEffect(() => {
    let currentHref = window.location.href;
    if(footerDisabledPages.some((page)=>currentHref.includes(page))){
      setShowNotifications(false)
    }
  }, []);

  const notificationIcon = () => {
    return (
      <ListItemButton sx={{
        "&:hover": {
          background: "none"
        }, cursor: "default"
      }}>
        <ListItemText primary={
          <Notifications/>}/>
      </ListItemButton>
    );
  };

  return (
    <>
      {/*{!matchesXs && <Search />}*/}
      {/*{matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}*/}
      <Box sx={{ width: '100%', ml: 1 }} />
      {showNotifications && notificationIcon()}
      {!matchesXs && userId &&  <Profile />}
      {matchesXs && userId && <MobileSection />}
    </>
  );
};

export default HeaderContent;
