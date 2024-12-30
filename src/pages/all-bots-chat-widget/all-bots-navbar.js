import React, {useEffect, useState} from "react";
import {
  Grid,
  Stack,
  Box,
  Typography,
  useMediaQuery,
  List,
  ListItemButton,
  ListItemText,
  Avatar
} from "@mui/material";
// material-ui
import {useTheme} from '@mui/material/styles';
import {dispatch} from "../../store";
import {fetchUsersByInterpreterId} from "../../store/reducers/chat";
import Loader from "../../components/Loader/Loader";
import {useSelector} from "react-redux";


const AllBotsNavbar = ({open, handleDrawerToggle, items}) => {
  const [botList, setBotList] = useState(items?.menuItems)
  const [isMenuEmpty, setIsMenuEmpty] = useState(false)
  const [isResFetching, setIsResFetching] = useState(false)
  const chatState = useSelector((state) => state.chat);
  const isFetching = useSelector((state) => state.menuItems.isListFetching);
  const userListState = useSelector((state) => state.chat);
  const menu = useSelector((state) => state.menu);
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('lg'));
  const {drawerOpen} = menu;

  useEffect(() => {
    if (items?.menuItems?.length > 0 && items?.menuItems?.[0]?.type !== "group") {
      setIsMenuEmpty(false)
      setBotList(items?.menuItems)
    } else if (!isFetching && items?.menuItems?.length === 0) {
      setIsMenuEmpty(true)
    }
  }, [items?.menuItems])

  useEffect(() => {
    if (userListState.usersListByBotId?.isUsersFetched) {
    }
  }, [userListState.usersListByBotId])

  useEffect(() => {
    if (chatState?.isResFetching) {
      setIsResFetching(true)
    } else {
      setIsResFetching(false)
    }
  }, [chatState?.isResFetching])

  const handleClickBotId = (botId) => {
    localStorage.setItem("botId", botId)
    const payload = {
      interpreterId: botId,
    }
    dispatch(fetchUsersByInterpreterId(payload))
  }

  return (
    <Grid container justifyContent="center">
      {isFetching ? (
          <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', height: "70vh"}}>
            <Loader/>
            {drawerOpen && <Typography paragraph sx={{margin: 0}}>Loading bots menu</Typography>}
          </Box>
        ) :
        (botList?.length > 0 ? <Stack justifyContent="center" alignItems="start" width="100%"> <List
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "inherit",
            paddingTop: "0",
            pointerEvents: isResFetching ? "none" : ""
          }}>
          {
            botList?.map((bot, index) =>
              <ListItemButton key={index} onClick={() => handleClickBotId(bot?.id)} sx={{
                border: "1px solid #80808024",
                gap: "10px",
                background: bot?.id === localStorage.getItem("botId") ? theme.palette.primary.lighter : "#fff",
                color: (bot?.id === localStorage.getItem("botId") && !isResFetching) ? theme.palette.primary.main : (isResFetching ? "rgb(158 158 158)" : "inherit"),
                "&:hover": {
                  background: theme.palette.primary.lighter
                }
              }}>
                <Avatar alt="Avatar 1" src={"https://d3dqyamsdzq0rr.cloudfront.net/images/bot_icon.png"}
                        sx={{border: "1px solid #80808059", height: "30px", width: "30px"}} size='sm'/>
                {
                  drawerOpen && <ListItemText primary={<Box display="flex" gap="8px"><Typography
                    sx={{fontWeight: "500"}}>{bot?.id}</Typography><Typography
                    sx={{
                      fontWeight: "500",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "60%"
                    }}>({bot?.name})</Typography></Box>}/>
                }

              </ListItemButton>
            )
          }
        </List> </Stack> : isMenuEmpty &&
          <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "70vh"}}><Typography
            color="secondary" fontWeight="600" fontSize="16px">No bots found</Typography></Box>)
      }
    </Grid>
  )
};


export default AllBotsNavbar;
