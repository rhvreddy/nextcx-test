// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

// project imports
import MainCard from 'components/MainCard';

// assets
import worldMap from 'assets/images/contact/botImage.svg';
import React, { useEffect, useState } from 'react';
import Typist from 'react-typist';
import Button from '@mui/material/Button';
import { ArrowRightOutlined } from '@ant-design/icons';

// ==============================|| CONTACT US - HEADER ||============================== //

function HomePageSection2() {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingIndex1, setTypingIndex1] = useState(0);
  const [typingDone1, setTypingDone1] = useState(false);
  const [typingDone2, setTypingDone2] = useState(false);
  const typingWords = ['Website.', 'Documents.', 'Knowledge Base.', 'Marketing', 'Memory'];
  const typingWords1 = ['Engage Visitors.', 'Organize Information.', 'Answer Questions.', 'Capture Leads', 'Remember'];

  const onTypingDone = () => {
    setTypingDone1(true);
  };

  const onTypingDone1 = () => {
    setTypingDone2(true);
  };

  useEffect(() => {
    if (typingDone1 && typingDone2) {
      setTimeout(() => {
        setTypingIndex((prevIndex) => (prevIndex + 1) % typingWords.length);
        setTypingIndex1((prevIndex) => (prevIndex + 1) % typingWords1.length);
      }, 2000);
      setTypingDone1(false);
      setTypingDone2(false);
    }
  }, [typingDone1, typingDone2]);

  return (
    <MainCard
      sx={{
        bgcolor: theme.palette.mode === 'dark' ? '#FFFFFF00' :alpha(theme.palette.background.default, 0),
        border: 'transparent',
        borderRadius: 0,


        m: 0,
        mt: { xs: 6, md: 2 },
        height: { xs: '100%', sm: 420, md: 580, lg: 680 }
      }}
    >
      <Container sx={{ px: { xs: 0, sm: 2 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-around" alignItems="center" spacing={{ xs: 0, sm: 3 }}>
          <Box sx={{ width: { xs: '100%', sm: 352, md: 460, lg: 636 }, pt: 6 }}>
            <Stack spacing={1}>
              <Box mb={5} mt={-1}>
                <Typography
                  variant='h3'
                  component='div'
                  mt={4}
                  className='text-second-cls'
                  sx={{
                    fontFamily: 'ethnocentric',
                    fontSize: { xs: '32px', sm: '32px', md: '38px', lg: '48px' },
                    color: '#FFF',
                    whiteSpace: 'pre-wrap',
                    width: '100%',
                    margin: '0 auto',
                    textAlign: 'left',
                    maxWidth: { xs: '100%', sm: '80%' },
                    '@media screen and (min-width: 600px)': {
                      whiteSpace: 'nowrap',
                      width: 'auto',
                      margin: 0,
                      maxWidth: 'none',
                      textAlign: 'left'
                    }
                  }}
                >
                  Build your Generative
                </Typography>
                <Typography variant='h3' component='div' mt={2} className='text-second-cls'
                            sx={{
                              fontFamily: 'ethnocentric', color: '#78FBFF', fontSize: { xs: '32px', sm: '32px', md: '38px', lg: '48px' } }}><span >AI BOT for Free </span></Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant='h3' component='div' mt={4} className='text-second-cls'
                              sx={{ fontSize: 24, color: '#FFF' }}>Using your</Typography>
                  <Typography className='text-primary' sx={{ padding: '5px', fontSize: { xs: '22px', sm: '22px', md: '32px', lg: '42px' } }}>
          <Typist key={typingIndex} cursor={{ blink: true, element: '|' }} onTypingDone={onTypingDone}
                  avgTypingDelay={500}>
            <strong
              style={{ color: '#78FBFF', minWidth: '100%', whiteSpace: 'nowrap' }}>{typingWords[typingIndex]}</strong>
          </Typist>
        </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant='h3' component='div' mt={4} className='text-second-cls'
                              sx={{ fontSize: 24, color: '#FFF', whiteSpace: 'nowrap' }}>Helping you </Typography>
                  <Typography className='text-primary' sx={{
                    padding: '5px',
                    fontSize: { xs: '22px', sm: '22px', md: '32px', lg: '42px' },
                    alignItems: 'baseline',
                    display: 'inline-block',
                    whiteSpace: 'nowrap'
                  }}>
          <Typist key={typingIndex1} cursor={{ blink: true }} onTypingDone={onTypingDone1} avgTypingDelay={500}>
            <strong style={{ color: '#78FBFF', whiteSpace: 'nowrap' }}>{typingWords1[typingIndex1]}</strong>
          </Typist>
          </Typography>
                </Box>
              </Box>
              <Typography component='div' sx={{ color: '#FFF', fontSize: { xs: '18px', sm: '18px', md: '18px', lg: '26px' } }}>Sia: Supercharge your work, life, and memory
                with ChatGPT AI-driven, personalized Generative chatbots.</Typography>
              <Box mt={4}>
                <Button variant='contained' color='error' sx={{ color: '#FFF', fontSize: { xs: '18px', sm: '18px', md: '18px', lg: '26px' } }} size='large' href='https://l7zxjkqm4s1.typeform.com/to/AxjMFYAc' target='_blank' endIcon={<ArrowRightOutlined />}>Join
                  Us to receive updates</Button>
              </Box>

            </Stack>
          </Box>
          <Box sx={{ width: { xs: 320, sm: 320, md: 500, lg: 600 } }}>
            <img
              src={worldMap}
              alt="mantis"
              style={{
                width: '100%',
                background: theme.palette.mode === 'dark' ? '#FFFFFF00' : alpha(theme.palette.background.default, 0)
              }}
            />
          </Box>
        </Stack>
      </Container>
    </MainCard>
  );
}

export default HomePageSection2;
