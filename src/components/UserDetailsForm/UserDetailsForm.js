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

const UserDetailsForm = ({
                           resetFormDetails,
                           customFormTitle,
                           getFormValues,
                           isFormSubmitted,
                           sourcePage,
                           userInitialDetails,
                           onCloseDialog
                         }) => {
  const [showProgress, setShowProgress] = useState(false)
  const [globalError, setGlobalError] = useState('')

  useEffect(() => {
    if (!resetFormDetails) {
      formik.resetForm();
    }
  }, [resetFormDetails])

  useEffect(() => {
    if (isFormSubmitted?.isSubmit && isFormSubmitted?.message === "success") {
      formik.resetForm();
      setShowProgress(false);
    } else if (isFormSubmitted?.isSubmit && isFormSubmitted?.message === "error") {
      formik.resetForm();
      setShowProgress(false);
    }
  }, [isFormSubmitted])

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().max(255).required('First Name is required'),
    lastName: Yup.string().max(255).required('Last Name is required'),
    email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
    phoneNumber: Yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number')
      .test(
        'is-country-code-given',
        'Country code is required when phone number is provided',
        function (value) {
          let {countryCode} = this.parent;
          return !value || (value && countryCode);
        }
      ),
    countryCode: Yup.string()
      .test(
        'is-phone-number-given',
        'Phone number is required when country code is provided',
        function (value) {
          let {phoneNumber} = this.parent;
          return !value || (value && phoneNumber);
        }
      ),
    companyName: Yup.string().max(255).required('Company Name is required'),
  })

  const formik = useFormik({
    initialValues: {
      firstName: userInitialDetails?.firstName ? userInitialDetails?.firstName : '',
      lastName: userInitialDetails?.lastName ? userInitialDetails?.lastName : '',
      email: userInitialDetails?.email ? userInitialDetails?.email : '',
      phoneNumber: '',
      countryCode: '',
      companyName: userInitialDetails?.companyName ? userInitialDetails?.companyName : '',
      comments: ''
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
            }}>{customFormTitle}</Typography>
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
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="firstname-signup">First Name*</InputLabel>
            <OutlinedInput
              id="first-name"
              type="text"
              value={formik.values.firstName}
              name="firstName"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              disabled={showProgress}
              placeholder="First name"
              fullWidth
              error={Boolean(formik.touched.firstName && formik.errors.firstName)}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <FormHelperText error id="helper-text-first-name">
                {formik.errors.firstName}
              </FormHelperText>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="lastname-details">Last Name*</InputLabel>
            <OutlinedInput
              id="last-name"
              type="text"
              value={formik.values.lastName}
              name="lastName"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              disabled={showProgress}
              placeholder="Last name"
              fullWidth
              error={Boolean(formik.touched.lastName && formik.errors.lastName)}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <FormHelperText error id="helper-text-last-name">
                {formik.errors.lastName}
              </FormHelperText>
            )}
          </Stack>
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
            <InputLabel htmlFor="phoneNumber-details">Phone Number</InputLabel>
            <Stack xs={12} gap={1} direction={"row"} style={{alignItems: "center", justifyContent: "space-between"}}>
              <OutlinedInput
                id="demo-simple-select"
                name="countryCode"
                type="number"
                error={Boolean(formik.touched.countryCode && formik.errors.countryCode)}
                disabled={showProgress}
                onBlur={formik.handleBlur}
                style={{width: "85px"}}
                placeholder="91"
                value={formik.values.countryCode}
                onChange={formik.handleChange}
              />
              <OutlinedInput
                id="phoneNumber-details"
                type="text"
                value={formik.values.phoneNumber}
                name="phoneNumber"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                disabled={showProgress}
                placeholder="Phone number"
                onKeyUp={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                }}
                fullWidth
                error={Boolean(formik.touched.phoneNumber && formik.errors.phoneNumber)}
              />
            </Stack>
            {formik.touched.countryCode && formik.errors.countryCode && (
              <FormHelperText error id="standard-weight-helper-text-email-login">
                {formik.errors.countryCode}
              </FormHelperText>
            )}
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <FormHelperText error id="standard-weight-helper-text-email-login">
                {formik.errors.phoneNumber}
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
        {sourcePage && <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="comments">Comments/Information to be shared Box</InputLabel>
            <OutlinedInput
              fullWidth
              id="comments"
              multiline
              minRows="2"
              maxRows="4"
              type="text"
              disabled={showProgress}
              value={formik.values.comments || ''}
              name="comments"
              onChange={formik.handleChange}
              placeholder="Add Your Comments Here"
            />
          </Stack>
        </Grid>}
        {globalError.length > 0 && (
          <Grid item xs={12}>
            <FormHelperText error>{globalError}</FormHelperText>
          </Grid>
        )}
        <Grid item xs={12} display="flex" justifyContent="center">
          <AnimateButton>
            <Button disableElevation sx={{minWidth: "6rem", pointerEvents: showProgress ? "none" : ""}} fullWidth
                    size="large" type="submit"
                    variant="contained" color="primary">
              {showProgress ? <CircularProgress sx={{
                width: "22px !important",
                height: "22px" +
                  " !important",
                color: "#ffff",
                position: "relative",
                left: "2px",
                top: "2px"
              }}/> : "Submit"}
            </Button>
          </AnimateButton>
        </Grid>
      </Grid>
    </form>
  )
}


export default UserDetailsForm;
