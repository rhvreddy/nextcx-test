import {useNavigate} from 'react-router-dom';

// material-ui
import {useOutletContext} from 'react-router';

import {useDispatch, useSelector} from 'react-redux';

// material-ui
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';

// third party
import {useFormik} from 'formik';

// project import
// import { useInputRef } from './index';
import MainCard from 'components/MainCard';

// assets
import {useEffect, useState} from 'react';
import {
  getUserInfo,
  setEditProfile,
  updateProfileInfo,
  setEditButton,
  setImageUpload
} from '../../../../store/reducers/profile';
import * as Yup from 'yup';
import {triggerNotification} from "../../../../store/reducers/chat";
import {toast} from "react-toastify";

// styles & constant
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
};

const skills = [
  'Adobe XD',
  'After Effect',
  'Angular',
  'Animation',
  'ASP.Net',
  'Bootstrap',
  'C#',
  'CC',
  'Corel Draw',
  'CSS',
  'DIV',
  'Dreamweaver',
  'Figma',
  'Graphics',
  'HTML',
  'Illustrator',
  'J2Ee',
  'Java',
  'Javascript',
  'JQuery',
  'Logo Design',
  'Material UI',
  'Motion',
  'MVC',
  'MySQL',
  'NodeJS',
  'npm',
  'Photoshop',
  'PHP',
  'React',
  'Redux',
  'Reduxjs & tooltit',
  'SASS',
  'SCSS',
  'SQL Server',
  'SVG',
  'UI/UX',
  'User Interface Designing',
  'Wordpress'
];

function useInputRef() {
  return useOutletContext();
}

// ==============================|| TAB - PERSONAL ||============================== //

