import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from "react-router-dom"
// material-ui
import {createTheme, styled, useTheme} from '@mui/material/styles';
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
} from '@mui/icons-material';

// project import
import Rocket from 'assets/images/chat/rocket.gif';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import {IoMdHome} from "react-icons/io";
import UserAvatar from '../../sections/apps/chat/UserAvatar';
import {dispatch, useSelector} from 'store';
import {
    clearChatFileState, disableNavItems, displayChatComponent, fetchAllBookingSlots,
    getBotReplyResponse,
    getBotUploadedDocumentResposne,
    getChatBasicToken,
    getChatBearerToken,
    getChatCustomSettings,
    getLatestBotByUserId,
    getUserJoin,
    uploadFileToS3,
    disableAppointmentSaveBtn
} from 'store/reducers/chat';
import {MdOutlineClose} from "react-icons/md";
import {BsBoxArrowInLeft} from "react-icons/bs";
import {MdOutlineMinimize} from "react-icons/md";
import {BsBoxArrowInRight} from "react-icons/bs";
import {GoKebabHorizontal} from "react-icons/go";

import {openDrawer} from 'store/reducers/menu';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';
import {toast} from "react-toastify";
import Cookies from "js-cookie";
import moment from 'moment-timezone';
import CustomCalendar from "../Calendar/index";
// assets
import {PaperClipOutlined, SendOutlined, SmileFilled, ClockCircleOutlined} from '@ant-design/icons';
import {renderToStaticMarkup} from 'react-dom/server';

import PropTypes from 'prop-types';
import {getUserInfo} from '../../store/reducers/profile';
import NotificationBadge from '../../components/NotificationBadge/NotificationBadge';
import {CLIENT_ID, FILE_UPLOAD_DEFAULT_MESSAGE, AUTH_KEY, widgetStyles} from '../../config';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ChatMessages from "./ChatMessages";

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
    },
    chatContainer: {
        transition: "width 0.5s ease-in-out"
    },
    chatContent: {
        transition: "height 0.5s ease-in-out, display"
    }
}));

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

