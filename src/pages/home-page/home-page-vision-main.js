import React, {useEffect} from 'react';
import { useTheme } from '@mui/material/styles';

import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import SwipeableViews from 'react-swipeable-views';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { autoPlay } from 'react-swipeable-views-utils';
import Button from '@mui/material/Button';
import MobileStepper from '@mui/material/MobileStepper';
import './HomePageMain.css'
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);


const useStyles = makeStyles((theme) => ({
  visionMain: {
    backgroundColor: 'var(--main-bg-color)'
  },
  visionStatement: {
    height: '100px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageSlider: {
    width: '100%',
    height: '100%'
  },
  infoBox: {
    padding: theme.spacing(2),
    textAlign: 'center'
  }
}));

const VisionMain = () => {
  const classes = useStyles();

  const theme = useTheme();


  const images = [
    {
      label: 'San Francisco – Oakland Bay Bridge, United States',
      imgPath:
        'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60'
    },
    {
      label: 'Bird',
      imgPath:
        'https://images.unsplash.com/photo-1538032746644-0212e812a9e7?auto=format&fit=crop&w=400&h=250&q=60'
    },
    {
      label: 'Bali, Indonesia',
      imgPath:
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&h=250'
    },
    {
      label: 'Goč, Serbia',
      imgPath:
        'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&w=400&h=250&q=60'
    }
  ];

  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  useEffect(() => {
    const hash = window.location.hash;

    if (hash === '#vision-section') {
      const element = document.getElementById('vision-section');

      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);


  return (
    <Box id="vision-section" className={classes.visionMain}>
      <Container maxWidth='lg' className={classes.visionStatement}>
        <Typography variant='h2' sx={{ color: 'white' }}>
          Vision & Inspiration
        </Typography>
      </Container>
      <Grid container spacing={2.5} justifyContent='center'>
        <Grid item xs={10} md={4} lg={4} justifyContent='center'>
          <Box sx={{ maxWidth: 500, justifyContent: 'center', flexGrow: 1 }}>
            <Paper
              square
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: 50,
                pl: 2,
                bgcolor: 'background.default'
              }}
            >
              <Typography>{images[activeStep].label}</Typography>
            </Paper>
            <AutoPlaySwipeableViews
              axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
              index={activeStep}
              onChangeIndex={handleStepChange}
              enableMouseEvents
            >
              {images.map((step, index) => (
                <div key={step.label}>
                  {Math.abs(activeStep - index) <= 2 ? (
                    <Box
                      component='img'
                      sx={{
                        height: 255,
                        display: 'block',
                        maxWidth: 400,
                        overflow: 'hidden',
                        width: '100%'
                      }}
                      src={step.imgPath}
                      alt={step.label}
                    />
                  ) : null}
                </div>
              ))}
            </AutoPlaySwipeableViews>
            <MobileStepper
              steps={maxSteps}
              position='static'
              activeStep={activeStep}
              nextButton={
                <Button
                  size='small'
                  onClick={handleNext}
                  disabled={activeStep === maxSteps - 1}
                >
                  Next
                  {theme.direction === 'rtl' ? (
                    <KeyboardArrowLeft />
                  ) : (
                    <KeyboardArrowRight />
                  )}
                </Button>
              }
              backButton={
                <Button size='small' onClick={handleBack} disabled={activeStep === 0}>
                  {theme.direction === 'rtl' ? (
                    <KeyboardArrowRight />
                  ) : (
                    <KeyboardArrowLeft />
                  )}
                  Back
                </Button>
              }
            />
          </Box>

        </Grid>

      </Grid>

    </Box>
  );
};

export default VisionMain;
