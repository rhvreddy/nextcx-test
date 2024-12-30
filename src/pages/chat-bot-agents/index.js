import React, {useEffect, useState} from "react";
import ChatBotAgentsConsole from "./ChatBotAgentsConsole";
import {Grid, Stack, Box, useMediaQuery} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChatBotAgentsConversationList from "./ChatBotAgentsConversationList";
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
import {useParams} from "react-router-dom";
import {makeStyles} from "@mui/styles";


const AllBotsChatWidget = () => {
  const theme = useTheme()
  const pathParameters = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const interpreterId = urlParams.get('botId');
  const versionNumber = urlParams.get('version');
  const chatState = useSelector((state) => state.chat);
  const [allActiveBotsInfo, setAllActiveBotsInfo] = useState({});
  const [noBotsFound,setNoBotsFound] = useState(false);
  const {user} = useSelector((state) => state.profile);
  const [open, setOpen] = useState(false)
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));

  const useStyles = makeStyles(()=>({
    container:{
      [theme.breakpoints.down("sm")]:{
        height:"100vh",
      },
      [theme.breakpoints.down("xl")]:{
        height:"84vh",
      },
      [theme.breakpoints.up("xl")]:{
        height:"87vh",
      }
    }
  }))

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const fetchBotByBizId = async () => {

    const payload = {
      userId: localStorage.getItem("userId"),
      businessId: localStorage.getItem("businessId"),
      organizationId: localStorage.getItem("organizationId")
    }
    let searchParams = {}
    if(interpreterId){
      searchParams.interpreterId = interpreterId;
      Object.assign(payload,searchParams);
    }
    if(versionNumber){
      searchParams.versionNumber = versionNumber;
      Object.assign(payload,searchParams);
    }
    const response = await dispatch(getAllBotsByBizId(payload));
    if (response?.payload?.status?.toLowerCase() === "success" && response?.payload?.results?.length > 0) {
      setAllActiveBotsInfo(response?.payload?.results);
    }else if(response?.payload?.status?.toLowerCase() === "success" && response?.payload?.results?.length === 0){
      setNoBotsFound(true);
      let botNavItems = {appRoles: user?.appRoles, customNavItems: [],notBotsFound:true}
      const menuItems = await dispatch(fetchBotsMenuItems(botNavItems));
    }
  };

  useEffect(() => {
    setAllActiveBotsInfo(chatState.allChatBotAgents)
  }, [chatState.allChatBotAgents]);

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

  const styles = useStyles()
  return (
    <Grid item xs={12} display="flex" flexDirection="row" className={styles.container}>
      {
        !matchDownSm ? <Box sx={{minWidth: "300px", maxWidth: "300px"}}>
            <ChatBotAgentsConversationList isBotsMenuList={noBotsFound}/>
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
                <ChatBotAgentsConversationList isBotsMenuList={noBotsFound}/>
              </Box>
            </Drawer>
          </>
      }
      <Box sx={{width: "100%"}}>
        <ChatBotAgentsConsole isBotsMenuList={noBotsFound}/>
      </Box>
    </Grid>
  )
}

export default AllBotsChatWidget;
