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
  List, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material"

import EditNoteIcon from '@mui/icons-material/EditNote';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCommentIcon from '@mui/icons-material/AddComment';

// material-ui
import {useTheme} from '@mui/material/styles';
import Loader from "../../components/Loader/Loader";
import {useDispatch, useSelector} from "react-redux";
import TreeView from "../../components/TreeView/TreeView";
import {AUTH_KEY, CLIENT_ID, REACT_APP_APP_BACK_END_BASE_URL} from "../../config";
import {dispatch} from "../../store";
import {
  clearChatFileState,
  deleteBot,
  deleteConversation, disableNavItems,
  setIsNewChatInitiating,
  fetchUsersByInterpreterId,
  getAllBotsByBizId,
  getAllChatBotAgentsBasicToken,
  getBotReplyResponse,
  getChatBearerToken,
  getChatCustomSettings,
  getUserJoin,
  triggerNotification
} from "../../store/reducers/chat";
import LinearProgress from "@mui/material/LinearProgress";
import axios from "axios";
import {toast} from "react-toastify";


const ChatBotAgentsConversationList = ({isBotsMenuList}) => {
  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isFetching = useSelector((state) => state.chat.isUsersFetching);
  const userListState = useSelector((state) => state.chat);
  const chatState = useSelector((state) => state.chat);
  const userState = useSelector((state) => state.profile)
  const {user} = useSelector((state) => state.profile);
  const botRecords = useSelector(state => state.botRecords)
  const [authTokenInfo, setAuthTokenInfo] = useState({})
  const [bearerInfo, setBearerInfo] = useState({});
  const [chatCustomSettings, setChatCustomSettings] = useState({});
  const [userJoinInfo, setUserJoinInfo] = useState({});
  const [botUserInfo, setBotUserInfo] = useState({});
  const menu = useSelector((state) => state.menu);
  const [currentBotInfo, setCurrentBotInfo] = useState({});
  const [isInitializingNewConversation, setIsInitializingNewConversation] = useState(false)
  const {drawerOpen} = menu;
  const [conversationIdToDelete, setConversationIdToDelete] = useState("");
  const [usersList, setUsersList] = useState([])
  const [showConversationDeletionDialog, setShowConversationDeletionDialog] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const dispatch = useDispatch();
  const [isResFetching, setIsResFetching] = useState(false);


  useEffect(() => {
    if (userListState.usersListByBotId?.isUsersFetched && userListState.usersListByBotId?.usersList?.length > 0) {
      setUsersList(userListState.usersListByBotId?.usersList)
    } else if (userListState.usersListByBotId?.isUsersFetched && userListState.usersListByBotId?.usersList?.length === 0) {
      setUsersList([])
      localStorage.removeItem("current_bot_user_id")
    }
  }, [userListState.usersListByBotId])

  useEffect(() => {
    console.log("user list -->", usersList);
  }, [usersList])

  useEffect(() => {
    if (chatState.allChatBotAgentsBasicToken?.status && chatState.allChatBotAgentsBasicToken.access_token) {
      setAuthTokenInfo(chatState.allChatBotAgentsBasicToken);
    }
  }, [chatState.allChatBotAgentsBasicToken]);

  useEffect(() => {
    if (authTokenInfo && authTokenInfo.access_token) {
      dispatch(getChatBearerToken(authTokenInfo));
    }
  }, [authTokenInfo]);

  useEffect(() => {
    if (chatState.bearerInfo && isInitializingNewConversation && authTokenInfo.access_token) {
      setBearerInfo(chatState.bearerInfo);
    }
  }, [chatState.bearerInfo]);

  useEffect(() => {
    if (bearerInfo && bearerInfo.access_token) {
      fetchBotInitialInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bearerInfo]);

  const getBotInfo = () => {
    return {
      botId: currentBotInfo.interpreterId,
      clientId: currentBotInfo.clientId,
      authKey: currentBotInfo.authKey
    }
  }

  const fetchBotInitialInfo = async () => {
    if (isInitializingNewConversation) {
      let botInfo = getBotInfo()
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${bearerInfo.access_token}`
      };
      //get custom bot settings, before getting any userId and conversationId
      const requestObjForSettings = {
        interpreterId: botInfo?.botId,
        // interactionId: localStorage.getItem('skil_ai_bot_conversation_id'),
        pageUrl: window.location.href,
        authKey: botInfo.authKey,
        publishStatus: true,
        clientId: botInfo.clientId
      };

      const requestObjectForJoin = {
        interpreterId: botInfo?.botId,
        userBotId: localStorage.getItem('userId'),
        pageUrl: window.location.href,
        authKey: botInfo?.authKey,
        publishStatus: true,
        clientId: botInfo?.clientId
      };

      const results = await Promise.allSettled([
        dispatch(getChatCustomSettings(requestObjForSettings, headers)),
        dispatch(getUserJoin(requestObjectForJoin, headers))
      ]);
      let localChatCustomSettings;
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          //console.log(`Promise ${i} fulfilled with value:`, result.value);
          const promiseResult = result.value;
          if (promiseResult.config.url.indexOf('agent-chat-settings') !== -1) {
            let settingsObj = promiseResult.data;
            if (settingsObj && Array.isArray(settingsObj) && settingsObj.length > 0) {
              localChatCustomSettings = settingsObj[0];
              setChatCustomSettings(localChatCustomSettings);
            }
          } else {
            let userJoinObj = promiseResult.data;
            if (userJoinObj && userJoinObj.userBotId) {
              localStorage.setItem('conversationId', userJoinObj.botConversationId);
              localStorage.setItem('botId', botInfo.botId);
              setUserJoinInfo(chatState.userJoinInfo);
            }
          }
        } else {
          console.log(`Promise ${i} rejected with reason: ${result.reason}`);
        }
      });
      if (localChatCustomSettings && localChatCustomSettings["languageSettings"] && localChatCustomSettings["languageSettings"][0] && localChatCustomSettings["languageSettings"][0]["charLimit"]) {
        let charLimit = localChatCustomSettings["languageSettings"][0]["charLimit"]
        const maxCharLimit = (localChatCustomSettings["languageSettings"][0]["maxCharLimit"] ? localChatCustomSettings["languageSettings"][0]["maxCharLimit"] : 300).toString()
        localChatCustomSettings["languageSettings"][0]["charLimit"] = charLimit.replace('${maxCharLimit}', maxCharLimit)
      }
      if (localChatCustomSettings) {
        //update all custom settings
        //create bot user
        let botUser = {
          avatar:
            localChatCustomSettings.avatarFileS3Info && localChatCustomSettings.avatarFileS3Info.avatarFileUrl
              ? localChatCustomSettings.avatarFileS3Info.avatarFileUrl
              : 'https://d3dqyamsdzq0rr.cloudfront.net/images/bot_icon.png',
          name: localChatCustomSettings.botName ? localChatCustomSettings.botName : 'Sia',
          id: localChatCustomSettings.botRecordId,
          charLimit: localChatCustomSettings["languageSettings"][0]["charLimit"] ? localChatCustomSettings["languageSettings"][0]["charLimit"] : "Please try rephrasing your question with fewer words. (300 characters max)",
          maxCharLimit: localChatCustomSettings["languageSettings"][0]["maxCharLimit"] ? localChatCustomSettings["languageSettings"][0]["maxCharLimit"] : 300,
          online_status: 'available',
          botColor: localChatCustomSettings?.botColor ? localChatCustomSettings.botColor : '#000000',
          botHeaderTextColor: localChatCustomSettings?.botHeaderTextColor
            ? localChatCustomSettings?.botHeaderTextColor
            : theme.palette.background.paper,
          userMsgBg: localChatCustomSettings?.userMsgBgColor ? localChatCustomSettings?.userMsgBgColor : theme.palette.primary.main,
          botMsgBg: localChatCustomSettings?.botMsgBgColor ? localChatCustomSettings?.botMsgBgColor : '',
          sendButtonColor: localChatCustomSettings?.sendButtonColor ? localChatCustomSettings?.sendButtonColor : '',
          privacyPolicyUrl: localChatCustomSettings?.languageSettings?.[0]?.privacyPolicyUrl
            ? localChatCustomSettings?.languageSettings?.[0]?.privacyPolicyUrl
            : 'https://skil.ai/privacy-policy/',
          privacyPolicyText: localChatCustomSettings?.languageSettings[0]?.privacyPolicyText
            ? localChatCustomSettings?.languageSettings?.[0]?.privacyPolicyText
            : 'Privacy Policy',
          poweredByUrl: localChatCustomSettings?.languageSettings?.[0]?.poweredByUrl
            ? localChatCustomSettings?.languageSettings?.[0]?.poweredByUrl
            : 'https://www.nextcx.ai',
          poweredByText: localChatCustomSettings?.languageSettings?.[0]?.poweredBy
            ? localChatCustomSettings?.languageSettings?.[0]?.poweredBy
            : 'Nextcx.AI',
          betaContent: localChatCustomSettings?.languageSettings?.[0]?.advisoryNotes
            ? localChatCustomSettings?.languageSettings?.[0]?.advisoryNotes
            : '<p>We invite you to beta test our chatbot and provide valuable feedback to enhance its functionality and usability. Request you to adhere to a few guidelines to ensure that the testing process is as smooth as possible:<br><br>1. Please keep in mind that this is a beta test version, and as such, there may be bugs or glitches that you encounter while using the chatbot.<br>2. We encourage you to provide detailed feedback on your experience using the chatbot, including any issues or errors you encounter, suggestions for improvement, and any other comments or concerns you may have.<br>3. Please do not share any confidential or sensitive information while using the chatbot, as this is still a test version and we cannot guarantee the security of the information at this time.<br>4. Lastly, we want to thank you for your participation in this beta testing process. Your feedback is incredibly valuable to us and will help us create a better chatbot for our users.<br><br>If you have any questions or concerns, please do not hesitate to contact us. Thank you again for your participation.</p>',
          betaTitle: localChatCustomSettings?.languageSettings?.[0]?.advisoryTitle
            ? localChatCustomSettings?.languageSettings?.[0]?.advisoryTitle
            : 'Beta Testing',
          showMessageFeedback: localChatCustomSettings.showMessageFeedback ? localChatCustomSettings.showMessageFeedback : 'enable',
          botErrorMessage: localChatCustomSettings?.languageSettings?.[0]?.botErrorMessage
            ? localChatCustomSettings?.languageSettings?.[0]?.botErrorMessage
            : 'System ran into an issue. Please try again later.'
        };
        setBotUserInfo(botUser);

        //if we use userJoinInfo then call History (..?history --  need to confirm whether it's needed or not..!) and then send start message
        let msg = localChatCustomSettings.startMessage ? localChatCustomSettings.startMessage : 'Hi';
        //setMessage(msg);
        handleOnSend(msg, botUser);
      }
    }
  };

  function getUserData() {
    const data = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenHeight: window.screen.height,
      screenWidth: window.screen.width,
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      devicePixelRatio: window.devicePixelRatio,
      timezoneOffset: new Date().getTimezoneOffset(),
      cookieEnabled: navigator.cookieEnabled,
      online: navigator.onLine
    };

    return data;
  }

  function buildRequestMetadata(userMessage) {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${bearerInfo.access_token}`
    };
    let metadataObj = getUserData();
    let botInfo = getBotInfo();
    let platform = metadataObj.platform;
    metadataObj.platformName = platform.name;
    metadataObj.platformVersion = platform.version;
    metadataObj.platformLayout = platform.layout;
    metadataObj.platformOs = platform.os ? platform.os.architecture + ' -bit,' + platform.os.family + ',' + platform.os.version : '';
    metadataObj.platformDescription = platform.description;
    metadataObj.platformProduct = platform.product;
    metadataObj.platformManufacturer = platform.manufacturer;
    //get custom bot settings, before getting any userId and conversationId
    const requestObjForBotReply = {
      interpreterId: botInfo.botId,
      meeting_user_id: localStorage.getItem('userId'),
      message: userMessage,
      interpreter_id: botInfo?.botId,
      liveAgentStatus: 'N',
      bot_builder: false,
      userBotId: localStorage.getItem('userId'),
      botConversationId: localStorage.getItem('conversationId'),
      conversationId: localStorage.getItem('conversationId'),
      pageUrl: window.location.href,
      authKey: botInfo.authKey,
      clientId: botInfo.clientId,
      metadata: metadataObj
    };
    return {headers, requestObjForBotReply};
  }

  const handleOnSend = async (msg, botUser) => {
    let userMessage = msg;

    if (!botUserInfo.name) {
      botUserInfo.name = botUser ? botUser.name : '';
    }
    let {headers, requestObjForBotReply} = buildRequestMetadata(userMessage);
    let result = await dispatch(getBotReplyResponse(requestObjForBotReply, headers));
    dispatch(clearChatFileState());
    setCurrentBotInfo({})
  };

  useEffect(() => {
    if (isInitializingNewConversation) {
      const data = {
        interpreterId: localStorage.getItem("botId"),
      }
      setTimeout(() => {
        setIsInitializingNewConversation(false)
        dispatch(setIsNewChatInitiating(false))
        dispatch(fetchUsersByInterpreterId(data))
      }, 3000)
    }
  }, [chatState.botReplyResponseInfo])

  useEffect(() => {
    if (chatState?.isResFetching) {
      setIsResFetching(true)
    } else {
      setIsResFetching(false)
    }
  }, [chatState?.isResFetching])

  const getValueBasedOnkey = (interpreterId, requiredKey) => {
    let allChatBotAgents = chatState.allChatBotAgents;
    let requiredValue = ""
    if (Array.isArray(allChatBotAgents)) {
      for (let chatBot of allChatBotAgents) {
        if (chatBot?.interpreterId === interpreterId) {
          requiredValue = chatBot[requiredKey];
        }
      }
    }
    return requiredValue;
  }

  const fetchBotByBizId = async () => {
    const payload = {
      userId: localStorage.getItem("userId"),
      businessId: localStorage.getItem("businessId"),
      organizationId: localStorage.getItem("organizationId")
    }
    dispatch(getAllBotsByBizId(payload));
  };

  const initiateNewConversation = () => {
    dispatch(disableNavItems({isDisabled: true}))
    setIsInitializingNewConversation(true)
    dispatch(setIsNewChatInitiating(true))
    let dataForConversationInitiation = {
      userId: localStorage.getItem("userId"),
      interpreterId: localStorage.getItem("botId"),
      clientId: CLIENT_ID,
      authKey: AUTH_KEY,
      versionNumber: getValueBasedOnkey(localStorage.getItem("botId"), "versionNumber")
    }
    setCurrentBotInfo(dataForConversationInitiation);
    let basicTokenInputObj = {
      botId: dataForConversationInitiation.interpreterId,
      version: dataForConversationInitiation.versionNumber,
      clientId: dataForConversationInitiation.clientId,
      authKey: dataForConversationInitiation.authKey
    }
    dispatch(getAllChatBotAgentsBasicToken(basicTokenInputObj));
    console.log("botInfo -->", chatState, userState, botRecords);
  }

  const initiateBotDeletion = () => {
    setShowProgress(true);
    let payload = {
      conversationId: conversationIdToDelete
    }
    dispatch(deleteConversation(payload)).then((action) => {
      setShowProgress(false);
      if (action?.error) {
        toast.error(action?.payload?.message)
      } else {
        toast.success("Selected conversation deleted successfully.")
        fetchBotByBizId();
      }
    }).catch((err) => {
      setShowProgress(false);
      toast.error("Error occurred while processing the conversation deletion request. Please try again");
    })
  }

  const handleConversationDeletion = () => {
    let selectedConversationId = localStorage.getItem("current_convId");
    if (selectedConversationId) {
      setConversationIdToDelete(selectedConversationId);
      setShowConversationDeletionDialog(true)
    } else {
      toast.error("Unable to delete the selected conversation. Please try again");
    }
  }

  const BotDeletionAlert = () => {
    return (
      <Dialog
        open={showConversationDeletionDialog}
        onClose={() => setShowConversationDeletionDialog(false)}
      >
        <DialogTitle>
          Are you sure you want to delete the selected conversation?
        </DialogTitle>
        <DialogContent>
          You are about to delete the selected conversation - <b>{conversationIdToDelete}</b>. This action is permanent
          and cannot be undone.
          All the associated chat history will be deleted. Are you sure you want to proceed?
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setShowConversationDeletionDialog(false)}>Cancel</Button>
          <Button onClick={() => {
            setShowConversationDeletionDialog(false);
            initiateBotDeletion();
          }}>
            Delete Conversation
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const botOperationsComponent = () => {
    return (
      <>
        {isInitializingNewConversation && <LinearProgress style={{width: "100%"}}/>}
        {showProgress && <LinearProgress style={{width: "100%"}}/>}
        <Box style={{
          pointerEvents: (isResFetching || isBotsMenuList) ? "none" : "auto",
          height: "50px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          columnGap: "10px"
        }}>
          <AddCommentIcon color={(isResFetching || isBotsMenuList) ? "disabled" : "black"}
                          onClick={initiateNewConversation} sx={{cursor: "pointer"}}/>
          <EditNoteIcon color={"disabled"} style={{fontSize: "30px", cursor: "not-allowed"}}/>
          <ArchiveIcon color={"disabled"} sx={{cursor: "not-allowed"}}/>
          <DeleteIcon color={(isResFetching || isBotsMenuList) ? "disabled" : "black"}
                      onClick={handleConversationDeletion} sx={{cursor: "pointer"}}/>
        </Box>
        <Divider style={{width: "100%"}}/>
      </>
    )
  }

  return (
    <Grid container sx={{
      background: "#fff",
      height: "100%",
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
      {BotDeletionAlert()}
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
            {botOperationsComponent()}
            <TreeView data={usersList}/>
          </Stack> :
          <Stack justifyContent="start" alignItems="start" width="92%" sx={{
            margin: "4px" +
              " 10px", border: "2px solid #8080802b", borderRadius: "10px", boxShadow: "0 0 6px rgba(0, 0, 0, 0.1)"
          }}>
            {botOperationsComponent()}
            <Box sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%"
            }}><Typography color="secondary" fontWeight="600" fontSize="16px">No users found</Typography></Box>
          </Stack>
      )
      }
    </Grid>
  )
};


export default ChatBotAgentsConversationList;
