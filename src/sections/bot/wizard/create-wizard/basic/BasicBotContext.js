import PropTypes from 'prop-types';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  Stack,
  Typography,
  TextField,
  FormHelperText, List, ListItem, ListItemButton, ListItemText,
  Paper, Link, CircularProgress
} from '@mui/material';
import {useFormik} from 'formik';
import AnimateButton from 'components/@extended/AnimateButton';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import IconButton from "../../../../../components/@extended/IconButton";
import {DeleteTwoTone, FileExcelOutlined, PlusSquareOutlined} from '@ant-design/icons';
import UploadMultiFile from "../../../../../components/third-party/dropzone/MultiFile";
import {validateBusinessUrl} from "../../../../../store/reducers/botRecords";
import {dispatch} from "../../../../../store";


const BasicBotContext = ({botFormData, setBotFormData, handleNext, setErrorIndex, handleBack}) => {
  const [businessUrl, setBusinessUrl] = useState("");
  const [verifiedBusinessUrl, setVerifiedBusinessUrl] = useState("");
  const [customBusinessUrls, setCustomBusinessUrls] = useState([]);
  const [fileError, setFileError] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const urlsContainerRef = useRef(null);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [showVerifyErrorMsg, setShowVerifyErrorMsg] = useState({
    text: "",
    isError: false,
    isVerifying: false
  });
  const [showAddUrlErrorMsg, setShowAddUrlErrorMsg] = useState({
    text: "",
    isError: false
  });
  const formik = useFormik({
    initialValues: {
      botContext: botFormData.botContext,
      businessUrls: botFormData?.businessUrls,
      verifiedBusinessUrl: botFormData?.verifiedBusinessUrl,
      files: botFormData?.businessInfoAttachments
    },
    onSubmit: (values) => {
      // console.log('form submit & including upload - ', values);
      const pdfFiles = values.files.filter(file => file.type === 'application/pdf');
      const excelFiles = values.files.filter(file => file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      setBotFormData({
        ...botFormData,
        botContext: values.botContext,
        businessUrls: customBusinessUrls,
        businessInfoAttachments: values?.files,
        verifiedBusinessUrl: isValidUrl ? verifiedBusinessUrl : ""
      });

      (pdfFiles?.length <= 3 && excelFiles?.length <= 1) ? handleNext() : setFileError(true);
    }
  });

  // Maintaining Urls state
  useEffect(() => {
    if (botFormData?.businessUrls?.length > 0) {
      setCustomBusinessUrls(botFormData?.businessUrls);
    }
    if (botFormData?.verifiedBusinessUrl !== "") {
      setVerifiedBusinessUrl(botFormData?.verifiedBusinessUrl);
      setIsValidUrl(true);
      setShowAddUrlErrorMsg({text: "", isError: false});
      setShowVerifyErrorMsg({text: "", isError: false, isVerifying: false});
    }
  }, []);

  useEffect(() => {
    if (urlsContainerRef.current && scrollToBottom) {
      urlsContainerRef.current.scrollTop = urlsContainerRef.current.scrollHeight;
      setScrollToBottom(false)
    }
  }, [scrollToBottom]);

  useEffect(() => {
    if (businessUrl === "") {
      setShowAddUrlErrorMsg({text: "", isError: false});
    }
  }, [businessUrl]);

  useEffect(() => {
    if (verifiedBusinessUrl === "") {
      setShowVerifyErrorMsg({text: "", isError: false, isVerifying: false});
    }
  }, [verifiedBusinessUrl]);

  // To get custom URL input
  const handleChangeCustomUrl = (event) => {
    setBusinessUrl(event.target.value);
  }

  const handleChangeVerifyUrl = (event) => {
    setVerifiedBusinessUrl(event.target.value);
  }

  const verifyBusinessUrl = async () => {
    if (verifiedBusinessUrl && verifiedBusinessUrl !== "") {
      setShowVerifyErrorMsg({...showVerifyErrorMsg, isVerifying: true});
      const data = {url: verifiedBusinessUrl};
      const response = await dispatch(validateBusinessUrl(data));
      if (response?.payload?.status?.toLowerCase() === "success") {
        handleAddVerifiedUrl();
      } else {
        setShowVerifyErrorMsg({
          text: "Please enter a valid URL",
          isError: true,
          isVerifying: false
        });
      }
    } else {
      setShowVerifyErrorMsg({
        text: "Empty input is not allowed.",
        isError: true,
        isVerifying: false
      });
    }
  }

  function compareDomain(array1, array2) {
    for (let i = 0; i < array1.length; i++) {
      if (array1[i]?.toLowerCase() === array2[i]?.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  const validateNonVerifiedUrls = (url) => {
    let customUrl = url.trim();
    if (typeof customUrl !== 'string') {
      return {text: "Invalid input: URL must be a string", isValid: false};
    }
    if (!customUrl.startsWith("https://")) {
      return {text: "URL must contain https://", isValid: false};
    }
    const validDomain = verifiedBusinessUrl.split(/\/\/|\./);
    const nonValidDomain = customUrl.split(/\/\/|\./);
    const valuesToRemove = ["https:", "com", "www"];
    const verifiedDomain = validDomain.filter(item => !valuesToRemove.includes(item.trim()));
    const domainToValidate = nonValidDomain.filter(item => !valuesToRemove.includes(item.trim()));
    if (customUrl.trim() === verifiedBusinessUrl.trim()) {
      return {text: "URL already added", isValid: false};
    } else if (compareDomain(verifiedDomain, domainToValidate)) {
      return {text: "Valid URL", isValid: true};
    } else {
      return {text: "Domain must match with verified URL", isValid: false};
    }
  };

  // To add custom URL to the list
  const handleAddUrl = async () => {
    if (businessUrl && businessUrl !== "") {
      if (isValidUrl) {
        const response = await validateNonVerifiedUrls(businessUrl)
        if (response.isValid) {
          setCustomBusinessUrls((prev) => [
            {type: 'webpage', url: businessUrl},
            ...prev
          ]);
          setScrollToBottom(true);
          setBusinessUrl("");
          setShowAddUrlErrorMsg({text: "", isError: false});
        } else {
          setShowAddUrlErrorMsg({text: response.text, isError: true});
        }
      } else {
        setShowAddUrlErrorMsg({text: "Please verify business URL first", isError: true});
      }
    } else {
      setShowAddUrlErrorMsg({text: "Empty input is not allowed", isError: true});
    }
  }

  const handleAddVerifiedUrl = () => {
    if (verifiedBusinessUrl && verifiedBusinessUrl !== "") {
      setCustomBusinessUrls((prev) => [
        {type: 'webpage', url: verifiedBusinessUrl},
        ...prev
      ]);
      setIsValidUrl(true);
      setScrollToBottom(true);
      setShowAddUrlErrorMsg({text: "", isError: false});
      setShowVerifyErrorMsg({text: "", isError: false, isVerifying: false});
    }
  }

  // To remove URL in the list
  const handleDeleteUrl = (DeletedData, index) => {
    if (index > -1) {
      customBusinessUrls?.splice(index, 1);
    }
    setCustomBusinessUrls((prev) => [
      ...prev
    ]);
  }


  return (
    <Grid item xs={12} >
      <Typography variant='h6' gutterBottom sx={{mb: 2}}>
        Teach your bot about your business
      </Typography>
      <form onSubmit={formik.handleSubmit} id='validation-forms'>
        <Grid ref={urlsContainerRef} container spacing={3} sx={{
          height: "auto", overflowY: "auto", overflowX: "hidden", '::-webkit-scrollbar': {
            width: "4px",
            height: "4px"
          },
          '::-webkit-scrollbar-track': {
            background: "#f1f1f1",
          },
          '::-webkit-scrollbar-thumb': {
            background: "#88888840",
          }
        }} maxHeight={{xs: "40vh", md: "45vh"}}>
          <Grid item xs={24} sm={12}>
            <Stack spacing={0.5} alignItems='center'>
              <TextField spellCheck='false' id='botContext' name='botContext' placeholder='Tell about your business'
                         fullWidth
                         multiline rows={5}
                         value={formik.values.botContext || ''}
                         onChange={formik.handleChange}
                         error={formik.touched.botContext && Boolean(formik.errors.botContext)}
                         helperText={formik.touched.botContext && formik.errors.botContext}
                         label='Tell about your business'/>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Typography gutterBottom sx={{mb: 1}}>
              The FAQs you upload here will be trained and would be available live.
            </Typography>
            <Grid container spacing={3}>
              <Grid item>
                <Stack spacing={0.5}>
                  <List>
                    <ListItem>
                      <FileExcelOutlined/>
                      <Link sx={{marginLeft: '5px'}} align="left"
                            href="https://skil-ai-cf.s3.amazonaws.com/sample/bot-creation-excel-example-01.xlsx"
                            target="_blank">
                        Download Sample Q&A Template
                      </Link>
                    </ListItem>
                  </List>
                </Stack>
              </Grid>
            </Grid>
            <Typography variant="h6" gutterBottom>Upload your business files</Typography>
            <UploadMultiFile showList={true} showSingleFile={false} customStyles={true}
                             setFieldValue={formik.setFieldValue}
                             isFileLimit={4} setFileError={setFileError} fileError={fileError}
                             selectedFiles={formik.values.files}
                             files={formik.values.files} error={formik.touched.files && !!formik.errors.files}/>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Verify your business URL</Typography>
            <TextField disabled={isValidUrl || showVerifyErrorMsg.isVerifying} error={showVerifyErrorMsg.isError}
                       fullWidth
                       value={verifiedBusinessUrl || ""}
                       onChange={handleChangeVerifyUrl} autoComplete="off" placeholder="verify here..."
                       label="verify your business URL" InputProps={{
              endAdornment: (
                <Button variant="contained" color={isValidUrl ? "success" : "primary"}
                        sx={{
                          pointerEvents: showVerifyErrorMsg.isVerifying || isValidUrl ? "none" : "",
                          minWidth: "72px",
                          minHeight: "36px"
                        }}
                        onClick={verifyBusinessUrl}>
                  {showVerifyErrorMsg.isVerifying ? <CircularProgress sx={{
                    color: "#ffff", height: "26px !important", width: "26px" +
                      " !important"
                  }}/> : (isValidUrl ? "Verified" : "verify")}
                </Button>
              )
            }}/>
            {
              showVerifyErrorMsg.isError && <FormHelperText error>{showVerifyErrorMsg.text}</FormHelperText>
            }
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Upload your business URLs</Typography>
            <TextField fullWidth value={businessUrl || ""} onChange={handleChangeCustomUrl}
                       placeholder="add your business URL" label="add your business URL" InputProps={{
              endAdornment: (
                <IconButton size="small" onClick={handleAddUrl}
                            sx={{fontSize: '2.5rem', ml: "15px", mt: "3px"}}>
                  <PlusSquareOutlined/>
                </IconButton>
              )
            }}/>
            {
              showAddUrlErrorMsg.isError && <FormHelperText error>{showAddUrlErrorMsg.text}</FormHelperText>
            }
          </Grid>
          {
            customBusinessUrls?.length > 0 && <Grid item xs={12} md={12} sx={{
              border: '1px solid #80808026',
              marginTop: '4px',
              marginBottom: '4px',
              marginLeft: '24px',
              marginRight: '6px',
              borderRadius: '6px',
              boxShadow: '0 0 8px -6px rgb(0 0 0)'
            }}>
              <List sx={{
                overflowY: 'auto', maxHeight: '100px', p: 0, '::-webkit-scrollbar': {
                  width: "4px",
                  height: "4px"
                },
                '::-webkit-scrollbar-track': {
                  background: "#f1f1f1",
                },
                '::-webkit-scrollbar-thumb': {
                  background: "#88888840",
                },
                marginLeft: '-24px',
                marginTop: "-18px"
              }}>
                {customBusinessUrls?.map((item, index) => (
                  <ListItem disablePadding divider key={index}>
                    <ListItemButton sx={{overflow: 'auto', width: '30rem'}}><ListItemText
                      primary={(index + 1 + ". ") + " " + item?.url}/></ListItemButton>
                    {item?.url !== verifiedBusinessUrl &&
                      <Button onClick={() => handleDeleteUrl(item, index)}><DeleteTwoTone/></Button>}
                  </ListItem>
                ))
                }
              </List>
            </Grid>
          }

        </Grid>
        <Grid item xs={12}>
          <Stack direction='row' marginRight="6px" justifyContent='space-between' marginBottom="6px">
            <Button onClick={handleBack} sx={{my: 3, ml: 1}} disabled={showVerifyErrorMsg.isVerifying}>
              Back
            </Button>
            <AnimateButton>
              <Button variant='contained' type='submit' disabled={showVerifyErrorMsg.isVerifying} sx={{my: 3, ml: 1}}
                      onClick={() => setErrorIndex(2)}>
                Next
              </Button>
            </AnimateButton>
          </Stack>
        </Grid>
      </form>
    </Grid>
  );
};

BasicBotContext.propTypes = {
  shippingData: PropTypes.object,
  setShippingData: PropTypes.func,
  handleNext: PropTypes.func,
  setErrorIndex: PropTypes.func
};

export default BasicBotContext;
