import {useState, useRef, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';


// material-ui
import {Grid} from '@mui/material';
import {EllipsisOutlined} from '@ant-design/icons';
import {
  EditOutlined,
  MoreOutlined,
  MessageOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import {
  Button,
  Fab,
  Tooltip,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  CardContent,
  Box,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Chip,
  Typography,
  DialogTitle, ListItemAvatar, Avatar, Dialog, CardActionArea
} from '@mui/material';
// project import
import MainCard from 'components/MainCard';
import DynamicDataNavigation from 'components/DynamicDataNavigation/DynamicDataNavigation'
import NestedList from '../Nestedlist/Nestedlist'
import StaticSubBar from '../StaticSubBar/StaticSubBar'
import DialogueInfo from '../DialogueInfo/DialogueInfo'
import MessageInfo from "../MessageInfo/MessageInfo";

// assets
import ActionInfo from "../ActionInfo/ActionInfo";

// ==============================|| LIST - NESTED ||============================== //


const DATA = [
  {
    id: "item-1",
    message: "I can help you with That",
    itemType: "Message",
    content:

      <>

        <Divider/>

      </>

  },
  {
    id: "item-9",
    message: "duplicate",
    itemType: "Message",
    content:

      <>
        <Divider/>

      </>

  },
  {
    id: "item-2",
    message: "Please provide me your case number",
    itemType: "Question",
    content: <>
      <Divider/>
    </>
  },
  {
    id: "item-3",
    message: " ",
    itemType: "Action",
    content:
      <>
        <Divider/>
      </>,
  }

];
const MemoryDialog = () => {
  const inputRef = useRef(null);
  const [data,setData]=useState(DATA);
  const [active, setActive] = useState('Message')
  const [messageInfo, setMessageInfo] = useState('')
  const [message, setMessage] = useState("")
  const [step,setStep]=useState("message")
  const [messageId,setMessageId]=useState("")


  const focusInput = () => {
    inputRef.current?.focus();
  };




  //This function identifies which item to show in  the step property
  const messageDisplay = (data) => {


    if (data == "2") {

      setMessageInfo("Question")
    } else if (data == "1") {
      setMessageInfo("Message")
    }  else if (data == "3") {
      setMessageInfo("Action")
    } else {
      setMessageInfo(" ")
    }
  }


  //this function is to know on which tab we are in like flow or intent
  const stepProperties=(data)=>{
    setStep(data)
  }

  //this function is to know about the  card action area clicked
  //is message action  or question
  const messageDetails = (data) => {
    setMessage(data.message)
    setMessageId(data.id)
  }




  //this is for setting updated message
  // after edit
  const handleMessageUpdate=(x)=>{
    let temp=data;
    setMessage(x)
    for (let index = 0; index < temp.length; index++) {
      if (temp[index].id === messageId) {
        temp[index].message = x
      }
    }
    setData(temp)
  }




  // set dialogue screen based on
  // navigation item selected like welcome or memory

  const dialogue = (data) => {
    setActive(data)
  };


  return (
    <Grid container spacing={1}>
      <Grid item xs={12} >
        <Grid container >
          <Grid item xs={12} >
            <DynamicDataNavigation />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} >
        <Grid container spacing={3}>
          <Grid item xs={3} >
            <NestedList focusInput={focusInput}/>
            <Grid item xs={12}>
              <StaticSubBar showBar={dialogue}/>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            {active === "Message" &&
              <DialogueInfo data={data} messageId={messageId} handleMessageUpdate={handleMessageUpdate} focusInput={focusInput} stepProperties={stepProperties} messageDisplay={messageDisplay} messageDetails={messageDetails}/>

            }
            {active === "Clear Memory" &&
              <MemoryDialog/>
            }
          </Grid>
          <Grid item xs={3} >
            {step==="message" &&
              <MainCard title="Step Properties">

                {messageInfo === "Question" && <QuestionInfo updateMessage={handleMessageUpdate} messageId={messageId} message={message}/>
                }
                {messageInfo === "Message" && <MessageInfo updateMessage={handleMessageUpdate} messageId={messageId} message={message}/>
                }
                {messageInfo && messageInfo === "Action" && <ActionInfo  message={message} handleMessageUpdate={handleMessageUpdate} />
                }
              </MainCard>
            }


          </Grid>

        </Grid>

      </Grid>
    </Grid>
  );
};

export default MemoryDialog;
