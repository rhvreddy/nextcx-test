import React, {useState, useEffect, useRef} from "react";
import {Button, CircularProgress, Grid, Stack, TextField, Typography, MenuItem, FormHelperText} from "@mui/material";
import * as yup from "yup";
import {useFormik} from "formik";
import UploadAvatar from "../../../../../components/third-party/dropzone/Avatar";
import AnimateButton from "../../../../../components/@extended/AnimateButton";
import {dispatch} from "../../../../../store";
import {validateBusinessUrl} from "../../../../../store/reducers/botRecords";
import CustomFileUpload from "../../../../../components/third-party/dropzone/CustomFile";


const timeIntervals = [
  {value: '15 Minutes', label: '15 Mins'},
  {value: '30 Minutes', label: '30 Mins'},
  {value: '45 Minutes', label: '45 Mins'},
  {value: '60 Minutes', label: '60 Mins'}
];

const getValidationSchema = (creationType, isValid) => {
  return yup.object({
    botName: yup.string().required('GPT Name is required'),
    companyName: yup.string().required('Company Name is required'),
    companyWebsite: (creationType !== "Financial Summary") && (creationType !== "Loan Management") ? yup.string().required('Company Website is required')
      .test('is-valid', function (value) {
        if (value && !isValid) {
          return this.createError({message: 'Verify the company website'});
        }
        return true;
      }) : null,
    salesTeamEmail: creationType === "Lead Generation" ? yup.string().email('Must be a valid email').max(255).required('Sales Team Email is required') : null,
    slotDuration: creationType === "Appointment Booking" ? yup.string().required('Slot Duration is required') : null,
    customSlotDuration: yup.string().when('slotDuration', {
      is: 'custom',
      then: yup.string()
        .matches(/^\d+$/, 'Accepted numbers only')
        .max(3, 'Maximum of 3 digits allowed')
        .required('Custom Slot Duration is required'),
      otherwise: yup.string()
    }),
    files: yup.object().shape({
      avatar: yup.mixed().required('Avatar is required'),
      customFiles: creationType === "Financial Summary" ? yup.array().of(
        yup.mixed().test('fileType', 'Only PDF files are supported', value => value ? value.type === 'application/pdf' : true)
      ).required('Business files are required').min(1, 'At least one business file is required') : null,
    }).required('Files are required')
  });
};

