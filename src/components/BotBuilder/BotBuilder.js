import React, { useEffect, useRef, useState } from 'react';
import {useSelector} from "react-redux"

// material-ui
import {
  Box,
  Stack,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid
} from '@mui/material';
// project import
import MainCard from 'components/MainCard';
import DynamicDataNavigation from 'components/DynamicDataNavigation/DynamicDataNavigation';
import NestedList from '../Nestedlist/Nestedlist';
import MemoryDialog from '../MemoryDialog/MemoryDialog';
import DialogueInfo from '../DialogueInfo/DialogueInfo';
import MessageInfo from '../MessageInfo/MessageInfo';
import AgGrid from '../AgGridComponent/AgGrid';
import { useNavigate } from 'react-router-dom';
import {CLIENT_ID} from '../../config'

// assets
import ActionInfo from '../ActionInfo/ActionInfo';
import { useLocation, useParams } from 'react-router-dom';
import { REACT_APP_APP_BACK_END_BASE_URL } from '../../config';
import axios from 'axios';
import AgGridComponent from '../AgGridComponent/AgGrid';
import JsonEditor from '../JsonEditor/JsonEditorMain';
import { initiateBotUpsert } from '../../store/reducers/chat';
import { openSnackbar } from '../../store/reducers/snackbar';
import { useDispatch } from 'react-redux';