const GPTWidget = ({selectedCellData}) => {
    const theme = useTheme();
    const {user} = useSelector((state) => state.profile);
    const LOADING_GIF_HTML_TAG = '<img src="https://d3dqyamsdzq0rr.cloudfront.net/sia/images/loading-dots-01-unscreen.gif" width="60">';
    const paperClipSVGString = renderToStaticMarkup(<PaperClipOutlined/>);

    // Add these state variables inside your component
    const [isListening, setIsListening] = useState(false);
    const botInfo = useRef({botId: "", version: ""});
    const [responseLoading, setResponseLoading] = useState(false);
    const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
    const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
    const [emailDetails, setEmailDetails] = useState(false);
    const [botUserInfo, setBotUserInfo] = useState({});
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
    const [openChatDrawer, setOpenChatDrawer] = useState(true);
    const [anchorElEmoji, setAnchorElEmoji] = useState(null);
    // handle new message form
    const [message, setMessage] = useState('');
    const textInput = useRef(null);
    const emojiOpen = Boolean(anchorElEmoji);
    const emojiId = emojiOpen ? 'simple-popper' : undefined;
    const commandAnchorRef = useRef(null);
    const [commands, setCommands] = useState([]);
    const [showCommands, setShowCommands] = useState(false);
    const [selectedCommand, setSelectedCommand] = useState({});
    const [commandModeInput, setCommandModeInput] = useState('');
    const [isCommandMode, setIsCommandMode] = useState(false);
    const [toolTip, setToolTip] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);
    const [characterLimitExceeded, setCharacterLimitExceeded] = useState(false)
    const [width, setWidth] = useState(widgetStyles.width ? widgetStyles.width : "auto");
    const [height, setHeight] = useState(widgetStyles.containerHeight ? widgetStyles.containerHeight : "520px");
    const [isMinimized, setIsMinimized] = useState(false);
    const [isToggleWidth, setIsToggleWidth] = useState(false);
    const chatContainerRef = useRef(null);
    const chatMessagesRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [slotBookingInfo, setSlotBookingInfo] = useState({});
    const [currentEvents, setCurrentEvents] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);
    const [showMainMenu, setShowMainMenu] = useState(false);
    const classes = useStyles();

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

    const handleOnPaperclipButtonClick = (event) => {
        if (anchorElPaperclip) {
            setAnchorElPaperclip(null);
        } else {
            setAnchorElPaperclip(event.currentTarget);
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

    const handleUserBtnInput = (msg) => {
        const clearTypeMessage = true;
        handleOnSend(msg, false, clearTypeMessage);
    };

    const handleCharacterLimitExceeded = () => {
        setCharacterLimitExceeded(true)
        setTimeout(() => {
            setCharacterLimitExceeded(false)
        }, 2000)
    }

    const startSpeechRecognition = () => {
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
        const d = new Date();
        const newMessage1 = {
            to: user?.name,
            from: botUserName || botUserInfo.name,
            text: LOADING_GIF_HTML_TAG,
            time: d.toLocaleTimeString([], options),
            type: "loading"
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
            from: botUserName || botUserInfo.name,
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
                    dispatch(uploadFileToS3({file: file, headers: headers, botId: botInfo.current?.botId}));
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
            interpreterId: botInfo.current?.botId,
            meeting_user_id: localStorage.getItem('userId'),
            message: userMessage,
            interpreter_id: botInfo.current?.botId,
            liveAgentStatus: 'N',
            bot_builder: false,
            userBotId: localStorage.getItem('userId'),
            botConversationId: localStorage.getItem('conversationId'),
            conversationId: localStorage.getItem('conversationId'),
            pageUrl: window.location.href,
            authKey: AUTH_KEY,
            clientId: CLIENT_ID,
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

            let botUserName = botUser?.name || botUserInfo?.name;
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

    const handleCloseEmoji = () => {
        setAnchorElEmoji(null);
    };

    // close sidebar when widow size below 'md' breakpoint
    useEffect(() => {
        setOpenChatDrawer(!matchDownLG);
    }, [matchDownLG]);

    useEffect(() => {
        if (profile?.user) {
            const {user} = profile
            if (user?.appRoles?.length === 0) {
                navigate("/access-denied")
            }
        } else {
            dispatch(getUserInfo(localStorage.getItem("userId")))
        }
    }, [profile]);

    const initializeTokens = async (data) => {
        let payload = {
            botId: data?.botId,
            version: data?.version,
            authKey: AUTH_KEY,
            clientId: CLIENT_ID
        }
        const basicTokenInfo = await dispatch(getChatBasicToken(payload));
        if (basicTokenInfo?.data?.status?.toLowerCase() === "success" && basicTokenInfo?.data?.access_token) {
            const bearerTokenInfo = await dispatch(getChatBearerToken(basicTokenInfo?.data));
            if (bearerTokenInfo?.data?.access_token) {
                Cookies.set("sia_access_token", bearerTokenInfo?.data?.access_token);
                fetchBotInitialInfo();
            }
        }
    }

    useEffect(() => {
        if (selectedCellData?.botId) {
            setConversationData([]);
            resetNotificationCount();
            setShowMainMenu(false);
            setIsFetching(false);
            dispatch(openDrawer(false));
            resetCalendarState();
            botInfo.current = {botId: selectedCellData?.botId, version: selectedCellData?.version};
            initializeTokens(selectedCellData);
        }
    }, [selectedCellData]);

    const fetchBotInitialInfo = async () => {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${Cookies.get("sia_access_token")}`
        };
        //get custom bot settings, before getting any userId and conversationId
        const requestObjForSettings = {
            interpreterId: botInfo.current?.botId,
            pageUrl: window.location.href,
            authKey: AUTH_KEY,
            publishStatus: true,
            clientId: CLIENT_ID
        };

        const requestObjectForJoin = {
            interpreterId: botInfo?.botId,
            userBotId: localStorage.getItem('userId'),
            pageUrl: window.location.href,
            authKey: AUTH_KEY,
            publishStatus: true,
            clientId: CLIENT_ID
        };

        const results = await Promise.allSettled([
            dispatch(getChatCustomSettings(requestObjForSettings, headers)),
            dispatch(getUserJoin(requestObjectForJoin, headers))
        ]);
        let localChatCustomSettings;
        results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
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
                        localStorage.setItem('botId', botInfo.current.botId);
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
                toShowMainMenu: localChatCustomSettings?.toShowMainMenu === "Y" ? "Y" : "N",
                wideScreen: localChatCustomSettings?.wideScreen ? localChatCustomSettings?.wideScreen : "disable",
                toShowHistoryIcon: localChatCustomSettings?.toShowHistoryIcon ? localChatCustomSettings?.toShowHistoryIcon : "N",
                toShowFeedBackForm: localChatCustomSettings?.toShowFeedBackForm ? localChatCustomSettings?.toShowFeedBackForm : "N",
                speechToText: localChatCustomSettings?.speechToText ? localChatCustomSettings?.speechToText : "disable",
                soundSettings: localChatCustomSettings?.soundSettings ? localChatCustomSettings?.soundSettings : "disable",
                showRestartIcon: localChatCustomSettings?.showRestartIcon ? localChatCustomSettings?.showRestartIcon : "N",
                notifications: localChatCustomSettings?.notifications ? localChatCustomSettings?.notifications : "disable",
                menuOptions: localChatCustomSettings?.menuOptions ? localChatCustomSettings?.menuOptions : "disable",
                botRePosition: localChatCustomSettings?.botRePosition ? localChatCustomSettings?.botRePosition : "right",
                botButtonsColor: localChatCustomSettings?.botButtonsColor ? localChatCustomSettings?.botButtonsColor : localChatCustomSettings?.botColor,
                botMsgBgColor: localChatCustomSettings?.botMsgBgColor ? localChatCustomSettings?.botMsgBgColor : "#8080801f",
                userMsgBgColor: localChatCustomSettings?.userMsgBgColor ? localChatCustomSettings?.userMsgBgColor : localChatCustomSettings?.botColor,
            };
            setBotUserInfo(botUser);
            setBotReadyToDisplay(true);

            //if we use userJoinInfo then call History (..?history --  need to confirm whether it's needed or not..!) and then send start message
            let msg = localChatCustomSettings.startMessage ? localChatCustomSettings.startMessage : 'Hi';
            //setMessage(msg);
            handleOnSend(msg, botUser);
        }
    };

    const handleCloseCalendar = () => {
        resetCalendarState();
        let {headers, requestObjForBotReply} = buildRequestMetadata("/closeCalendar");
        requestObjForBotReply.command = "/closeCalendar"
        addLoadingIndicator();
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

    useEffect(() => {
        if (chatState.botReplyResponseInfo && chatState.botReplyResponseInfo.status && chatState.botReplyResponseInfo.status === 'success') {
            let botResponse = chatState.botReplyResponseInfo;
            removeLoadingIndicator();
            if (notificationSound && notificationSound.paused && isMinimized) {
                notificationSound.play().catch(e => {
                });
            }

            if (botResponse && Array.isArray(botResponse['bot_responses']) && botResponse['bot_responses'].length > 0) {
                let botResponsesLength = botResponse['bot_responses']?.length;
                botResponse['bot_responses'].forEach((response, i) => {
                    // do something with each response
                    let responseType = i === 0 ? 'firstResponse' : '';
                    let transactionId = botResponse?.transactionId;
                    let updatedButtons = response?.buttons;


                    if (updatedButtons?.length > 0 && response?.default_buttons === "Y") {
                        updatedButtons?.map((btn, key) => {
                            if ((btn?.title?.toLowerCase() === "main menu" || btn?.title?.toLowerCase() === "mainmenu") && botUserInfo?.toShowMainMenu === "Y") {
                                setShowMainMenu(true);
                                updatedButtons = updatedButtons?.filter((btn) => btn?.title?.toLowerCase() !== "main menu");
                            }
                        })
                    }

                    if (response.text) {
                        if (isMinimized) {
                            setNotificationCount(prevState => prevState + 1)
                        }
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
                            if (i === 0) {
                                if (selectedCellData?.botId && botResponse?.interpreter_id === selectedCellData?.botId) {
                                    setConversationData((prevState) => [...prevState, newMessage]);
                                } else if (!selectedCellData) {
                                    setConversationData((prevState) => [...prevState, newMessage]);
                                }
                                addLoadingIndicatorForMultiResponse()
                            } else if (i < botResponsesLength - 1) {
                                setTimeout(() => {
                                    removeLoadingIndicator()
                                    if (selectedCellData?.botId && botResponse?.interpreter_id === selectedCellData?.botId) {
                                        setConversationData((prevState) => [...prevState, {
                                            ...newMessage,
                                            isMultiResponse: true
                                        }]);
                                    } else if (!selectedCellData) {
                                        setConversationData((prevState) => [...prevState, {
                                            ...newMessage,
                                            isMultiResponse: true
                                        }]);
                                    }
                                    addLoadingIndicatorForMultiResponse()
                                }, i * 5000);
                            } else {
                                setTimeout(() => {
                                    removeLoadingIndicator();
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
                                    if (selectedCellData?.botId && botResponse?.interpreter_id === selectedCellData?.botId) {
                                        setConversationData((prevState) => [...prevState, {
                                            ...newMessage,
                                            isMultiResponse: true
                                        }]);
                                    } else if (!selectedCellData) {
                                        setConversationData((prevState) => [...prevState, {
                                            ...newMessage,
                                            isMultiResponse: true
                                        }]);
                                    }

                                }, i * 5000);
                            }
                        } else {
                            if (selectedCellData?.botId && botResponse?.interpreter_id === selectedCellData?.botId) {
                                setConversationData((prevState) => [...prevState, newMessage]);
                            } else if (!selectedCellData) {
                                setConversationData((prevState) => [...prevState, newMessage]);
                            }
                        }
                    }
                    if (response?.custom?.command === "/appointmentCalendar") {
                        fetchAllCurrentEvents()
                    }
                });
            }
            setBotReplyResponse(chatState.botReplyResponseInfo);
        }
    }, [chatState.botReplyResponseInfo]);

    useEffect(() => {
        setConversationData(chatState.chats);
    }, [chatState.chats]);

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

    const displayHighlightedMainMenu = () => {
        return (
            <Box sx={{
                position: "absolute",
                background: botUserInfo?.botColor,
                width: "calc(100% - 16px)",
                top: "-26px",
                borderRadius: "30px",
                display: "flex",
                justifyContent: "start",
                alignItems: "center"
            }}>
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
                <Box style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: "5px",
                    position: "absolute",
                    bottom: "55px",
                    zIndex: showMainMenu ? 1 : 0
                }}>
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
            <Box sx={{
                height: height,
                width: width,
                backgroundColor: "rgba(255,255,255, 0.5)",
                backdropFilter: "blur(2px)",
                zIndex: "9999",
                position: "fixed",
                marginLeft: "-13px",
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
                <Stack flexDirection="row" gap="2rem">
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
        )
    }

    const handleCloseBot = (e) => {
        e.preventDefault();
        resetNotificationCount();
        setShowMainMenu(false);
        resetCalendarState();
        dispatch(displayChatComponent(false));
    }

    const handleToggleWidth = () => {
        const currentWidth = chatContainerRef.current.offsetWidth;
        const newWidth = Math.round(currentWidth) === 400 ? '67vw' : widgetStyles.width;
        if (newWidth === "67vw") {
            setIsToggleWidth(true);
        } else {
            setIsToggleWidth(false);
        }
        setWidth(newWidth);
    };
    const handleMinimize = () => {
        const currentHeight = chatMessagesRef.current.offsetHeight;
        const newHeight = Math.round(currentHeight) === 520 ? 0 : widgetStyles.containerHeight;
        if (newHeight === 0) {
            setTimeout(() => {
                setIsMinimized(true);
            }, 300)
            setHeight(newHeight);
        } else {
            resetNotificationCount();
            setIsMinimized(false);
            setTimeout(() => {
                setHeight(newHeight);
            }, 100)
        }
    };

    let headerBGColor = theme.palette.background.paper;
    return (
        <Box sx={{display: 'flex', width: width}} className={classes.chatContainer} ref={chatContainerRef}>
            {botReadyToDisplay ? (
                <Main theme={theme} open={openChatDrawer}>
                    <Grid container>
                        <Grid item xs={12} md={emailDetails ? 8 : 12} xl={emailDetails ? 9 : 12}>
                            <MainCard
                                content={false}
                                sx={{
                                    bgcolor: theme.palette.mode === 'dark' ? 'dark.main' : 'grey.50',
                                    pt: 2,
                                    pl: 2,
                                    borderRadius: '10px'
                                }}
                            >
                                <Grid container spacing={3}>
                                    <Grid
                                        item
                                        xs={12}
                                        sx={{
                                            bgcolor: botUserInfo?.botColor || headerBGColor,
                                            paddingBottom: '8px',
                                            paddingTop: "20px !important",
                                            borderBottom: `1px solid ${theme.palette.divider}`
                                        }}
                                    >
                                        <Grid container justifyContent="space-between">
                                            <Grid item>
                                                <Stack direction="row" alignItems="center" spacing={1}
                                                       sx={{position: 'relative'}}>
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
                                                                            color: botUserInfo?.botHeaderTextColor ||  theme.palette.background.paper,
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
                                                                                <Typography
                                                                                    variant="h5">{botUserInfo?.betaTitle}</Typography>
                                                                            </Stack>
                                                                            <CardContent sx={{p: 0}}>
                                                                                <Typography
                                                                                    dangerouslySetInnerHTML={{__html: botUserInfo?.betaContent}}/>
                                                                            </CardContent>
                                                                        </MainCard>
                                                                    </Popper>
                                                                </Box>
                                                                <Box>
                                                                    {notificationCount > 0 && isMinimized &&
                                                                        <NotificationBadge count={notificationCount}/>}
                                                                </Box>
                                                            </Stack>
                                                            <Typography variant="caption" color="textSecondary">
                                                                Active now
                                                            </Typography>
                                                        </Stack>
                                                    </ClickAwayListener>
                                                </Stack>
                                            </Grid>
                                            <Grid item paddingRight="10px">
                                                <Stack direction="row" alignItems="center" justifyContent="flex-end"
                                                       spacing={1}>
                                                    {/*<IconButton sx={{padding: "0px", marginLeft: "0px !important", width: "22px !important"}}*/}
                                                    {/*            onClick={handleMinimize}>*/}
                                                    {/*  <GoKebabHorizontal style={{*/}
                                                    {/*    width: "30px",*/}
                                                    {/*    height: "30px",*/}
                                                    {/*    transform: "rotate(270deg)",*/}
                                                    {/*    strokeWidth: "inherit",*/}
                                                    {/*    color: theme.palette.primary.contrastText*/}
                                                    {/*  }}/>*/}
                                                    {/*</IconButton>*/}
                                                    <IconButton sx={{
                                                        padding: "2px",
                                                        marginLeft: "0px !important",
                                                        pointerEvents: showCalendar ? "none" : "auto"
                                                    }}
                                                                onClick={handleMinimize}>
                                                        <MdOutlineMinimize style={{
                                                            width: "30px",
                                                            height: "28px",
                                                            color: theme.palette.primary.contrastText,
                                                            marginBottom: "1rem"
                                                        }}/>
                                                    </IconButton>

                                                    {botUserInfo?.wideScreen === "enable" && <IconButton sx={{
                                                        padding: "2px",
                                                        marginLeft: "0px !important",
                                                        pointerEvents: showCalendar ? "none" : "auto"
                                                    }}
                                                                                                         onClick={handleToggleWidth}>
                                                        {width === widgetStyles.width ? <BsBoxArrowInLeft
                                                                style={{
                                                                    width: "28px",
                                                                    height: "24px",
                                                                    color: theme.palette.primary.contrastText
                                                                }}/> :
                                                            <BsBoxArrowInRight
                                                                style={{
                                                                    width: "28px",
                                                                    height: "24px",
                                                                    color: theme.palette.primary.contrastText
                                                                }}/>}
                                                    </IconButton>}


                                                    <IconButton sx={{
                                                        padding: "2px",
                                                        marginLeft: "0px !important",
                                                        pointerEvents: showCalendar ? "none" : "auto"
                                                    }}
                                                                onClick={handleCloseBot}>
                                                        <MdOutlineClose
                                                            style={{
                                                                width: "28px",
                                                                height: "24px",
                                                                color: theme.palette.primary.contrastText
                                                            }}/>
                                                    </IconButton>

                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid sx={{height: height, display: isMinimized ? "none" : "flex"}}
                                          className={classes.chatContent}
                                          container marginLeft="20px" ref={chatMessagesRef}>
                                        <Grid item xs={12} paddingTop="0px !important">
                                            <SimpleBar
                                                sx={{
                                                    overflowX: 'hidden',
                                                    height: widgetStyles.height ? widgetStyles.height : 'calc(100vh - 280px)'
                                                }}
                                            >
                                                <Box sx={{pl: 1, pr: 3, mb: 3}}>
                                                    <ChatMessages theme={theme} handleUserBtnInput={handleUserBtnInput}
                                                                  user={botUserInfo}
                                                                  data={conversationData}
                                                                  wideScreenMode={isToggleWidth}/>

                                                </Box>
                                            </SimpleBar>
                                        </Grid>
                                        {
                                            showCalendar && displayAppointmentCalendar()
                                        }

                                        <Grid item sx={{
                                            paddingTop: "0 !important",
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-left",
                                            rowGap: "10px",
                                            marginBottom: "1rem",
                                            position: "relative"
                                        }}>
                                            {DisplayUploadedFileInfoComponent()}
                                            {showMainMenu && displayHighlightedMainMenu()}
                                            {toolTip && (
                                                <Box sx={{
                                                    backgroundColor: '#888',
                                                    mr: 2,
                                                    p: 1,
                                                    borderRadius: '22px 22px 0 0'
                                                }}>
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
                                                <Box ref={commandAnchorRef}
                                                     sx={{width: '100%', display: 'flex', alignItems: 'center'}}>
                                                    <Grid item style={{padding: "0px 5px"}}>
                                                        <label style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            cursor: "pointer",
                                                            padding: 0,
                                                            margin: 0
                                                        }} htmlFor={"fileUpload"}>
                                                            <AttachFileIcon sx={{
                                                                color: !responseLoading ? theme.palette.secondary.main : theme.palette.primary.main,
                                                                padding: 0,
                                                                margin: 0
                                                            }}/>
                                                        </label>
                                                        <input onChange={(e) => handleFileUpload(e)}
                                                               accept="application/pdf" onClick={(event) => {
                                                            event.target.value = null;
                                                        }} style={{opacity: 0, position: "absolute", zIndex: -1}}
                                                               type={"file"} id={"fileUpload"}
                                                               disabled={!responseLoading}/>
                                                    </Grid>
                                                    <Grid item xs="auto" container direction="row" alignItems="center">
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
                                                                            <IconButton onClick={handleImageUpload}
                                                                                        disabled={isCommandMode}>
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
                                                                    <Paper elevation={2}
                                                                           sx={{backgroundColor: 'grey.100'}}>
                                                                        <List>
                                                                            {allCommands.map((command, index) => (
                                                                                <ListItemButton
                                                                                    key={index}
                                                                                    onClick={() => {
                                                                                        handleCommandSelect(command);
                                                                                    }}
                                                                                >
                                                                                    <Stack>
                                                                                        <Box sx={{
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '4px'
                                                                                        }}>
                                                                                            <Typography>{command.name}</Typography>
                                                                                            {command.action === 'prompt' && (
                                                                                                <Box
                                                                                                    sx={{
                                                                                                        backgroundColor: '#474747',
                                                                                                        borderRadius: '4px',
                                                                                                        padding: '2px 6px'
                                                                                                    }}
                                                                                                >
                                                                                                    <Typography
                                                                                                        sx={{color: '#FFF'}}>{command.action}</Typography>
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
                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: '4px'
                                                                                    }}>
                                                                                        <Typography>{command.name}</Typography>
                                                                                        {command.action === 'prompt' && (
                                                                                            <Box
                                                                                                sx={{
                                                                                                    backgroundColor: '#474747',
                                                                                                    borderRadius: '4px',
                                                                                                    padding: '2px 6px'
                                                                                                }}
                                                                                            >
                                                                                                <Typography
                                                                                                    sx={{color: '#FFF'}}>{command.action}</Typography>
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
                                                                    sx={{
                                                                        backgroundColor: '#FFF',
                                                                        borderRadius: '50%',
                                                                        width: '12px',
                                                                        height: '12px'
                                                                    }}
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
                                                                maxRows={2}
                                                                multiline
                                                                value={message}
                                                                onChange={handleMessageInput}
                                                                onFocus={handleFocusMessageInput}
                                                                onKeyDown={handleKeyDown}
                                                                disabled={!responseLoading || isDisabled}
                                                                placeholder="Type a message"
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
                                                </Box>
                                            </Paper>
                                            {characterLimitExceeded ?
                                                <Typography sx={{
                                                    textAlign: "center",
                                                    padding: " 2px 8px",
                                                    position: "absolute",
                                                    right: "6px",
                                                    borderRadius: "50px",
                                                    width: "100%",
                                                    bottom: "70px",
                                                    background: theme.palette.error.main,
                                                    color: theme.palette.primary.contrastText
                                                }}>{botUserInfo?.charLimit}</Typography> : ""}
                                        </Grid>
                                    </Grid>

                                </Grid>
                            </MainCard>
                        </Grid>
                    </Grid>
                </Main>
            ) : (
                <Grid container alignItems="center" justifyContent="center" style={{
                    height: widgetStyles.initialHeight ? widgetStyles.initialHeight : "100vh",
                    background: "#fff",
                    width: widgetStyles.width ? widgetStyles.width : "auto",
                    borderRadius: "10px"
                }}>
                    <Stack>
                        <img src={Rocket} alt="Rocket" width="200"/>
                        <Typography variant="h2" align="center">
                            Initializing...
                        </Typography>
                    </Stack>
                </Grid>
            )}
        </Box>
    )
};

GPTWidget.propTypes = {
    user: PropTypes.object,
    otherInfo: PropTypes.object,
};

GPTWidget.defaultProps = {
    user: {}, // default value for user
    otherInfo: {}, // default value for otherInfo
    customTheme: null // default value for customTheme
};

export default GPTWidget;
