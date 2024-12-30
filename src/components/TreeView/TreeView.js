import React, {Fragment, useEffect, useState} from 'react';
import {List, ListItem, Typography, ListItemText, Collapse} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {ChatBubbleOutline} from "@mui/icons-material";
import {dispatch, useSelector} from "../../store";
import {getSelectedConvId} from "../../store/reducers/chat";
import {useTheme} from "@mui/material/styles";

const TreeView = ({data}) => {
  const theme = useTheme();
  const [openIndex, setOpenIndex] = useState(-1);
  const [isResFetching, setIsResFetching] = useState(false)
  const chatState = useSelector((state) => state.chat);
  useEffect(() => {
    setOpenIndex(0)
  }, [])

  //Disabling items when bot response is loading
  useEffect(() => {
    if (chatState?.isResFetching) {
      setIsResFetching(true)
    } else {
      setIsResFetching(false)
    }
  }, [chatState?.isResFetching])

  const handleClickUserId = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };
  const handleClickConversationId = (conversationId, userId) => {
    dispatch(getSelectedConvId({isSelected: true, convId: conversationId, userBotId: userId}))
  }

  return (
    <List sx={{width: "100%", paddingTop: "0", pointerEvents: isResFetching ? 'none' : ''}}>
      {
        data?.map((item, index) =>
          <Fragment key={index}>
            <ListItem sx={{
              borderBottom: "1px solid #80808024",
              color: isResFetching ? "rgb(158 158 158)" : "inherit",
              paddingRight: "8px",
              paddingLeft: "8px"
            }}>
              {openIndex === index ? <ExpandMoreIcon onClick={() => handleClickUserId(index)} sx={{
                color: (item?.userInteractionId === localStorage.getItem("current_bot_user_id") ? theme.palette.primary.main : "inherit"), cursor: "pointer"
              }}/> : <ChevronRightIcon onClick={() => handleClickUserId(index)} sx={{
                color: item?.userInteractionId === localStorage.getItem("current_bot_user_id") ? theme.palette.primary.main : "inherit", cursor: "pointer"
              }}/>}
              <ListItemText primary={<Typography sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis"
              }}>{item.userInteractionId}</Typography>}/>
            </ListItem>
            <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{
                maxHeight: "230px", overflowY: "auto", overflowX: "hidden",borderBottom:"1px solid #80808024", barWidth: "thin",
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
                {item?.conversationIds?.map((conversationId, index) => (
                  <ListItem onClick={() => handleClickConversationId(conversationId, item?.userInteractionId)}
                            key={index} button sx={{
                    marginLeft: "16px",
                    border: "1px" +
                      " solid" +
                      " #80808024",
                    paddingLeft: "6px",
                    gap: "6px",
                    background: localStorage.getItem("current_convId") === conversationId ? theme.palette.primary.lighter : "inherit",
                    color: (conversationId === localStorage.getItem("current_convId") && !isResFetching) ? theme.palette.primary.main : (isResFetching ? "rgb(158 158 158)" : "inherit"),
                    "&:hover": {
                      background: theme.palette.primary.lighter
                    }
                  }}>
                    <ChatBubbleOutline/>
                    <ListItemText primary={<Typography sx={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis"
                    }}>{conversationId}</Typography>}/>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Fragment>
        )
      }
    </List>
  );
};

export default TreeView;
