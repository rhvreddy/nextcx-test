import {useSelector} from 'react-redux';

// material-ui
import {useMediaQuery, useTheme} from '@mui/material';

// project import
import SimpleBar from 'components/third-party/SimpleBar';
import DynamicNavigation from './DynamicNavigation';
import AllBotsNavbar from "../../../../pages/all-bots-chat-widget/all-bots-navbar";
import ChatBotAgentsNavbar from "../../../../pages/chat-bot-agents/ChatBotAgentsNavbar";
import {useEffect} from "react";
import {fetchAdminMenuItems, fetchMenuItems} from "../../../../store/reducers/menuItems";
import {dispatch} from "../../../../store";
import AdminNavbar from "../../../../pages/AdminNavbar";

// ==============================|| DRAWER CONTENT ||============================== //

const DynamicNavDrawerContent = (props) => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('lg'));
  const pathName = window.location.pathname
  const userDetails = useSelector((state) => state.profile);
  const menu = useSelector((state) => state.menu);
  const {drawerOpen} = menu;
  const userRoutes = ["/bot/wizard", "/apps/chat-widget", "/bot/model-upgrade", "/bot/multi-agent"];
  const adminRoutes = ["/admin","/admin/mult-agent","/admin/model-upgrade","/admin/guard-rails"]

  useEffect(() => {
    let isUserPathsExists = userRoutes.includes(pathName)
    let isAdminPathsExists = adminRoutes.includes(pathName)
    if (isUserPathsExists && (props?.menuItems?.[0]?.customNav || props?.menuItems?.length === 0)) {
      dispatch(fetchMenuItems(userDetails?.user))
    }else if(isAdminPathsExists && props?.menuItems?.[0]?.customNav){
      dispatch(fetchAdminMenuItems(userDetails?.user?.appRoles))
    }
  }, [props])
  const getSideNavBar = (pathName, props) => {
    switch (pathName) {
      case "/bot/wizard":
      case "/apps/chat-widget":
        return <DynamicNavigation/>
        break;
      case "/bot/universal-chat-console":
        return <AllBotsNavbar items={props}/>
        break;
      case pathName.includes("/bot/all-chatbot-agents") ? pathName : "/bot/all-chatbot-agents":
        return <ChatBotAgentsNavbar items={props}/>
        break;
      case pathName.includes("/admin") ? pathName : "/admin":
        return <AdminNavbar/>
      break
      default:
        return <DynamicNavigation/>
    }
  }
  return (
    <SimpleBar
      sx={{
        height: `100%`,
        borderTop: "1px solid #80808033",
        '& .simplebar-content': {
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {getSideNavBar(pathName, props)}
    </SimpleBar>
  );
};

export default DynamicNavDrawerContent;
