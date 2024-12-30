import PropTypes from 'prop-types';
import {forwardRef, useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import * as Icons from '@mui/icons-material'

// material-ui
import {useTheme} from '@mui/material/styles';
import { Avatar, Button, Chip, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
const useStyles = makeStyles(() => ({
  navItem: {
    position: 'relative',
    '&:hover $deleteButton': {
      opacity: 1,
    },
  },
  deleteButton: {
    minWidth: 'auto',
    padding: 0,
    zIndex: 1300,
    position: 'absolute',
    top: '50%',
    right: '5%',
    transform: 'translate(-5%, -50%)',
    opacity: 0,
    transition: 'opacity 0.2s'
  },
}));

// project import
import { activeItem } from 'store/reducers/menu';
import ChatWidget from "../../../../../pages/apps/chat-widget";
import {
  deleteConversationById,
  getChatBasicToken,
  getChatHistory, getHistoryByConversationId,
  renderChatContainer
} from '../../../../../store/reducers/chat';
import { DeleteOutline } from '@mui/icons-material';
import { openSnackbar } from '../../../../../store/reducers/snackbar';
import Loader from '../../../../../components/Loader/Loader';
import IconButton from '@mui/material/IconButton';
// ==============================|| NAVIGATION - LIST ITEM ||============================== //

const NavItem = ({ item, level }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const menu = useSelector((state) => state.menu);
  const { drawerOpen, openItem } = menu;
  let chatState = useSelector((state) => state.chat);
  const [isDisabled, setIsDisabled] = useState(false)
  const [itemToDelete, setItemToDelete] = useState("")
  const classes = useStyles()

  let itemTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  let listItemProps = {
    component: item?.url && forwardRef((props, ref) => {
      return <Link {...props} to={item.url} target={itemTarget} ref={ref} />;
    })
  };
  if (item?.external) {
    listItemProps = { component: 'a', href: item.url, target: itemTarget };
  }

  // const Icon = item.icon;
  // const itemIcon = item.icon ? <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} /> : false;
  const ItemComponent = Icons[item.icon]

  const isSelected = openItem.findIndex((id) => id === item.id) > -1;

  const { pathname } = useLocation();

  // active menu item on page load
  useEffect(() => {
    if (pathname.includes(item.url)) {
      localStorage.setItem('activeNavItem', item.id)
      dispatch(activeItem({ openItem: [item.id] }));
    }
    // eslint-disable-next-line
  }, [pathname]);

  useEffect(() => {
    if(chatState?.isResFetching){
      setIsDisabled(true)
    }else{
      setIsDisabled(false)
    }

  }, [chatState?.isResFetching])

  useEffect(() => {
    if (localStorage.getItem("activeNavItem") && localStorage.getItem("activeNavItem") !== "") {
      dispatch(activeItem({ openItem: [localStorage.getItem("activeNavItem")] }));
    }
  }, [])

  const textColor = theme.palette.mode === 'dark' ? 'grey.400' : 'text.primary';
  const iconSelectedColor = theme.palette.mode === 'dark' && drawerOpen ? 'text.primary' : 'primary.main';
  const handleNavItems = (item) => {
    dispatch(activeItem({ openItem: [item.id] }));
    dispatch(renderChatContainer({ value: true }))
    let clientId = "czIzLTMzNzgxMS05MTkyMjc2OTA1"
    localStorage.setItem("activeNavItem", item?.id)
    if (item.id !== "new-chat") {
      localStorage.setItem("conversationId", item?.id)
      let data = {
        interpreterId: localStorage.getItem('botId'),
        interactionId: localStorage.getItem('userId'),
        conversationId: localStorage.getItem('conversationId'),
        clientId: clientId,
        authKey: "SFlZSVlCSFNISlNESlNESks="
      }
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${chatState.bearerInfo.access_token}`
      };
      dispatch(getChatHistory(data, headers))
    } else {
      localStorage.setItem("is-new-chat", true)
      localStorage.removeItem("conversationId")
      let botInfo = {}
      botInfo.botId = localStorage.getItem('botId');
      botInfo.version = localStorage.getItem('versionNumber');
      botInfo.clientId = clientId
      let basicTokenInputObj = botInfo;
      dispatch(getChatBasicToken(basicTokenInputObj));
    }
  }

  const handleDeleteConversation = async (id) => {
    setItemToDelete(id)
    const payload = {conversationId: id}
    const deletedResult = await dispatch(deleteConversationById(payload))
    if(deleteConversationById.rejected.match(deletedResult)) {
      dispatch(
        openSnackbar({
          open: true,
          message: "Failed to delete conversation",
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    } else if(deleteConversationById.fulfilled.match(deletedResult)) {
      let clientId = "czIzLTMzNzgxMS05MTkyMjc2OTA1"
      let data = {
        interpreterId: localStorage.getItem('botId'),
        interactionId: localStorage.getItem('userId'),
        conversationId: deletedResult.payload.conversationId,
        clientId: clientId,
      }
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${chatState.bearerInfo.access_token}`
      };
      const fetchedMenuItems = await dispatch(getHistoryByConversationId({ data: data, headers: headers }))
      if(getHistoryByConversationId.fulfilled.match(fetchedMenuItems)) {
        if(fetchedMenuItems.payload.length > 0) {
          dispatch(activeItem({openItem: [fetchedMenuItems.payload[0]?._id]}))
          if(id === fetchedMenuItems.payload[0]?._id) dispatch(renderChatContainer({ value: true }))
          localStorage.setItem('activeNavItem', fetchedMenuItems.payload[0]?._id)
          localStorage.setItem("conversationId", fetchedMenuItems.payload[0]?._id)
          let data = {
            interpreterId: localStorage.getItem('botId'),
            interactionId: localStorage.getItem('userId'),
            conversationId: localStorage.getItem('conversationId'),
            clientId: clientId,
            authKey: "SFlZSVlCSFNISlNESlNESks="
          }
          const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${chatState.bearerInfo.access_token}`
          };
          dispatch(getChatHistory(data, headers))
        } else {
          dispatch(activeItem({openItem: ['new-chat']}))
          localStorage.setItem("is-new-chat", true)
          localStorage.removeItem("conversationId")
          let botInfo = {}
          botInfo.botId = localStorage.getItem('botId');
          botInfo.version = localStorage.getItem('versionNumber');
          botInfo.clientId = clientId
          let basicTokenInputObj = botInfo;
          dispatch(getChatBasicToken(basicTokenInputObj));
          dispatch(renderChatContainer({ value: true }))
        }
      } else if(getHistoryByConversationId.rejected.match(fetchedMenuItems)){
        dispatch(
          openSnackbar({
            open: true,
            message: "Could not fetch conversations",
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: false
          })
        );
      }
    }
  }

  return (
    <ListItemButton
      onClick={(e) => {
        if (item?.customNav === true) {
          handleNavItems(item)
        }
      }
      }
      className={classes.navItem}
      {...listItemProps}
      disabled={isDisabled }
      selected={isSelected}
      sx={{
        zIndex: 1201,
        pl: drawerOpen && !item?.customNav ? `${level * 28}px` : 1.5,
        py: !drawerOpen && level === 1 ? 1.25 : 1,
        ...(drawerOpen && {
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? 'divider' : 'primary.lighter'
          },
          '&.Mui-selected': {
            bgcolor: theme.palette.mode === 'dark' ? 'divider' : 'primary.lighter',
            borderRight: `2px solid ${theme.palette.primary.main}`,
            color: iconSelectedColor,
            '&:hover': {
              color: iconSelectedColor,
              bgcolor: theme.palette.mode === 'dark' ? 'divider' : 'primary.lighter'
            }
          }
        }),
        ...(!drawerOpen && {
          '&:hover': {
            bgcolor: 'transparent'
          },
          '&.Mui-selected': {
            '&:hover': {
              bgcolor: 'transparent'
            },
            bgcolor: 'transparent'
          }
        }),
        border: item?.customNav ? "1px solid #8080802b" : "none"
      }}
    >
      {ItemComponent && (
        <ListItemIcon
          sx={{
            minWidth: 28,
            color: isSelected ? iconSelectedColor : textColor,
            ...(!drawerOpen && {
              borderRadius: 1.5,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'secondary.light' : 'secondary.lighter'
              }
            }),
            ...(!drawerOpen &&
              isSelected && {
              bgcolor: theme.palette.mode === 'dark' ? 'primary.900' : 'primary.lighter',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'primary.darker' : 'primary.lighter'
              }
            })
          }}
        >
          <ItemComponent />
        </ListItemIcon>
      )}

      {(drawerOpen || (!drawerOpen && level !== 1)) && (
        <ListItemText
          primary={
            drawerOpen &&
            <Typography variant="h6" sx={{ color: isSelected ? iconSelectedColor : textColor }}>
              {item.title}
            </Typography>
          }
        />
      )}
      {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
        <Chip
          color={item.chip.color}
          variant={item.chip.variant}
          size={item.chip.size}
          label={item.chip.label}
          avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
        />
      )}
      {(chatState?.deleting && item?.id === itemToDelete && (item?.customNav && item?.id !== 'new-chat')) ? <Loader /> : ((item?.customNav && item?.id !== 'new-chat' && drawerOpen) &&
        (
          <IconButton
            aria-label={'delete'}
            className={classes.deleteButton}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteConversation(item?.id);
            }}
            sx={{ color: '#1890ff'}}
          >
            <DeleteOutline />
          </IconButton>
        )
      )}
    </ListItemButton>
  );
};

NavItem.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number
};

export default NavItem;
