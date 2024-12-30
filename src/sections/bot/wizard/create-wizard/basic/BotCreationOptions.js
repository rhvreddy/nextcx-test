import React, {useEffect, useState} from "react";
import {useFormik} from "formik";
import * as yup from "yup";
import {
  Grid,
  Typography,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  Button,
  OutlinedInput,
  FormControl,
  FormHelperText, Alert, TextField
} from "@mui/material";
import AnimateButton from "../../../../../components/@extended/AnimateButton";
import {generateGoogleAuthURL} from "../../../../../store/reducers/botRecords";
import {useDispatch, useSelector} from "react-redux";
import {FcGoogle} from "react-icons/fc";
import axios from 'axios';
import { REACT_APP_APP_BACK_END_BASE_URL } from '../../../../../config';
import { getUserInfo } from '../../../../../store/reducers/profile';
import LinearProgress from '@mui/material/LinearProgress';
import { useNavigate } from 'react-router-dom';
import showdown from 'showdown';
import {toast} from "react-toastify";

const validationSchema = yup.object({
  creationType: yup.string().required('Please select the type of your GPT'),
  creationFrom: yup.string().required('Please select the creation method')
});

const instruction = "Date: {date}\n\nYou are a world class AI assistant. Your role is to engage with users based on the context provided \nFollow these guidelines:\n\n1. Always respond to the user based on the provided context only. Do not use prior knowledge..\n\n2. For each user query, you will be provided with supporting documentation (context) from the function 'get_supporting_documentation_for_query'. Use this information to respond to the user.n\n2. Maintain a professional and polite demeanor at all times.\n\n3. Always respond in Markdown (MD) format only\n\n4. Provide potential follow-up questions as buttons to the user based on the provided context.\n\nTool calling instructions:\n1. when user Query cannot be answered from contexts or previous conversations, call the ```process_and_dispatch_assistant_prediction``` function and pass the literal ```I don't know```.\n"
const BotCreationOptions = ({botFormData, setBotFormData, handleNext, setErrorIndex, setCreateFrom, setCreateType}) => {
  const [menuOptions, setMenuOptions] = useState(["Basic GPT", "Lead Generation", "Financial Summary", "Loan" +
  " Management", "Customer" +
  " Support", "Appointment Booking", "Ticket Booking", "Ecommerce Assistance", "Feedback Collection", "Event Management"]);
  const [botCreationType, setBotCreationType] = useState("");
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const appointmentBookingBotType = "Appointment Booking";
  const queryParams = new URLSearchParams(window.location.search);
  const [isGoogleApiCalled, setIsGoogleApiCalled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {user} = useSelector((state) => state.profile);

  const formik = useFormik({
    initialValues: {
      creationType: botFormData.creationType,
      creationFrom: botFormData.creationFrom,
      googleAuthenticationInfo: botFormData.googleAuthenticationInfo,
      instruction: botFormData?.instruction
    },
    validationSchema,
    onSubmit: (values) => {
      setBotFormData({
        ...botFormData,
        creationType: values.creationType,
        creationFrom: values.creationFrom,
        googleAuthenticationInfo:values.googleAuthenticationInfo,
        instruction: values.instruction
      })
      handleNext();
    }
  })

  function appendBreakTag(text) {
    let trimmedText = text;
    if (!trimmedText.includes('\n -')) {
      trimmedText = trimmedText.replace(/\n/g, '<br>\n');
    }
    return trimmedText;
  }

  const convertHtmlToText = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleFetchInstruction = (creationType) => {
    const text = creationType?.toLowerCase();
    const trimmedText = text.trim();
    let botUseCase = trimmedText.replace(/ /g, "_");
    if (botUseCase === "basic_gpt") {
      botUseCase = "basic"
    }
    const config = {
      method: 'get',
      url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/app-gpt/fetch-prompt-templates/botUseCase/${botUseCase}`,
    };
    let htmlContent;
    let converter = new showdown.Converter();
    const modifiedText = appendBreakTag(instruction);
    htmlContent = converter.makeHtml(modifiedText);
    htmlContent = convertHtmlToText(htmlContent);

    axios(config).then((res) => {
      if (res?.data?.status?.toLowerCase() === "success" && res?.data?.result?.[0]?.instruction) {
        const modifiedText = appendBreakTag(res?.data?.result?.[0]?.instruction);
        htmlContent = converter.makeHtml(modifiedText)
        htmlContent = convertHtmlToText(htmlContent);
        formik.setFieldValue("instruction", htmlContent);
      } else {
        formik.setFieldValue("instruction", htmlContent);
      }
    }).catch((err) => {
      console.log("Error while fetching instruction");
      formik.setFieldValue("instruction", htmlContent);
    })

  }

  const handleBotCreationTypeChange = (creationType) => {
    setBotCreationType(creationType)
    formik.setFieldValue('creationType', creationType);
    formik.setFieldValue('creationFrom', creationType === "Financial Summary" ? "Template" : formik.values.creationFrom);
    if (creationType === "Financial Summary") {
      setCreateFrom("Template");
    }
    handleFetchInstruction(creationType);
    setCreateType(creationType);
  }

  const handleBotCreateFormChange = (createForm) => {
    formik.setFieldValue('creationFrom', createForm);
    setCreateFrom(createForm);
  }

  const handleGoogleTokens = (googleTokens) => {
    formik.setFieldValue('googleAuthenticationInfo', googleTokens);
    setIsUserAuthenticated(true);
  }

  const generateAuthenticatedURL = () => {
    dispatch(generateGoogleAuthURL()).then((action) => {
      if (action?.error) {
        toast.error(action?.payload?.message || "Error occurred while generating google Auth URL");
      } else {
        window.open(action?.payload?.URL, "_self")
        localStorage.setItem("botInfo", JSON.stringify({
          botFormData: Object.assign(botFormData, formik.values)
        }))
      }
    }).catch((err) => {
      toast.error(err?.message || "Error occurred while generating google Auth URL");
    })
  }

  const fetchGoogleTokens = async(authenticationCode)=>{
    setIsGoogleApiCalled(true);
    try {
      let res = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/calendar/fetch-google-tokens`, {
        code: authenticationCode
      });
      if(res){
        setIsGoogleApiCalled(false);
      }
      if (res?.data?.status?.toLowerCase() === "success" && res?.data?.googleAuthenticationInfo) {
        toast.success("Google authentication successfully completed");
        handleGoogleTokens(res?.data?.googleAuthenticationInfo);
      } else {
        toast.error("Error occurred while performing google authentication.Please try again");
      }
    }
    catch(err){
      setIsGoogleApiCalled(false);
      toast.error("Error occurred while performing google authentication.Please try again")
    }
  }

  const userGoogleAuthentication = () => {
    if (queryParams && queryParams.get("code")) {
      fetchGoogleTokens(queryParams.get("code"));
      navigate("/bot/wizard")
    }
    else{
      if(botFormData?.googleAuthenticationInfo?.refresh_token){
        setBotCreationType(botFormData?.creationType)
        setIsUserAuthenticated(true);
      }
    }
  }

  useEffect(() => {
    userGoogleAuthentication()
    let storedBotInfo = localStorage.getItem("botInfo")
    if (storedBotInfo) {
      storedBotInfo = JSON.parse(storedBotInfo);
      if (storedBotInfo?.botFormData?.creationType) {
        handleBotCreationTypeChange(storedBotInfo?.botFormData?.creationType)
      }
      if (storedBotInfo?.botFormData?.creationFrom) {
        handleBotCreateFormChange(storedBotInfo?.botFormData?.creationFrom)
      }
      localStorage.removeItem("botInfo")
    }
    () => {
      localStorage.removeItem("botInfo");
    }
  }, []);

  const CalendarIntegrationComponent = () => {
    return (
      botCreationType === appointmentBookingBotType ?
        isUserAuthenticated ?
          <Stack>
            <Alert severity="success" variant={"outlined"} sx={{border: "none", p: 0}}>Your Google Calendar has been
              successfully integrated. You may now proceed
              with the bot creation process.</Alert>
          </Stack> :
          <Stack direction={"column"} spacing={2} style={{paddingBottom: "30px"}}>
            <Typography>Integrate your google calendar? <sup>*</sup></Typography>
            <Button
              onClick={() => generateAuthenticatedURL()}
              style={{padding: "10px 0px", color: "#262626", borderColor: "#b8b8b8", textTransform: "capitalize"}}
              variant="outlined"
              startIcon={<FcGoogle/>}>Sync google calendar</Button>
            {isGoogleApiCalled && <LinearProgress/>}
          </Stack> :
        <Stack></Stack>
    )
  }

  return (
    <>
      <Typography variant='h6' gutterBottom sx={{mb: 2}}>Build your GPT with the following options</Typography>
      <form onSubmit={formik.handleSubmit} id='validation-forms' style={{overflow: "hidden"}}>
        <Grid container spacing={3} sx={{mt: 2}}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={0.5}>
              <FormControl fullWidth>
                <InputLabel>Select type of your GPT</InputLabel>
                <Select name='creationType' label="Select type of your GPT" value={formik.values.creationType}
                        onChange={(e) => {
                          handleBotCreationTypeChange(e.target.value)
                        }}
                  // onBlur={formik.handleBlur}
                        error={formik.touched.creationType && Boolean(formik.errors.creationType)}
                        helpertext={formik.touched.creationType && formik.errors.creationType}>
                  {menuOptions.map((item, index) =>
                    <MenuItem key={index} value={item}>{item}</MenuItem>
                  )}
                </Select>
                {formik.touched.creationType && formik.errors.creationType &&
                  <FormHelperText error id="helper-text-creation-type">{formik.errors.creationType}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={0.5}>
              <FormControl fullWidth>
                <InputLabel>GPT Design Choice</InputLabel>
                <Select name='creationFrom' label="GPT Design Choice" value={formik.values.creationFrom}
                        onChange={(e) => {
                          handleBotCreateFormChange(e.target.value)
                        }}
                  // onBlur={formik.handleBlur}
                        error={formik.touched.creationFrom && Boolean(formik.errors.creationFrom)}
                        helpertext={formik.touched.creationFrom && formik.errors.creationFrom}
                >
                  <MenuItem value="Template">Template</MenuItem>
                  <MenuItem value="Scratch"
                            disabled={formik.values.creationType === "Financial Summary"}>Scratch</MenuItem>
                </Select>
                {formik.touched.creationFrom && formik.errors.creationFrom &&
                  <FormHelperText error id="helper-text-creation-from">{formik.errors.creationFrom}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={0.5}>
              <TextField spellCheck='false' id='instruction' name='instruction'
                         placeholder="What does this GPT do? How does it behave? What should it avoid doing?"
                         fullWidth
                         multiline rows={5}
                         value={formik.values.instruction || ''}
                         onChange={formik.handleChange}
                         error={formik.touched.instruction && Boolean(formik.errors.instruction)}
                         helperText={formik.touched.instruction && formik.errors.instruction}
                         label='Instruction'/>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction='row' marginRight="6px" justifyContent='space-between' alignItems={"center"}>
              <CalendarIntegrationComponent/>
              <AnimateButton>
                <Button disabled={(botCreationType === appointmentBookingBotType && !isUserAuthenticated) ? true : false}
                        variant='contained' sx={{my: 3, ml: 1}} type='submit'
                        onClick={() => setErrorIndex(0)}>
                  Next
                </Button>
              </AnimateButton>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </>
  )
}
export default BotCreationOptions;
