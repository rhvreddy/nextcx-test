import React, {useState, useEffect, useRef} from 'react';
import {Link as RouterLink} from 'react-router-dom';

// material-ui
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  Link,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography, MenuItem, Select, FormControl
} from '@mui/material';
import {FcGoogle} from "react-icons/fc"
import {makeStyles} from '@mui/styles';
import LinearProgress from '@mui/material/LinearProgress';


// third party
import * as Yup from 'yup';
import {Formik} from 'formik';

// project import
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import {EyeOutlined, EyeInvisibleOutlined} from '@ant-design/icons';
import jwt from "jsonwebtoken";
import axios from "axios";
import { CLIENT_ID, REACT_APP_APP_BACK_END_BASE_URL } from "../../../config";
import {useNavigate} from "react-router-dom";
import {autoBotCreation, login, loginUsingOtp, register} from '../../../store/reducers/profile';
import {useDispatch, useSelector} from 'react-redux';

import {useGoogleLogin} from '@react-oauth/google';



// ============================|| FIREBASE - LOGIN ||============================ //

var JWT_SECRET_KEY = 'LMS SECRET'
const AuthLogin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState('')
  const [googleSignInError, setGoogleSignInError] = useState("")
  const [otpSigninError, setOtpSigninError] = useState("");
  const [responseStateColor, setResponseStateColor] = useState("")
  const [resendButtonState, setResendButtonState] = useState(true)
  const [showOtpField, setShowOtpField] = useState(false);
  const [phoneLogin, setPhoneLogin] = useState(false)
  const [otp, setOtp] = useState("")
  const [formValues, setFormValues] = useState({})
  const [showProgress, setShowProgress] = useState(false)
  const SUCCESS_COLOR = "green";
  const ERROR_COLOR = "red";
  const DOWN_TIME_VALUE = 60;
  const [showOtp, setShowOtp] = useState(false);
  const [timerValue, setTimerValue] = useState(60);
  const useStyles = makeStyles((theme) => ({
    container: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap"
    },
    text: {
      color: "#fff",
      display: "flex",
      justifyContent: "flex-start",
      [theme.breakpoints.down("md")]: {
        justifyContent: "center"
      }
    },
    button: {
      display: "flex",
      justifyContent: "flex-end",
      [theme.breakpoints.down("md")]: {
        justifyContent: "center"
      }
    }
  }))
  const styles = useStyles()

  const setSessionData = (showOtpField, formValues) => {//This function is to store the user entered data in localStorage
    try {
      let sessionData = localStorage.getItem("loginFormData")
      if (sessionData) {
        const loginFormData = JSON.parse(localStorage.getItem("loginFormData"));
        if (showOtpField) {
          if(showOtpField === "false"){
            loginFormData["showOtpField"] = false
          }
          else {
            loginFormData["showOtpField"] = showOtpField
          }
        }
        if (formValues) {
          loginFormData["formValues"] = formValues
        }
        localStorage.setItem("loginFormData", JSON.stringify(loginFormData))
      }
    } catch (err) {
    }
  }

  useEffect(() => {
    /*const fetchData = async () => {
      try {
        let sessionData = localStorage.getItem("loginFormData");
        if (sessionData) {
          const loginFormData = JSON.parse(sessionData);
          if (loginFormData["showOtpField"]) {
            setResendButtonState(false);
            setTimerValue(0);
          }
          setShowOtpField(loginFormData["showOtpField"]);
          setFormValues(loginFormData["formValues"]);
        } else {
          localStorage.setItem("loginFormData", JSON.stringify({showOtpField: false, formValues: {email: ""}}));
        }
      } catch (e) {
        // Handle error
      }
    };*/
    //fetchData();
    return () => {
      localStorage.removeItem("loginFormData");
    };
  }, []);

  const handleClickShowOtp = () => {
    setShowOtp(!showOtp);
  };

  const handleMouseDownOtp = (event) => {
    event.preventDefault();
  };

  const startTimer = () => {
    let time = DOWN_TIME_VALUE;
    let timerInterval = setInterval(function () {
      if (time <= 0) {
        setResendButtonState(false)
        clearInterval(timerInterval)
      } else {
        time -= 1
        setTimerValue(time)
      }
    }, 1000)
  }

  const resendOtp = async (userObj) => {
    try {
      setShowProgress(true);
      setGoogleSignInError("");
      setOtpSigninError("");
      /*      const userData = {
              email: userObj?.email || "",
              isOtpSignin: "Y",
              clientId: CLIENT_ID
            }*/
      if(userObj["email"]){
        userObj["isOtpSignin"] = "Y"
      }
      const signedToken = jwt.sign(userObj, JWT_SECRET_KEY);
      const res = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/web/user/signin-v2`, {tokenInfo: signedToken});
      if (res) {
        setShowProgress(false)
      }
      if (res?.data?.status?.toLowerCase() === "success") {
        setShowOtpField(true)
        startTimer()
        setResendButtonState(true)
        setSessionData(true, "")
        setOtpSigninError(res?.data?.message || "")
        setResponseStateColor(SUCCESS_COLOR)
      } else {
        setOtpSigninError(res?.data?.message || "")
        setResponseStateColor(ERROR_COLOR)
      }
    } catch (err) {
      setShowProgress(false)
      setOtpSigninError(err?.message || "")
      setResponseStateColor(ERROR_COLOR)
    }
  }

  const verifyOtp = async () => {
    try {
      setShowProgress(true);
      setGoogleSignInError("")
      setOtpSigninError("")
      const userData = {
        clientId: CLIENT_ID,
        isSignin: "Y",
        otp: otp
      }
      if(formValues.email){
        userData["email"] = formValues?.email || "";
      }
      else{
        userData["phone"] = formValues?.phone;
        userData["countryCode"] = formValues?.countryCode;
      }
      const loginResult = await dispatch(loginUsingOtp(userData))
      if (loginResult) {
        setShowProgress(false)
      }
      if (loginUsingOtp.rejected.match(loginResult)) {
        setOtpSigninError(loginResult?.payload?.error || "")
        setResponseStateColor(ERROR_COLOR)
      } else if (loginUsingOtp.fulfilled.match(loginResult)) {
        setGoogleSignInError('')
      }
    } catch (err) {
      setShowProgress(false)
      setOtpSigninError(err?.message || "")
      setResponseStateColor(ERROR_COLOR)
    }
  }

  const automaticSignup = async(userProfileInfo) => {
    const userObj = {
      appName: "nextcx",
      company: "",
      email: userProfileInfo?.email,
      firstName: userProfileInfo?.given_name,
      lastName: userProfileInfo?.family_name || "",
      isGoogleSignin: "Y",
      first_login: "N",
      clientId: CLIENT_ID
    }
    setShowProgress(true);
    setGoogleSignInError("");
    setOtpSigninError("");
    const registerResult = await dispatch(register(userObj))
    if (register.rejected.match(registerResult)) {
      setShowProgress(false)
      setGoogleSignInError(registerResult?.payload?.error || "",)
    } else if (register.fulfilled.match(registerResult)) {
      let userId = registerResult?.payload?.userId
        setShowProgress(false);
        const userDetails = {
          email: userObj?.email,
          isGoogleSignin: "Y",
          clientId: CLIENT_ID
        }
        const loginResult = await dispatch(login(userDetails))
        if (login.rejected.match(loginResult)) {
          setGoogleSignInError(loginResult.payload.error)
        } else if (login.fulfilled.match(loginResult)) {
          setGoogleSignInError('')
        }
    }
  }

  const loginFunctionality = async (userObj, userProfileInfo) => {
    try {
      const loginResult = await dispatch(login(userObj))
      if (login.rejected.match(loginResult)) {
        if(loginResult?.payload?.userNotFound){
         await automaticSignup(userProfileInfo)
        }
        /*
                setGoogleSignInError(loginResult.payload.error)
        */
      } else if (login.fulfilled.match(loginResult)) {
        setGoogleSignInError('')
      }
    } catch (err) {
      setShowProgress(false)
    }
  }

  const ModifyAuthFlow = (flowType) => {
    if((flowType === "email" && !phoneLogin) || (flowType === "phone" && phoneLogin)){
      return
    }
    setOtpSigninError("");
    setGoogleSignInError("")
    setSessionData("false", {})
    setShowOtpField(false)
    setOtp("")
    setTimerValue(60)
  }

  const googleOAuthLogin = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/userinfo.profile",
    onError: () => {
      setGoogleSignInError("Login failed")
    },
    onSuccess: async (tokenResponse) => {
      try {
        let res = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`)
        let userProfileInfo = {}
        if (res && res?.data) {
          userProfileInfo = res?.data
        }
        const userObj = {
          email: userProfileInfo?.email,
          isGoogleSignin: "Y",
          clientId: CLIENT_ID
        }
        loginFunctionality(userObj, userProfileInfo)
      } catch (err) {
        setGoogleSignInError(err.message)
      }
    }
  });

  return (
    <>
      <Formik
        initialValues={{
          email: "",
          phone:"",
          otp: "",
          countryCode:"",
          clientId: CLIENT_ID,
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().max(255)
            .when(["phone","countryCode"],{
              is:(phone,countryCode)=>{
                if(phone && countryCode){return false}
                else{return true}
              },
              then:(schema)=>schema.required('You must enter either both phone number and country code or an email to login.')
                .email("Please provide valid email")
            })
          ,
          phone:Yup.string(),
          countryCode:Yup.string(),
          otp: Yup.string().max(6, "Invalid otp")
        })}
        onSubmit={async (values, {setErrors, setStatus, setSubmitting, setFieldError}) => {
          try {
            values.phone = values.phone.toString();
            values.countryCode = values.countryCode.toString()
            if(phoneLogin) {
              values["email"] = "";
            }
            else {
              values["phone"] = "";
              values["countryCode"] = "";
            }
            setFormValues(values)
            setSessionData("", {...values})
            resendOtp({...values})
          } catch (err) {
            setGlobalError(err.message)
          }
        }}
      >
        {({errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values}) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack direction={"row"} spacing={1} style={{background:"#6e45e9",padding:"5px 10px",borderRadius:"5px"}}>
                  <Button style={{borderRadius:"5px",border:"none",color:phoneLogin?"white":"black",background:phoneLogin?"#6e45e9":"white",width:"50%"}} variant="outlined" disabled={showProgress || (showOtpField && phoneLogin)} onClick={()=>{setPhoneLogin(false);ModifyAuthFlow("email")}} >Email</Button>
                  <Button style={{borderRadius:"5px",border:"none",color:phoneLogin?"black":"white",background:phoneLogin?"white":"#6e45e9",width:"50%"}} variant="outlined" disabled={showProgress || (showOtpField && !phoneLogin)} onClick={()=>{setPhoneLogin(true);ModifyAuthFlow("phone")}}>Phone</Button>
                </Stack>
              </Grid>
              {!phoneLogin && <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-login" sx={{color:"#fff"}}>Email Address</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={showOtpField ? formValues?.email : "" || values.email || ""}
                    name="email"
                    onChange={handleChange}
                    placeholder="Enter email address"
                    fullWidth
                    autoComplete="email"
                    error={Boolean(touched.email && errors.email)}
                    sx={{
                      borderRadius: "20px",
                      pointerEvents : showOtpField ? "none" : "auto",
                      background: "#2B2735",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      color: "#fff",
                      "& input": {
                        color: "#fff",
                        "&::placeholder": {
                          color: "#fff",
                        },
                      },
                    }}
                  />
                </Stack>
              </Grid>}
              {phoneLogin &&
                <Grid item xs={12}>
                  <Stack xs={12} gap={1}>
                    <InputLabel htmlFor="phone-login" sx={{color:"#fff"}}>Mobile Number</InputLabel>
                    <Stack xs={12} gap={1} direction={"row"}>
                      <OutlinedInput
                        id="demo-simple-select"
                        name="countryCode"
                        type="number"
                        error={Boolean(touched.email && errors.email)}
                        disabled={showOtpField}
                        style={{width:"75px"}}
                        placeholder="91"
                        value={showOtpField?formValues.countryCode:"" || values.countryCode || ""}
                        onChange={handleChange}
                        sx={{
                          borderRadius: "20px",
                          background: "#2B2735",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          color: "#fff",
                      "& input": {
                        color: "#fff",
                        "&::placeholder": {
                          color: "#fff",
                        },
                          },
                        }}
                      />
                      <OutlinedInput
                        style={{width:"80%"}}
                        id="phone-login"
                        type="number"
                        disabled={showOtpField}
                        value={showOtpField?formValues.phone:"" || values.phone || ""}
                        name="phone"
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                        autoComplete={'phone'}
                        error={Boolean(touched.email && errors.email)}
                        sx={{
                          borderRadius: "20px",
                          background: "#2B2735",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          color: "#fff",
                      "& input": {
                        color: "#fff",
                        "&::placeholder": {
                          color: "#fff",
                        },
                          },
                        }}
                      />
                    </Stack>
                  </Stack>
                </Grid>
              }
              <Grid item xs={12}>
                <span style={{color:"#fff"}}>Don’t have account?</span> <span onClick={()=>navigate("/register")} style={{cursor:"pointer",margin:0,color:"#1890ff"}}>Create Account</span>
              </Grid>
              {showOtpField && <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="otp-login" sx={{color:"#fff"}}>OTP</InputLabel>
                  <OutlinedInput
                    fullWidth
                    //color={capsWarning ? 'warning' : 'primary'}
                    error={Boolean(touched.otp && errors.otp)}
                    id="-otp-login"
                    type={showOtp ? 'text' : 'password'}
                    value={values.otp}
                    name="otp"
                    onChange={(e) => {
                      handleChange(e);
                      setOtp(e.target.value)
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle otp visibility"
                          onClick={handleClickShowOtp}
                          onMouseDown={handleMouseDownOtp}
                          edge="end"
                          color="secondary"
                        >
                          {showOtp ? <EyeOutlined/> : <EyeInvisibleOutlined/>}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter OTP"
                    sx={{
                      borderRadius: "20px",
                      background: "#2B2735",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      color: "white",
                      "& input": {
                        color: "#fff",
                        "&::placeholder": {
                          color: "#fff",
                        },
                      },
                    }}
                  />
                  {touched.otp && errors.otp && (
                    <FormHelperText error id="standard-weight-helper-text-password-login">
                      {errors.otp}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>}
              {showOtpField && <Grid item xs={12}>
                <Grid item xs={12} className={styles.container}>
                  <Grid item xs={12} md={8} className={styles.text}>
                    Resend OTP in 00 : {timerValue}
                  </Grid>
                  <Grid item xs={12} md={4} className={styles.button}>
                    <Button disabled={resendButtonState} onClick={() => resendOtp(formValues)}>Resend OTP</Button>
                  </Grid>
                </Grid>
              </Grid>
              }
              {globalError.length > 0 && (
                <Grid item xs={12}>
                  <FormHelperText error>{globalError}</FormHelperText>
                </Grid>
              )}
              {otpSigninError && otpSigninError.length > 0 && (
                <Grid item xs={12}>
                  <FormHelperText style={{color: responseStateColor}}>{otpSigninError}</FormHelperText>
                </Grid>
              )}
              {touched.email && errors.email && (
                <Grid item xs={12}>
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  {!showOtpField &&
                    <Button style={{background:"#6e45e9", borderRadius:"20px"}} disableElevation disabled={showProgress} fullWidth size="large" type="submit"
                            variant="contained" color="primary">
                      Generate OTP
                    </Button>}
                  {showOtpField &&
                    <Button style={{background:"#6e45e9", borderRadius:"20px"}} disabled={showProgress} disableElevation onClick={() => verifyOtp()} fullWidth size="large"
                            variant="contained" color="primary">
                      Verify & Proceed
                    </Button>}
                </AnimateButton>
              </Grid>
              {/*<Grid item xs={12}
                    style={{width: "100%", display: "flex", alignItems: 'center', justifyContent: "center"}}>
                <Grid item style={{flex: 1, height: "1px", borderTop: "1px solid #b8b8b8"}}>
                </Grid>
                <Grid item
                      style={{padding: "0px 10px", display: "flex", justifyContent: "center", alignItems: "center", color:"#fff"}}>
                  <Typography>
                    or
                  </Typography>
                </Grid>
                <Grid item style={{flex: 1, height: "1px", borderTop: "1px solid #b8b8b8"}}>
                </Grid>
              </Grid>
              <Grid item xs={12} style={{display: "flex", justifyContent: "center"}}>
                <Button
                  onClick={googleOAuthLogin}
                  style={{padding: "10px 0px", color: "black", background:"#fff", borderRadius:"25px"}}
                  fullWidth={true}
                  variant="outlined"
                  startIcon={<FcGoogle/>}>
                  Continue with Google
                </Button>
              </Grid>*/}
              {googleSignInError && googleSignInError.length > 0 && (
                <Grid item xs={12}>
                  <FormHelperText error>{googleSignInError}</FormHelperText>
                </Grid>
              )}
              {showProgress && <Grid item xs={12}>
                <LinearProgress/>
              </Grid>}
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthLogin;
