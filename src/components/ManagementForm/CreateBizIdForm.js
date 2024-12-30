import React, {useEffect, useState} from "react";
import * as Yup from "yup";
import {useFormik} from 'formik';
import {
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  Divider,
  Button,
  IconButton
} from "@mui/material";
import {useDispatch} from "../../store";
import AnimateButton from "../@extended/AnimateButton";
import CircularProgress from "@mui/material/CircularProgress";
import {Close} from "@mui/icons-material";

const BizIdGenerationForm = ({
                           resetFormDetails,
                           getFormValues,
                           isFormSubmitted,
                           onCloseDialog
                         }) => {
  const [showProgress, setShowProgress] = useState(false)
  const [globalError, setGlobalError] = useState('')

  useEffect(() => {
    if (!resetFormDetails) {
      formik.resetForm();
    }
  }, [resetFormDetails]);

  useEffect(() => {
    if (isFormSubmitted?.isSubmit) {
      formik.resetForm();
      setShowProgress(false);
    }
  }, [isFormSubmitted]);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
    companyName: Yup.string().max(255).required('Company Name is required'),
  })

  const formik = useFormik({
    initialValues: {
      email: '',
      companyName: '',
      companyWebsite:''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      try {
        setShowProgress(true)
        getFormValues(values)
      } catch (err) {
        setShowProgress(false)
        setGlobalError(err.message)
      }
    }
  });

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} paddingTop="6px !important">
          <Stack flexDirection="row" justifyContent="center" alignItems="center">
            <Typography sx={{
              fontSize: "18px",
              fontWeight: "500",
              textAlign: "center",
              paddingBottom: "6px"
            }}>Generate a New Business ID</Typography>
            <IconButton
              aria-label="close"
              color="primary"
              onClick={() => onCloseDialog()}
              sx={{borderRadius:"50%",position:"absolute",right:0,top:"6px"}}
            >
              <Close style={{width:"22px",height:"22px"}}/>
            </IconButton>
          </Stack>

          <Divider/>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="email-details">Email Id*</InputLabel>
            <OutlinedInput
              id="email-details"
              type="text"
              value={formik.values.email}
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              placeholder="Email"
              disabled={showProgress}
              fullWidth
              error={Boolean(formik.touched.email && formik.errors.email)}
            />
            {formik.touched.email && formik.errors.email && (
              <FormHelperText error id="helper-text-email">
                {formik.errors.email}
              </FormHelperText>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="company-name">Company Name*</InputLabel>
            <OutlinedInput
              fullWidth
              error={Boolean(formik.touched.companyName && formik.errors.companyName)}
              id="company-name"
              value={formik.values.companyName}
              onBlur={formik.handleBlur}
              name="companyName"
              disabled={showProgress}
              onChange={formik.handleChange}
              placeholder="Company name"
            />
            {formik.touched.companyName && formik.errors.companyName && (
              <FormHelperText error id="helper-text-company-name">
                {formik.errors.companyName}
              </FormHelperText>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="email-details">Company Website</InputLabel>
            <OutlinedInput
              id="company-website-details"
              type="text"
              value={formik.values.companyWebsite}
              name="companyWebsite"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              placeholder="Company Website"
              disabled={showProgress}
              fullWidth
            />
          </Stack>
        </Grid>
        {globalError.length > 0 && (
          <Grid item xs={12}>
            <FormHelperText error>{globalError}</FormHelperText>
          </Grid>
        )}
        <Grid item xs={12} display="flex" mt={2} justifyContent="center">
          <AnimateButton>
            <Button disableElevation sx={{minWidth: "6rem", pointerEvents: showProgress ? "none" : "",padding:"4px"}} fullWidth
                    size="large" type="submit"
                    variant="contained" color="primary">
              {showProgress ? <CircularProgress sx={{
                width: "22px !important",
                height: "22px" +
                  " !important",
                color: "#ffff",
                position: "relative",
                left: "2px",
                top: 0
              }}/> : "Generate"}
            </Button>
          </AnimateButton>
        </Grid>
      </Grid>
    </form>
  )
}


export default BizIdGenerationForm;
