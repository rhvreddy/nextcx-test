import {useEffect, useRef, useState} from 'react';

// material-ui
import {Button, Step, Stepper, StepLabel, Stack, Typography, Grid, Box} from '@mui/material';
import {CLIENT_ID, REACT_APP_APP_BACK_END_BASE_URL, REACT_APP_APP_S_CODE} from 'config';

// project imports
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';
import BasicBotForm from './BasicBotForm';
import BasicBotContext from './BasicBotContext';
import BasicBotReview from './BasicBotReview';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {Link} from "react-router-dom";
import AdvanceBotForm from "./AdvanceBotForm";
import {useSelector} from "react-redux"
import BotCreationOptions from "./BotCreationOptions";
import BotTemplateForm from "../BotTemplateForm/BotTemplateForm";
import {Close} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import {triggerNotification} from "../../../../../store/reducers/chat";
import OpenAPISpec from "./OpenAPISpec";
import {mainAppName} from "../../../../../consts";
import {useTheme} from "@mui/material/styles";
import {openDrawer} from "../../../../../store/reducers/menu";

const getBotContext = (handleNext, handleBack, setErrorIndex, botFormData, setBotFormData) => {
  return (
    <BasicBotContext handleNext={handleNext} handleBack={handleBack} setErrorIndex={setErrorIndex}
                     botFormData={botFormData} setBotFormData={setBotFormData}/>
  );
}

const getBotDetailsReview = (handleBack, setErrorIndex, botFormData, setBotFormData, handleAdvanceView, botType) => {
  return (
    <BasicBotReview handleBack={handleBack} setErrorIndex={setErrorIndex} botFormData={botFormData}
                    setBotFormData={setBotFormData} handleAdvanceView={handleAdvanceView} botType={botType}/>
  );
}

const getStepContent = (step, handleNext, handleBack, setErrorIndex, botFormData, setBotFormData, handleBotType, setUpScreen, handleAdvanceView, botType, setCreateFrom, setCreateType) => {
  if (step === 0) {
    return (
      <BotCreationOptions
        handleNext={handleNext}
        setErrorIndex={setErrorIndex}
        botFormData={botFormData}
        setBotFormData={setBotFormData}
        setCreateFrom={setCreateFrom}
        setCreateType={setCreateType}
      />
    )
  } else if (step === 1) {
    if (botFormData.creationFrom === "Template") {
      return (
        <BotTemplateForm
          handleNext={handleNext}
          setErrorIndex={setErrorIndex}
          botFormData={botFormData}
          setBotFormData={setBotFormData}
          handleBack={handleBack}
        />
      )
    } else if (botFormData.creationFrom === "Scratch") {
      return (
        <BasicBotForm
          handleBotType={handleBotType}
          handleNext={handleNext}
          setErrorIndex={setErrorIndex}
          botFormData={botFormData}
          setBotFormData={setBotFormData}
          handleBack={handleBack}
        />
      );
    }
  } else if (step === 2) {
    if (botFormData.creationFrom === "Scratch" && setUpScreen === "advance") {
      return (
        <AdvanceBotForm handleNext={handleNext} handleBack={handleBack} setErrorIndex={setErrorIndex}
                        botFormData={botFormData} setBotFormData={setBotFormData}/>
      )
    } else if (botFormData.creationFrom === "Scratch" && setUpScreen === "basic") {
      return getBotContext(handleNext, handleBack, setErrorIndex, botFormData, setBotFormData);
    } else if (botFormData.creationFrom === "Template") {
      // return getBotDetailsReview(handleBack, setErrorIndex, botFormData, setBotFormData, handleAdvanceView, botType);
      return <OpenAPISpec handleNext={handleNext} handleBack={handleBack} setErrorIndex={setErrorIndex}
                          botFormData={botFormData} setBotFormData={setBotFormData}/>
    }
  } else if (step === 3) {

    if (botFormData.creationFrom === "Scratch" && setUpScreen === "advance") {
      return getBotContext(handleNext, handleBack, setErrorIndex, botFormData, setBotFormData);
    } else if (botFormData.creationFrom === "Scratch" && setUpScreen === "basic") {
      // return getBotDetailsReview(handleBack, setErrorIndex, botFormData, setBotFormData, handleAdvanceView, botType);
      return <OpenAPISpec handleNext={handleNext} handleBack={handleBack} setErrorIndex={setErrorIndex}
                          botFormData={botFormData} setBotFormData={setBotFormData}/>
    }else{
      return getBotDetailsReview(handleBack, setErrorIndex, botFormData, setBotFormData, handleAdvanceView, botType);
    }
  } else if (step === 4) {
    if (botFormData.creationFrom === "Scratch" && setUpScreen === "advance") {
      return <OpenAPISpec handleNext={handleNext} handleBack={handleBack} setErrorIndex={setErrorIndex}
                          botFormData={botFormData} setBotFormData={setBotFormData}/>
    }else{
      return getBotDetailsReview(handleBack, setErrorIndex, botFormData, setBotFormData, handleAdvanceView, botType);
    }
  }else if(step === 5){
    return getBotDetailsReview(handleBack, setErrorIndex, botFormData, setBotFormData, handleAdvanceView, botType);
  } else {
    throw new Error('Unknown step');
  }
};