const BotTemplateForm = ({botFormData, setBotFormData, handleNext, setErrorIndex, handleBack}) => {
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [fileError, setFileError] = useState(false);
  const containerRef = useRef(null);
  const [showVerifyErrorMsg, setShowVerifyErrorMsg] = useState({
    text: "",
    isError: false,
    isVerifying: false
  });

  // Maintaining Urls state
  useEffect(() => {
    if (botFormData?.companyWebsite !== "") {
      setIsValidUrl(true);
      setShowVerifyErrorMsg({text: "", isError: false, isVerifying: false});
    }
    formik.touched.companyWebsite = false;
  }, []);

  const verifyBusinessUrl = async () => {
    if (formik.values.companyWebsite && formik.values.companyWebsite !== "") {
      setShowVerifyErrorMsg({...showVerifyErrorMsg, isVerifying: true});
      formik.setFieldError("companyWebsite", "");
      const data = {url: formik.values.companyWebsite};
      const response = await dispatch(validateBusinessUrl(data));
      if (response?.payload?.status?.toLowerCase() === "success") {
        setIsValidUrl(true);
        formik.setFieldError("companyWebsite", "");
        setShowVerifyErrorMsg({text: "", isError: false, isVerifying: false});
      } else {
        setShowVerifyErrorMsg({
          text: "Company Website is not valid",
          isError: true,
          isVerifying: false
        });
        formik.touched.companyWebsite = true;
        formik.setFieldError("companyWebsite", "Company Website is not valid");
      }
    }
  }

  const formik = useFormik({
    initialValues: {
      botName: botFormData.botName,
      companyName: botFormData.companyName,
      companyWebsite: botFormData.companyWebsite,
      salesTeamEmail: botFormData.salesTeamEmail,
      slotDuration: botFormData.slotDuration,
      customSlotDuration: botFormData.customSlotDuration,
      files: {
        avatar: botFormData.avatarFiles || null,
        customFiles: botFormData.customFiles || []
      }
    },
    validationSchema: getValidationSchema(botFormData.creationType, isValidUrl),
    onSubmit: (values) => {
      setBotFormData({
        ...botFormData,
        botName: values.botName,
        companyName: values.companyName,
        companyWebsite: values.companyWebsite,
        salesTeamEmail: values.salesTeamEmail ? values.salesTeamEmail : "",
        slotDuration: values.slotDuration,
        customSlotDuration: values.customSlotDuration,
        avatarFiles: values.files.avatar,
        customFiles: values.files.customFiles
      });
      handleNext();
    }
  })

  useEffect(() => {
    if ((containerRef.current && formik.values.files.customFiles) || fileError) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [formik.values.files.customFiles]);

  return (
    <>
      <Typography variant='h6' gutterBottom sx={{mb: 2}}>
        Provide following details to create the GPT
      </Typography>
      <form onSubmit={formik.handleSubmit} id='validation-forms' style={{overflow: "hidden"}} autoComplete="off">
        <Grid ref={containerRef} container spacing={3} pb={0.5} sx={{
          mt: 0, overflow: "auto", '::-webkit-scrollbar': {
            width: "4px",
            height: "4px"
          },
          '::-webkit-scrollbar-track': {
            background: "#f1f1f1",
          },
          '::-webkit-scrollbar-thumb': {
            background: "#88888840",
          }
        }} maxHeight={{xs: "35vh", md: "40vh"}}>
          <Grid item xs={12} sx={{paddingTop: "0 !important"}}>
            <Stack spacing={1.5} alignItems="center" justifyContent="center">
              <UploadAvatar size="lg" sx={{marginTop: "-1rem"}} setFieldValue={formik.setFieldValue}
                            isCustom={true}
                            file={formik.values.files?.avatar}
                            error={formik.touched.files?.avatar && Boolean(formik.errors.files?.avatar)}
                            helperText={formik.touched.files?.avatar && formik.errors.files?.avatar}/>
              <Stack spacing={0}>
                <Typography align="center" variant="caption"
                            color={formik.touched.files?.avatar && Boolean(formik.errors.files?.avatar) ? "error" : "primary"}>
                  Upload Avatar - Allowed &lsquo;image/*&rsquo; (*.png, *.jpeg, *.jpg, *.gif)
                </Typography>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={0.5}>
              <TextField spellCheck="false" id='botName' inputProps={{maxLength: 25}} name='botName'
                         placeholder='GPT name' fullWidth
                         value={formik.values.botName}
                // onBlur={formik.handleBlur}
                         onChange={formik.handleChange}
                         autoComplete="off"
                         error={formik.touched.botName && Boolean(formik.errors.botName)}
                         helperText={formik.touched.botName && formik.errors.botName} label='GPT Name*'/>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={0.5}>
              <TextField id='companyName' name='companyName' placeholder='company name' fullWidth
                         value={formik.values.companyName}
                         onChange={formik.handleChange}
                // onBlur={formik.handleBlur}
                         autoComplete="off"
                         error={formik.touched.companyName && Boolean(formik.errors.companyName)}
                         helperText={formik.touched.companyName && formik.errors.companyName} label='Company Name*'/>
            </Stack>
          </Grid>
          {(botFormData?.creationType === "Financial Summary") || (botFormData?.creationType === "Loan Management") ? <Grid item xs={12}> <CustomFileUpload showList={true}
                                                                                                     setFieldValue={formik.setFieldValue}
                                                                                                     selectedFiles={formik.values.files.customFiles}
                                                                                                                                                            isFileLimit={5}                                                                             setFileError={setFileError}
                                                                                                     fileError={fileError}
                                                                                                     isCustom={true}
                                                                                                     files={formik.values.files?.customFiles}
                                                                                                     error={formik.touched.files?.customFiles && !!formik.errors.files?.customFiles}/>
          </Grid> : <Grid item xs={12} sm={6}>
            <Stack spacing={0.5} sx={{position: "relative"}}>
              <TextField id='companyWebsite' name='companyWebsite'
                         placeholder='company website' fullWidth
                         autoComplete="off"
                         value={formik.values.companyWebsite}
                         disabled={isValidUrl || showVerifyErrorMsg.isVerifying}
                         onChange={formik.handleChange}
                         error={formik.touched.companyWebsite && Boolean(formik.errors.companyWebsite)}
                         label='Company Website*'/>
              <Button variant="contained" color={isValidUrl ? "success" : "primary"}
                      disabled={formik.values.companyWebsite?.trim() === ""}
                      sx={{
                        pointerEvents: showVerifyErrorMsg.isVerifying || isValidUrl ? "none" : "",
                        minWidth: "72px",
                        minHeight: "36px",
                        position: "absolute",
                        bottom: "10px",
                        right: "10px"
                      }}
                      onClick={verifyBusinessUrl}>
                {showVerifyErrorMsg.isVerifying ? <CircularProgress sx={{
                  color: "#ffff", height: "26px !important", width: "26px" +
                    " !important"
                }}/> : (isValidUrl ? "Verified" : "verify")}
              </Button>
            </Stack>
            {
              (showVerifyErrorMsg.isError || formik.touched.companyWebsite && formik.errors.companyWebsite) &&
              <FormHelperText error>{formik.touched.companyWebsite && formik.errors.companyWebsite}</FormHelperText>
            }
          </Grid>}

          {botFormData?.creationType === "Lead Generation" && <Grid item xs={12} sm={6}>
            <Stack spacing={0.5}>
              <TextField id='salesTeamEmail' name='salesTeamEmail'
                         placeholder='Sales Team Email' fullWidth
                         value={formik.values.salesTeamEmail}
                         autoComplete="off"
                // onBlur={formik.handleBlur}
                         onChange={formik.handleChange}
                         error={formik.touched.salesTeamEmail && Boolean(formik.errors.salesTeamEmail)}
                         helperText={formik.touched.salesTeamEmail && formik.errors.salesTeamEmail}
                         label='Sales Team Email*'/>
            </Stack>
          </Grid>
          }
          {
            botFormData.creationType === "Appointment Booking" && <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <TextField id='slotDuration' name='slotDuration'
                           select
                           fullWidth
                           value={formik.values.slotDuration}
                  // onBlur={formik.handleBlur}
                           onChange={formik.handleChange}
                           error={formik.touched.slotDuration && Boolean(formik.errors.slotDuration)}
                           helperText={formik.touched.slotDuration && formik.errors.slotDuration}
                           label='Slot Duration*'>
                  {timeIntervals.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">Custom</MenuItem>
                </TextField>
              </Stack>
            </Grid>
          }
          {botFormData.creationType === "Appointment Booking" && formik.values.slotDuration === "custom" && (
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <TextField id='customSlotDuration' name='customSlotDuration'
                           placeholder='Custom Slot Duration' fullWidth
                           type="text"
                           value={formik.values.customSlotDuration}
                           onChange={(e) => {
                             const value = e.target.value.replace(/[^0-9]/g, '');
                             if (value.length <= 3) {
                               formik.setFieldValue('customSlotDuration', value);
                             }
                           }}
                           onKeyUp={(e) => {
                             e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                           }}
                           error={formik.touched.customSlotDuration && Boolean(formik.errors.customSlotDuration)}
                           helperText={formik.touched.customSlotDuration && formik.errors.customSlotDuration}
                           InputProps={{ endAdornment : (<Typography sx={{background:"#8080802e",padding:"8px",borderRadius:"4px",color:"#000000c9"}} >Minutes</Typography>)}}/>
              </Stack>
            </Grid>
          )}
        </Grid>
        <Grid item xs={12} marginBottom={{xs: "4.5rem", sm: "0"}}>
          <Stack direction='row' marginRight="6px" justifyContent='space-between' marginBottom="6px">
            <Button onClick={handleBack} sx={{my: 3, ml: 1}} disabled={showVerifyErrorMsg.isVerifying}>
              Back
            </Button>
            <AnimateButton>
              <Button variant='contained' sx={{my: 3, ml: 1}} disabled={showVerifyErrorMsg.isVerifying} type='submit'
                      onClick={() => setErrorIndex(1)}>
                Next
              </Button>
            </AnimateButton>
          </Stack>
        </Grid>
      </form>
    </>
  )
}

export default BotTemplateForm;