const BotBuilder = () => {
  let { botRecordId } = useParams();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef(null);
  const navigate=useNavigate()
  const [active, setActive] = useState('');
  const [messageInfo, setMessageInfo] = useState('');
  const [rowData, setRowData] = useState([]);
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [entities, setEntities] = useState([]);
  const [entity, setEntity] = useState('');
  const [customEntity, setCustomEntity] = useState('');
  const [step, setStep] = useState('message');
  const [messageId, setMessageId] = useState('');
  const [advanceRenderedItems, setAdvanceRenderedItems] = useState('');
  const [open, setOpen] = useState(false);
  const [componentType, setComponentType] = useState(localStorage?.getItem("componentType") || 'dialogs');
  const [addJsonEditor, setAddJsonEditor] = useState(false);
  const location = useLocation();
  const [data, setData] = useState();
  const [botDetailObject, setBotDetailObject] = useState({});
  const [dialogs, setDialogs] = useState([]);
  const [selectedDialog, setSelectedDialog] = useState('');
  const [dialogName, setDialogName] = useState('');
  const [dialogId, setDialogId] = useState('');
  const [intentName, setIntentName] = useState('');
  const {user} = useSelector((state) => state.profile)

  const [columnDefs, setColumnDefs] = useState([]);
  let title=`BotId : ${botDetailObject["interpreterId"]} , Version - ${botDetailObject["versionNumber"]}`

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleStatus = (type) => {
    setComponentType(type);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const dialogClicked = (info) => {
    setMessageInfo('');
    setSelectedDialog(info);
    const found = dialogs.find((element) => element.dialogName === info);
    setData(found);
    setDialogName(found.dialogName);
    setDialogId(found.dialogId);
    setIntentName(found.intentName);
    setMessageInfo('');
  };

  function updateDialogInfo() {}

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddJsonEditor = (value) => {
    setAddJsonEditor(value);
  };

  const getUpdatedResponse = async (res) => {
    const userId = localStorage.getItem('userId');
    res.userId = userId;
    res.userName = user?.firstName+ " "+user?.lastName;
    res.businessId = localStorage.getItem('businessId');
    res.organizationId = localStorage.getItem('organizationId');
    res.clientId = CLIENT_ID
    const response = await dispatch(initiateBotUpsert(res));
    if (response?.status === 200 && response?.data) {
      snackbar('Successfully updated', 'success');
      navigate(`/bot-builder/bot-details/${response?.data.botRecordId}`)
      localStorage.setItem("componentType","config")
      window.location.reload()      
    } else {
      snackbar('Error while updating', 'error');
    }
    handleAddJsonEditor(false);
  };

  const snackbar = (text, status) => {
    dispatch(
      openSnackbar({
        open: true,
        message: text,
        variant: 'alert',
        alert: {
          color: status
        },
        close: false
      })
    );
  };

  const getDialogsData = () => {
    const config = {
      method: 'get',
      url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/get-bot-details/${botRecordId}`,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    axios(config)
      .then((res) => {
        let botDataObj = res.data.data[0];
        if (botDataObj) {
          setBotDetailObject(botDataObj);
          botDataObj.botDialogFlow?.dialogs ? setDialogs(botDataObj.botDialogFlow.dialogs) : setDialogs([]);
        }
        if (dialogs && dialogs.length > 0) {
          dialogClicked(dialogs[0].dialogName);
        }
        setActive('Message');
      })
      .catch((err) => {
        console.log('BotBuilder JS -> ', err);
      });
  };

  useEffect(() => {
    localStorage.removeItem("componentType")
    componentType !== 'webQa' && getDialogsData();
  }, [componentType]);

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (dialogs && dialogs?.length > 0) {
      setData(dialogs[0]);
    }
  }, [dialogs]);

  //This function identifies which item to show in  the step property
  const messageDisplay = (data) => {
    if (data === '2') {
      setMessageInfo('Question');
    } else if (data === '1') {
      setMessageInfo('Message');
    } else if (data === '3') {
      setMessageInfo('Action');
    } else {
      setMessageInfo(' ');
    }
  };

  //this function is to know on which tab we are in like flow or intent
  const stepProperties = (data) => {
    setStep(data);
  };

  //this function is to know about the  card action area clicked
  //is message action  or question
  const messageDetails = (data) => {
    setEntities(data?.entityNames);
    setMessage(data?.text);
    setMessageId(data?.stepId);
    setActionUrl(data?.text);
  };

  const advanceScreenData = (data) => {
    if (data) {
      setAdvanceRenderedItems(data);
    }
  };

  //this is for setting updated message
  // after edit
  const handleMessageUpdate = (x) => {
    alert('message update');
    let temp = data;
    setMessage(x);
    for (let index = 0; index < temp?.steps?.length; index++) {
      if (temp?.steps[index]?.stepId === messageId) {
        temp.steps[index].text = x;
      }
    }
    setData(temp);
  };

  // action url input to and from
  const handleActionUrl = (input) => {
    let temp = data;
    setActionUrl(input);
    for (let index = 0; index < temp?.steps?.length; index++) {
      if (temp?.steps[index]?.stepId === messageId) {
        temp.steps[index].url = input;
      }
    }
    setData(temp);
  };

  // set dialogue screen based on
  // navigation item selected like welcome or memory

  const dialogue = (data) => {
    setActive(data);
  };

  const handleEntity = (data) => {
    alert('delete entity');
    setEntity(data);
  };

  const AddCustomEntity = (data) => {
    alert('add entity');
    setCustomEntity(data);
    // setEntities((prev) => [
    //   ...prev, data
    // ]);
  };

  const addEntityFromStepProp = (data) => {
    setCustomEntity(data);
  };

  const displayComponent = (componentType) => {
    switch (componentType) {
      case 'webQa':
        return <AgGridComponent />;
      case 'config':
        return <JsonEditor title={title} data={botDetailObject} getResponse={getUpdatedResponse} />;
      default:
        return <></>;
    }
  };

  return (
    <>
      {isLoading ? (
        <Stack alignItems="center" height="100vh" justifyContent="center">
          <CircularProgress sx={{ width: '60px !important', height: '60px !important', mt: 1 }} color="primary" />
        </Stack>
      ) : (
        <Grid container spacing={1}>
          <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <Box sx={{ p: 1, py: 1.5 }}>
              <DialogTitle id="alert-dialog-title">Update</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  The edited information has been sent for training your Bot will be Updated Soon..
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button color="error" onClick={handleClose}>
                  Close
                </Button>
              </DialogActions>
            </Box>
          </Dialog>

          <Grid item xs={12} md={12} lg={12}>
            <Grid container>
              <Grid item xs={12}>
                <DynamicDataNavigation
                  updateDialogInfo={updateDialogInfo}
                  advanceScreenOutput={advanceRenderedItems}
                  selectedDialog={selectedDialog}
                  handleClickOpen={handleClickOpen}
                  componentType={componentType}
                  handleSettings={handleAddJsonEditor}
                  handleStatus={handleStatus}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            {componentType != 'dialogs' ? (
              displayComponent(componentType)
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <NestedList focusInput={focusInput} basicScreenData={dialogs} dialogClicked={dialogClicked} />

                  {/*<StaticSubBar showBar={dialogue}/>*/}
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  {/*<AgGridComponent/>*/}
                  {active === 'Message' && (
                    <DialogueInfo
                      data={data}
                      dialogName={dialogName}
                      dialogId={dialogId}
                      intentName={intentName}
                      messageId={messageId}
                      handleMessageUpdate={handleMessageUpdate}
                      focusInput={focusInput}
                      stepProperties={stepProperties}
                      messageDisplay={messageDisplay}
                      messageDetails={messageDetails}
                      advanceScreenData={advanceScreenData}
                      entity={entity}
                      handleEntity={handleEntity}
                      AddCustomEntity={AddCustomEntity}
                      customEntity={customEntity}
                      handleActionUrl={handleActionUrl}
                    />
                  )}
                  {active === 'Clear Memory' && <MemoryDialog />}
                </Grid>
                <Grid item xs={24} sm={6} md={3}>
                  {step === 'message' && (
                    <MainCard title="Step Properties">
                      {/*{messageInfo === "Question" && <QuestionInfo updateMessage={handleMessageUpdate} messageId={messageId} message={message}/>*/}
                      {/*}*/}
                      {messageInfo === 'Message' && (
                        <MessageInfo
                          data={data}
                          updateMessage={handleMessageUpdate}
                          messageId={messageId}
                          message={message}
                          entities={entities}
                          entity={entity}
                          customEntity={customEntity}
                          addEntityFromStepProp={addEntityFromStepProp}
                          handleEntity={handleEntity}
                        />
                      )}
                      {messageInfo === 'Action' && (
                        <ActionInfo actionUrl={actionUrl} handleActionUrl={handleActionUrl} handleMessageUpdate={handleMessageUpdate} />
                      )}
                    </MainCard>
                  )}
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default BotBuilder;