// ==============================|| FORMS WIZARD - VALIDATION ||============================== //

const BotCreateWizard = (props) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [botFormData, setBotFormData] = useState({
    creationType: "",
    creationFrom: "Scratch",
    botName: '',
    companyName: "",
    companyWebsite: "",
    salesTeamEmail: "",
    slotDuration: "",
    customSlotDuration: "",
    botColor: {r: 0, g: 0, b: 0, a: 1},
    googleAuthenticationInfo:{},
    avatarFiles: null,
    botDescription: '',
    templateFile: null,
    botContext: '',
    botType: "basic",
    industry: "",
    intents: [],
    businessInfoAttachments: [],
    businessUrls: [],
    verifiedBusinessUrl: "",
    aiModel:"gpt-4o",
    openApiSpec:""
  });
  const [errorIndex, setErrorIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [response, setResponse] = useState('Please wait while we process your request...');
  const [stepperForScratch, setStepperForScratch] = useState(['Create your GPT', 'Customize your GPT', 'Teach something' +
  ' to your' +
  ' GPT',"Model & OpenAPI Spec", 'Review and create your personalized GPT']);
  const [stepperForTemplate, setStepperForTemplate] = useState(['Create your GPT', 'Basic Information',"Model & OpenAPI Spec", 'Review and create' +
  ' your personalized GPT']);
  const [showCloseBtn, setShowCloseBtn] = useState(false);
  const botObject = useRef({});
  const [steps, setSteps] = useState([]);
  const [setUpScreen, setSetUpScreen] = useState("basic");
  const [botType, setBotType] = useState(false);
  const [advanceView, setAdvanceView] = useState(false);
  const [createFrom, setCreateFrom] = useState("");
  const [createType, setCreateType] = useState("");
  const [title, setTitle] = useState("");
  const {user} = useSelector((state) => state.profile);

  const displayStepper = () => {
    setSteps(stepperForScratch);
  }

  useEffect(() => {
    //step options
    //removed 'Upskill your BOT' as of now, because the same steps included in 'Teach something to your BOT' itself
    dispatch(openDrawer({drawerOpen: false}));
    displayStepper();
  }, []);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
    setErrorIndex(null);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setErrorIndex(null);
    if (activeStep === 1 && (!botType || botFormData.botType === "basic")) {
      setBotType(false);
      setBotFormData({...botFormData, botType: "basic"});
    }
  };

  useEffect(() => {
    botType ? (setSetUpScreen("advance")) : (setSetUpScreen("basic"));
    botType && steps.splice(2, 0, "Business unit info");
    !botType && steps?.length > 3 && steps.includes("Business unit info") && steps.splice(2, 1);
  }, [botType]);

  const handleBotType = (data) => {
    setBotType(data);
  }

  const resetBotFormData = (createFrom) => {
    setErrorIndex(null);
    setBotFormData({
      creationType: "",
      creationFrom: "Scratch",
      botName: '',
      companyName: "",
      companyWebsite: "",
      salesTeamEmail: "",
      slotDuration: "",
      customSlotDuration: "",
      botColor: {r: 0, g: 0, b: 0, a: 1},
      avatarFiles: null,
      botDescription: '',
      templateFile: null,
      botContext: '',
      botType: "basic",
      industry: "",
      intents: [],
      businessInfoAttachments: [],
      businessUrls: [],
      verifiedBusinessUrl: "",
      aiModel: "gpt-4o",
      openApiSpec: ""
    })
  }

  useEffect(() => {
    if (createFrom === "Scratch") {
      setSteps(stepperForScratch);
      resetBotFormData("scratch")
    } else if (createFrom === "Template") {
      setSteps(stepperForTemplate);
      resetBotFormData("template")
      if (botType) {
        setBotType(false);
        steps.includes("Business unit info") && steps.splice(2, 1);
      }
    }
  }, [createFrom]);

  useEffect(() => {
    if (createType !== "") {
      setTitle(`- ${createType}`);
      if (botType) {
        setBotType(false);
        steps.includes("Business unit info") && steps.splice(2, 1);
      }
      resetBotFormData();
    }
  }, [createType]);

  const handleAdvanceView = (data) => {
    setAdvanceView(data);
  }

  const botSuccessRes = (data) => {
    setShowResult(!showResult);
  };

  const handleFormSubmission = async () => {
    let userId = localStorage.getItem("userId");

    botSuccessRes();
    let formData = new FormData();
    const text = botFormData.creationType?.toLowerCase();
    const trimmedText = text.trim();
    let botUseCase = trimmedText.replace(/ /g, "_");
    if (botUseCase === "basic_gpt") {
      botUseCase = "basic"
    }

    botObject.current = {
      botUseCase: botUseCase,
      companyName: botFormData.companyName,
      botName: botFormData.botName,
      botDescription: botFormData.botDescription,
      botColor: `rgba(${botFormData.botColor.r},${botFormData.botColor.g},${botFormData.botColor.b},${botFormData.botColor.a})`,
      context: botFormData.botContext,
      intents: botFormData.botType === "advance" ? botFormData.intents : [],
      industry: botFormData.botType === "advance" ? botFormData.industry : "",
      botType: botFormData.botType,
      enableWebQA: true,
      webQAInfo: botFormData?.businessUrls,
      businessUrl: botFormData?.businessUrls,
      aiModel:botFormData?.aiModel,
      userId: userId,
      adminUserId: user?.adminUserId ? user?.adminUserId : "",
      clientId: CLIENT_ID,
      businessId: localStorage.getItem('businessId'),
      organizationId: localStorage.getItem('organizationId'),
      googleAuthenticationInfo:botFormData.googleAuthenticationInfo,
      sourcePage:"wizard"
    };

    if(botFormData?.instruction){
      botObject.current.instruction = botFormData.instruction
    }

    if (botFormData.salesTeamEmail !== "") {
      botObject.current.emails = [botFormData.salesTeamEmail]
    }

    if (botFormData.companyWebsite !== "") {
      botObject.current.businessUrl = [{
        "type": "webpage",
        "url": botFormData.companyWebsite
      }];

      botObject.current.webQAInfo = [{
        "type": "webpage",
        "url": botFormData.companyWebsite
      }];
    }

    if (botFormData.slotDuration !== "") {
      botObject.current.slotDuration = botFormData.slotDuration;
    }

    if (botFormData.customSlotDuration !== "") {
      botObject.current.slotDuration = botFormData.customSlotDuration;
    }

    if (botFormData && botFormData.avatarFiles && botFormData.avatarFiles.length > 0) {
      formData.append('avatarFile', botFormData.avatarFiles[0], botFormData.avatarFiles[0].name);
    }
    if (botFormData && botFormData.templateFiles && botFormData.templateFiles.length > 0) {
      formData.append(
        'knowledgeTemplateFile',
        botFormData.templateFiles[botFormData.templateFiles.length - 1],
        botFormData.templateFiles[botFormData.templateFiles.length - 1].name
      );
    }
    if (botFormData && (botFormData.creationType === "Financial Summary" || botFormData.creationType === "Loan" +
      " Management") && botFormData?.customFiles?.length > 0) {
      botFormData.businessInfoAttachments = botFormData.customFiles
    }

    if(botFormData && botFormData.openApiSpec){
      botObject.current.openApiSpec = botFormData.openApiSpec
    }
    if (botFormData && botFormData.businessInfoAttachments && botFormData.businessInfoAttachments.length > 0) {
      let fileNames = [];
      botFormData.businessInfoAttachments?.map((file, index) => {
        fileNames.push(file.name)
        formData.append(
          `businessInfoAttachments`,
          file,
          file?.name
        );
      })
      botObject.current.businessInfoFileNames = fileNames
    }
    botObject.current.userName = user?.firstName + " " + user?.lastName
    formData.append('botObject', JSON.stringify(botObject.current));

    let initiateBotUrl = "/ai-bots/v0/initiate-bot-upsert";
    let appGptUrl = "/ai-bots/v0/app-gpt/upsert-bot";
    const config = {
      method: 'post',
      url: REACT_APP_APP_BACK_END_BASE_URL + appGptUrl,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    };
    axios(config)
      .then((res) => {
        if (res?.status === 200 && res?.data?.status && res?.data?.status?.toLowerCase() === 'success') {
          setResponse(
            <Stack flexDirection="column">
              <Typography fontWeight="500" fontSize="20px">Your bot is being created.</Typography>
              <Typography fontWeight="500" fontSize="20px">Please check the status with Bot Record Id
                : {res?.data?.botRecordId} </Typography>
            </Stack>
          );
          props.requestResponse({data: res?.data});
          setShowCloseBtn(true);
        } else {
          setResponse(
            <Stack flexDirection="column">
              <Typography fontWeight="500" fontSize="20px"> Bot creation is failed.</Typography>
              <Typography fontWeight="500" fontSize="20px">Please contact your administrator.</Typography>
            </Stack>
          );
          props.requestResponse({data: res});
          setShowCloseBtn(true);
        }
        dispatch(triggerNotification({isNotify: true}))
      })
      .catch((err) => {
        console.log('error from server for the bot creation ->', err);
        setResponse(
          <Stack flexDirection="column">
            <Typography fontWeight="500" fontSize="20px">Bot creation is failed.</Typography>
            <Typography fontWeight="500" fontSize="20px">Please contact your administrator.</Typography>
          </Stack>
        );
        props.requestResponse({data: err});
        setShowCloseBtn(true);
      });
  };

  return (
    <MainCard title={<Box sx={{display: "flex", gap: "4px"}}><Typography>{mainAppName}</Typography> <Typography
      fontWeight="500">{title}</Typography></Box>} secondary={ !showResult && <IconButton
      aria-label="close"
      onClick={() => props.onCancel()}
      style={{position: "absolute", right: "8px", top: "18px", color: theme.palette.primary.main}}
    >
      <Close/>
    </IconButton>} sx={{border:"none !important"}}>
      <Stepper activeStep={activeStep} sx={{
        pt: 3, pb: 5, overflow: "auto", '::-webkit-scrollbar': {
          width: "4px",
          height: "4px"
        },
        '::-webkit-scrollbar-track': {
          background: "#f1f1f1",
        },
        '::-webkit-scrollbar-thumb': {
          background: "#88888840",
        }
      }}>
        {!showResult &&
          steps.map((label, index) => {
            const labelProps = {};

            if (index === errorIndex) {
              labelProps.optional = (
                <Typography variant='caption' color='error'>
                  Error
                </Typography>
              );

              labelProps.error = true;
            }

            return (
              <Step key={label}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
      </Stepper>
      <>
        {!showResult &&
          <Box sx={{
            maxHeight: window.devicePixelRatio > "1.25" ? "40vh" : '65vh', overflow: 'auto', '::-webkit-scrollbar': {
              width: "4px",
              height: "4px"
            },
            '::-webkit-scrollbar-track': {
              background: "#f1f1f1",
            },
            '::-webkit-scrollbar-thumb': {
              background: "#88888840",
            }
          }}>
            {getStepContent(activeStep, handleNext, handleBack, setErrorIndex, botFormData, setBotFormData, handleBotType, setUpScreen, handleAdvanceView, botType, setCreateFrom, setCreateType)}
          </Box>
        }
        {activeStep === steps.length - 1 && !showResult && (
          <Stack direction='row' justifyContent={activeStep !== 0 ? 'space-between' : 'flex-end'}>
            {activeStep !== 0 && (
              <Button onClick={handleBack}>
                Back
              </Button>
            )}
            <AnimateButton>

              <Button
                variant='contained'
                onClick={(activeStep === steps.length - 1) ? handleFormSubmission : handleNext}
              >
                {activeStep === steps.length - 1 ? 'Create' : 'Next'}
              </Button>
            </AnimateButton>
          </Stack>
        )}
        {showResult && (
          <Grid container justifyContent='center' alignItems='center'>
            <Grid item>
              <Typography variant='h6' textAlign='center' gutterBottom sx={{mb: 10}}>
                {response}
              </Typography>
            </Grid>
            {showCloseBtn && !advanceView && (
              <Grid container justifyContent='center' alignItems='center'>
                <AnimateButton>
                  <Button variant='contained' onClick={() => props.onCancel()}>
                    Close
                  </Button>
                </AnimateButton>
              </Grid>
            )}
            {showCloseBtn && advanceView && botType && (
              <Grid container justifyContent='center' alignItems='center'>
                <AnimateButton>
                  <Link
                    style={{textDecoration: 'none'}}
                    to={"/welcome"}
                    state={{data: botFormData}}
                  >
                    <Button variant='contained'>
                      Close
                    </Button>
                  </Link>
                </AnimateButton>
              </Grid>
            )}
          </Grid>
        )}
      </>
    </MainCard>
  );
};

export default BotCreateWizard;
