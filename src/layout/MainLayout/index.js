import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, Container, Toolbar } from '@mui/material';

// project import
import Drawer from './Drawer';
import Header from './Header';
import Footer from './Footer';
import navigation from 'menu-items';
import useConfig from 'hooks/useConfig';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { openDrawer } from 'store/reducers/menu';
import DynamicNavDrawer from './DynamicNavDrawer';
import {footerDisabledPages} from "../../config";

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const [showFooter, setShowFooter] = useState(true);
  const matchDownLG = useMediaQuery(theme.breakpoints.down('xl'));

  const { container, miniDrawer } = useConfig();
  const dispatch = useDispatch();

  const menu = useSelector((state) => state.menu);
  const { drawerOpen } = menu;

  // drawer toggler
  const [open, setOpen] = useState(!miniDrawer || drawerOpen);
  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      setOpen(!matchDownLG);
      dispatch(openDrawer({ drawerOpen: !matchDownLG }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchDownLG]);

  useEffect(() => {
    if (open !== drawerOpen) setOpen(drawerOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  useEffect(() => {
    let currentHref = window.location.href;
    if(footerDisabledPages.some((page)=>currentHref.includes(page))){
      setShowFooter(false)
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', width: '100%', padding: 0 }}>
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      {/*<Drawer open={open} handleDrawerToggle={handleDrawerToggle} />*/}
      <DynamicNavDrawer open={open} handleDrawerToggle={handleDrawerToggle} />
      <Box component="main" sx={{ width: 'calc(100% - 280px)', flexGrow: 1, marginTop: "60px", marginBottom: '40px'}}>
        {/*<Toolbar />*/}
        {container && (
          <>
            <Outlet />
            {showFooter && <Footer/>}
          </>
        )}
        {!container && (
          <Box sx={{ position: 'relative', minHeight: 'calc(100vh - 110px)', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
            <Footer />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MainLayout;
