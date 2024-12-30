import React, {useContext, useEffect, useRef, useState} from 'react';
import {useNavigate} from "react-router-dom"
// auth provider
import AuthContext from 'contexts/FirebaseContext';
// material-ui
import {createTheme, styled, ThemeProvider, useTheme} from '@mui/material/styles';
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
  useMediaQuery, Alert, FormControl, Tooltip
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {
  Close,
  DescriptionOutlined,
  ImageOutlined,
  InsertEmoticonOutlined,
  KeyboardCommandKeyOutlined,
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
  clearChatFileState, disableNavItems,
  getBotReplyResponse,
  getBotUploadedDocumentResposne,
  getChatBasicToken,
  getChatBearerToken,
  getChatCustomSettings,
  getLatestBotByUserId,
  getUserJoin,
  uploadFileToS3
} from 'store/reducers/chat';
import {openDrawer} from 'store/reducers/menu';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';
import {toast} from "react-toastify";
// assets
import {PaperClipOutlined, SendOutlined, SmileFilled, ClockCircleOutlined} from '@ant-design/icons';
import {renderToStaticMarkup} from 'react-dom/server';

import PropTypes from 'prop-types';
import BotCreateWizard from '../../sections/bot/wizard/create-wizard/basic';
import {set} from 'lodash';
import {getUserInfo} from '../../store/reducers/profile';
import NotificationBadge from '../../components/NotificationBadge/NotificationBadge';
import {CLIENT_ID, FILE_UPLOAD_DEFAULT_MESSAGE} from '../../config';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const options = {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  hour12: false,
  hour: 'numeric',
  minute: 'numeric',
};
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
const customizeTheme = createTheme({
  palette: {
    primary: {
      // Purple and green play nicely together.
      main: 'rgb(25, 118, 210)'
    },
    secondary: {
      // This is green.A700 as hex.
      main: '#e6f7ff'
    }
  }
});

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

