import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from "react-router-dom"
// material-ui
import {styled, useTheme} from '@mui/material/styles';
import {
  Box,
  Button,
  CardContent,
  CircularProgress,
  ClickAwayListener,
  Dialog,
  Grid,
  img,
  InputBase,
  InputAdornment,
  Link,
  List,
  ListItemButton,
  Paper,
  Popper,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {
  InsertEmoticonOutlined,
  MicOutlined,
  StopOutlined
} from '@mui/icons-material';

// third party
import Picker, {SKIN_TONE_MEDIUM_DARK} from 'emoji-picker-react';

// project import
import Rocket from 'assets/images/chat/rocket.gif';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import ChatHistory from 'sections/apps/chat/ChatHistory';
import UserAvatar from 'sections/apps/chat/UserAvatar';
import {dispatch, useSelector} from 'store';
import {
  disableNavItems,
  getBotReplyResponse,
  getChatCustomSettings,
  getChatHistory,
  getSelectedConvId
} from 'store/reducers/chat';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';
import {openSnackbar} from 'store/reducers/snackbar';
// assets
import {PaperClipOutlined, SendOutlined, SmileFilled, ClockCircleOutlined} from '@ant-design/icons';
import {renderToStaticMarkup} from 'react-dom/server';
import PropTypes from 'prop-types';
import config, {CLIENT_ID, AUTH_KEY} from "../../config";
import Cookies from "js-cookie";


const drawerWidth = 320;

const Main = styled('main', {shouldForwardProp: (prop) => prop !== 'open'})(({theme, open}) => ({
  padding: 0,
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter
  }),
  marginLeft: `-${drawerWidth}px`,
  [theme.breakpoints.down('lg')]: {
    paddingLeft: 0,
    marginLeft: 0
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shorter
    }),
    marginLeft: 0
  })
}));

let currentYear = new Date().getFullYear();
// Put this outside your component
let recognition;
const useStyles = makeStyles((theme) => ({
  inputRoot: {
    color: 'inherit',
    width: '100%'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%'
  },
  button: {
    margin: theme.spacing(1)
  },
  fileInput: {
    display: 'none'
  },
  placeholder: {
    color: 'rgba(0, 0, 0, 0.54)'
  },
  clickablePlaceholder: {
    color: 'blue',
    cursor: 'pointer'
  }
}));

