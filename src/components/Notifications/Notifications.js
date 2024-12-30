import React, {useState, useEffect, useRef, Fragment} from 'react';
import {
  Typography,
  Box,
  Stack,
  Popover,
  Badge,
  Paper,
  List,
  ListItem,
  Divider,
  Grid,
  IconButton
} from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import {dispatch, useSelector} from 'store';
import {triggerNotification, fetchNotifications, OnReadNotifications} from "../../store/reducers/chat";
import LogoIcon from "../logo/LogoIcon";
import {Close} from "@mui/icons-material";
import {toast} from "react-toastify";

export const formatTimeDifference = (commentedAt) => {
  const now = new Date();
  const commentedDate = new Date(commentedAt);
  const diffInSeconds = Math.floor((now - commentedDate) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 5) {
    return "Just now";
  } else if (diffInSeconds < 60) {
    return `${diffInSeconds} ${diffInSeconds === 1 ? 'second' : 'seconds'} ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hr' : 'hrs'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  }
};

const customBoxShadow = () => {
  return (
    <style>
      {`
        .css-16oh8wq-MuiPaper-root-MuiPopover-paper {
          box-shadow:0px 2px 7px 1px rgb(0 0 0.1);
        }
      `}
    </style>
  )
}

const Notifications = () => {
  const limit = 10;
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [notifyCount, setNotifyCount] = useState(0);
  const notifyList = useRef([]);
  const notificationIds = useRef([]);
  const [skip, setSkip] = useState(5);
  const [isScrolling, setIsScrolling] = useState(false);
  let chatState = useSelector(state => state.chat);
  const userId = localStorage.getItem("userId");

  const notificationIcons = {
    "botCreationSuccessful" : "https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/bot-creation-succesfull.png",
    "botCreationInProgress" : "https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/bot-creation-in-progress.png",
    "botCreationFailed" : "https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/bot-creation-failed.png",
    "botUpdated" : "https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/bot-updated.png",
    "botDeleted" : "https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/bot-deleted.png",
    "profileUpdate" : "https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/profile-update.png",
    "blogPost" : "https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/blog-post.png",
    "contactUpdate" : "https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/profile-update.png",
    "emailUpdate" : "https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/profile-update.png",
    "botPublish" : "https://d3dqyamsdzq0rr.cloudfront.net/nextcx-widget/chat/images/bot-publish.png"
  }

  //To fetch all the notifications
  useEffect(() => {
    getAllNotificationsByLimit();
  }, [])

  const getAllNotificationsByLimit = () => {
    const reqObject = {
      skip: 0,
      limit: limit,
    };
    fetchNotification(reqObject);
  }

  // Fetching notifications
  useEffect(() => {
    if (chatState?.isNotification?.isNotify) {
      getAllNotificationsByLimit();
      dispatch(triggerNotification({message: "", isNotify: false}));
    }
  }, [chatState?.isNotification?.isNotify])

  //Show all notifications history
  useEffect(() => {
    if (chatState?.allNotifications?.[0]?.data?.length > 0) {
      let list = [];
      if (chatState?.allNotifications?.[0]?.unReadCount > 0) {
        setNotifyCount(chatState?.allNotifications?.[0]?.unReadCount)
      }
      const notificationArray = JSON.parse(JSON.stringify(chatState?.allNotifications?.[0]?.data));
      list.push(...notificationArray);
      // chatState?.allNotifications?.[0]?.data?.map((history, index) => {
      //     if (history?.notificationHistory) {
      //       const notificationArray = JSON.parse(JSON.stringify(history?.notificationHistory));
      //       list.push(...notificationArray);
      //     }
      //   }
      // )
      if (isScrolling) {
        notifyList.current = [...notifyList.current, ...list];
      } else {
        notifyList.current = [...list];
      }
      setIsScrolling(false);
    } else {
      if (!isScrolling) {
        setNotifyCount(0);
        notifyList.current = [];
      }
      if (isScrolling) {
        toast.warning("You're all caught up!")
      }
    }
  }, [chatState?.allNotifications])

  //To fetch notifications
  const fetchNotification = async (payload) => {
    const id = userId;
    payload.id = id;
    await dispatch(fetchNotifications(payload));
  }

  const handleClick = async (event) => {
    setIsHighlighted(true);
    setAnchorEl(event.currentTarget);
    setNotifyCount(0)
    let payload = {
      userId: userId,
      state: "read",
    };
    await dispatch(OnReadNotifications(payload));
  };

  const handleClose = async () => {
    setAnchorEl(null);
    await resetNotificationCount(notificationIds.current);
  };

  //Reset notifications count to empty
  const resetNotificationCount = () => {
    setNotifyCount(0);
    notifyList.current = [];
    setIsScrolling(false);
    setIsHighlighted(false);
    setSkip(5);
    getAllNotificationsByLimit();
  }

  //Dynamically loading history
  const loadMoreNotifications = async (payload) => {
    setIsScrolling(true);
    await fetchNotification(payload);
  };

  //on scroll of history
  const handleScroll = (event) => {
    if (anchorEl !== null) {
      const maxScrollHeight = event.target.scrollHeight - event.target.clientHeight;
      const currentScrollPosition = event.target.scrollTop;
      if (Math.ceil(currentScrollPosition) >= maxScrollHeight && !isScrolling) {
        setSkip(skip + limit);
        const reqData = {
          skip: skip,
          limit: 10,
        }
        loadMoreNotifications(reqData);
      }
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <Stack sx={{color: '#262626'}}>
      <Badge badgeContent={notifyCount} color="error">
        <NotificationsNoneRoundedIcon sx={{cursor: "pointer", color: isHighlighted ? "primary.main" : "inherit"}}
                                      onClick={handleClick}/>
      </Badge>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper>
          <Box sx={{display:"flex",justifyContent:"space-between",alignItems:"center",padding: "8px 15px", borderTop: "1px" +
              " solid #8080802e"}}>
            <Typography variant="h4">Notifications</Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{borderRadius:"50%",color:"primary"}}
            >
              <Close style={{width:"22px",height:"22px"}}/>
            </IconButton>
          </Box>
          <Divider sx={{borderColor: "text.secondary"}}/>
          <Stack sx={{
            minHeight: "100px",
            // minWidth: "300px",
            width: "500px",
            maxHeight: "70vh",
            scrollbarWidth: "thin",
            overflow: "hidden auto",
            '::-webkit-scrollbar': {
              width: "4px",
            },
            '::-webkit-scrollbar-track': {
              background: "#f1f1f1",
            },
            '::-webkit-scrollbar-thumb': {
              background: "#888",
            }

          }}
                 onScroll={handleScroll}>
            {notifyList.current?.length > 0 ? notifyList.current.map((item, index) =>
              <Fragment key={index}>
                <List sx={{paddingTop: "2px", paddingBottom: "2px", display: "flex", flexDirection: "column"}}>
                  <ListItem sx={{gap: "16px", backgroundColor: item?.state === "Unread" ? "#EDE4FF" : "inherit"}}>
                    {item?.messageObj ?
                      <Box component="img" src={notificationIcons[item?.messageObj?.iconType]} alt="notification-icon"
                           width="50px"/> : <LogoIcon customWidth="50"/>}
                    <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 0.5}}>
                      <Typography variant="h5">
                        {item?.messageObj?.heading}
                      </Typography>
                      <Typography
                        sx={{
                            wordBreak: 'break-word'
                        }}
                        dangerouslySetInnerHTML={{__html: (item?.messageObj ? item?.messageObj?.message : item?.message)}}
                      />
                    </Box>
                    <Typography color="grey" textAlign="end" fontWeight="500" fontSize="12px" paddingRight="10px"
                                whiteSpace="nowrap">
                      {formatTimeDifference(item?.createdAt)}
                    </Typography>
                  </ListItem>
                </List>
                {index !== notifyList.current?.length - 1 && <Divider/>}
              </Fragment>
            ) : <Grid item xs={12} sx={{padding: "20px"}}>
              <Typography variant="h5" color="secondary">You have no new notification</Typography>
            </Grid>}
          </Stack>
        </Paper>
      </Popover>
      {customBoxShadow()}
    </Stack>
  );
};

export default Notifications;

