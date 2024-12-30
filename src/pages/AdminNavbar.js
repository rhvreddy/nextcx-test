import React, {useEffect} from "react";
import {dispatch} from "../store";
import {fetchAdminMenuItems, fetchMenuItems} from "../store/reducers/menuItems";
import {useSelector} from "react-redux";
import {getUserInfo} from "../store/reducers/profile";
import NavGroup from "../layout/MainLayout/DynamicNavDrawer/DynamicNavDrawerContent/DynamicNavigation/NavGroup";
import {Box, Typography} from "@mui/material";
import Loader from "../components/Loader/Loader";


const AdminNavbar = () => {
  const userDetails = useSelector((state) => state.profile)
  const menu = useSelector((state) => state.menu);
  let menuItems = useSelector((state) => state.menuItems.adminItems);
  const loading = useSelector((state) => state.menuItems.loading);
  const error = useSelector((state) => state.menuItems.error);
  const {drawerOpen} = menu;
  const userId = localStorage.getItem("userId")

  useEffect(() => {
    if (userDetails?.user) {
      dispatch(fetchAdminMenuItems(userDetails?.user))
    } else {
      dispatch(getUserInfo(userId)).then((res) => {
        dispatch(fetchAdminMenuItems(res?.payload?.userInfo))
      })
    }

  }, []);

  const displayNavGroups = () => {
    return (
      <>
        {menuItems?.map((item) => {
          switch (item.type) {
            case 'admin':
              return <NavGroup key={item.id} item={item}/>;
            default:
              return (
                <Typography key={item.id} variant="h6" color="error" align="center">
                  {/*Fix - Navigation Group*/}
                </Typography>
              );
          }
        })}
        <Box style={{position:"absolute",bottom:0,left:0,width:"100%"}}>
          {menuItems?.map((item) => {
            switch (item.type) {
              case 'admin-b':
                return <NavGroup key={item.id} item={item}/>;
              default:
                return (
                  <Typography key={item.id} variant="h6" color="error" align="center">
                    {/*Fix - Navigation Group*/}
                  </Typography>
                );
            }
          })}
        </Box>
      </>
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

}

export default AdminNavbar;
