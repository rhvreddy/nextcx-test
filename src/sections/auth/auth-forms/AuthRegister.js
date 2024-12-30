import React, {useEffect, useRef, useState} from 'react';
import {Link as RouterLink} from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  Link,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography, Select, MenuItem
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LinearProgress from '@mui/material/LinearProgress';

// third party
import * as Yup from 'yup';
import {Formik} from 'formik';

// project import
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import {strengthColor, strengthIndicator} from 'utils/password-strength';

// assets
import {EyeOutlined, EyeInvisibleOutlined} from '@ant-design/icons';
import { CLIENT_ID, DOCUBAAT_CLIENT_ID, REACT_APP_APP_BACK_END_BASE_URL } from "../../../config";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux';
import {register, autoBotCreation, login, initializeAutoLogin} from '../../../store/reducers/profile';
import {FcGoogle} from "react-icons/fc";
import {useGoogleLogin} from "@react-oauth/google";
import {makeStyles} from "@mui/styles";
import Cookies from "js-cookie";

// ============================|| FIREBASE - REGISTER ||============================ //
var JWT_SECRET_KEY = 'LMS SECRET'

const AuthRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [googleSignUpError, setGoogleSignUpError] = useState("")
  const [otpSigninError, setOtpSigninError] = useState("");
  const [responseStateColor, setResponseStateColor] = useState("")
  const [showOtp, setShowOtp] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [phoneLogin, setPhoneLogin] = useState(false)
  const [formValues, setFormValues] = useState({})
  const [otp, setOtp] = useState("")
  const [resendButtonState, setResendButtonState] = useState(true)
  const [showProgress, setShowProgress] = useState(false)
  const SUCCESS_COLOR = "green";
  const ERROR_COLOR = "red";
  const DOWN_TIME_VALUE = 60;
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

  const handleClickShowOtp = () => {
    setShowOtp(!showOtp);
  };

  const handleMouseDownOtp = (event) => {
    event.preventDefault();
  };

  const setSessionData = (showOtpField, formValues) => { //This function is to store the user entered data in localStorage
    try {
      let sessionData = localStorage.getItem("registerFormData")
      if (sessionData) {
        const registerFormData = JSON.parse(localStorage.getItem("registerFormData"));
        if (showOtpField) {
          if(showOtpField === "false"){
            registerFormData["showOtpField"] = false
          }
          else {
            registerFormData["showOtpField"] = showOtpField
          }
        }
        if (formValues) {
          registerFormData["formValues"] = formValues
        }
        localStorage.setItem("registerFormData", JSON.stringify(registerFormData))
      }
    } catch (err) {
    }
  }

  useEffect(() => {
    try {
      let sessionData = localStorage.getItem("registerFormData")
      if (sessionData) {
        const registerFormData = JSON.parse(localStorage.getItem("registerFormData"));
        if (registerFormData["showOtpField"]) {
          setResendButtonState(false);
          setTimerValue(0);
        }
        setShowOtpField(registerFormData["showOtpField"])
        setFormValues(registerFormData["formValues"])
      } else {
        localStorage.setItem("registerFormData", JSON.stringify({showOtpField: false, formValues: {email: ""}}))
      }
    } catch (e) {
    }
    return () => {
      localStorage.removeItem("registerFormData")
    }
  }, []);


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

  const resendOtp = async () => {
    try {
      setShowProgress(true);
      setGoogleSignUpError("")
      setOtpSigninError("")
      const userData = {
        userName: (formValues?.firstName || "") + " " + (formValues?.lastName || ""),
        clientId: CLIENT_ID
      }
      if(formValues?.email){
        userData["email"] = formValues?.email
      }
      if(formValues?.phone){
        userData["phone"] = formValues?.phone;
        userData["countryCode"] = formValues?.countryCode
      }
      let res = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/user/generateSignupOtp`, userData);
      if (res) {
        setShowProgress(false)
        startTimer()
        setResendButtonState(true)
      }
      if (res?.data?.status?.toLowerCase() === "success") {
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
      setShowProgress(true)
      setGoogleSignUpError("")
      setOtpSigninError("")
      const userData = {
        clientId: CLIENT_ID,
        isSignin: "N",
        otp: otp
      }
      if(formValues?.email){
        userData["email"] = formValues?.email
      }
      if(formValues?.phone){
        userData["phone"] = formValues?.phone;
        userData["countryCode"] = formValues?.countryCode
      }
      let res = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/user/verifyOtp`, userData);
      if (res?.data?.status?.toLowerCase() === "success") {
        let registerResult ={payload: res.data};
          dispatch(initializeAutoLogin({user:res?.data?.user}))
      } else {
        setShowProgress(false)
        setOtpSigninError(res?.data?.message || "")
        setResponseStateColor(ERROR_COLOR)
      }
    } catch (err) {
      setShowProgress(false)
      setOtpSigninError(err?.message || "")
      setResponseStateColor(ERROR_COLOR)
    }
  }

  const signupFunctionality = async (userObj, isGoogleSignUp) => {
    try {
      setShowProgress(true)
      setOtpSigninError('')
      setGoogleSignUpError("")
      const registerResult = await dispatch(register(userObj))

      if (register.rejected.match(registerResult)) {
        setShowProgress(false)
        if (isGoogleSignUp === "Y") {
          setGoogleSignUpError(registerResult?.payload?.error || "",)
        } else {
          setOtpSigninError(registerResult?.payload?.error || "",);
          setResponseStateColor(ERROR_COLOR)
        }
      } else if (register.fulfilled.match(registerResult)) {
        if (isGoogleSignUp !== 'Y') {
          setShowProgress(false)
          setShowOtpField(true);
          startTimer()
          setResendButtonState(true)
          setSessionData(true, "")
          setOtpSigninError(registerResult?.payload?.message || "");
          setResponseStateColor(SUCCESS_COLOR)
        }
        let userId = registerResult?.payload?.userId
        const appRoles = registerResult?.payload?.appRoles
          setShowProgress(false)
          if (isGoogleSignUp && isGoogleSignUp === "Y") {
            const userDetails = {
              email: userObj?.email,
              isGoogleSignin: "Y",
              clientId: CLIENT_ID
            }
            const loginResult = await dispatch(login(userDetails))
            if (login.rejected.match(loginResult)) {
              setGoogleSignUpError(loginResult.payload.error)
            } else if (login.fulfilled.match(loginResult)) {
              setGoogleSignUpError('')
            }
          }
      }
    } catch (err) {
      setShowProgress(false)
      if (isGoogleSignUp === "Y") {
        setGoogleSignUpError(err?.message || "")
      } else {
        setOtpSigninError(err?.message || "");
        setResponseStateColor(ERROR_COLOR)
      }
    }
  }

  const googleOAuthLogin = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/userinfo.profile",
    onError: () => {
      setGoogleSignUpError("Login failed")
    },
    onSuccess: async (tokenResponse) => {
      try {
        let res = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`)
        let userProfileInfo = {}
        if (res && res?.data) {
          userProfileInfo = res?.data
        }
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
        signupFunctionality(userObj, "Y")
      } catch (err) {
        setGoogleSignUpError(err.message)
      }
    }
  });

  const ModifyAuthFlow = (flowType) => {
    if((flowType === "email" && !phoneLogin) || (flowType === "phone" && phoneLogin)){
      return
    }
    setOtpSigninError("");
    setGoogleSignUpError("")
    setSessionData("false", {})
    setShowOtpField(false)
    setOtp("")
    setTimerValue(60)
  }

  return (
    <>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          otp: "",
          phone:"",
          countryCode:"",
          appName: "nextcx",
          first_login: "N",
          clientId: CLIENT_ID,
          submit: null
        }}
        validationSchema={Yup.object().shape({
          firstName: Yup.string().max(255).required('First Name is required'),
          lastName: Yup.string().max(255).required('Last Name is required'),
          email: Yup.string().max(255)
            .when(['phone','countryCode'], {
              is:(phone,countryCode) => {
                if(phone && countryCode){return false}
                else {return true}
              },
              then: (schema)=>
                schema.required('You must enter either both phone number and country code or an email.')
                  .email('Please provide valid email')
            }),
          phone:Yup.string(),
          countryCode:Yup.string()
            .when("phone",{
              is:(phoneNumber)=>phoneNumber,
              then:(schema)=>schema.required("You must enter both phone number and country code")
            })
          ,
          otp: Yup.string().max(6, "Invalid otp")
        })}
        onSubmit={async (values, {setErrors, setStatus, setSubmitting}) => {
          try {
            values.phone = values.phone.toString();
            values.countryCode = values.countryCode.toString()
            if(values.email) {
              values["isOtpSignin"] = "Y"
            }
            let userObj = {...values}
            delete userObj.submit
            setSessionData("", {...values})
            setFormValues({...values})
            signupFunctionality(userObj, "N")
          } catch (e) {
          }
        }}
      >
        {({errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values}) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="firstname-signup" sx={{color:"#fff"}}>First Name*</InputLabel>
                  <OutlinedInput
                    id="firstname-login"
                    type="text"
                    value={showOtpField?formValues?.firstName:"" || values.firstName || ""}
                    name="firstName"
                    onChange={handleChange}
                    disabled={showOtpField}
                    placeholder="John"
                    fullWidth
                    error={Boolean(touched.firstName && errors.firstName)}
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
                  {touched.firstName && errors.firstName && (
                    <FormHelperText error id="helper-text-firstname-signup">
                      {errors.firstName}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="lastname-signup" sx={{color:"#fff"}}>Last Name*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.lastName && errors.lastName)}
                    id="lastname-signup"
                    type="text"
                    value={showOtpField?formValues?.lastName:"" || values.lastName || ""}
                    name="lastName"
                    disabled={showOtpField}
                    onChange={handleChange}
                    placeholder="Doe"
                    inputProps={{}}
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
                  {touched.lastName && errors.lastName && (
                    <FormHelperText error id="helper-text-lastname-signup">
                      {errors.lastName}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="company-signup" sx={{color:"#fff"}}>Company</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.company && errors.company)}
                    id="company-signup"
                    value={showOtpField?formValues?.company:"" || values.company || ""}
                    name="company"
                    disabled={showOtpField}
                    onChange={handleChange}
                    placeholder="Demo Inc."
                    inputProps={{}}
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
                  {touched.company && errors.company && (
                    <FormHelperText error id="helper-text-company-signup">
                      {errors.company}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-signup" sx={{color:"#fff"}}>Email Address</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-login"
                    type="email"
                    disabled={showOtpField}
                    value={showOtpField?formValues.email:"" || values.email || ''}
                    name="email"
                    onChange={handleChange}
                    placeholder="demo@company.com"
                    inputProps={{}}
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
                  {touched.email && errors.email && (
                    <FormHelperText error id="helper-text-email-signup">
                      {errors.email}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack xs={12} gap={1}>
                  <InputLabel htmlFor="phone-login" sx={{color:"#fff"}}>Mobile Number</InputLabel>
                  <Stack xs={12} gap={1} direction={"row"} style={{alignItems:"center",justifyContent:"space-between"}}>
                    <OutlinedInput
                      id="demo-simple-select"
                      name="countryCode"
                      type="number"
                      error={Boolean(touched.countryCode && errors.countryCode)}
                      disabled={showOtpField}
                      style={{width:"65px"}}
                      placeholder="91"
                      value={showOtpField?formValues.countryCode:"" || values.countryCode || ""}
                      onChange={handleChange}
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
                    <OutlinedInput
                      style={{width:"85%"}}
                      id="phone-login"
                      type="number"
                      error={Boolean(touched.countryCode && errors.countryCode)}
                      disabled={showOtpField}
                      value={showOtpField?formValues.phone:"" || values.phone || ""}
                      name="phone"
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      autoComplete={'phone'}
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
                  </Stack>
                  {touched.countryCode && errors.countryCode && (
                    <FormHelperText error id="standard-weight-helper-text-email-login">
                      {errors.countryCode}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              {showOtpField && <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-signup" sx={{color:"#fff"}}>OTP</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.otp && errors.otp)}
                    id="password-signup"
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
                          aria-label="toggle password visibility"
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
                    inputProps={{}}
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
                    <FormHelperText error id="helper-text-password-signup">
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
              </Grid>}
              <Grid item xs={12}>
                {otpSigninError && otpSigninError.length > 0 && (
                  <Grid item xs={12}>
                    <FormHelperText style={{color: responseStateColor}}>{otpSigninError}</FormHelperText>
                  </Grid>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="#fff">
                  By Signing up, you agree to our &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="https://www.nextcx.ai/legal/terms-of-service" target="_blank" sx={{color: "#1890ff"}}>
                    Terms of Service
                  </Link>
                  &nbsp; and &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="https://www.nextcx.ai/legal/privacy-policy" target="_blank" sx={{color: "#1890ff"}}>
                    Privacy Policy
                  </Link>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <AnimateButton>
                  {!showOtpField &&
                    <Button style={{background:"#6e45e9", borderRadius:"20px"}} disableElevation disabled={showProgress} fullWidth size="large" type="submit"
                            variant="contained" color="primary">
                      Generate OTP
                    </Button>}
                  {showOtpField &&
                    <Button style={{background:"#6e45e9", borderRadius:"20px"}} disabled={showProgress} onClick={verifyOtp} disableElevation fullWidth size="large"
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
              {googleSignUpError.length > 0 && (
                <Grid item xs={12}>
                  <FormHelperText error>{googleSignUpError}</FormHelperText>
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

export default AuthRegister;
