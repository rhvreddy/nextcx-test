import PropTypes from 'prop-types';

// material-ui
import {
  Button,
  Checkbox,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  InputLabel,
  Stack,
  Typography,
  TextField,
  FormHelperText, MenuItem,
} from '@mui/material';

// third-party
import {useFormik} from 'formik';
import * as yup from 'yup';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import {SketchPicker, TwitterPicker} from 'react-color';
import UploadAvatar from '../../../../../components/third-party/dropzone/Avatar';
import React, {useEffect, useMemo, useState} from 'react';
import {styled} from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import {mainAppName} from "../../../../../consts";

const timeIntervals = [
  {value: '15 Minutes', label: '15 Mins'},
  {value: '30 Minutes', label: '30 Mins'},
  {value: '45 Minutes', label: '45 Mins'},
  {value: '60 Minutes', label: '60 Mins'}
];

const getValidationSchema = (creationType) => {
  return yup.object({
    botName: yup.string().required('GPT Name is required'),
    salesTeamEmail: creationType === "Lead Generation" ? yup.string().email('Must be a valid email').max(255).required('Sales Team Email is required') : null,
    slotDuration: creationType === "Appointment Booking" ? yup.string().required('Slot Duration is required') : null,
    customSlotDuration: yup.string().when('slotDuration', {
      is: 'custom',
      then: yup.string()
        .matches(/^\d+$/, 'Accepted numbers only')
        .max(3, 'Maximum of 3 digits allowed')
        .required('Custom Slot Duration is required'),
      otherwise: yup.string()
    })
  });
};

const AntSwitch = styled(Switch)(({theme}) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)'
    }
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#52c41a' : '#52c41a'
      }
    }
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200
    })
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
    boxSizing: 'border-box'
  }
}));
AntSwitch.displayName = 'AntSwitch';


// ==============================|| VALIDATION WIZARD - ADDRESS  ||============================== //

