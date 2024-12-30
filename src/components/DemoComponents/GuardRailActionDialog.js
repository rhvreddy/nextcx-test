import React, { useEffect, useState } from 'react';
import {
  fetchBotGuardRails,
  updateBotGuardRails
} from '../../store/reducers/botRecords';
import {
  Accordion, AccordionDetails,
  AccordionSummary,
  Alert, Box, Button,
  Grid, Stack,
  Tooltip,
  Typography
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import {toast} from 'react-toastify';
import {useDispatch, useSelector} from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';

export default function GuardRailActionDialog({openDialog, setOpenDialog, selectedBotInfo, setSelectedBotInfo, defaultGuardRails, requestAllBotRecords}){

  const [open, setOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  const [isErrorCase, setIsErrorCase] = useState(false);
  const [isApiCalled, setIsApiCalled] = useState(false);
  const [currentBotInfo, setCurrentBotInfo] = useState({});
  const [categorizedGuardRails, setCategorizedGaurdRails] = useState([])
  const [initialCategorizedGuardRails, setInitialCategorizedGuardRails] = useState([])
  const [enableSubmitButton, setEnableSubmitButton] = useState(false);
  const [currentBotGuardRails, setCurrentBotGuardRails] = useState([]);
  const [disablePointerEvents, setDisablePointerEvents] = useState(false);
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state.profile)
  const pathParams = useParams();
  const theme = useTheme();
  const userId = localStorage.getItem("userId");

  useEffect(()=>{
    try {
      if(selectedBotInfo && selectedBotInfo?.botRecordId) {
        const botInfo = selectedBotInfo;
        setCurrentBotInfo(botInfo);
        fetchBotGuardRailsData({ userId: userId, botRecordId: botInfo?.botRecordId });
      }
    }
    catch(err){
      toast.error(err?.message)
    }

  },[selectedBotInfo])

  useEffect(() => {
    if(openDialog) {
      setTimeout(() => {
        setOpen(openDialog);
      }, 500)
    }
  }, [openDialog]);


  useEffect(() => {
    let filteredGuardRails = [];
    let initialBotGuardRails = {};
    let botGuardRails = {};
    currentBotGuardRails?.map((guardRailName)=>{
      if(guardRailName){
        botGuardRails[guardRailName] = 1;
      }
    })
    defaultGuardRails?.map((guardRail)=>{
      if(guardRail?.name && botGuardRails[guardRail?.name]){
        filteredGuardRails.push({...guardRail, isAdded:"Y"})
        initialBotGuardRails[guardRail?.name] = "Y";
      }
      else{
        filteredGuardRails.push(guardRail);
        initialBotGuardRails[guardRail?.name] = "N";
      }
    })
    setCategorizedGaurdRails(filteredGuardRails);
    setInitialCategorizedGuardRails(initialBotGuardRails);
  }, [currentBotGuardRails, defaultGuardRails]);

  const fetchBotGuardRailsData = (payload)=>{
    dispatch(fetchBotGuardRails(payload)).then((action)=>{
      if(action?.error){
        toast.error(action?.payload?.message)
      }
      else{
        setCurrentBotGuardRails(action?.payload?.guardRails)
      }
    }).catch((err)=>{
      toast.error(err?.message)
    })
  }
  const setResponse = (response, isError)=>{
    setApiResponse(response);
    setIsErrorCase(isError)
  }

  const handleGuardRailModification = ()=>{
    setIsApiCalled(true);
    let addedGuardRails = [], removedGuardRails = [];
    categorizedGuardRails.map((guardRail)=>{
      if(guardRail?.isAdded && (guardRail?.isAdded !== initialCategorizedGuardRails[guardRail?.name])) {
        if (guardRail?.isAdded === "Y") {
          addedGuardRails.push(guardRail);
        } else {
          removedGuardRails.push(guardRail);
        }
      }
    })
    const userData = userInfo?.user ? userInfo?.user : {};

    dispatch(updateBotGuardRails({userId: userId, botRecordId: currentBotInfo?.botRecordId, addedGuardRails:addedGuardRails, removedGuardRails:removedGuardRails, sourcePage:"guard-rail",userName: userData?.firstName + " " + userData?.lastName,interpreterId:currentBotInfo?.interpreterId}))
      .then((action)=>{
        if(action?.error){
          setResponse(action?.payload?.message,true)
        }
        else{
          setDisablePointerEvents(true);
          toast.success( action?.payload?.message);
          requestAllBotRecords();
          handleCloseDialog();
        }
      })
      .catch((err)=>{
        setResponse(err?.message,true)
      }).finally(()=>{
      setIsApiCalled(false);
    })
  }

  const compareTwoObjects = (obj1,obj2)=>{
    for(let entry of Object.entries(obj1)){
      let k=entry[0], value=entry[1]
      if(!(obj2[k] && obj2[k]==value)){
        return false;
      }
    }
    for(let entry of Object.entries(obj2)){
      let k=entry[0], value=entry[1]
      if(!(obj1[k] && obj1[k]==value)){
        return false;
      }
    }
    return true;
  }

  const modifyAndCompareGuardRails = (guardRails)=>{
    setCategorizedGaurdRails(guardRails);
    let newBotGuardRails = {};
    guardRails.map((guardRail)=>{
      if(guardRail?.isAdded === "Y"){
        newBotGuardRails[guardRail?.name] = "Y";
      }
      else{
        newBotGuardRails[guardRail?.name] = "N";
      }
    })
    if(!compareTwoObjects(newBotGuardRails, initialCategorizedGuardRails)){
      setEnableSubmitButton(true);
    }
    else{
      setEnableSubmitButton(false);
    }
  }
  const addGuardRailToBot = (guardRailInfo) =>{
    let currentGuardRails = JSON.parse(JSON.stringify(categorizedGuardRails));
    currentGuardRails.map((guardRail)=>{
      if(guardRail?.name === guardRailInfo?.name){
        guardRail["isAdded"] = "Y";
      }
    })
    modifyAndCompareGuardRails(currentGuardRails);
  }

  const removeGuardRailFromBot = (guardRailInfo) =>{
    let currentGuardRails = JSON.parse(JSON.stringify(categorizedGuardRails));
    currentGuardRails.map((guardRail)=>{
      if(guardRail?.name === guardRailInfo?.name && guardRail["isAdded"]){
        guardRail["isAdded"] = "N"
      }
    })
    modifyAndCompareGuardRails(currentGuardRails);
  }

  const handleCloseDialog = ()=>{
    setOpenDialog(false);
    setOpen(false);
    setResponse("",false);
    setCategorizedGaurdRails([]);
    setInitialCategorizedGuardRails([]);
    setCurrentBotInfo({});
    setSelectedBotInfo({});
    setCurrentBotGuardRails([]);
    setEnableSubmitButton(false);
    setDisablePointerEvents(false);
  }


  return(
    <>
      <Dialog
        fullWidth
        open={open}
      >
        <DialogTitle>
          {isApiCalled && <LinearProgress style={{width:"100%"}}/>}
          <Box style={{padding:"5px 10px", width:"100%",display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
            <h2 style={{margin:0,padding:0}}>Guard Rails : {currentBotInfo?.interpreterId || ""} <span style={{fontWeight:"initial",fontSize:"15px"}}>(v {currentBotInfo?.versionNumber?currentBotInfo?.versionNumber:""})</span></h2>
            <CloseIcon onClick={handleCloseDialog} style={{cursor:"pointer"}} fontSize={"medium"}/>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container style={{display:"flex", flexDirection:"column", rowGap:"10px", columnGap:"10px", flexWrap:"wrap",padding:"5px 10px"}}>
            {
              categorizedGuardRails?.map((guardRailInfo)=>{
                return (
                  <Accordion style={{borderRadius:"10px",width: "100%", border:`1px solid #00000122`}}>
                    <AccordionSummary style={{border:`1px solid ${guardRailInfo?.isAdded?guardRailInfo?.isAdded === "Y"?"#52C41A":"#FF4D4F":"#aaa"}`,borderRadius:"10px",display:"flex",alignItems:"center",columnGap:"10px",padding:"5px 10px"}}>
                      <Stack style={{width:"100%",display:"flex",flexDirection:"column",alignItems:"flex-start",rowGap:"5px"}}>
                        <Grid item style={{width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", border:`1px solid transparent`, borderRadius:"5px", boxShadow:`0px 0px 2px transparent`}}>
                          <Tooltip title={guardRailInfo?.name}>
                            <Typography style={{fontWeight:"500",width:"80%",textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}}>{guardRailInfo?.name}</Typography>
                          </Tooltip>
                          {guardRailInfo?.isAdded === "Y"
                            ?<Button onClick={(e)=>{e.stopPropagation();removeGuardRailFromBot(guardRailInfo)}} style={{pointerEvents:(isApiCalled || disablePointerEvents)?"none":"auto", color:theme.palette.primary.main}}>Remove</Button>
                            :<Button onClick={(e)=>{e.stopPropagation();addGuardRailToBot(guardRailInfo)}} style={{pointerEvents:(isApiCalled || disablePointerEvents)?"none":"auto", color:theme.palette.primary.main}}>Add</Button>
                          }
                        </Grid>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      {guardRailInfo?.description || ""}
                    </AccordionDetails>
                  </Accordion>
                )
              })
            }
            <Grid item style={{width:"100%"}}>
              <Tooltip title={apiResponse}>
                {apiResponse && <Alert severity={isErrorCase?"error":"success"}>{apiResponse}</Alert>}
              </Tooltip>
            </Grid>
            <Grid item style={{width:"100%",display:"flex",justifyContent:"center"}}>
              {enableSubmitButton && <Button disabled={(isApiCalled || disablePointerEvents)} onClick={handleGuardRailModification} variant={"contained"}>submit</Button>}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}
