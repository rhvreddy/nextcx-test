// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

// project import
import MainCard from 'components/MainCard';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { Button } from '@mui/material';
import { useLocation } from 'react-router-dom';
import React, { useState, useRef } from 'react';
import { SettingsOutlined } from '@mui/icons-material';
import {mainAppName} from "../../consts";

const DynamicDataNavigation = (props) => {
  const theme = useTheme();
  let location = useLocation();
  const botObject = useRef({});

  const handleSaveData = () => {
    props.handleClickOpen();
  };

  const handleStatus = (type) => {
    props.handleStatus(type);
  };

  const displayComponentType = (componentType) => {
    switch (componentType) {
      case 'webQa':
        return 'WebQA Info';
      case 'config':
        return 'Config';
      default:
        return '';
    }
  };

  return (
    <Grid
      container
      spacing={3}
      justify="space-between" // Add it here :)
      spacing={24}
    >
      <Grid item xs={12} sx={{ mt: 4 }}>
        <MainCard>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">
              {mainAppName}
            </Link>
            {props.componentType !== 'dialogs' ? (
              <Link
                underline="hover"
                color="inherit"
                href=""
                onClick={(event) => {
                  event.preventDefault();
                  handleStatus(props.componentType);
                }}
              >
                {displayComponentType(props.componentType)}
              </Link>
            ) : (
              <Link underline="hover" color="inherit" href="">
                Dialogs
              </Link>
            )}
            {props.componentType === 'dialogs' ? <Typography color="text.primary">{props.selectedDialog}</Typography> : <></>}
          </Breadcrumbs>
          {/*<Button variant="contained" color="success"*/}
          {/*        sx={{"float": "right", "mt": "-25px", "ml": "4px"}}>Publish</Button>*/}

          <Button onClick={() => handleStatus('config')} sx={{ float: 'right', ml: '10px', mt: '-25px' }}>
            <SettingsOutlined />
          </Button>
          {/*<Button variant="contained" onClick={handleSaveData} sx={{ float: 'right', mt: '-25px' }}>
            Save
          </Button>*/}
          {props.componentType === 'dialogs' ? (
            <Button variant="contained" onClick={() => handleStatus('webQa')} sx={{ float: 'right', mt: '-25px', mx: '10px' }}>
              WebQA Info
            </Button>
          ) : (
            <Button variant="contained" onClick={() => handleStatus('dialogs')} sx={{ float: 'right', mt: '-25px', mx: '10px' }}>
              Dialogs
            </Button>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default DynamicDataNavigation;
