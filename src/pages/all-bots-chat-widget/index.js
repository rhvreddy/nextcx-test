import React, {useEffect, useState} from "react";
import ChatConsole from "./chat-console";
import {Grid, Stack, Box, useMediaQuery} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ConversationNavbar from "./users-and-conversations-navbar";
import {AUTH_KEY, CLIENT_ID} from "../../config";
import {dispatch, useSelector} from "../../store";
import Drawer from '@mui/material/Drawer';
import {
  fetchUsersByInterpreterId, getAllBotsByBizId,
  getChatBasicToken,
  getChatBearerToken,
  getLatestBotByUserId
} from "../../store/reducers/chat";
import {fetchBotsMenuItems} from "../../store/reducers/menuItems";
import Cookies from "js-cookie";
import {useTheme} from "@mui/material/styles";


const AllBotsChatWidget = () => {
  const theme = useTheme()
  const chatState = useSelector((state) => state.chat);
  const [allActiveBotsInfo, setAllActiveBotsInfo] = useState({});
  const {user} = useSelector((state) => state.profile);
  const [open, setOpen] = useState(false)
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));
  const toggleDrawer = () => {
    setOpen(!open);
  };
  const fetchBotByBizId = async () => {
    const payload = {
      userId: localStorage.getItem("userId"),
      businessId: localStorage.getItem("businessId"),
      organizationId: localStorage.getItem("organizationId")
    }
    const response = await dispatch(getAllBotsByBizId(payload));
    if (response?.payload?.status?.toLowerCase() === "success" && response?.payload?.results?.length > 0) {
      setAllActiveBotsInfo(response?.payload?.results)
    }
  };

  const getBasicTokenInfo = (botInfo) => {
    dispatch(getChatBasicToken(botInfo));
  }

  const getBearerTokenInfo = (authTokenInfo) => {
    dispatch(getChatBearerToken(authTokenInfo));
  }

  useEffect(() => {
    if (chatState.authTokenInfo?.status && chatState.authTokenInfo.access_token) {
      getBearerTokenInfo(chatState.authTokenInfo)
    }
  }, [chatState.authTokenInfo]);

  useEffect(() => {
    if (chatState.bearerInfo && chatState.bearerInfo.access_token) {
      Cookies.set("sia_access_token", chatState.bearerInfo.access_token);
    }
  }, [chatState.bearerInfo]);

  //Added interval to call tokens API on every 20min
  const setupTokenGenerationInterval = () => {
    const intervalId = setInterval(async () => {
      Cookies.remove("sia_access_token")
      await generateTokens("timerStart")
    }, 1200000);
    return () => clearInterval(intervalId);
  }

  const generateTokens = async (timerStart) => {
    try {
      const botId = localStorage.getItem("botId");
      const version = localStorage.getItem("versionNumber");
      const botInfo = {
        botId: botId,
        version: version,
        clientId: CLIENT_ID,
        authKey: AUTH_KEY,
      }
      getBasicTokenInfo(botInfo)
      if (!timerStart) {
        setupTokenGenerationInterval()
      }
    } catch (err) {
    }
  }

  useEffect(() => {
    fetchBotByBizId()
  }, []);

  const triggerTokensInfo = () => {
    window.addEventListener("beforeunload", (event) => {
      localStorage.setItem("onPageLoad", "Y")
    });
    const onloadChatPage = localStorage.getItem("onPageLoad")
    if ((onloadChatPage && onloadChatPage === "Y") || !Cookies.get("sia_access_token")) {
      generateTokens()
      localStorage.removeItem("onPageLoad")
    }
    return () => {
      window.removeEventListener('beforeunload', () => {
      });
    }
  }

  const fetchBotsInfo = async (activeBots) => {
    localStorage.setItem("botId", activeBots[0]?.interpreterId)
    const tokens = await triggerTokensInfo();
    let botNavItems = {appRoles: user?.appRoles, customNavItems: activeBots}
    const menuItems = await dispatch(fetchBotsMenuItems(botNavItems));
    const data = {
      interpreterId: localStorage.getItem("botId"),
    }
    const users = await dispatch(fetchUsersByInterpreterId(data))
  }

  useEffect(() => {
    if (allActiveBotsInfo?.length > 0) {
      fetchBotsInfo(allActiveBotsInfo)
    }
  }, [allActiveBotsInfo]);


  return (
    <Grid item xs={12} display="flex" flexDirection="row">
      {
        !matchDownSm ? <Box sx={{minWidth: "300px", maxWidth: "300px"}}>
            <ConversationNavbar/>
          </Box> :
          <>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{
                position: 'absolute',
                zIndex: 999,
                left: "30px",
                marginTop: "22px",
                background: "#80808029",
                color: "#ffff",
                height: "30px",
                width: "30px"
              }
              }
              onClick={toggleDrawer}
            >
              <MenuIcon/>
            </IconButton>
            <Drawer anchor="left" open={open} onClose={toggleDrawer}>
              <Box sx={{minWidth: "300px", maxWidth: "300px"}}>
                <ConversationNavbar/>
              </Box>
            </Drawer>
          </>
      }
      <Box sx={{width: "100%"}}>
        <ChatConsole/>
      </Box>
    </Grid>
  )
}

export default AllBotsChatWidget;
