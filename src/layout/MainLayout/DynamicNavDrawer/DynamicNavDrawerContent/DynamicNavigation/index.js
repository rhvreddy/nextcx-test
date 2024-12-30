import {useSelector} from 'react-redux';

// material-ui
import {Box, Typography} from '@mui/material';

import Loader from '../../../../../components/Loader/Loader';

// project import
import NavGroup from './NavGroup';
import {useEffect, useState} from 'react';



// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const DynamicNavigation = () => {
  const {user} = useSelector((state) => state.profile)
  const menu = useSelector((state) => state.menu);
  const {records} = useSelector((state) => state.botRecords);
  const {botRecords} = useSelector((state) => state.chat);
  let menuItems = useSelector((state) => state.menuItems.items);
  const loading = useSelector((state) => state.menuItems.loading);
  const error = useSelector((state) => state.menuItems.error);
  const {drawerOpen} = menu;
  const pathName = window.location.pathname;
  const [isNoCreatedBots, setIsNoCreatedBots] = useState(false)

  useEffect(() => {
    if (records?.length === 0 && pathName === "/bot/wizard") {
      setIsNoCreatedBots(true)
    } else if (botRecords?.length === 0 && pathName === "/apps/chat-widget") {
      setIsNoCreatedBots(true)
    } else {
      setIsNoCreatedBots(false)
    }
  }, [records, botRecords])

  const displayNavGroups = () => {
    const items = isNoCreatedBots ? menuItems?.filter((items) => items?.children?.[0]?.url !== "/apps/chat-widget") : menuItems;
    return (
      items?.map((item) => {
        switch (item.type) {
          case 'group':
            return <NavGroup key={item.id} item={item}/>;
          default:
            return (
              <Typography key={item.id} variant="h6" color="error" align="center">
                {/*Fix - Navigation Group*/}
              </Typography>
            );
        }
      })
    )
  }


  return (
    <Box sx={{pt: drawerOpen ? 2 : 0, '& > ul:first-of-type': {mt: 0}}}>
      {loading ? (
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
          <Loader/>
          {drawerOpen && <Typography paragraph sx={{margin: 0}}>Loading menu items</Typography>}
        </Box>
      ) : error ? (
        <p>Error loading menu items: {error}</p>
      ) : (
        <>
          {displayNavGroups()}
        </>
      )}
    </Box>
  );
};

export default DynamicNavigation;
