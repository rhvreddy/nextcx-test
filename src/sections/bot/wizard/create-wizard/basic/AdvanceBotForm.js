import PropTypes from 'prop-types';

// material-ui
import {
  Button,
  Grid,
  Box,
  Stack,
  Typography,
  TextField, List, ListItem, ListItemButton, ListItemText
} from '@mui/material';

// third-party
import {useFormik} from 'formik';
import * as yup from 'yup';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import React, {useEffect, useMemo, useState} from 'react';
import {styled, useTheme} from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import MainCard from "../../../../../components/MainCard";
import {DeleteTwoTone, PlusSquareOutlined} from "@ant-design/icons";
import {REACT_APP_APP_BACK_END_BASE_URL} from "../../../../../config";
import axios from 'axios';
import IconButton from "../../../../../components/@extended/IconButton";
import {CircularProgress, Chip} from "@mui/material";
import AirplaneTicketOutlinedIcon from '@mui/icons-material/AirplaneTicketOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

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
const AdvanceBotForm = ({botFormData, setBotFormData, handleNext, setErrorIndex, handleBack}) => {
  const [intents, setIntents] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [AddCustomIntent, setAddCustomIntent] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isClickNext, setIsClickNext] = useState(false);
  const [sampleIndustryList, setSampleIndustryList] = useState([]);
  const [sampleIndustryIcons, setSampleIndustryIcons] = useState([]);

  // API integration to get intents
  const getIntentsForIndustry = async () => {
    if (formik?.values?.industry !== "" && customInput === "") {
      setIsFetching(true);
      const config = {
        method: 'post',
        url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/get-all-intents`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: {industry: formik?.values?.industry}
      };
      await axios(config)
        .then((res) => {
          if (res?.data) {
            setIntents(res?.data?.dialogs);
            setIsFetching(false);
          }
        })
        .catch((err) => {
          setIsFetching(false);
          console.log(err);
        })
    }
  }

  // To get custom intent input
  const handleCustomIntent = (event) => {
    setCustomInput(event.target.value);
    setAddCustomIntent(event.target.value);
  }

  // To add custom intent to the list
  const handleAddCustomIntents = () => {
    if (customInput && customInput !== "") {
      setIntents((prev) => [
        AddCustomIntent,
        ...prev
      ]);
      setCustomInput("");
    }
  }


  const handleClick = (item) => {
    formik.setFieldValue("industry", item);
    setIntents([]);
  }
  // To remove intent in the list
  const handleDeleteIntent = (DeletedData, index) => {
    if (index > -1) {
      intents?.splice(index, 1);
    }
    setIntents((prev) => [
      ...prev
    ]);
  }

  const formik = useFormik({
    initialValues: {
      industry: botFormData.industry,
      intents: botFormData.intents
    },
    onSubmit: (values) => {
      // console.log('form submit & including upload - ', values);
      setBotFormData({
        ...botFormData,
        industry: values.industry,
        intents: intents
      });
      isClickNext && handleNext()
    }
  });

  // On click enter key (API will be triggered)
  const onClickEnter = (e) => {
    if (e?.keyCode === 13 || e?.key === "Enter") {
      getIntentsForIndustry().then((r) => {
      })
      window.event.cancelBubble = true;
      window.event.returnValue = false;
    }
  }

  // Reset intents if no input for industry
  useEffect(() => {
    if (formik?.values?.industry === "") {
      setIntents([]);
    }
  }, [formik?.values?.industry])

  // Maintaining intents state
  useEffect(() => {
    if (formik?.values?.industry !== "") {
      setIntents(botFormData?.intents);
    }
    setSampleIndustryList([{
      name: "Insurance helping Customers with filing Claim",
      icon: <DescriptionIcon/>
    }, {
      name: "Capture leads for the websites on Consulting",
      icon: <AssignmentIndIcon/>
    }, {
      name: "Airline industry wants to handle customer queries w.r.t. to tickets ",
      icon: <AirplaneTicketOutlinedIcon/>
    }, {
      name: "E-Commerce website handles customer enquiries about the Orders",
      icon: <AddShoppingCartIcon/>
    }, {name: "Yoga teacher helps answering questions and setup appointment", icon: <SelfImprovementIcon/>}]);

  }, [])

  return (
    <>
      <Stack flexDirection="row">
        <Typography variant='h6' gutterBottom sx={{mb: 2}}>Example:</Typography>
        <Box sx={{
          display: "flex", flexWrap: "wrap", maxHeight: "150px", overflow: "auto", '::-webkit-scrollbar': {
            width: "4px",
            height: "4px"
          },
          '::-webkit-scrollbar-track': {
            background: "#f1f1f1",
          },
          '::-webkit-scrollbar-thumb': {
            background: "#88888840",
          },
          marginRight: "4px"
        }} flexDirection="row">
          {sampleIndustryList?.map((item, i) => (
            <ListItem sx={{width: "auto", paddingRight: "0", cursor: "pointer"}} key={i} onClick={() => {
              handleClick(item.name)
            }}>
              <Chip
                icon={item.icon}
                size="small"
                label={item.name}
              />
            </ListItem>
          ))}
        </Box>
      </Stack>

      <form onSubmit={formik.handleSubmit} style={{overflow: "hidden"}} onKeyDown={e => onClickEnter(e)}
            id='validation-forms' autoComplete="off">
        <Grid container spacing={3} maxHeight={{xs: "40vh", lg: "50vh"}} sx={{
          overflow: "auto", '::-webkit-scrollbar': {
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
          <Grid item xs={24} sm={12} sx={{mt: 1}}>
            <TextField fullWidth id="industry" label="Industry" value={formik.values.industry || ""}
                       onChange={formik.handleChange} InputProps={{
              endAdornment: (
                <Button color='primary' variant='contained' onClick={getIntentsForIndustry}><ArrowForwardOutlinedIcon/></Button>
              )
            }}/>
          </Grid>
          {
            intents?.length > 0 && formik?.values?.industry !== "" && !isFetching ?
              <Grid item xs={12} md={12} sx={{
                border: '1px solid #80808026',
                marginLeft: '28px',
                marginRight: '4px',
                borderRadius: '6px',
                marginTop: '4px',
                boxShadow: '0 0 8px -6px rgb(0 0 0)'
              }}>
                <List sx={{
                  overflow: 'auto', maxHeight: '150px', p: 0, '::-webkit-scrollbar': {
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
                  {intents?.map((item, index) => (
                    <ListItem disablePadding divider key={index}>
                      <ListItemButton><ListItemText primary={item}/></ListItemButton>
                      <Button onClick={() => handleDeleteIntent(item, index)}><DeleteTwoTone/></Button>
                    </ListItem>
                  ))
                  }
                </List>
                <Grid item xs={12} sx={{display: "flex", justifyContent: "center"}}>
                  <TextField value={customInput || ""} fullWidth onChange={handleCustomIntent}
                             placeholder="add your custom ones.. if the above doesn't meet your needs"
                             sx={{marginLeft: "-24px", marginTop: "4px", marginBottom: "4px"}}
                             InputProps={{
                               endAdornment:
                                 (
                                   <IconButton size="small" sx={{fontSize: '2.5rem', ml: "15px", mt: "3px"}}
                                               onClick={handleAddCustomIntents}>
                                     <PlusSquareOutlined/>
                                   </IconButton>
                                 )
                             }}/>
                </Grid>

              </Grid> : isFetching ?
                <Grid item xs={24} md={12} textAlign="center">
                  <CircularProgress color="primary"/>
                </Grid> : null
          }
        </Grid>
        <Grid item xs={12} marginBottom={{xs: "4.5rem", lg: "0"}}>
          <Stack direction='row' marginRight="6px" justifyContent='space-between'>
            <Button onClick={handleBack} sx={{my: 3, ml: 1}} disabled={isFetching}>
              Back
            </Button>
            <AnimateButton>
              <Button variant='contained' type='submit' sx={{my: 3, ml: 1}} onClick={() => {
                setErrorIndex(2)
                setIsClickNext(true)
              }} disabled={isFetching}>
                Next
              </Button>
            </AnimateButton>
          </Stack>
        </Grid>
      </form>
    </>
  );
};

AdvanceBotForm.propTypes = {
  shippingData: PropTypes.object,
  setShippingData: PropTypes.func,
  handleNext: PropTypes.func,
  setErrorIndex: PropTypes.func
};

export default AdvanceBotForm;
