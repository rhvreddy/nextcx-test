import {Alert, AlertTitle, Button, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {getUserInfo} from "../../store/reducers/profile";
import {useNavigate} from "react-router-dom";
import {Box} from "@mui/system";
import {REACT_APP_APP_BACK_END_BASE_URL} from "../../config";
import {toast} from "react-toastify";

export default function GoogleAuthorization(){
  const queryParams = new URLSearchParams(window.location.search);
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [isApiCalled, setIsApiCalled] = useState(false)
  const [apiResponse, setApiResponse] = useState({status:"",message:""})

  useEffect(()=>{
    const userId = localStorage.getItem("userId");
    if(userId && queryParams && queryParams.get("code")){
      saveGoogleAuthenticationInfo(queryParams.get("code"),userId);
    }
    else{
      setIsApiCalled(true);
    }
  },[])

  const saveGoogleAuthenticationInfo = async(authenticationCode, userId)=>{
    try {
      let res = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/calendar/save-google-tokens`, {
        code: authenticationCode,
        userId: userId
      });
      if(res) {
        setIsApiCalled(true);
        setApiResponse(res?.data)
      }
      if (res?.data?.status?.toLowerCase() === "success") {
        dispatch(getUserInfo(userId));
        toast.success("Google authentication successfully completed");
        navigate("/bot/wizard", {replace: true});
      } else {
        toast.error("Error occurred while performing google authentication.Please try again");
      }
    }
    catch(err){
      setIsApiCalled(true)
      setApiResponse(Object.assign(apiResponse,{status:"error",message:err?.message}))
    }
  }

  return(
    <>
      <Box style={{width:"100%",height:"100vh",display:"flex",justifyContent:"center",alignItems:"center"}}>

        { isApiCalled? apiResponse?.status?.toLowerCase() === "success" ? <Alert severity="success">
          <AlertTitle>Success</AlertTitle>
          Google authorization completed and your google calendar has been successfully integrated.
        </Alert>:
          <Stack gap={3}>
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              {apiResponse?.message || "Error occurred while integrating google calendar, please try again"}
            </Alert>
            <Button variant={"contained"} onClick={()=>navigate("/bot/wizard",{replace:true})}>Redirect to bot wizard</Button>
          </Stack>:
          <></>
        }
      </Box>
    </>
  )
}