const ChatWidget = ({
                      userInfo,
                      botInfo,
                      otherInfo,
                      customTheme,
                      isChatInnerSection,
                      selectedCellData,
                      setShowChat,
                      showChat
                    }) => {
  const theme = customTheme ? customTheme : useTheme();
  const {user} = useSelector((state) => state.profile);
  const initialRender = useRef(true);
  const LOADING_GIF_HTML_TAG = '<img src="https://d3dqyamsdzq0rr.cloudfront.net/sia/images/loading-dots-01-unscreen.gif" width="60">';
  const paperClipSVGString = renderToStaticMarkup(<PaperClipOutlined/>);

  // Add these state variables inside your component
  const [isListening, setIsListening] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
  const [emailDetails, setEmailDetails] = useState(false);
  const [botUserInfo, setBotUserInfo] = useState({});
  const [authTokenInfo, setAuthTokenInfo] = useState({});
  const [latestBotInfo, setLatestBotInfo] = useState({});
  const [initialBotStatus, setInitialBotStatus] = useState({
    isRefreshButton: false,
    suggestionText: ''
  });
  const [bearerInfo, setBearerInfo] = useState({});
  const [chatCustomSettings, setChatCustomSettings] = useState({});
  const [userJoinInfo, setUserJoinInfo] = useState({});
  const [botReplyResponse, setBotReplyResponse] = useState({});
  const [botReadyToDisplay, setBotReadyToDisplay] = useState(false);
  const [conversationData, setConversationData] = useState([]);
  let chatState = useSelector((state) => state.chat);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElBeta, setAnchorElBeta] = useState(null);
  const [add, setAdd] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [open, setOpen] = useState(false);
  const [commandsListAnchorRef, setCommandsListAnchorRef] = useState(null);
  const [anchorElPaperclip, setAnchorElPaperclip] = useState(null);
  const paperclipId = anchorElPaperclip ? 'paperclip-popover' : undefined;
  const commandListId = anchorElPaperclip ? 'command-list-popover' : undefined;
  const paperclipOpen = Boolean(anchorElPaperclip);
  const commandListOpen = Boolean(commandsListAnchorRef);
  const profile = useSelector((state) => state.profile);
  const navigate = useNavigate()
  const [notificationSound, setNotificationSound] = useState(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [uploadedFileInfo, setUploadedFileInfo] = useState({});

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
  const handleAdd = () => {
    setAdd(!add);
  };
  const betaOpen = Boolean(anchorElBeta);

  const handleOnPaperclipButtonClick = (event) => {
    resetNotificationCount()
    if (anchorElPaperclip) {
      setAnchorElPaperclip(null);
    } else {
      setAnchorElPaperclip(event.currentTarget);
    }
  };

  const handleOnCommandClick = (event) => {
    resetNotificationCount()
    if (commandsListAnchorRef) {
      setCommandsListAnchorRef(null);
    } else {
      setCommandsListAnchorRef(event.currentTarget);
    }
  };

  const handleClosePaperclip = () => {
    setAnchorElPaperclip(null);
  };

  const handleImageUpload = () => {
    document.getElementById('image-input').click();
  };

  const handleDocumentUpload = () => {
    document.getElementById('document-input').click();
  };

  const handleClickSort = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseSort = () => {
    setAnchorEl(null);
  };

  const handleUserBtnInput = (msg) => {
    resetNotificationCount()
    const clearTypeMessage = true;
    handleOnSend(msg, false, clearTypeMessage);
  };

  const handleUserChange = () => {
    setEmailDetails((prev) => !prev);
  };

  const [openChatDrawer, setOpenChatDrawer] = useState(true);
  const handleDrawerOpen = () => {
    setOpenChatDrawer((prevState) => !prevState);
  };

  const [anchorElEmoji, setAnchorElEmoji] = useState(null);

  const handleOnEmojiButtonClick = (event) => {
    resetNotificationCount()
    setAnchorElEmoji(anchorElEmoji ? null : event?.currentTarget);
  };

  // handle new message form
  const [message, setMessage] = useState('');
  const textInput = useRef(null);
  const classes = useStyles();

  const handleCharacterLimitExceeded = () => {
    setCharacterLimitExceeded(true)
    setTimeout(() => {
      setCharacterLimitExceeded(false)
    }, 2000)
  }

  const startSpeechRecognition = () => {
    resetNotificationCount()
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
      toast.error("Speech recognition is not supported in this browser");
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
    const d = new Date();
    const newMessage1 = {
      to: user?.name,
      from: botUserName ? botUserName : botUserInfo.name,
      text: LOADING_GIF_HTML_TAG,
      time: d.toLocaleTimeString([], options)
    };
    setConversationData((prevState) => [...prevState, newMessage1]);
  }

  function addLoadingIndicatorForMultiResponse(botUserName) {
    setResponseLoading(false);
    dispatch(disableNavItems({isDisabled: true}))
    const d = new Date();
    const newMessage1 = {
      to: user?.name,
      from: botUserName ? botUserName : botUserInfo.name,
      text: LOADING_GIF_HTML_TAG,
      time: "",
      type: "loading",
      isMultiResponse: true,
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

  const sendDocument = (event, fileType) => {
    handleOnPaperclipButtonClick();
    const file = event.target.files[0];
    dispatch(clearChatFileState());
    if (file) {
      // Check if the file size is less than 20MB
      const maxSize = 20 * 1024 * 1024; // 20MB in bytes
      if (file.size > maxSize) {
        toast.error("File size must be less than 20MB.");
        return;
      }

      // Call getBotUploadedDocumentResponse with the required data, file, and headers
      const {headers, requestObjForBotReply} = buildRequestMetadata(file.name);
      const d = new Date();
      // Un-comment code to enable file upload for command mode.
      if (isCommandMode) {
        if (file.type === 'application/pdf') {
          dispatch(uploadFileToS3({file: file, headers: headers, botId: botInfo?.botId}));
        } else {
          toast.error("Unsupported file type. Please upload a PDF.");
        }
      } else {
        const newMessage = {
          from: user?.name,
          to: botUserInfo.name,
          text: `${paperClipSVGString} ${file.name}`,
          time: d.toLocaleTimeString([], options)
        };
        setConversationData((prevState) => [...prevState, newMessage]);
        // Add fileType to requestObjForBotReply
        requestObjForBotReply.fileType = fileType;
        requestObjForBotReply.command = 'file-upload';

        dispatch(getBotUploadedDocumentResposne(requestObjForBotReply, file, headers));
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

  const handleOnSend = (msg, botUser, isClearMessage) => {
    if (uploadedFileInfo?.name && uploadedFileInfo?.name !== "") {
      handleOnFileUpload(uploadedFileInfo, botUser, msg);
      setUploadedFileInfo({})
    } else {
      setCharacterLimitExceeded(false);
      let userMessage;
      if (isClearMessage && msg) {
        userMessage = msg;
      } else {
        userMessage = message ? message : msg;
      }

      if (isCommandMode) {
        const commandIndex = message.indexOf(' ');
        if (selectedCommand.name === '/memorize') {
          if (
            chatState?.fileUploadInfo &&
            !(Object.keys(chatState?.fileUploadInfo).length === 0 && chatState?.fileUploadInfo.constructor === Object)
          ) {
            //userMessage = userMessage;
          } else {
            userMessage = message;
          }
        }
      }

      let botUserName = botUser?.name ? botUser?.name : botUserInfo?.name;
      if (!botUserInfo.name) {
        botUserInfo.name = botUser ? botUser.name : '';
      }

      if (userMessage?.trim() === '') {
        toast.error("Message required");
      } else if (isCommandMode && !commandModeInput?.length > 0) {
        toast.error("Please enter a prompt");
      } else {
        let {headers, requestObjForBotReply} = buildRequestMetadata(userMessage);
        const d = new Date();
        const newMessage = {
          from: user?.name,
          to: botUserName,
          text: userMessage,
          time: d.toLocaleTimeString([], options)
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

        addLoadingIndicator(botUserName);

        dispatch(getBotReplyResponse(requestObjForBotReply, headers));
        setMessage('');
        setIsCommandMode(false);
        setCommandModeInput('');
        setToolTip('');
        setSelectedCommand({});
        dispatch(clearChatFileState());
        setSelectedIndex(0);
      }
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

  const emojiOpen = Boolean(anchorElEmoji);
  const emojiId = emojiOpen ? 'simple-popper' : undefined;

  const handleCloseEmoji = () => {
    setAnchorElEmoji(null);
  };

  // close sidebar when widow size below 'md' breakpoint
  useEffect(() => {
    setOpenChatDrawer(!matchDownLG);
  }, [matchDownLG]);

  const fetchBotByUserId = async () => {
    setIsFetching(true);
    const payload = {
      clientId: CLIENT_ID,
      createdBy: localStorage.getItem("userId"),
      appRoles: localStorage.getItem("appRoles")
    }
    const result = await dispatch(getLatestBotByUserId(payload));
    if (result?.payload?.error?.toLowerCase() === "no bot records") {
      setIsFetching(false);
      setInitialBotStatus({
        suggestionText: 'No chat bots created yet. Please create a new chat bot.',
        isRefreshButton: false
      });
    }
  };

  useEffect(() => {
    if (profile?.user) {
      const {user} = profile
      if (user?.appRoles?.length === 0) {
        navigate("/access-denied")
      }
    } else {
      dispatch(getUserInfo(localStorage.getItem("userId")))
    }
  }, [profile])

  useEffect(() => {
    chatState = {
      error: null,
      chats: [],
      user: {},
      users: [],
      authTokenInfo: {},
      bearerInfo: {},
      chatCustomSettings: {},
      userJoinInfo: {},
      fileUploadInfo: {},
      botReplyResponseInfo: {}
    };
    setConversationData([]);
    fetchBotByUserId();
  }, []);

  useEffect(() => {
    if (chatState?.botInfo?.status && chatState?.botInfo?.data?.length > 0) {
      const activeBot = chatState.botInfo.data.find((bot) => {
        return bot?.status?.toLowerCase() === 'active';
      });
      if (activeBot) {
        setLatestBotInfo(activeBot);
      } else {
        setIsFetching(false);
        setInitialBotStatus({
          suggestionText: 'The chat bot is currently being created and will be available soon.' + ' Please check back later.',
          isRefreshButton: true
        });
      }
    }
  }, [chatState.botInfo]);

  useEffect(() => {
    if (latestBotInfo?.interpreterId) {
      setIsFetching(false);
      dispatch(openDrawer(false));
      botInfo.botId = latestBotInfo?.interpreterId;
      botInfo.version = latestBotInfo?.versionNumber;

      if (selectedCellData) {
        botInfo.botId = selectedCellData?.botId;
        botInfo.version = selectedCellData?.version;
      }

      let basicTokenInputObj = botInfo;
      setConversationData([]);
      dispatch(getChatBasicToken(basicTokenInputObj));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [latestBotInfo, selectedCellData]);

  useEffect(() => {
    if (chatState.authTokenInfo?.status && chatState.authTokenInfo.access_token) {
      setAuthTokenInfo(chatState.authTokenInfo);
    }
  }, [chatState.authTokenInfo]);

  useEffect(() => {
    if (authTokenInfo && authTokenInfo.access_token) {
      dispatch(getChatBearerToken(authTokenInfo));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authTokenInfo]);

  useEffect(() => {
    if (chatState.bearerInfo && chatState.bearerInfo.access_token) {
      setBearerInfo(chatState.bearerInfo);
    }
  }, [chatState.bearerInfo]);

  useEffect(() => {
    if (bearerInfo && bearerInfo.access_token) {
      fetchBotInitialInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bearerInfo]);

  const fetchBotInitialInfo = async () => {
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
      let charLimit = localChatCustomSettings["languageSettings"]?.[0]?.["charLimit"]
      const maxCharLimit = (localChatCustomSettings["languageSettings"]?.[0]?.["maxCharLimit"] ? localChatCustomSettings["languageSettings"]?.[0]?.["maxCharLimit"] : 300).toString()
      localChatCustomSettings["languageSettings"][0]["charLimit"] = charLimit.replace('${maxCharLimit}', maxCharLimit)
    }
    if (localChatCustomSettings) {
      //update all custom settings
      //create bot user
      let botUser = {
        avatar:
          localChatCustomSettings.avatarFileS3Info && localChatCustomSettings.avatarFileS3Info?.avatarFileUrl
            ? localChatCustomSettings.avatarFileS3Info?.avatarFileUrl
            : 'https://d3dqyamsdzq0rr.cloudfront.net/images/bot_icon.png',
        name: localChatCustomSettings.botName ? localChatCustomSettings.botName : 'Sia',
        id: localChatCustomSettings.botRecordId,
        charLimit: localChatCustomSettings["languageSettings"]?.[0]?.["charLimit"] ? localChatCustomSettings["languageSettings"]?.[0]?.["charLimit"] : "Please try rephrasing your question with fewer words. (300 characters max)",
        maxCharLimit: localChatCustomSettings["languageSettings"]?.[0]?.["maxCharLimit"] ? localChatCustomSettings["languageSettings"]?.[0]?.["maxCharLimit"] : 300,
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
        privacyPolicyText: localChatCustomSettings?.languageSettings?.[0]?.privacyPolicyText
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

      //if we use userJoinInfo then call History (..?history --  need to confirm whether it's needed or not..!) and then send start message
      let msg = localChatCustomSettings.startMessage ? localChatCustomSettings.startMessage : 'Hi';
      //setMessage(msg);
      handleOnSend(msg, botUser);
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
        time: d.toLocaleTimeString([], options)
      };
      // if (botUserInfo?.botErrorMessage) {
      //   if (notificationSound && notificationSound.paused) {
      //     notificationSound.play().catch(e => {
      //     });
      //   }
      //   setNotificationCount(prevCount => prevCount + 1)
      // }
      setConversationData((prevState) => [...prevState, newMessage]);
    }
  }, [chatState.botReplyResponseInfo, chatState.botErrorReply]);

  useEffect(() => {
    if (chatState.botReplyResponseInfo && chatState.botReplyResponseInfo.status && chatState.botReplyResponseInfo.status === 'success') {
      let botResponse = chatState.botReplyResponseInfo;
      /*
            let botResponse = chatState.botReplyResponseInfo ? JSON.parse(JSON.stringify(chatState.botReplyResponseInfo)):chatState.botReplyResponseInfo;
      */
      removeLoadingIndicator();
      if (notificationSound && notificationSound.paused) {
        notificationSound.play().catch(e => {
        });
      }

      if (botResponse && Array.isArray(botResponse['bot_responses']) && botResponse['bot_responses'].length > 0) {

        /*        let initialBotResponse = botResponse['bot_responses']?.[0];
                botResponse["bot_responses"].push(initialBotResponse);
                botResponse["bot_responses"].push(initialBotResponse);*/
        let botResponsesLength = botResponse['bot_responses']?.length;

        botResponse['bot_responses'].forEach((response, i) => {
          // do something with each response

          let responseType = i == 0 ? 'firstResponse' : '';
          let transactionId = botResponse?.transactionId;

          if (response.text) {
            setNotificationCount(prevState => prevState + 1)
            const d = new Date();
            const newMessage = {
              to: user?.name,
              from: botUserInfo.name,
              text: response.text,
              time: d.toLocaleTimeString([], options),
              buttons: response.buttons,
              responseType: responseType,
              transactionId: transactionId,
              userInteractionId: botResponse?.transactionId,
              conversationId: botResponse?.conversationId,
              interpreter_id: botResponse?.interpreter_id
            };
            if (i === botResponsesLength - 1 && botResponse['bot_responses'].length > 1 && botResponse['bot_responses'][0].buttons) {
              newMessage.buttons = botResponse['bot_responses'][0].buttons
            }
            if (botResponsesLength > 2) {
              if (i == 0) {
                setConversationData((prevState) => [...prevState, newMessage]);
                addLoadingIndicatorForMultiResponse()
              } else if (i < botResponsesLength - 1) {
                setTimeout(() => {
                  removeLoadingIndicator()
                  setConversationData((prevState) => [...prevState, {...newMessage, isMultiResponse: true}]);
                  addLoadingIndicatorForMultiResponse()
                }, i * 5000);
              } else {
                setTimeout(() => {
                  removeLoadingIndicator()
                  setConversationData((prevState) => [...prevState, {...newMessage, isMultiResponse: true}]);
                }, i * 5000);
              }
            } else {
              setConversationData((prevState) => [...prevState, newMessage]);
            }
          }
        });
      }
      setBotReplyResponse(chatState.botReplyResponseInfo);
    }
  }, [chatState.botReplyResponseInfo]);

  useEffect(() => {
    setConversationData(chatState.chats);
  }, [chatState.chats]);

  //COMMAND MODE FUNCTIONS

  const commandAnchorRef = useRef(null);

  const [commands, setCommands] = useState([]);
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState({});
  const [commandModeInput, setCommandModeInput] = useState('');
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [toolTip, setToolTip] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [characterLimitExceeded, setCharacterLimitExceeded] = useState(false)

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isCommandMode) {
      if (chatState.uploading) {
        setIsDisabled(true);
        setCommandModeInput('');
        setMessage(message);
      } else {
        setIsDisabled(chatState.uploading);
        if (chatState.error) {
          toast.error(chatState.error);
        } else {
          if (Object.keys(chatState?.fileUploadInfo).length > 0) {
            setMessage(selectedCommand.name + ' ' + chatState.fileUploadInfo.fileName);
            setCommandModeInput(chatState.fileUploadInfo.fileName);
          } else {
            setMessage(selectedCommand.name + ' ');
            setCommandModeInput('');
          }
        }
      }
    } else {
      setCommandModeInput('');
    }
  }, [isCommandMode, chatState.fileUploadInfo, chatState.uploading]);

  // TODO: Add description to the commands
  const allCommands = [
    {
      name: '/help',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
    },
    {
      name: '/memorize',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      action: 'prompt',
      actionToolTip: 'Select a file or insert a URL after the command'
    }
  ];

  const handleMessageInput = (event) => {
    let enteredMessage = event.target.value;
    if (enteredMessage?.length > botUserInfo?.maxCharLimit) {
      handleCharacterLimitExceeded()
    } else {
      setCharacterLimitExceeded(false)
      setMessage(event.target.value);
      if (enteredMessage.startsWith('/') && !enteredMessage.substring(1).includes('/')) {
        handleCommand(enteredMessage);
      } else {
        handleMessage(enteredMessage);
      }
      const commandIndex = enteredMessage.indexOf(' ');
      if (isCommandMode) {
        if (commandIndex > -1) {
          setCommandModeInput(enteredMessage.substring(commandIndex + 1));
        } else {
          setIsCommandMode(false);
          setSelectedCommand({});
          setToolTip('');
        }
      }
    }
  };

  const handleMessage = (message) => {
    if (commands.length > 0) {
      setCommands([]);
      setShowCommands(false);
    }
    setMessage(message);
  };

  const handleCommand = (command) => {
    // show list of commands to choose from
    if (selectedCommand && !selectedCommand?.name?.length > 0) {
      setCommands(allCommands.filter((cmd) => cmd.name.includes(command)));
      setShowCommands(true);
    }
  };

  const handleCommandSelect = (command) => {
    if (commandListOpen) {
      setCommandsListAnchorRef(null);
    }
    setSelectedCommand(command);
    setIsCommandMode(true);
    setMessage(command.name + ' ');
    setCommandModeInput((prevState) => (prevState ? prevState : ''));
    setToolTip(command.actionToolTip);
    setShowCommands(false);
  };

  useEffect(() => {
    if (commandListOpen && commandAnchorRef.current !== null) {
      setShowCommands(false);
    }
  }, [commandListOpen]);

  const closeCommandPopover = (event) => {
    if (commandAnchorRef.current && commandAnchorRef.current.contains(event.target)) {
      return;
    }
    setShowCommands(false);
  };

  const closeCommandList = (event) => {
    setCommandsListAnchorRef(null);
  };

  const handleFocusMessageInput = (event) => {
    resetNotificationCount()
    if (event.target.value.startsWith('/') && !event.target.value.substring(1).includes('/') && !isCommandMode) {
      handleCommand(event.target.value);
    } else {
      handleMessage(event.target.value);
    }
  };

  const resetNotificationCount = () => {
    setNotificationCount(0)
  }

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowUp':
        setSelectedIndex((prevSelectedIndex) => (prevSelectedIndex <= 0 ? 0 : prevSelectedIndex - 1));
        break;
      case 'ArrowDown':
        setSelectedIndex((prevSelectedIndex) => (prevSelectedIndex >= commands.length - 1 ? commands.length - 1 : prevSelectedIndex + 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (showCommands && commands[selectedIndex]) {
          handleCommandSelect(commands[selectedIndex]);
        } else {
          handleOnSend(message);
        }
        break;
      default:
        break;
    }
  };

  const onSpanChange = (event) => {
    setMessage(event.target.textContent);
    if (selectedCommand.name !== event.target.textContent) {
      setIsCommandMode(false);
      setCommandModeInput('');
      setSelectedCommand({});
      setToolTip('');
      dispatch(clearChatFileState());
    }
  };

  const removeUploadedFile = () => {
    setUploadedFileInfo({})
  }

  const handleFileUpload = (event) => {
    const maxSize = 1 * 1024 * 1024;
    if (event.target.files && event.target.files[0].size > maxSize) {
      toast.error("Only PDF files of size less than 1 MB are accepted");
    } else if (!(event.target.files && event.target.files[0].type.includes("pdf"))) {
      toast.error("Only PDF files are acceptable");
    } else {
      console.log("files", event.target.files)
      if (event.target?.files?.length > 0) {
        let uploadedFile = event.target.files?.[0]
        setUploadedFileInfo(uploadedFile);
      }
      else{
        toast.error("File not uploaded.Please try again");
      }
    }
  }

  const handleOnFileUpload = (uploadedFile, botUser, msg) => {
    setCharacterLimitExceeded(false)
    let command = "/file-upload";
    let userMessage = message ? message : FILE_UPLOAD_DEFAULT_MESSAGE;
    let userUploadedFileName = uploadedFile?.name;
    let botUserName = botUser?.name ? botUser?.name : botUserInfo?.name;
    if (!botUserInfo.name) {
      botUserInfo.name = botUser ? botUser.name : '';
    }


    let {headers, requestObjForBotReply} = buildRequestMetadata(userMessage);
    const d = new Date();
    const newMessage = {
      from: user?.name,
      to: botUserName,
      isFileUploadEvent: true,
      uploadedFileName: userUploadedFileName,
      text: userMessage,
      time: d.toLocaleTimeString([], options)
    };
    setConversationData((prevState) => [...prevState, newMessage]);

    addLoadingIndicator(botUserName);
    let formData = new FormData();

    requestObjForBotReply["command"] = command;
    formData.append("clientId", CLIENT_ID)
    formData.append("bodyParameters", JSON.stringify(requestObjForBotReply));
    formData.append("uploadedFile", uploadedFile);
    dispatch(getBotReplyResponse(formData, headers));
    setMessage('');
    setToolTip('');

  };

  const DisplayUploadedFileInfoComponent = () => {
    return (
      uploadedFileInfo?.name && <>
        <Box style={{display: "flex", flexDirection: "row", alignItems: "center", columnGap: "5px"}}>
          <Alert icon={<InsertDriveFileIcon fontSize={"inherit"}/>} severity="success">
            <Tooltip title={uploadedFileInfo?.name}>
              <Typography style={{
                width: "200px",
                whiteSpace: "nowrap",
                overflowX: "hidden",
                textOverflow: "ellipsis"
              }}>{uploadedFileInfo?.name}</Typography>
            </Tooltip>
          </Alert>
          <RemoveCircleOutlineIcon onClick={removeUploadedFile} style={{cursor: "pointer", padding: 0, margin: 0}}
                                   fontSize={"inherit"} color={"error"}/>
        </Box>
      </>
    )
  }

  let headerBGColor = theme.palette.background.paper;
  return botReadyToDisplay ? (
    <>
      <Box sx={{display: 'flex'}} onFocus={() => resetNotificationCount()}>
        <Main theme={theme} open={openChatDrawer}>
          <Grid container onFocus={() => resetNotificationCount()}>
            <Grid item xs={12} md={emailDetails ? 8 : 12} xl={emailDetails ? 9 : 12}
                  onClick={() => resetNotificationCount()}>
              <MainCard
                content={false}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'dark.main' : 'grey.50',
                  pt: 2,
                  pl: 2,
                  borderRadius: emailDetails ? '0' : '0 4px 4px 0'
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
                    <Grid container justifyContent="space-between">
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
                                <Box>
                                  {notificationCount > 0 && <NotificationBadge count={notificationCount}/>}
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
                  <Grid item xs={12}>
                    <SimpleBar
                      sx={{
                        overflowX: 'hidden',
                        height: 'calc(100vh - 280px)',
                        minHeight: 320,
                        maxHeight: isChatInnerSection ? 408 : 500
                      }}
                    >
                      <Box sx={{pl: 1, pr: 3, mb: 3}}>
                        <ChatHistory theme={theme} handleUserBtnInput={handleUserBtnInput} user={botUserInfo}
                                     data={conversationData}/>
                      </Box>
                    </SimpleBar>
                  </Grid>
                  <Grid item sx={{
                    paddingTop: "0 !important",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-left",
                    rowGap: "10px"
                  }}>
                    {DisplayUploadedFileInfoComponent()}
                    {toolTip && (
                      <Box sx={{backgroundColor: '#888', mr: 2, p: 1, borderRadius: '22px 22px 0 0'}}>
                        <Typography sx={{color: '#FFF'}}>{toolTip}</Typography>
                      </Box>
                    )}
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
                      <Box ref={commandAnchorRef} sx={{width: '100%', display: 'flex', alignItems: 'center'}}>
                        <Grid item style={{padding: "0px 5px"}}>
                          <label style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: 0,
                            margin: 0
                          }} htmlFor={"fileUpload"}>
                            <AttachFileIcon sx={{color: "#6E45E9", padding: 0, margin: 0}}/>
                          </label>
                          <input onChange={(e) => handleFileUpload(e)} accept="application/pdf" onClick={(event) => {
                            event.target.value = null;
                          }} style={{opacity: 0, position: "absolute", zIndex: -1}} type={"file"} id={"fileUpload"}/>
                        </Grid>
                        <Grid item xs="auto" container direction="row" alignItems="center">
                          {/*<IconButton ref={anchorElEmoji} aria-describedby={emojiId} onClick={handleOnEmojiButtonClick}*/}
                          {/*            color="primary">*/}
                          {/*  <InsertEmoticonOutlined/>*/}
                          {/*</IconButton>*/}
                          {/*<IconButton*/}
                          {/*  color={'primary'}*/}
                          {/*  aria-describedby={paperclipId}*/}
                          {/*  disabled={!responseLoading}*/}
                          {/*  onClick={(e) => handleOnPaperclipButtonClick(e)}*/}
                          {/*>*/}
                          {/*  <PaperClipOutlined/>*/}
                          {/*</IconButton>*/}
                          {/*<IconButton*/}
                          {/*  color={'primary'}*/}
                          {/*  aria-describedby={commandListId}*/}
                          {/*  disabled={!responseLoading || uploadedFileInfo?.name}*/}
                          {/*  onClick={(e) => handleOnCommandClick(e)}*/}
                          {/*>*/}
                          {/*  <KeyboardCommandKeyOutlined/>*/}
                          {/*</IconButton>*/}
                          {paperclipOpen && responseLoading && (
                            <Popper
                              id={paperclipId}
                              open={paperclipOpen}
                              anchorEl={anchorElPaperclip}
                              disablePortal
                              popperOptions={{
                                modifiers: [
                                  {
                                    name: 'offset',
                                    options: {
                                      offset: [-20, 20]
                                    }
                                  }
                                ]
                              }}
                            >
                              <ClickAwayListener onClickAway={handleClosePaperclip}>
                                <MainCard elevation={8} content={false}>
                                  <Grid container direction="column">
                                    <IconButton onClick={handleImageUpload} disabled={isCommandMode}>
                                      <ImageOutlined/>
                                      <input
                                        disabled={isCommandMode}
                                        id="image-input"
                                        type="file"
                                        accept="image/*"
                                        style={{display: 'none'}}
                                        onChange={(event) => sendDocument(event, 'image')}
                                      />
                                    </IconButton>
                                    <IconButton onClick={handleDocumentUpload}>
                                      <DescriptionOutlined/>
                                      <input
                                        id="document-input"
                                        type="file"
                                        accept="application/pdf"
                                        style={{display: 'none'}}
                                        onChange={(event) => sendDocument(event, 'doc')}
                                      />
                                    </IconButton>
                                  </Grid>
                                </MainCard>
                              </ClickAwayListener>
                            </Popper>
                          )}

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
                          {commandListOpen && (
                            <Popper
                              id={commandListId}
                              open={commandListOpen}
                              anchorEl={commandsListAnchorRef}
                              placement="top-start"
                              sx={{marginBottom: '10px !important'}}
                              popperOptions={{
                                modifiers: [
                                  {
                                    name: 'offset',
                                    options: {
                                      offset: [-20, 20]
                                    }
                                  }
                                ]
                              }}
                            >
                              <ClickAwayListener onClickAway={closeCommandList}>
                                <Paper elevation={2} sx={{backgroundColor: 'grey.100'}}>
                                  <List>
                                    {allCommands.map((command, index) => (
                                      <ListItemButton
                                        key={index}
                                        onClick={() => {
                                          handleCommandSelect(command);
                                        }}
                                      >
                                        <Stack>
                                          <Box sx={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                            <Typography>{command.name}</Typography>
                                            {command.action === 'prompt' && (
                                              <Box
                                                sx={{
                                                  backgroundColor: '#474747',
                                                  borderRadius: '4px',
                                                  padding: '2px 6px'
                                                }}
                                              >
                                                <Typography sx={{color: '#FFF'}}>{command.action}</Typography>
                                              </Box>
                                            )}
                                          </Box>
                                          <Box>{command.description}</Box>
                                        </Stack>
                                      </ListItemButton>
                                    ))}
                                  </List>
                                </Paper>
                              </ClickAwayListener>
                            </Popper>
                          )}
                        </Grid>
                        {commands.length > 0 && (
                          <Popper
                            open={showCommands}
                            anchorEl={commandAnchorRef.current}
                            placement="top-start"
                            sx={{marginBottom: '10px !important'}}
                            popperOptions={{
                              modifiers: [
                                {
                                  name: 'sameWidth',
                                  enabled: true,
                                  phase: 'beforeWrite',
                                  requires: ['computeStyles'],
                                  fn: ({state}) => {
                                    state.styles.popper.width = `${state.rects.reference.width}px`;
                                  },
                                  effect: ({state}) => {
                                    state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
                                  }
                                }
                              ]
                            }}
                          >
                            <ClickAwayListener onClickAway={closeCommandPopover}>
                              <Paper elevation={2} sx={{backgroundColor: 'grey.100'}}>
                                <List>
                                  {commands.map((command, index) => (
                                    <ListItemButton
                                      key={index}
                                      sx={{bgcolor: index === selectedIndex ? 'action.selected' : 'inherit'}}
                                      onClick={() => {
                                        handleCommandSelect(command);
                                      }}
                                    >
                                      <Stack>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                          <Typography>{command.name}</Typography>
                                          {command.action === 'prompt' && (
                                            <Box
                                              sx={{
                                                backgroundColor: '#474747',
                                                borderRadius: '4px',
                                                padding: '2px 6px'
                                              }}
                                            >
                                              <Typography sx={{color: '#FFF'}}>{command.action}</Typography>
                                            </Box>
                                          )}
                                        </Box>
                                        <Box>{command.description}</Box>
                                      </Stack>
                                    </ListItemButton>
                                  ))}
                                </List>
                              </Paper>
                            </ClickAwayListener>
                          </Popper>
                        )}
                        {isCommandMode && Object.keys(chatState?.fileUploadInfo).length > 0 ? (
                          <Box
                            sx={{
                              width: '100%',
                              lineBreak: 'anywhere',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexWrap: 'wrap'
                            }}
                          >
                            <span contentEditable suppressContentEditableWarning onInput={onSpanChange}
                                  style={{whiteSpace: 'pre-wrap'}}>
                              {selectedCommand?.name}
                            </span>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#1890ff',
                                px: '4px',
                                py: '2px',
                                borderRadius: '8px',
                                gap: '4px',
                                lineBreak: 'anywhere'
                              }}
                            >
                              <Typography>{chatState?.fileUploadInfo.fileName}</Typography>
                              <IconButton
                                onClick={() => {
                                  dispatch(clearChatFileState());
                                  setCommandModeInput('');
                                }}
                                sx={{backgroundColor: '#FFF', borderRadius: '50%', width: '12px', height: '12px'}}
                              >
                                <Close sx={{fontSize: '12px', color: '#1890ff'}}/>
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <FormControl fullWidth>
                            <InputBase
                              error={characterLimitExceeded}
                              endAdornment={<InputAdornment
                                position="end">{message.length + "/" + botUserInfo?.maxCharLimit}</InputAdornment>}
                              inputRef={textInput}
                              fullWidth
                              minRows={1}
                              maxRows={4}
                              multiline
                              value={message}
                              onChange={handleMessageInput}
                              onFocus={handleFocusMessageInput}
                              onKeyDown={handleKeyDown}
                              disabled={!responseLoading || isDisabled}
                              placeholder="Type a message or command"
                            />
                          </FormControl>
                        )}
                        <IconButton
                          color="primary"
                          customcolor={botUserInfo?.sendButtonColor}
                          onClick={handleOnSend}
                          disabled={!responseLoading || (message.trim().length === 0 && !uploadedFileInfo?.name) || isDisabled}
                        >
                          <SendOutlined/>
                        </IconButton>
                        {/*{!isListening ? (*/}
                        {/*  <IconButton color="primary" disabled={uploadedFileInfo?.name} onClick={startSpeechRecognition}>*/}
                        {/*    <MicOutlined/>*/}
                        {/*  </IconButton>*/}
                        {/*) : (*/}
                        {/*  <IconButton color="primary" onClick={stopSpeechRecognition}>*/}
                        {/*    <StopOutlined/>*/}
                        {/*  </IconButton>*/}
                        {/*)}*/}
                      </Box>
                    </Paper>
                    {characterLimitExceeded ?
                      <Typography color="error">{botUserInfo?.charLimit}</Typography> : ""}
                  </Grid>
                  <Grid item xs={12}>
                    {/*  <Stack>*/}
                    {/*    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{py: 2}}>*/}
                    {/*      <Box flexBasis="50%">*/}
                    {/*        <Link color="secondary" sx={{fontSize: '12px'}} href={botUserInfo?.privacyPolicyUrl}*/}
                    {/*              target="_blank">*/}
                    {/*          {botUserInfo?.privacyPolicyText}*/}
                    {/*        </Link>*/}
                    {/*      </Box>*/}
                    {/*      <Box flexBasis="50%" display="flex">*/}
                    {/*        <img*/}
                    {/*          alt="poweredBy"*/}
                    {/*          width="18px"*/}
                    {/*          src="https://d3dqyamsdzq0rr.cloudfront.net/widget/chat/images/thunderbolt.png"*/}
                    {/*        />*/}
                    {/*        <Typography color="secondary" sx={{fontSize: '12px'}}>*/}
                    {/*          by{' '}*/}
                    {/*          <Link color="secondary" href={botUserInfo?.poweredByUrl} target="_blank">*/}
                    {/*            {botUserInfo?.poweredByText}*/}
                    {/*          </Link>*/}
                    {/*        </Typography>*/}
                    {/*      </Box>*/}
                    {/*      <Box flexBasis="6%">*/}
                    {/*        <Typography sx={{fontSize: '12px'}} color="secondary">*/}
                    {/*          &copy;{currentYear}*/}
                    {/*        </Typography>*/}
                    {/*      </Box>*/}
                    {/*    </Stack>*/}
                    {/*  </Stack>*/}
                  </Grid>
                </Grid>
              </MainCard>
            </Grid>
          </Grid>
        </Main>
      </Box>
      {showChat && (
        <Grid item container justifyContent="center" sx={{mt: 2, mb: 1}}>
          <Button variant="contained" color="error" onClick={() => setShowChat(false)}>
            Close
          </Button>
        </Grid>
      )}
    </>
  ) : latestBotInfo?.interpreterId ? (
    <Grid container alignItems="center" justifyContent="center" style={{height: '100vh'}}>
      <Grid item>
        {/* Replace 'MyCuteSVG' with your actual SVG component */}
        <img src={Rocket} alt="Rocket" width="200"/>
        <Typography variant="h2" align="center">
          Initializing...
        </Typography>
      </Grid>
    </Grid>
  ) : (
    <Box alignItems="center" display="flex" justifyContent="center" style={{height: '70vh'}}>
      <Grid item xs={12}>
        {isFetching ? (
          <CircularProgress sx={{width: '50px !important', height: '50px !important', mt: 1}} color="primary"/>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <Typography variant="h4" textAlign="center">
              {initialBotStatus.suggestionText}
            </Typography>
            {initialBotStatus?.isRefreshButton && <Button
              color="success"
              variant="contained"
              sx={{mt: 2}}
              endIcon={<ClockCircleOutlined/>}
              onClick={(e) => {
                e.stopPropagation();
                fetchBotByUserId();
              }}
            >
              REFRESH
            </Button>}

          </Box>
        )}
      </Grid>
    </Box>
  );
};

ChatWidget.propTypes = {
  user: PropTypes.object,
  botInfo: PropTypes.object,
  otherInfo: PropTypes.object,
  customTheme: PropTypes.object
};

ChatWidget.defaultProps = {
  user: {}, // default value for user
  botInfo: {botId: 's_623df5', clientId: 'czIzLTMzNzgxMS05MTkyMjc2OTA1', authKey: 'SFlZSVlCSFNISlNESlNESks='}, // default value for botInfo
  otherInfo: {}, // default value for otherInfo
  customTheme: null // default value for customTheme
};

export default ChatWidget;
