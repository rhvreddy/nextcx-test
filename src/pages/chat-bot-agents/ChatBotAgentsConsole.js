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
    DialogContent,
    Divider,
    DialogTitle,
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
    useMediaQuery, AlertTitle, Alert, Tooltip, FormControl
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
import {IoMdHome} from "react-icons/io";
import {
    disableNavItems,
    getBotReplyResponse,
    getChatCustomSettings,
    getChatHistory,
    getSelectedConvId,
    disableAppointmentSaveBtn, fetchAllBookingSlots
} from 'store/reducers/chat';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';
// assets
import {PaperClipOutlined, SendOutlined, SmileFilled, ClockCircleOutlined} from '@ant-design/icons';
import {renderToStaticMarkup} from 'react-dom/server';
import PropTypes from 'prop-types';
import config, {CLIENT_ID, AUTH_KEY, FILE_UPLOAD_DEFAULT_MESSAGE, widgetStyles} from '../../config';
import Cookies from "js-cookie";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {toast} from "react-toastify";
import moment from 'moment-timezone';
import CustomCalendar from "../../components/Calendar";


const drawerWidth = 320;

const options = {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
};

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

const ChatBotAgentsConsole = ({
                                  customTheme,
                                  isChatInnerSection,
                                  isBotsMenuList
                              }) => {
    const theme = customTheme ? customTheme : useTheme();
    const urlParams = new URLSearchParams(window.location.search);
    const versionNumber = urlParams.get("version")
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
    const [isEmptyHistory, setIsEmptyHistory] = useState(false)
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
    const [uploadedFileInfo, setUploadedFileInfo] = useState({});
    const [width, setWidth] = useState(widgetStyles.width ? widgetStyles.width : "auto");
    const [height, setHeight] = useState(widgetStyles.containerHeight ? widgetStyles.containerHeight : "520px");
    const [slotBookingInfo, setSlotBookingInfo] = useState({});
    const [currentEvents, setCurrentEvents] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);
    const [showMainMenu, setShowMainMenu] = useState(false);

    useEffect(() => {
        const audio = new Audio('https://d3dqyamsdzq0rr.cloudfront.net/widget/chat/files/CSR-Connect-Notification-Sound.mp3')
        setNotificationSound(audio)
    }, []);

    useEffect(() => {
        if (chatState?.disableSaveBtn?.isDisable === "N") {
            setIsSaveDisabled(false);
        } else {
            setIsSaveDisabled(true)
        }

    }, [chatState?.disableSaveBtn?.isDisable]);

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
        const clearTypeMessage = true;
        handleOnSend(msg, false, clearTypeMessage);
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
        setShowMainMenu(false);
        dispatch(disableNavItems({isDisabled: true}))
        const d = new Date();
        const newMessage1 = {
            to: user?.name,
            from: botUserName ? botUserName : botUserInfo.name,
            text: LOADING_GIF_HTML_TAG,
            time: d.toLocaleTimeString([], options),
            type: "loading",
        };
        setConversationData((prevState) => [...prevState, newMessage1]);
    }

    function addLoadingIndicatorForMultiResponse(botUserName) {
        setResponseLoading(false);
        setShowMainMenu(false);
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
            if (event.target?.files?.length > 0) {
                let uploadedFile = event.target.files?.[0]
                setUploadedFileInfo(uploadedFile);
            } else {
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

        setIsEmptyHistory(false)
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

    const handleOnSend = (msg, botUser, isClearMessage) => {
        if (uploadedFileInfo?.name && uploadedFileInfo?.name !== "") {
            handleOnFileUpload(uploadedFileInfo, botUser, msg);
            setUploadedFileInfo({})
        } else {
            setCharacterLimitExceeded(false)
            let userMessage;
            if (isClearMessage && msg) {
                userMessage = msg;
            } else {
                userMessage = message ? message : msg;
            }
            let botUserName = botUser?.name ? botUser?.name : botUserInfo?.name;
            if (!botUserInfo.name) {
                botUserInfo.name = botUser ? botUser.name : '';
            }

            if (userMessage?.trim() === '') {
                toast.error("Message required")
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
                setIsEmptyHistory(false)
                addLoadingIndicator(botUserName);
                dispatch(getBotReplyResponse(requestObjForBotReply, headers));
                setMessage('');
                setToolTip('');
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

    const handleCloseEmoji = () => {
        setAnchorElEmoji(null);
    };

    // close sidebar when widow size below 'md' breakpoint
    useEffect(() => {
        setOpenChatDrawer(!matchDownLG);
    }, [matchDownLG]);

    const getAllChatHistory = () => {
        setShowMainMenu(false);
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

    useEffect(() => {
        if (isBotsMenuList) {
            setIsFetching(false);
            setWarningText("BOT could not be located");
        }
    }, [isBotsMenuList]);

    const displayConversationExistUserId = (response) => {
        for (let index = 0; index < response?.length; index++) {
            if (response?.[index]?.userInteractionId && response?.[index]?.conversationIds?.length > 0 && response?.[index]?.conversationIds?.[index] !== "null") {
                localStorage.setItem("current_bot_user_id", response?.[index]?.userInteractionId)
                localStorage.setItem("current_convId", response?.[index]?.conversationIds?.[0])
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
                    const formattedTime = date.toLocaleTimeString('en-US', options);
                    if (historyMessages?.message !== "" && historyMessages?.display !== "N") {
                        const newMessage = {
                            from: user?.firstName ? user?.firstName + " " + (user?.lastName || "") : "createdBy",
                            to: botUserInfo.name,
                            isFileUploadEvent: (historyMessages?.source?.metadata?.uploadedFileS3Info?.fileName) ? true : false,
                            uploadedFileName: (historyMessages?.source?.metadata?.uploadedFileS3Info?.fileName) ? (historyMessages?.source?.metadata?.uploadedFileS3Info?.fileName) : "",
                            text: historyMessages?.message,
                            time: formattedTime
                        };
                        setConversationData((prevState) => [...prevState, newMessage]);
                    }
                    if (historyMessages?.botResponse?.bot_responses?.length > 0) {
                        historyMessages.botResponse.bot_responses.forEach((response, index) => {
                            let updatedButtons = response?.buttons

                            if(updatedButtons?.length > 0 && response?.default_buttons === "Y" && i === historyResponse?.length -1) {
                                updatedButtons?.map((btn,key) => {
                                    if ((btn?.title?.toLowerCase() === "main menu" || btn?.title?.toLowerCase() === "mainmenu") && botUserInfo?.toShowMainMenu === "Y") {
                                        setShowMainMenu(true);
                                        updatedButtons = updatedButtons?.filter((btn) => btn?.title?.toLowerCase() !== "main menu");
                                    }
                                })
                            }
                            if (response?.text) {
                                const newMessage = {
                                    to: user?.firstName ? user?.firstName + " " + (user?.lastName || "") : "createdBy",
                                    from: botUserInfo.name,
                                    text: response.text,
                                    time: formattedTime,
                                    buttons: updatedButtons,
                                    userInteractionId: historyResponse?.transactionId,
                                    conversationId: historyResponse?.conversationId,
                                    interpreter_id: historyResponse?.interpreter_id
                                };
                                if (index === 1 && historyMessages.botResponse['bot_responses'].length > 1 && historyMessages.botResponse['bot_responses'][0].buttons) {
                                    newMessage.buttons = historyMessages.botResponse['bot_responses'][0].buttons
                                }
                                setConversationData((prevState) => [...prevState, newMessage]);
                            }
                            if (i === historyResponse?.length - 1 && response?.custom?.command === "/appointmentCalendar") {
                                fetchAllCurrentEvents()
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
        if (versionNumber) {
            requestObjForSettings.version = versionNumber;
        }

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
            let charLimit = localChatCustomSettings?.["languageSettings"]?.[0]?.["charLimit"]
            const maxCharLimit = (localChatCustomSettings?.["languageSettings"]?.[0]?.["maxCharLimit"] ? localChatCustomSettings["languageSettings"]?.[0]["maxCharLimit"] : 300).toString()
            if (localChatCustomSettings?.["languageSettings"]?.[0]?.["charLimit"]) {
                localChatCustomSettings["languageSettings"][0]["charLimit"] = charLimit.replace('${maxCharLimit}', maxCharLimit)
            }
        }
        if (localChatCustomSettings) {
            let botUser = {
                avatar:
                    localChatCustomSettings.avatarFileS3Info && localChatCustomSettings.avatarFileS3Info.avatarFileUrl
                        ? localChatCustomSettings.avatarFileS3Info.avatarFileUrl
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
                userMsgBg: localChatCustomSettings?.userMsgBgColor ? localChatCustomSettings?.userMsgBgColor : localChatCustomSettings?.botColor,
                botMsgBg: localChatCustomSettings?.botMsgBgColor ? localChatCustomSettings?.botMsgBgColor : '"#8080801f"',
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
                showMessageFeedback: localChatCustomSettings.showMessageFeedback ? localChatCustomSettings.showMessageFeedback : 'disable',
                botErrorMessage: localChatCustomSettings?.languageSettings?.[0]?.botErrorMessage
                    ? localChatCustomSettings?.languageSettings?.[0]?.botErrorMessage
                    : 'System ran into an issue. Please try again later.',
                userId: localChatCustomSettings?.userId ? localChatCustomSettings?.userId : "",
                slotDuration: localChatCustomSettings?.slotDuration ? localChatCustomSettings?.slotDuration : "30 Minutes",
                toShowHistoryIcon: localChatCustomSettings?.toShowHistoryIcon ? localChatCustomSettings?.toShowHistoryIcon : "N",
                toShowFeedBackForm: localChatCustomSettings?.toShowFeedBackForm ? localChatCustomSettings?.toShowFeedBackForm : "N",
                speechToText: localChatCustomSettings?.speechToText ? localChatCustomSettings?.speechToText : "disable",
                soundSettings: localChatCustomSettings?.soundSettings ? localChatCustomSettings?.soundSettings : "disable",
                showRestartIcon: localChatCustomSettings?.showRestartIcon ? localChatCustomSettings?.showRestartIcon : "N",
                notifications: localChatCustomSettings?.notifications ? localChatCustomSettings?.notifications : "disable",
                menuOptions: localChatCustomSettings?.menuOptions ? localChatCustomSettings?.menuOptions : "disable",
                botRePosition: localChatCustomSettings?.botRePosition ? localChatCustomSettings?.botRePosition : "right",
                botButtonsColor: localChatCustomSettings?.botButtonsColor ? localChatCustomSettings?.botButtonsColor : "rgba(0,0,0,1)",
                toShowMainMenu: localChatCustomSettings?.toShowMainMenu === "Y" ? "Y" : "N",
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
                time: d.toLocaleTimeString([], options)
            };
            setConversationData((prevState) => [...prevState, newMessage]);
        }
    }, [chatState.botReplyResponseInfo, chatState.botErrorReply]);

    const handleCloseCalendar = () => {
        resetCalendarState();
        let {headers, requestObjForBotReply} = buildRequestMetadata("/closeCalendar");
        requestObjForBotReply.command = "/closeCalendar"
        addLoadingIndicator();
        requestObjForBotReply.display = "N";
        dispatch(getBotReplyResponse(requestObjForBotReply, headers));

    }

    const resetCalendarState = () => {
        setShowCalendar(false);
        setCurrentEvents([]);
        setSlotBookingInfo("");
        dispatch(disableAppointmentSaveBtn({isDisable: "Y"}));
    }

    const handleSaveAppointmentDetails = () => {
        if (slotBookingInfo?.date && slotBookingInfo?.time) {
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const dateTimeStr = `${slotBookingInfo?.date} ${slotBookingInfo?.time}`;
            const formattedDate = moment(dateTimeStr).tz(userTimeZone).format("YYYY-MM-DDTHH:mm:ssZ");
            const appointmentInfo = {
                clientUserId: botUserInfo?.userId,
                startTime: formattedDate
            }
            let {headers, requestObjForBotReply} = buildRequestMetadata("/saveAppointment");
            requestObjForBotReply.slot_details = appointmentInfo;
            requestObjForBotReply.command = "/saveAppointment";
            requestObjForBotReply.display = "N";
            addLoadingIndicator();
            dispatch(getBotReplyResponse(requestObjForBotReply, headers));
            resetCalendarState();
        }
    }

    const getSelectedBookingSlot = (slotInfo) => {
        setSlotBookingInfo(slotInfo);
    }

    const fetchAllCurrentEvents = async () => {
        addLoadingIndicator();
        dispatch(disableAppointmentSaveBtn({isDisable: "Y"}));
        try {
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            let fromDate = moment().tz(userTimeZone).format("YYYY-MM-DDTHH:mm:ssZ");
            let toDate = moment().tz(userTimeZone).add(3, 'months').format("YYYY-MM-DDTHH:mm:ssZ");
            let payload = {
                clientUserId: botUserInfo?.userId,
                interpreterId: localStorage.getItem("botId"),
                from: fromDate,
                to: toDate
            }
            const result = await dispatch(fetchAllBookingSlots(payload));
            if (result?.data?.busyEvents) {
                setShowCalendar(true);
                removeLoadingIndicator();
                setCurrentEvents(result?.data?.busyEvents);
            } else {
                removeLoadingIndicator();
                setShowCalendar(false);
            }
        } catch (err) {
            removeLoadingIndicator();
            setShowCalendar(false);
        }

    }

    useEffect(() => {
        if (chatState.botReplyResponseInfo && chatState.botReplyResponseInfo.status && chatState.botReplyResponseInfo.status === 'success') {
            let botResponse = chatState.botReplyResponseInfo;
            /*
                  let botResponse = chatState.botReplyResponseInfo ? JSON.parse(JSON.stringify(chatState.botReplyResponseInfo)):chatState.botReplyResponseInfo;
            */
            removeLoadingIndicator();

            if (botResponse && Array.isArray(botResponse['bot_responses']) && botResponse['bot_responses'].length > 0) {

                /*        let initialBotResponse = botResponse['bot_responses']?.[0];
                        botResponse["bot_responses"].push(initialBotResponse);
                        botResponse["bot_responses"].push(initialBotResponse);*/
                let botResponsesLength = botResponse['bot_responses']?.length;

        botResponse['bot_responses'].forEach((response, i) => {
          let responseType = i == 0 ? 'firstResponse' : '';
          let transactionId = botResponse?.transactionId;
            let updatedButtons = response?.buttons

            if(updatedButtons?.length > 0 && response?.default_buttons === "Y") {
                updatedButtons?.map((btn,key) => {
                    if ((btn?.title?.toLowerCase() === "main menu" || btn?.title?.toLowerCase() === "mainmenu") && botUserInfo?.toShowMainMenu === "Y") {
                        setShowMainMenu(true);
                        updatedButtons = updatedButtons?.filter((btn) => btn?.title?.toLowerCase() !== "main menu");
                    }
                })
            }

            if (response?.custom?.command === "/appointmentCalendar") {
                fetchAllCurrentEvents();
            }
          if (response.text) {
            // setNotificationCount(prevState => prevState + 1)
            const d = new Date();
            const newMessage = {
              to: user?.name,
              from: botUserInfo.name,
              text: response.text,
              time: d.toLocaleTimeString([], options),
              buttons: updatedButtons,
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
                    let updatedBtns = response?.buttons;
                    if (updatedBtns?.length > 0 && response?.default_buttons === "Y") {
                        updatedBtns?.map((btn, key) => {
                            if ((btn?.title?.toLowerCase() === "main menu" || btn?.title?.toLowerCase() === "mainmenu") && botUserInfo?.toShowMainMenu === "Y") {
                                setShowMainMenu(true);
                                updatedBtns = updatedBtns?.filter((btn) => btn?.title?.toLowerCase() !== "main menu");
                            }
                        })
                    }
                    newMessage.buttons = updatedButtons;
                  setConversationData((prevState) => [...prevState, {...newMessage, isMultiResponse: true}]);
                }, i * 5000);
              }
            } else {
              if(!chatState?.isNewChatInitiating) {
                setConversationData((prevState) => [...prevState, newMessage]);
              }
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

    const displayHighlightedMainMenu = () => {
        return (
            <Box sx={{
                position: "absolute",
                background: botUserInfo?.botColor,
                width: "calc(100% - 40px)",
                top: "-26px",
                borderRadius: "30px",
                display: "flex",
                justifyContent: "start",
                alignItems: "center"
            }} >
                <IoMdHome style={{
                    color: "#fff",
                    margin: "2px 0px 2px 10px",
                    height: "20px",
                    width: "30px",
                    cursor: "pointer"
                }} onClick={() => handleUserBtnInput("Main Menu", false, true)}/>
            </Box>
        )
    }

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
                    <RemoveCircleOutlineIcon onClick={removeUploadedFile}
                                             style={{cursor: "pointer", padding: 0, margin: 0}}
                                             fontSize={"inherit"} color={"error"}/>
                </Box>
            </>
        )
    }
    const displayAppointmentCalendar = () => {
        return (
            <Dialog open={showCalendar}>
                <DialogTitle id="alert-dialog-title" textAlign="center">
                    <h3 style={{margin: 0, padding: 0}}>Choose a Time Slot for Your Appointment</h3>
                </DialogTitle>
                <Divider/>
                <DialogContent>
                    <Box sx={{
                        height: height,
                        width: "520px",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "1rem"
                    }}>
                        <CustomCalendar allBookingEvents={currentEvents}
                                        selectedBookingSlot={getSelectedBookingSlot}
                                        slotDuration={botUserInfo?.slotDuration} userInfo={botUserInfo}/>
                        <Stack flexDirection="row" gap="2rem" justifyContent="center" width="100%" marginTop="2rem">
                            <Button variant="outlined" sx={{color:botUserInfo?.botColor ||  theme.palette.primary.main,
                                borderColor:botUserInfo?.botColor ||  theme.palette.primary.main,
                                fontWeight: 600,
                                '&:hover': {
                                    background: botUserInfo?.botColor || theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText
                                }
                            }} onClick={handleCloseCalendar}>Close</Button>
                            <Button variant="contained" disabled={isSaveDisabled} sx={{
                                fontWeight: 600,
                                border: chatState?.disableSaveBtn?.isDisable === "Y"  ? "1px solid #80808069" : "inherit",
                                color: chatState?.disableSaveBtn?.isDisable === "Y" ? "gray !important"   : theme.palette.primary.contrastText,
                                background: botUserInfo?.botColor || theme.palette.primary.main,
                                '&:hover': {
                                    background: botUserInfo?.botColor || theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText
                                }
                            }} onClick={handleSaveAppointmentDetails}>Save</Button>
                        </Stack>
                    </Box>
                </DialogContent>
            </Dialog>
        )
    }

  let headerBGColor = theme.palette.background.paper;
  return botReadyToDisplay ? (
      <>
        <Box sx={{display: 'flex', height: "100%"}}>
          <Main theme={theme} open={openChatDrawer} sx={{height: "100%"}}>
            <Grid container sx={{height: "100%"}}>
              <Grid item xs={12} md={12} xl={12} sx={{height: "100%"}}>
                <MainCard
                  content={false}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'dark.main' : 'grey.50',
                    pt: 2,
                    pl: 2,
                    borderRadius: '0 4px 4px 0',
                    boxShadow: "0 0 10px rgb(0 0 0 / 10%)",
                    height: "100%"
                  }}
                >
                  <Grid container spacing={3}
                        style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
                    <Grid
                      item
                      sx={{
                        bgcolor: botUserInfo?.botColor ? botUserInfo?.botColor : headerBGColor,
                        pr: 2,
                        pb: 2,
                        width: "100%",
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
                    <Grid item sx={{
                      width: "100%",
                      minHeight: 220,
                      flex: 1,
                      paddingTop: "0 !important"
                    }}>
                      <SimpleBar
                        sx={{
                          overflowX: 'hidden',
                          height: "100%"
                        }}
                      >
                        <Box sx={{pl: 1, pr: 3, mb: 3}}>
                          <ChatHistory isEmptyInfo={isEmptyHistory} theme={theme} handleUserBtnInput={handleUserBtnInput}
                                       user={botUserInfo}
                                       data={conversationData}/>
                        </Box>
                      </SimpleBar>
                        {
                            showCalendar && displayAppointmentCalendar()
                        }
                    </Grid>
                      <Grid item sx={{
                          paddingTop: "0 !important",
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-left",
                          rowGap: "10px",
                          position: "relative"
                    }}>
                      {DisplayUploadedFileInfoComponent()}
                        {showMainMenu && displayHighlightedMainMenu()}
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
                        <Box sx={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          paddingBottom: "0px",
                          paddingTop: "0px",
                          marginTop: "0px"
                        }}>
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
                          <FormControl fullWidth>
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
                              disabled={!responseLoading || isDisabled || chatState?.isNewChatInitiating}
                              placeholder="Type a message"
                            />
                          </FormControl>

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
                                    </Grid>
                                </MainCard>
                            </Grid>
                        </Grid>
                    </Main>
                </Box>
            </>
        ) :
        (isFetching ?
            <Stack justifyContent="center" alignItems="center" height={matchDownSM ? "70vh" : "100%"}><CircularProgress
                sx={{
                    width: '50px' +
                        ' !important', height: '50px' +
                        ' !important', mt: 1
                }}
                color='primary'/></Stack> : (isConversations ?
                <Grid container alignItems="center" justifyContent="center"
                      sx={{height: matchDownSM ? "70vh" : '100%'}}>
                    <Grid item>
                        <img src={Rocket} alt="Rocket" width="200"/>
                        <Typography variant="h2" align="center">
                            Initializing...
                        </Typography>
                    </Grid>
                </Grid> :
                <Box display='flex' height={matchDownSM ? "70vh" : "100%"} justifyContent='center' alignItems='center'
                     flexDirection='column'>

                    <Typography variant='h4' color="secondary" fontWeight="bold"
                                textAlign='center'>{warningText}</Typography>
                </Box>))

};

ChatBotAgentsConsole.propTypes = {
    user: PropTypes.object,
    botInfo: PropTypes.object,
    otherInfo: PropTypes.object,
    customTheme: PropTypes.object
};

export default ChatBotAgentsConsole;