const ChatConsole = ({
                       customTheme,
                       isChatInnerSection
                     }) => {
  const theme = customTheme ? customTheme : useTheme();
  const {user} = useSelector((state) => state.profile);
  const LOADING_GIF_HTML_TAG = '<img src="https://d3dqyamsdzq0rr.cloudfront.net/sia/images/loading-dots-01-unscreen.gif" width="60">';
  const paperClipSVGString = renderToStaticMarkup(<PaperClipOutlined/>);

  // Add these state variables inside your component
  const [isListening, setIsListening] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const [botUserInfo, setBotUserInfo] = useState({});
  const [warningText, setWarningText] = useState('No Conversations found on this botId.');
  const [isConversations, setIsConversations] = useState(false)
  const [chatCustomSettings, setChatCustomSettings] = useState({});
  const [botReplyResponse, setBotReplyResponse] = useState({});
  const [botReadyToDisplay, setBotReadyToDisplay] = useState(false);
  const [conversationData, setConversationData] = useState([]);
  let chatState = useSelector((state) => state.chat);
  const[isEmptyHistory,setIsEmptyHistory] = useState(false)
  const [anchorElBeta, setAnchorElBeta] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [open, setOpen] = useState(false);
  const [anchorElPaperclip, setAnchorElPaperclip] = useState(null);
  const paperclipId = anchorElPaperclip ? 'paperclip-popover' : undefined;
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate()
  const [notificationSound, setNotificationSound] = useState(null)
  const [openChatDrawer, setOpenChatDrawer] = useState(true);
  const [anchorElEmoji, setAnchorElEmoji] = useState(null);
  const [toolTip, setToolTip] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [characterLimitExceeded, setCharacterLimitExceeded] = useState(false)
  // handle new message form
  const [message, setMessage] = useState('');
  const isMobileDevice = useMediaQuery(theme.breakpoints.down("md"))
  const textInput = useRef(null);
  const emojiOpen = Boolean(anchorElEmoji);
  const emojiId = emojiOpen ? 'simple-popper' : undefined;
  const classes = useStyles();

  useEffect(() => {
    const audio = new Audio('https://d3dqyamsdzq0rr.cloudfront.net/widget/chat/files/CSR-Connect-Notification-Sound.mp3')
    setNotificationSound(audio)
  }, []);

  const handleBetaPopover = (event) => {
    if (open) {
      setAnchorElBeta(null);
    } else {
      setAnchorElBeta(event.currentTarget);
    }
    setOpen(!open);
  };

  const handleUserBtnInput = (msg) => {
    // resetNotificationCount()
    handleOnSend(msg);
  };

  const handleOnEmojiButtonClick = (event) => {
    // resetNotificationCount()
    setAnchorElEmoji(anchorElEmoji ? null : event?.currentTarget);
  };

  const handleCharacterLimitExceeded = () => {
    setCharacterLimitExceeded(true)
    setTimeout(() => {
      setCharacterLimitExceeded(false)
    }, 2000)
  }

  const startSpeechRecognition = () => {
    // resetNotificationCount()
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();

      recognition.lang = 'en-US'; // Set the language
      recognition.interimResults = true; // Allow interim results for real-time updates

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;

        // Update the user input with the recognized text
        setMessage(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Error in speech recognition:', event.error);
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
    } else {
      openSnackbar({
        open: true,
        message: 'Speech recognition is not supported in this browser',
        variant: 'alert',
        alert: {
          color: 'error'
        },
        close: false
      });
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  function addLoadingIndicator(botUserName) {
    setResponseLoading(false);
    dispatch(disableNavItems({isDisabled: true}))
    const d = new Date();
    const newMessage1 = {
      to: user?.name,
      from: botUserName ? botUserName : botUserInfo.name,
      text: LOADING_GIF_HTML_TAG,
      time: d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      type: "loading",
    };
    setConversationData((prevState) => [...prevState, newMessage1]);
  }

  function removeLoadingIndicator() {
    setResponseLoading(true);
    dispatch(disableNavItems({isDisabled: false}))
    setConversationData((prevState) => {
      return prevState.filter((message) => message.text !== LOADING_GIF_HTML_TAG);
    });
  }

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
      Authorization: `Bearer ${Cookies.get("sia_access_token")}`
    };
    let metadataObj = getUserData();
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
      interpreterId: localStorage.getItem("botId"),
      meeting_user_id: localStorage.getItem('current_bot_user_id'),
      message: userMessage,
      interpreter_id: localStorage.getItem("botId"),
      liveAgentStatus: 'N',
      bot_builder: false,
      userBotId: localStorage.getItem('current_convId'),
      botConversationId: localStorage.getItem('current_convId'),
      conversationId: localStorage.getItem('current_convId'),
      pageUrl: window.location.href,
      authKey: AUTH_KEY,
      clientId: CLIENT_ID,
      metadata: metadataObj
    };
    return {headers, requestObjForBotReply};
  }

  const handleOnSend = (msg, botUser) => {
    setCharacterLimitExceeded(false)
    let userMessage = message ? message : msg;
    let botUserName = botUser?.name ? botUser?.name : botUserInfo?.name;
    if (!botUserInfo.name) {
      botUserInfo.name = botUser ? botUser.name : '';
    }

    if (userMessage?.trim() === '') {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Message required',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    } else {
      let {headers, requestObjForBotReply} = buildRequestMetadata(userMessage);
      const d = new Date();
      const newMessage = {
        from: user?.name,
        to: botUserName,
        text: userMessage,
        time: d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
      };
      setConversationData((prevState) => [...prevState, newMessage]);
      if (!(Object.keys(chatState.fileUploadInfo).length === 0 && chatState.fileUploadInfo.constructor === Object)) {
        requestObjForBotReply.memorizeMetadata = {
          fileInfo: {
            bucket: chatState.fileUploadInfo.s3Bucket,
            key: chatState.fileUploadInfo.s3Key
          }
        };
      }
      setIsEmptyHistory(false)
      addLoadingIndicator(botUserName);
      dispatch(getBotReplyResponse(requestObjForBotReply, headers));
      setMessage('');
      setToolTip('');
    }
  };

  const handleEnter = (event) => {
    if (responseLoading) {
      if (event?.key !== 'Enter') {
        return;
      }
      handleOnSend(message);
    }
  };

  // handle emoji
  const onEmojiClick = (event, emojiObject) => {
    let enteredMessage = message + emojiObject.emoji;
    if (enteredMessage?.length > botUserInfo?.maxCharLimit) {
      handleCharacterLimitExceeded()
    } else {
      setMessage(message + emojiObject.emoji);
    }
  };

  const handleCloseEmoji = () => {
    setAnchorElEmoji(null);
  };

  // close sidebar when widow size below 'md' breakpoint
  useEffect(() => {
    setOpenChatDrawer(!matchDownLG);
  }, [matchDownLG]);

  const getAllChatHistory = () => {
    let data = {
      interpreterId: localStorage.getItem('botId'),
      interactionId: localStorage.getItem('current_bot_user_id'),
      conversationId: localStorage.getItem('current_convId'),
      clientId: CLIENT_ID
    }
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${Cookies.get("sia_access_token")}`
    };
    dispatch(getChatHistory(data, headers))
  }

  useEffect(() => {
    setConversationData([]);
  }, []);

  useEffect(() => {
    if (chatState?.isUsersFetching) {
      setIsFetching(true)
    }
  }, [chatState.isUsersFetching])

  const displayConversationExistUserId = (response) => {
    for (let index = 0; index < response?.length; index++) {
      if (response?.[index]?.userInteractionId && response?.[index]?.conversationIds?.length > 0 && response?.[index]?.conversationIds?.[index] !== "null") {
        localStorage.setItem("current_bot_user_id", response?.[index]?.userInteractionId)
        localStorage.setItem("current_convId", response?.[index]?.conversationIds[0])
        fetchBotInitialInfo();
        setIsFetching(false)
        setIsConversations(true)
        setWarningText("No Conversations found on this botId.")
        return true
        break;
      }
    }
    return false;
  }

  useEffect(() => {
    if ((chatState?.usersListByBotId?.isUsersFetched && chatState?.usersListByBotId?.usersList?.length > 0)) {
      setBotReadyToDisplay(false)
      const getActiveUserId = chatState?.usersListByBotId?.usersList
      const result = displayConversationExistUserId(getActiveUserId)
      if (!result) {
        setBotReadyToDisplay(false)
        setIsFetching(false)
        setIsConversations(false)
        setWarningText("No Conversations found on this botId.")
        localStorage.removeItem("current_bot_user_id")
        localStorage.removeItem("current_convId")
      }
    } else if (chatState?.usersListByBotId?.usersList?.length === 0) {
      setBotReadyToDisplay(false)
      setIsFetching(false)
      setIsConversations(false)
      setWarningText("No Conversations found on this botId.")
      localStorage.removeItem("current_bot_user_id")
      localStorage.removeItem("current_convId")
    }
    if (chatState?.usersFetchingError) {
      setBotReadyToDisplay(false)
      setIsFetching(false)
      setIsConversations(false)
      setWarningText("Error occurred while fetching conversation")
      localStorage.removeItem("current_bot_user_id")
      localStorage.removeItem("current_convId")
    }
  }, [chatState?.usersListByBotId, chatState?.usersFetchingError]);

  useEffect(() => {
    if (chatState?.allChatHistory && chatState?.allChatHistory?.length > 0) {
      removeLoadingIndicator()
      setIsEmptyHistory(false)
      let historyResponse = chatState?.allChatHistory
      if (historyResponse?.length > 0) {
        setConversationData([]);
        historyResponse?.forEach((historyMessages, i) => {
          const date = new Date(historyMessages?.createdAtUnixTime);
          const options = {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            hour: 'numeric',
            minute: 'numeric',
          };
          const formattedTime = date.toLocaleTimeString('en-US', options);
          if (historyMessages?.message !== "") {
            const d = new Date();
            const newMessage = {
              from: user?.name ? user?.name : createdBy,
              to: botUserInfo.name,
              text: historyMessages?.message,
              time: formattedTime
            };
            setConversationData((prevState) => [...prevState, newMessage]);
          }
          if (historyMessages?.botResponse?.bot_responses?.length > 0) {
            historyMessages.botResponse.bot_responses.forEach((response, i) => {
              if (response?.text) {
                const d = new Date();
                const newMessage = {
                  to: user?.name ? user?.name : createdBy,
                  from: botUserInfo.name,
                  text: response.text,
                  time: formattedTime,
                  buttons: response.buttons,
                  userInteractionId: historyResponse?.transactionId,
                  conversationId: historyResponse?.conversationId,
                  interpreter_id: historyResponse?.interpreter_id
                };
                setConversationData((prevState) => [...prevState, newMessage]);
              }
            })
          }

        });
      }
    } else if (chatState?.allChatHistory?.length === 0) {
      removeLoadingIndicator()
      setIsEmptyHistory(true)
    }
  }, [chatState.allChatHistory])

  useEffect(() => {
    if (chatState?.selectedConversation?.isSelected && chatState?.selectedConversation?.convId && chatState?.selectedConversation?.userBotId) {
      setConversationData([])
      addLoadingIndicator()
      localStorage.setItem("current_bot_user_id", chatState?.selectedConversation?.userBotId)
      localStorage.setItem("current_convId", chatState?.selectedConversation?.convId)
      dispatch(getSelectedConvId({isSelected: false}))
      setIsEmptyHistory(false)
      getAllChatHistory()
    }
  }, [chatState?.selectedConversation])

  const fetchBotInitialInfo = async () => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${Cookies.get("sia_access_token")}`
    };
    //get custom bot settings, before getting any userId and conversationId
    const requestObjForSettings = {
      interpreterId: localStorage.getItem("botId"),
      pageUrl: window.location.href,
      authKey: AUTH_KEY,
      publishStatus: true,
      clientId: CLIENT_ID
    };

    const results = await Promise.allSettled([
      dispatch(getChatCustomSettings(requestObjForSettings, headers))
    ]);
    let localChatCustomSettings;
    results?.forEach((result, i) => {
      if (result?.status === 'fulfilled') {
        const promiseResult = result?.value;
        if (promiseResult?.config?.url?.indexOf('agent-chat-settings') !== -1) {
          let settingsObj = promiseResult?.data;
          if (settingsObj && Array.isArray(settingsObj) && settingsObj.length > 0) {
            localChatCustomSettings = settingsObj[0];
            setChatCustomSettings(localChatCustomSettings);
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
      setBotReadyToDisplay(true);
      setResponseLoading(true)
      setConversationData([]);
      setIsEmptyHistory(false)
      getAllChatHistory()
    }
  };

  useEffect(() => {
    if (
      !chatState?.botReplyResponseInfo?.status ||
      chatState?.botReplyResponseInfo?.status === 'error' ||
      !chatState?.botReplyResponseInfo?.bot_responses ||
      chatState?.botErrorReply
    ) {
      removeLoadingIndicator();
      const d = new Date();
      const newMessage = {
        to: user?.name,
        from: botUserInfo.name,
        text: botUserInfo?.botErrorMessage,
        time: d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
      };
      setConversationData((prevState) => [...prevState, newMessage]);
    }
  }, [chatState.botReplyResponseInfo, chatState.botErrorReply]);

  useEffect(() => {
    if (chatState.botReplyResponseInfo && chatState.botReplyResponseInfo.status && chatState.botReplyResponseInfo.status === 'success') {
      let botResponse = chatState.botReplyResponseInfo;
      removeLoadingIndicator();

      if (botResponse && Array.isArray(botResponse['bot_responses']) && botResponse['bot_responses'].length > 0) {
        botResponse['bot_responses'].forEach((response, i) => {
          let responseType = i == 0 ? 'firstResponse' : '';
          let transactionId = botResponse?.transactionId;

          if (response.text) {
            // setNotificationCount(prevState => prevState + 1)
            const d = new Date();
            const newMessage = {
              to: user?.name,
              from: botUserInfo.name,
              text: response.text,
              time: d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
              buttons: response.buttons,
              responseType: responseType,
              transactionId: transactionId,
              userInteractionId: botResponse?.transactionId,
              conversationId: botResponse?.conversationId,
              interpreter_id: botResponse?.interpreter_id
            };
            setConversationData((prevState) => [...prevState, newMessage]);
          }
        });
      }
      setBotReplyResponse(chatState.botReplyResponseInfo);
    }
  }, [chatState.botReplyResponseInfo]);

  useEffect(() => {
    setConversationData(chatState.chats);
  }, [chatState.chats]);

  const handleMessageInput = (event) => {
    let enteredMessage = event.target.value;
    if (enteredMessage?.length > botUserInfo?.maxCharLimit) {
      handleCharacterLimitExceeded()
    } else {
      setCharacterLimitExceeded(false)
      setMessage(event.target.value);
      handleMessage(enteredMessage);
    }
  };

  const handleMessage = (message) => {
    setMessage(message);
  };

  const handleFocusMessageInput = (event) => {
    // resetNotificationCount()
    handleMessage(event.target.value);
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        handleOnSend(message);
        break;
      default:
        break;
    }
  };

  let headerBGColor = theme.palette.background.paper;
  return botReadyToDisplay ? (
      <>
        <Box sx={{display: 'flex'}}>
          <Main theme={theme} open={openChatDrawer}>
            <Grid container>
              <Grid item xs={12} md={12} xl={12}>
                <MainCard
                  content={false}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'dark.main' : 'grey.50',
                    pt: 2,
                    pl: 2,
                    borderRadius: '0 4px 4px 0',
                    boxShadow:"0 0 10px rgb(0 0 0 / 10%)",
                    height:"86vh"
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        bgcolor: botUserInfo?.botColor ? botUserInfo?.botColor : headerBGColor,
                        pr: 2,
                        pb: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Grid container marginLeft={matchDownSM ? "3rem" : "0"} justifyContent="space-between">
                        <Grid item>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{position: 'relative'}}>
                            <UserAvatar
                              user={{
                                online_status: botUserInfo.online_status,
                                avatar: botUserInfo.avatar,
                                name: botUserInfo.name
                              }}
                            />
                            <ClickAwayListener onClickAway={() => {
                              setOpen(false)
                            }}>
                              <Stack>
                                <Stack direction={'row'} gap={'1rem'} alignItems={'center'}>
                                  <Box>
                                    <Typography
                                      sx={{
                                        color: botUserInfo?.botHeaderTextColor ? botUserInfo?.botHeaderTextColor : theme.palette.background.paper,
                                        '& .beta-btn-base-css:hover': {
                                          cursor: 'pointer'
                                        }
                                      }}
                                      dangerouslySetInnerHTML={{__html: botUserInfo.name}}
                                      ref={(ref) => {
                                        if (ref) {
                                          const span = ref.querySelector('.beta-btn-base-css');
                                          if (span) {
                                            span.onclick = function (event) {
                                              handleBetaPopover(event);
                                            };
                                          }
                                        }
                                      }}
                                    />
                                    <Popper
                                      open={open}
                                      anchorEl={anchorElBeta}
                                      placement="right-start"
                                      anchororigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right'
                                      }}
                                      transformorigin={{
                                        vertical: 'top',
                                        horizontal: 'right'
                                      }}
                                      sx={{
                                        borderRadius: '4px',
                                        boxShadow: '0px 2px 5px 0px rgba(0,0,0,0.15)',
                                        zIndex: 1201,
                                        maxWidth: '30vw',
                                        height: 'max-content',
                                        maxHeight: '40vh',
                                        overflowY: 'scroll'
                                      }}
                                    >
                                      <MainCard
                                        sx={{
                                          backgroundColor: 'white',
                                          borderRadius: 1,
                                          boxShadow: '0px 2px 5px 0px rgba(0,0,0,0.15)',
                                          display: 'flex',
                                          flexDirection: 'column'
                                        }}
                                      >
                                        <Stack
                                          sx={{
                                            textAlign: 'center',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '8px',
                                            flexDirection: 'row'
                                          }}
                                        >
                                          <Typography>
                                            <WarningOutlinedIcon/>
                                          </Typography>
                                          <Typography variant="h5">{botUserInfo?.betaTitle}</Typography>
                                        </Stack>
                                        <CardContent sx={{p: 0}}>
                                          <Typography dangerouslySetInnerHTML={{__html: botUserInfo?.betaContent}}/>
                                        </CardContent>
                                      </MainCard>
                                    </Popper>
                                  </Box>
                                </Stack>
                                <Typography variant="caption" color="textSecondary">
                                  Active now
                                </Typography>
                              </Stack>
                            </ClickAwayListener>
                          </Stack>
                        </Grid>
                        <Grid item>
                          <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}></Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}  sx={{
                      minHeight: 220,
                      height: "100%",
                      paddingTop:"0 !important"
                    }}>
                      <SimpleBar
                        sx={{
                          overflowX: 'hidden',
                          height: 'calc(100vh - 284px)',
                        }}
                      >
                        <Box sx={{pl: 1, pr: 3}}>
                          <ChatHistory isEmptyInfo={isEmptyHistory} theme={theme} handleUserBtnInput={handleUserBtnInput} user={botUserInfo}
                                       data={conversationData}/>
                        </Box>
                      </SimpleBar>
                    </Grid>
                    <Grid item xs={12} sx={{mt: 1,paddingTop:"0 !important"}}>
                      <Paper
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: toolTip ? '0 0 22px 22px' : '22px',
                          p: 1,
                          backgroundColor: '#F4F5F7',
                          border: characterLimitExceeded ? '2px solid red' : '1px solid #ECE5DD',
                          mr: 2,
                          position: 'relative'
                        }}
                      >
                        <Box sx={{ width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          paddingBottom: "0px",
                          paddingTop: "0px",
                          marginTop: "0px"}}>
                          {/*<Grid item xs="auto" container direction="row" alignItems="center">*/}
                            {/*<IconButton ref={anchorElEmoji} aria-describedby={emojiId} onClick={handleOnEmojiButtonClick}*/}
                            {/*            color="primary">*/}
                            {/*  <InsertEmoticonOutlined/>*/}
                            {/*</IconButton>*/}
                            {/*{emojiOpen && (*/}
                            {/*  <Popper*/}
                            {/*    id={emojiId}*/}
                            {/*    open={emojiOpen}*/}
                            {/*    anchorEl={anchorElEmoji}*/}
                            {/*    disablePortal*/}
                            {/*    popperOptions={{*/}
                            {/*      modifiers: [*/}
                            {/*        {*/}
                            {/*          name: 'offset',*/}
                            {/*          options: {*/}
                            {/*            offset: [-20, 20]*/}
                            {/*          }*/}
                            {/*        }*/}
                            {/*      ]*/}
                            {/*    }}*/}
                            {/*  >*/}
                            {/*    <ClickAwayListener onClickAway={handleCloseEmoji}>*/}
                            {/*      <MainCard elevation={8} content={false}>*/}
                            {/*        <Picker onEmojiClick={onEmojiClick} skinTone={SKIN_TONE_MEDIUM_DARK}*/}
                            {/*                disableautoFocus/>*/}
                            {/*      </MainCard>*/}
                            {/*    </ClickAwayListener>*/}
                            {/*  </Popper>*/}
                            {/*)}*/}
                          {/*</Grid>*/}
                          <InputBase
                            error={characterLimitExceeded}
                            endAdornment={<InputAdornment
                              position="end">{message.length + "/" + botUserInfo?.maxCharLimit}</InputAdornment>}
                            inputRef={textInput}
                            fullWidth
                            minRows={1}
                            maxRows={3}
                            multiline
                            value={message}
                            onChange={handleMessageInput}
                            onFocus={handleFocusMessageInput}
                            onKeyDown={handleKeyDown}
                            disabled={!responseLoading || isDisabled}
                            placeholder="Type a message"
                          />

                          <IconButton
                            color="primary"
                            customcolor={botUserInfo?.sendButtonColor}
                            onClick={handleOnSend}
                            disabled={!responseLoading || message.trim().length === 0 || isDisabled}
                          >
                            <SendOutlined/>
                          </IconButton>
                          {!isListening ? (
                            <IconButton color="primary" onClick={startSpeechRecognition}>
                              <MicOutlined/>
                            </IconButton>
                          ) : (
                            <IconButton color="primary" onClick={stopSpeechRecognition}>
                              <StopOutlined/>
                            </IconButton>
                          )}
                        </Box>
                      </Paper>
                      {characterLimitExceeded ?
                        <Typography sx={{mt: "10px"}} color="error">{botUserInfo?.charLimit}</Typography> : ""}

                    </Grid>
                    <Grid item xs={12} sx={{paddingTop:"0 !important"}}>
                      <Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{pt: 1}}>
                          <Box flexBasis="50%">
                            <Link color="secondary" sx={{fontSize: '12px'}} href={botUserInfo?.privacyPolicyUrl}
                                  target="_blank">
                              {botUserInfo?.privacyPolicyText}
                            </Link>
                          </Box>
                          <Box flexBasis="50%" display="flex">
                            <img
                              alt="poweredBy"
                              width="18px"
                              src="https://d3dqyamsdzq0rr.cloudfront.net/widget/chat/images/thunderbolt.png"
                            />
                            <Typography color="secondary" sx={{fontSize: '12px'}}>
                              by{' '}
                              <Link color="secondary" href={botUserInfo?.poweredByUrl} target="_blank">
                                {botUserInfo?.poweredByText}
                              </Link>
                            </Typography>
                          </Box>
                          <Box flexBasis="6%">
                            <Typography sx={{fontSize: '12px'}} color="secondary">
                              &copy;{currentYear}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                </MainCard>
              </Grid>
            </Grid>
          </Main>
        </Box>
      </>
    ) :
    (isFetching ?
      <Stack justifyContent="center" alignItems="center" height={matchDownSM ? "70vh" : "100%"}><CircularProgress sx={{
        width: '50px' +
          ' !important', height: '50px' +
          ' !important', mt: 1
      }}
                                                                                                                  color='primary'/></Stack> : (isConversations ?
        <Grid container alignItems="center" justifyContent="center" sx={{height: matchDownSM ? "70vh" : '100%'}}>
          <Grid item>
            <img src={Rocket} alt="Rocket" width="200"/>
            <Typography variant="h2" align="center">
              Initializing...
            </Typography>
          </Grid>
        </Grid> : <Box display='flex' height={matchDownSM ? "70vh" : "100%"} justifyContent='center' alignItems='center'
                       flexDirection='column'>

          <Typography variant='h4' color="secondary" fontWeight="bold"
                      textAlign='center'>{warningText}</Typography>
        </Box>))

};

ChatConsole.propTypes = {
  user: PropTypes.object,
  botInfo: PropTypes.object,
  otherInfo: PropTypes.object,
  customTheme: PropTypes.object
};

export default ChatConsole;
