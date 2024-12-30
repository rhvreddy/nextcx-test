import { Dialog, DialogTitle, DialogActions, DialogContent, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import {toast} from "react-toastify";

export default function GenericDefaultDialog({dialogState, successMessage, dialogTitle, setDialogState, inputFormat}){
  const [inputData, setInputData] = useState("")
  const [isErrorCase, setIsErrorCase] = useState(false);
  const [isApiRequest, setIsApiRequest] = useState(false);
  const handleClose = ()=>{
    setIsErrorCase(false)
    setDialogState(false);
  }

  const handleSubmit = ()=>{
    if(inputData) {
      setIsApiRequest(true);
      setIsErrorCase(false)
      setTimeout(() => {
        setDialogState(false);
        setIsApiRequest(false);
        toast.success(successMessage);
      }, 3000)
    }
    else{
      setIsErrorCase(true)
    }
  }
  return(
    <>
      <Dialog maxWidth style={{padding:"5px 10px"}} open={dialogState} onClose={handleClose}>
        {isApiRequest && <LinearProgress style={{width:"100%"}}/>}
        <DialogTitle id="alert-dialog-title">
          <h2 style={{margin:0,padding:0}}>{dialogTitle}</h2>
        </DialogTitle>
        <DialogContent style={{padding:"10px 25px",width:"80vw"}}>
          <TextField error={isErrorCase} style={{width:""}} placeholder={inputFormat}
                     fullWidth
                     multiline rows={10}
                     onChange={(e)=>setInputData(e.target.value)}
                     label=''/>
          {isErrorCase && <p style={{color:"red",fontSize:"15px"}}>configuration must be required</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button autoFocus onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