const TabPersonal = () => {
  const [userInfo, setUserInfo] = useState();
  const navigate = useNavigate()
  const profile = useSelector(state => state.profile)
  const [disclaimer, setDisclaimer] = useState("")

  const resetHandler = () => {
    setDisclaimer("");
    formik.resetForm();
    dispatch(setEditProfile(false));
    dispatch(setEditButton(true));
    dispatch(setImageUpload(false));
  }
  const handleChangeDay = (event, date, setFieldValue) => {
    setFieldValue('dob', new Date(date.setDate(parseInt(event.target.value, 10))));
  };

  const handleChangeMonth = (event, date, setFieldValue) => {
    setFieldValue('dob', new Date(date.setMonth(parseInt(event.target.value, 10))));
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  const dispatch = useDispatch();
  const inputRef = useInputRef();

  let userId = localStorage.getItem('userId');

  const [initialValues, setInitialValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '',
    jobTitle: '',
  });

  useEffect(() => {
    if (userInfo) {
      setInitialValues({
        firstName: userInfo?.firstName ? userInfo?.firstName : '',
        lastName: userInfo?.lastName ? userInfo.lastName : '',
        email: userInfo?.email ? userInfo?.email : '',
        phone: userInfo?.phone ? userInfo?.phone : '',
        jobTitle: userInfo?.jobTitle ? userInfo?.jobTitle : '',
        countryCode: userInfo?.countryCode ? userInfo?.countryCode : ''
      });
    }
  }, [userInfo]);

  useEffect(() => {
    dispatch(setEditProfile(false));
    dispatch(getUserInfo(userId)).then((action) => {
      const info = JSON.parse(JSON.stringify(action.payload.userInfo))
      if (info?.phone?.length > 10 && info?.countryCode?.length > 0) {
        info["phone"] = info?.phone?.substring(info?.countryCode?.length)
      }
      setUserInfo(info);
    }).catch((err) => {
      setUserInfo({});
    });
  }, []);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().max(255).required('First Name is required'),
    lastName: Yup.string().max(255).required('Last Name is required'),
    email: Yup.string().email('Must be a valid email').max(255),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number')
      .test(
        'is-country-code-given',
        'Both country code and phone number are required',
        function (value) {
          let {countryCode} = this.parent;
          return !value || (value && countryCode);
        }
      ),
    countryCode: Yup.string()
      .test(
        'is-phone-number-given',
        'Both country code and phone number are required',
        function (value) {
          let {phone} = this.parent;
          return !value || (value && phone);
        }
      ),
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setDisclaimer("")
      let emailUpdate = "N"
      let phoneUpdate = "N"
      let submittedValues = JSON.parse(JSON.stringify(values));
      if (submittedValues?.email !== '' && submittedValues?.email !== userInfo?.email) {
        emailUpdate = "Y"
      }
      if (submittedValues?.phone !== '' && submittedValues?.phone !== userInfo?.phone) {
        phoneUpdate = "Y"
      }
      if (submittedValues?.countryCode !== '' && submittedValues?.phone !== '') {
        submittedValues['phone'] = submittedValues?.countryCode + submittedValues?.phone;
      }
      let updateInfo = {
        info: {...submittedValues},
        userId: userId
      };
      const formData = new FormData()
      if (profile?.userAvatar) {
        const {userAvatar} = profile
        updateInfo.info = {...updateInfo.info, userAvatar: userAvatar}
        formData.append("userAvatar", userAvatar)
      }
      formData.append("emailUpdate", emailUpdate)
      formData.append("phoneUpdate", phoneUpdate)
      formData.append("updateInfo", JSON.stringify(updateInfo))
      formData.append("isNotParsed", "Y")
      dispatch(updateProfileInfo(formData)).then((action) => {
        if (action.payload && action.payload?.status?.toLowerCase() !== "error") {
          const info = JSON.parse(JSON.stringify(action.payload.userInfo))
          if (info?.phone?.length > 10 && info?.countryCode?.length > 0) {
            info["phone"] = info?.phone?.substring(info?.countryCode?.length)
          }
          setInitialValues(info)
          setUserInfo(info);
          dispatch(setEditProfile(false))
          dispatch(setEditButton(true))
          dispatch(setImageUpload(false))
          dispatch(triggerNotification({isNotify: true}));
          toast.success("Saved info successfully.");
          setDisclaimer("")
        } else {
          if (formData.get("emailUpdate") === "Y") {
            setDisclaimer(`*The Email Address (${values?.email}) is already in use!`)
          } else if (formData.get("phoneUpdate") === "Y") {
            setDisclaimer(`*The Phone Number (${values.phone}) is already in use!`)
          } else {
            setDisclaimer(action?.payload?.message || "The details provided during your profile update are not valid. Please try again")
          }
        }

      }).catch((err) => {
        console.error(err.message);
        toast.error(err.message);
      });
    }
  });


  return (
    <MainCard content={false} title='Personal Information' sx={{'& .MuiInputLabel-root': {fontSize: '0.875rem'}}}>
      <form noValidate onSubmit={formik.handleSubmit}>
        <Box sx={{p: 2.5}}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor='personal-first-name'>First Name</InputLabel>
                <TextField
                  fullWidth
                  id='personal-first-name'
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  name='firstName'
                  placeholder='First Name'
                  autoFocus
                  error={Boolean(formik.touched.firstName && formik.errors.firstName)}
                  disabled={!profile.editProfile}
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <FormHelperText error id="helper-text-firstname-edit">
                    {formik.errors.firstName}
                  </FormHelperText>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor='personal-last-name'>Last Name</InputLabel>
                <TextField
                  fullWidth
                  id='personal-last-name'
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  name='lastName'
                  placeholder='Last Name'
                  error={Boolean(formik.touched.lastName && formik.errors.lastName)}
                  disabled={!profile.editProfile}
                />
              </Stack>
              {formik.touched.lastName && formik.errors.lastName && (
                <FormHelperText error id="helper-text-lastname-signup">
                  {formik.errors.lastName}
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor='personal-email'>Email Address</InputLabel>
                <TextField
                  type='email'
                  fullWidth
                  disabled={!profile.editProfile || userInfo?.email?.length > 0}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  name='email'
                  id='personal-email'
                  placeholder='Email Address'
                  error={Boolean(formik.touched.email && formik.errors.email)}
                />
                {formik.touched.email && formik.errors.email && (
                  <FormHelperText error id="helper-text-email-signup">
                    {formik.errors.email}
                  </FormHelperText>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor='personal-phone'>Phone Number</InputLabel>
                <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
                  <Select name='countryCode' value={formik.values.countryCode} onChange={formik.handleChange}
                          disabled={!profile.editProfile || userInfo?.countryCode?.length > 0}>
                    <MenuItem value='91'>+91</MenuItem>
                    <MenuItem value='1-671'>1-671</MenuItem>
                    <MenuItem value='+36'>+36</MenuItem>
                    <MenuItem value='(225)'>(255)</MenuItem>
                    <MenuItem value='+39'>+39</MenuItem>
                    <MenuItem value='1-876'>1-876</MenuItem>
                    <MenuItem value='+7'>+7</MenuItem>
                    <MenuItem value='(254)'>(254)</MenuItem>
                    <MenuItem value='(373)'>(373)</MenuItem>
                    <MenuItem value='1-664'>1-664</MenuItem>
                    <MenuItem value='+95'>+95</MenuItem>
                    <MenuItem value='(264)'>(264)</MenuItem>
                  </Select>
                  <TextField
                    fullWidth
                    id='personal-contact'
                    autoComplete={"off"}
                    type="text"
                    onKeyUp={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                    }}
                    error={Boolean(formik.errors.phone)}
                    value={formik?.values?.phone?.length > 10 ? formik?.values?.phone?.substring(formik?.values?.countryCode?.length) : formik?.values?.phone}
                    onChange={formik.handleChange}
                    name='phone'
                    placeholder='Contact Number'
                    disabled={!profile.editProfile || userInfo?.phone?.length > 0}
                  />
                </Stack>
                {formik.errors.phone && (
                  <FormHelperText error id="helper-text-contact-number">
                    {formik.errors.phone}
                  </FormHelperText>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor='personal-jobTitle'>Job Title</InputLabel>
                <TextField
                  fullWidth
                  id='personal-jobTitle'
                  value={formik.values.jobTitle}
                  onChange={formik.handleChange}
                  name='jobTitle'
                  placeholder='Job Title'
                  disabled={!profile.editProfile || userInfo?.jobTitle?.length > 0}
                />

              </Stack>
            </Grid>
          </Grid>
          <Stack mt={2}>
            <Typography sx={{color: "#ff4d4f", fontWeight: 500, fontSize: "15px"}}>
              {disclaimer}
            </Typography>
          </Stack>
          <Stack direction='row' justifyContent='flex-end' alignItems='center' spacing={2} sx={{mt: 2.5}}>
            {profile.editProfile && <Button variant='outlined' color='secondary' onClick={resetHandler}>
              Cancel
            </Button>}
            {profile.editProfile &&
              <Button type='submit' variant='contained' disabled={!formik.dirty && !profile.imageUpload}>
                Save
              </Button>}
          </Stack>
        </Box>
      </form>
    </MainCard>
  );
};

export default TabPersonal;
