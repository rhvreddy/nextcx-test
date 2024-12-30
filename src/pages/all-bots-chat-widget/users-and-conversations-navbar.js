import React, {useState, useEffect} from "react";
import {
  Grid,
  Stack,
  Box,
  useMediaQuery,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List
} from "@mui/material"

// material-ui
import {useTheme} from '@mui/material/styles';
import Loader from "../../components/Loader/Loader";
import {useSelector} from "react-redux";
import TreeView from "../../components/TreeView/TreeView";


const ConversationNavbar = () => {
  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isFetching = useSelector((state) => state.chat.isUsersFetching);
  const userListState = useSelector((state) => state.chat);
  const menu = useSelector((state) => state.menu);
  const {drawerOpen} = menu;
  const [usersList, setUsersList] = useState([])


  useEffect(() => {
    if (userListState.usersListByBotId?.isUsersFetched && userListState.usersListByBotId?.usersList?.length > 0) {
      setUsersList(userListState.usersListByBotId?.usersList)
    } else if (userListState.usersListByBotId?.isUsersFetched && userListState.usersListByBotId?.usersList?.length === 0) {
      setUsersList([])
      localStorage.removeItem("current_bot_user_id")
    }
  }, [userListState.usersListByBotId])


  return (
    <Grid container sx={{
      background: "#fff",
      height: matchDownSm ? "100vh" : "86.6vh",
      overflowX: "hidden",
      overflowY: "auto",
      barWidth: "thin",
      '::-webkit-scrollbar': {
        width: "6px",
      },
      '::-webkit-scrollbar-track': {
        background: "#f1f1f1",
      },
      '::-webkit-scrollbar-thumb': {
        background: "#888",
      }
    }}>
      {isFetching ? (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          height: "70vh",
          width: "100%"
        }}>
          <Loader/>
        </Box>
      ) : (usersList?.length > 0 ? <Stack justifyContent="start" alignItems="start" width="92%" sx={{
        margin: "4px" +
          " 10px", border: "2px solid #8080802b", borderRadius: "10px", boxShadow: "0 0 6px rgba(0, 0, 0, 0.1)"
      }}>
        <TreeView data={usersList}/>
      </Stack> : <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%"
      }}><Typography color="secondary" fontWeight="600" fontSize="16px">No users found</Typography></Box>)
      }
    </Grid>
  )
};


export default ConversationNavbar;
