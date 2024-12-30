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
import AnimateButton from "../@extended/AnimateButton";
import CircularProgress from "@mui/material/CircularProgress";
import {Close} from "@mui/icons-material";

const UserDetailsUpdateForm = ({
                                 resetFormDetails,
                                 getFormValues,
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

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().max(255).required('First Name is required'),
    lastName: Yup.string().max(255).required('Last Name is required'),
    companyName: Yup.string().max(255).required('Company Name is required'),
  })

  const formik = useFormik({
    initialValues: {
      firstName: userInitialDetails?.firstName ? userInitialDetails?.firstName : '',
      lastName: userInitialDetails?.lastName ? userInitialDetails?.lastName : '',
      email: userInitialDetails?.email ? userInitialDetails?.email : '',
      companyName: userInitialDetails?.company ? userInitialDetails?.company : '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      try {
        setShowProgress(true);
        getFormValues(values);
      } catch (err) {
        setShowProgress(false);
        setGlobalError(err.message);
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
            }}>Update User Profile</Typography>
            <IconButton
              aria-label="close"
              color="primary"
              onClick={() => onCloseDialog()}
              sx={{borderRadius: "50%", position: "absolute", right: 0, top: "6px"}}
            >
              <Close style={{width: "22px", height: "22px"}}/>
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
              disabled={true}
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
              disabled={true}
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
        {globalError.length > 0 && (
          <Grid item xs={12}>
            <FormHelperText error>{globalError}</FormHelperText>
          </Grid>
        )}
        <Grid item xs={12} display="flex" justifyContent="center">
          <AnimateButton>
            <Button disabled={!formik.dirty} disableElevation sx={{minWidth: "6rem", pointerEvents: showProgress ? "none" : ""}} fullWidth
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
  );
}

export default UserDetailsUpdateForm;
