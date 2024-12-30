import PropTypes from 'prop-types';
import {useCallback, useEffect, useRef, useState} from 'react';

// material-ui
import {Button, Card, CardContent, Grid, Stack, TextField, Tooltip, Typography} from '@mui/material';

// project imports
import UserAvatar from '../../sections/apps/chat/UserAvatar';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import {Box} from "@mui/system";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useTheme} from '@mui/material/styles';
import * as React from 'react';
import Divider from '@mui/material/Divider';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import {FILE_UPLOAD_DEFAULT_MESSAGE, REACT_APP_APP_BACK_END_BASE_URL} from 'config';
import axios from "axios";
import {useSelector} from 'react-redux';
import Avatar from '../../components/@extended/Avatar';
import DescriptionIcon from '@mui/icons-material/Description';


const ChatMessages = ({data, theme, user, handleUserBtnInput, isEmptyInfo, wideScreenMode}) => {
  // scroll to bottom when new message is sent or received
  const wrapper = useRef(document.createElement('div'));
  const el = wrapper.current;
  const [open, setOpen] = React.useState(false);
  const [downClicked, setDownClicked] = useState(false)
  const [likedMessage, setLikedMessage] = useState([]);
  const [dislikeMessage, setDislikedMessage] = useState([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedInputs, setSelectedInputs] = useState([]);
  const [feedBackId, setFeedbackId] = useState("")
  const [feedType, setFeedType] = useState("")
  const [isError, setIsError] = useState(false);
  const profile = useSelector(state => state.profile)

  const handleClickOpen = (typeClick, transactionId, history, type) => {
    setIsError(false);
    if (typeClick === "downClicked") {
      setDownClicked(true);
      setDislikedMessage(prevDislikedMessage => [...prevDislikedMessage, transactionId]);
    } else {
      setDownClicked(false);
      setLikedMessage(prevLikedMessage => [...prevLikedMessage, transactionId]);
    }
    setSelectedTransactionId(transactionId);
    setOpen(true);
    setFeedType(type)
    handleFeedBackAPICall(history, type)
  };

  const handleClose = () => {
    setSelectedTransactionId(null);
    setOpen(false);
  };

  const handleAPICall = (req) => {
    if (feedbackText.trim().length === 0) {
      setIsError(true);
      return;
    }
    // Make the API call here
    let type = ""
    if (setDownClicked) {
      type = "disliked"
    } else {
      type = "liked"
    }
    handleClose();
    const config = {
      method: 'post',
      url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-widget-api/v0/nlu/bot-feedback`,
      data: {
        userInteractionId: req?.userInteractionId,
        conversationId: req?.conversationId,
        transactionId: req?.transactionId,
        interpreterId: req?.interpreter_id,
        userFeedback: feedType,
        additionalFeedback: feedbackText,
        feedbackId: feedBackId
      }
    };
    axios(config)
      .then((res) => {
      })
      .catch((err) => {
        console.log("err===>", err)
      })
    setFeedbackText('');
    setSelectedInputs([]);
  };

  const handleFeedBackAPICall = (req, type) => {
    // Make the API call here
    const config = {
      method: 'post',
      url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-widget-api/v0/nlu/bot-feedback`,
      data: {
        userInteractionId: req?.userInteractionId,
        conversationId: req?.conversationId,
        transactionId: req?.transactionId,
        interpreterId: req?.interpreter_id,
        userFeedback: type
      }
    };
    axios(config)
      .then((res) => {
        if (res?.data?.status?.toLowerCase() == "success") {
          setFeedbackId(res.data.feedbackId)
        }

      })
      .catch((err) => {
        console.log("err===>", err)
      })
  };

  const handleShowButtons = (history, i) => {
    return (
      <Grid item xs={12} paddingBottom="14px">
        <Grid container direction='column' spacing={1}>
          {
            history.buttons && history.buttons.map((button, index) => (
              (i === data?.length - 1) &&
              <Grid item key={index} width="100%">
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => handleSendBtnInput(button.title)}
                  sx={{
                    backgroundColor: button.bgcolor || '#F7F6F5',
                    width: "100%",
                    maxWidth: wideScreenMode ? "90%" : "85%",
                    border: user?.botButtonsColor ? ` 1px solid ${user?.botButtonsColor}` : '1px solid',
                    borderRadius: button.borderRadius || 20,
                    color: button.textColor || '#000000',
                    '&:hover': {
                      backgroundColor: user?.botButtonsColor || '#F7F6F5',
                      color: user?.userMsgBgColor ? '#FFFF' : '#000000'
                    },
                    textTransform: 'none'
                  }}
                >
                  {button.title}
                </Button>
              </Grid>
            ))
          }
          {/* Add more grid items for more buttons */}
        </Grid>
      </Grid>
    )
  }

  const scrollToBottom = useCallback(() => {
    el.scrollIntoView(false);
  }, [el]);

  const lastMessage = data[data.length - 1];
  const buttonsLength = lastMessage?.buttons?.length || 0;

  useEffect(() => {
    scrollToBottom();
  }, [data.length, buttonsLength, scrollToBottom]);

  const RequestedMessageComponent = ({history}) => {
    return (
      <Stack direction='row' justifyContent='flex-end' alignItems='flex-start'>

        <Card
          sx={{
            display: 'inline-block',
            float: 'left',
            bgcolor: user?.userMsgBgColor || theme.palette.primary.main,
            boxShadow: 'none',
            ml: 1,
            width: "max-content", maxWidth: "100%",
            borderRadius: "20px 0px 20px 20px"
          }}
        >

          <CardContent sx={{p: 1, pb: '8px !important', ml: 'auto'}}>
            <Grid container spacing={1}>
              {history?.isFileUploadEvent ?
                <Grid item xs={12} style={{display: "flex", alignItems: "center", columnGap: "5px"}}>
                  <DescriptionIcon style={{fontSize: "40px", color: theme.palette.grey[0]}}/>
                  <Stack style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <Tooltip title={history.uploadedFileName}>
                      <Typography style={{
                        fontWeight: "600",
                        width: wideScreenMode ? 'max-content' : "300px",
                        maxWidth: wideScreenMode ? '350px' : "146px",
                        whiteSpace: 'nowrap',
                        overflowX: 'hidden',
                        textOverflow: 'ellipsis'
                      }} variant='h6' color={theme.palette.grey[0]}
                                  dangerouslySetInnerHTML={{__html: history.uploadedFileName}}>

                      </Typography>
                    </Tooltip>
                    <Typography sx={{fontWeight: "200"}} variant='h6' color={theme.palette.grey[0]}>PDF</Typography>
                  </Stack>
                </Grid> :
                <Grid item xs={12} sx={{wordWrap:"break-word"}}>
                  <Typography variant='h6' color={theme.palette.grey[0]}
                              dangerouslySetInnerHTML={{__html: history.text}}>
                  </Typography>
                </Grid>}
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    )
  }

  const handleSendBtnInput = (input) => {
    handleUserBtnInput(input);
  };

  const userFeedBackDialog = () => {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        maxWidth="lg"
        sx={{zIndex: 99999999}}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Set the background color of the backdrop to a semi-transparent color
          },
        }}
      >
        <DialogTitle id="responsive-dialog-title" style={{display: 'flex', alignItems: 'center'}}>
          {downClicked && <ThumbDownAltIcon/>}
          {!downClicked && <ThumbUpAltIcon/>}
          <span style={{marginLeft: '0.5rem'}}>Provide additional feedback</span>
        </DialogTitle>
        <Divider style={{backgroundColor: '#0000002e', height: 3}}/>
        <DialogContent>
          <TextField

            sx={{width: "42rem"}}
            id="outlined-multiline-static"
            error={isError}
            className={isError ? 'error-textfield' : ''}
            fullWidth
            multiline
            rows={5}
            value={feedbackText}
            label={"Tell Us about the response"}
            InputLabelProps={{style: {lineHeight: '1rem'}}}
            onChange={(event) => setFeedbackText(event.target.value)}
          />
          <DialogContentText>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => {
            handleAPICall(history)
          }} autoFocus>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const userMessages = (history, i) => {
    return (
      <Stack paddingTop="10px" style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        columnGap: "5px",
        justifyContent: "flex-end"
      }}>
        <Grid container spacing={1} justifyContent='flex-end' style={{paddingTop: "5px"}}>
          <Grid item xs={2} md={3} xl={4}/>

          <Grid item xs={10} md={9} xl={8}>
            {(history?.isFileUploadEvent) ?
              <Box style={{width: "100%", display: "flex", flexDirection: "column", rowGap: "5px"}}>
                <RequestedMessageComponent history={history}/>
                {(history?.text && history?.text != FILE_UPLOAD_DEFAULT_MESSAGE) ?
                  <RequestedMessageComponent history={{...history, isFileUploadEvent: false}}/> : <></>}
              </Box> :
              <RequestedMessageComponent history={history}/>
            }
          </Grid>
          <Grid item xs={12}>
            <Typography align='right' variant='subtitle2' color='textSecondary'>
              {history.time}
            </Typography>
          </Grid>
        </Grid>
        {
          profile?.user?.userAvatar ?
            <Avatar alt="Avatar 1" src={profile?.user?.userAvatar} sx={{border: "1px solid #80808059"}}
                    size='md'/> : <UserAvatar user={{
              online_status: 'available',
              avatar: 'avatar-1.png',
              showInitials: "true",
              name: history?.from,
              border: "1px solid #80808059"
            }}/>
        }
      </Stack>
    );
  }

  const botMessages = (history, i) => {
    return (
      <Stack direction='row' paddingTop="10px" spacing={1.25} alignItems='flext-start'>
        {history.isMultiResponse ?
          <UserAvatar avatarCustomStyles={{opacity: 0}} user={{avatar: user.avatar, name: user.name}}
                      sx={{border: "1px solid "}}/> :
          <UserAvatar user={{avatar: user.avatar, name: user.name}} sx={{border: "1px solid "}}/>
        }
        <Grid container style={{width: "80%"}}>
          <Grid item xs={12} sm={12} sx={{display: "flex", flexDirection: "row"}}>
            <Card
              sx={{
                display: 'inline-block',
                float: 'left',
                bgcolor: (history?.type === "loading") ? "transparent" : (user?.botMsgBgColor || "#8080801f"),
                boxShadow: 'none',
                borderRadius: "0px 20px 20px 20px"
              }}
            >
              <CardContent sx={{p: 1, pb: '8px !important'}}>
                <Grid container spacing={1}>
                  <Grid item xs={12} paddingTop="0px !important">
                    <Typography variant='h6' color='textPrimary'
                                dangerouslySetInnerHTML={{__html: history.text}}>
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            {user?.showMessageFeedback === "enable" &&
              <>
                {
                  history?.responseType == "firstResponse" && !likedMessage.includes(history?.transactionId) && !dislikeMessage.includes(history?.transactionId) &&
                  <>
                    <>
                      <Stack direction="row" spacing={1} sx={{
                        "justifyContent": "start",
                        "alignItems": "start"
                      }}>
                        <Button
                          onClick={() => {
                            handleClickOpen("upClick", history?.transactionId, history, "liked")
                          }}
                          sx={{
                            p: 0,
                            minWidth: 0,
                            color: 'grey',
                            fontSize: '12px',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              color: 'grey',
                            },
                          }}
                        >
                          <ThumbUpOutlinedIcon sx={{fontSize: '19px'}}/>
                        </Button>
                        <Button
                          onClick={() => {
                            handleClickOpen("downClicked", history?.transactionId, history, "disliked")
                          }}
                          sx={{
                            p: 0,
                            minWidth: 0,
                            color: 'grey',
                            fontSize: '12px',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              color: 'grey',
                            },
                          }}
                        >
                          <ThumbDownOutlinedIcon sx={{fontSize: '19px'}}/>
                        </Button>
                      </Stack>
                    </>
                  </>
                }
                {open && selectedTransactionId === history?.transactionId && userFeedBackDialog()}
                {
                  history?.responseType == "firstResponse" && likedMessage.includes(history?.transactionId) &&
                  <>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                      <Button
                        sx={{
                          p: 0,
                          minWidth: 0,
                          color: 'grey',
                          fontSize: '12px',
                          '&:hover': {
                            backgroundColor: 'transparent',
                            color: 'grey',
                          },
                        }}
                      >

                        <ThumbUpAltIcon sx={{fontSize: '19px'}}/>
                      </Button>
                      <Box sx={{width: 8}}/>
                    </Box>
                  </>
                }
                {
                  history?.responseType == "firstResponse" && dislikeMessage.includes(history?.transactionId) &&
                  <>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                      <Button
                        sx={{
                          p: 0,
                          minWidth: 0,
                          color: 'grey',
                          fontSize: '12px',
                          '&:hover': {
                            backgroundColor: 'transparent',
                            color: 'grey',
                          },
                        }}
                      >
                        <ThumbDownAltIcon sx={{fontSize: '19px'}}/>
                      </Button>
                      <Box sx={{width: 8}}/>
                    </Box>
                  </>
                }
              </>
            }
          </Grid>
          <Grid item xs={12} sx={{mt: 1}}>
            <Typography align='left' variant='subtitle2' color='textSecondary'>
              {history.time}
            </Typography>
          </Grid>
          {/* Add this grid item for the buttons */}
          {handleShowButtons(history, i)}
        </Grid>
      </Stack>
    );
  }

  return (
    <Grid container spacing={2.5} ref={wrapper}>
      {isEmptyInfo ? <Grid xs={12} sx={{position: "absolute", bottom: "50%", left: "40%"}}><Typography color="secondary"
                                                                                                       fontWeight="bold"
                                                                                                       fontSize="16px">Chat
        not initiated yet</Typography></Grid> : (data.map((history, i) => {
        return (
          <Grid item xs={12} key={i}>
            {history.from !== user.name ? userMessages(history, i) : botMessages(history, i)}
          </Grid>
        );
      }))}

    </Grid>
  );
};

ChatMessages.propTypes = {
  data: PropTypes.array,
  theme: PropTypes.object,
  user: PropTypes.object
};

export default ChatMessages;