const BasicBotForm = ({botFormData, setBotFormData, handleNext, setErrorIndex, handleBotType, handleBack}) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState(botFormData.botColor);
  const [switchToAdvance, setSwitchToAdvance] = useState(botFormData.botType);

  const handleSwitchScreen = () => {
    if (switchToAdvance === "basic") {
      setSwitchToAdvance("advance");
      handleBotType(true);
    }
    if (switchToAdvance === "advance") {
      setSwitchToAdvance("basic");
      handleBotType(false);
    }
  };

  function handlePickerOpen() {
    setDisplayColorPicker(state => !state);
  }

  function handlePickerClose() {
    setDisplayColorPicker(false);
  }

  const formik = useFormik({

    initialValues: {
      botName: botFormData.botName,
      lastName: botFormData.lastName,
      files: botFormData.avatarFiles,
      botDescription: botFormData.botDescription,
      salesTeamEmail: botFormData.salesTeamEmail,
      slotDuration: botFormData.slotDuration,
      customSlotDuration: botFormData.customSlotDuration,
      botColor: botFormData.botColor,
    },
    validationSchema: getValidationSchema(botFormData?.creationType),
    onSubmit: (values) => {
      // console.log('form submit & including upload - ', values);
      //TODO: set other values properly...!
      setBotFormData({
        ...botFormData,
        botName: values.botName,
        avatarFiles: values.files,
        botDescription: values.botDescription,
        botColor: color,
        salesTeamEmail: values.salesTeamEmail ? values.salesTeamEmail : "",
        slotDuration: values.slotDuration,
        customSlotDuration: values.customSlotDuration,
        botType: switchToAdvance
      });
      handleNext();
    }
  });

  return (
    <>
      <Typography variant='h6' gutterBottom sx={{mb: 2}}>
        Provide a GPT name, description and preferences
      </Typography>
      <form onSubmit={formik.handleSubmit} id='validation-forms' style={{overflow: "hidden"}}>
        <Grid container spacing={3} sx={{
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
            <Stack spacing={1.5} alignItems="center">
              <UploadAvatar size="lg" sx={{marginTop: "-1rem"}} setFieldValue={formik.setFieldValue}
                            file={formik.values.files}/>
              <Stack spacing={0}>
                <Typography align="center" variant="caption" color="primary">
                  Upload Avatar - Allowed &lsquo;image/*&rsquo; (*.png, *.jpeg, *.jpg, *.gif)
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={0.5}>
              <TextField spellCheck="false" id='botName' inputProps={{maxLength: 25}} name='botName'
                         placeholder={mainAppName} fullWidth
                         value={formik.values.botName}
                         onChange={formik.handleChange}
                         error={formik.touched.botName && Boolean(formik.errors.botName)}
                         helperText={formik.touched.botName && formik.errors.botName} label='GPT Name*'/>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={0.5}>
              <TextField
                placeholder='App Theme Color'
                label='App Theme Color'
                value={`rgba(${color.r},${color.g},${color.b},${color.a})`}
                id="uiPrimaryColor"
                onClick={() => handlePickerOpen()}
                InputProps={{
                  endAdornment: (
                    <>
                      <Grid>
                        <Stack sx={{
                          background: `rgba(${color.r},${color.g},${color.b},${color.a})`,
                          width: "50px",
                          height: "40px",
                          borderRadius: "10px",
                          cursor: "pointer"
                        }}/>
                      </Grid>

                    </>
                  ), readOnly: true
                }}
              />
              {displayColorPicker ? <Grid sx={{position: "absolute", zIndex: "2", bottom: "11rem"}}>
                <Grid onClick={() => handlePickerClose()}
                      sx={{position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px'}}/>
                <SketchPicker color={color} onChange={(e) => {
                  setBotFormData({...botFormData, botColor: e.rgb})
                  setColor(e.rgb);
                }}/>
              </Grid> : null}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={0.5}>
              <TextField id='botDescription' spellCheck="false" onChange={formik.handleChange}
                         value={formik.values.botDescription || ""} multiline minRows={1} maxRows={3}
                         name='botDescription' placeholder='App Description' fullWidth label='App Description'/>
            </Stack>
          </Grid>

          {botFormData?.creationType === "Lead Generation" && <Grid item xs={12} sm={6}>
            <Stack spacing={0.5}>
              <TextField id='salesTeamEmail' name='salesTeamEmail'
                         placeholder='Sales Team Email' fullWidth
                         value={formik.values.salesTeamEmail}
                // onBlur={formik.handleBlur}
                         onChange={formik.handleChange}
                         error={formik.touched.salesTeamEmail && Boolean(formik.errors.salesTeamEmail)}
                         helperText={formik.touched.salesTeamEmail && formik.errors.salesTeamEmail}
                         label='Sales Team Email*'/>
            </Stack>
          </Grid>
          }
          {/*{*/}
          {/*  botFormData.creationType === "Appointment Booking" && <Grid item xs={12} sm={6}>*/}
          {/*    <Stack spacing={0.5}>*/}
          {/*      <TextField id='calendarLink' name='calendarLink' placeholder='Link your calendar' fullWidth*/}
          {/*                 value={formik.values.calendarLink}*/}
          {/*                 // onBlur={formik.handleBlur}*/}
          {/*                 onChange={formik.handleChange}*/}
          {/*                 error={formik.touched.calendarLink && Boolean(formik.errors.calendarLink)}*/}
          {/*                 helperText={formik.touched.calendarLink && formik.errors.calendarLink}*/}
          {/*                 label='Link your calendar*'/>*/}
          {/*    </Stack>*/}
          {/*  </Grid>*/}
          {/*}*/}
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

          <Grid item xs={12}>
            <Typography fontWeight='fontWeightMedium'>Setup</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>Basic</Typography>
              {switchToAdvance === "advance" &&
                <AntSwitch inputProps={{'aria-label': 'ant design'}} defaultChecked onChange={handleSwitchScreen}/>}
              {switchToAdvance === "basic" &&
                <AntSwitch inputProps={{'aria-label': 'ant design'}} onChange={handleSwitchScreen}/>}
              <Typography>Advanced</Typography>
            </Stack>
          </Grid>
        </Grid>
        <Grid item xs={12} marginBottom={{xs: "4.5rem", sm: "0"}}>
          <Stack direction='row' marginRight="6px" marginBottom="6px" justifyContent='space-between'>
            <Button onClick={handleBack} sx={{my: 3, ml: 1}}>
              Back
            </Button>
            <AnimateButton>
              <Button variant='contained' sx={{my: 3, ml: 1}} type='submit'
                      onClick={() => setErrorIndex(1)}>
                Next
              </Button>
            </AnimateButton>
          </Stack>
        </Grid>
      </form>
    </>
  );
};

BasicBotForm.propTypes = {
  shippingData: PropTypes.object,
  setShippingData: PropTypes.func,
  handleNext: PropTypes.func,
  setErrorIndex: PropTypes.func
};

export default BasicBotForm;
