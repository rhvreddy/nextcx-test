import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import Button from '@mui/material/Button';
import Typist from 'react-typist';
import { ArrowRightOutlined } from '@ant-design/icons';
import './HomePageMain.css';

const HeroMainSection = () => {
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
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ml: '12rem', marginTop: '-4rem' }}>
      <Box sx={{ padding: 1, textAlign: 'left', fontFamily: 'Roboto' }}>
        <Box mb={5} mt={-1}>
          <Typography variant='h3' component='div' mt={4} className='text-second-cls'
                      sx={{ fontSize: 48, color: '#FFF', whiteSpace: 'nowrap' }}>Build your Generative</Typography>
          <Typography variant='h3' component='div' mt={2} className='text-second-cls'
                      sx={{ fontSize: 32, color: '#FFF' }}><span style={{ color: '#78FBFF', fontSize: 48 }}>AI BOT for Free </span></Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography variant='h3' component='div' mt={4} className='text-second-cls'
                        sx={{ fontSize: 24, color: '#FFF' }}>Using your</Typography>
            <span className='text-primary' style={{ padding: '5px', fontSize: 42 }}>
          <Typist key={typingIndex} cursor={{ blink: true, element: '|' }} onTypingDone={onTypingDone}
                  avgTypingDelay={500}>
            <strong
              style={{ color: '#78FBFF', minWidth: '100%', whiteSpace: 'nowrap' }}>{typingWords[typingIndex]}</strong>
          </Typist>
        </span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography variant='h3' component='div' mt={4} className='text-second-cls'
                        sx={{ fontSize: 24, color: '#FFF', whiteSpace: 'nowrap' }}>Helping you </Typography>
            <span className='text-primary' style={{
              padding: '5px',
              fontSize: 42,
              alignItems: 'baseline',
              display: 'inline-block',
              whiteSpace: 'nowrap'
            }}>
          <Typist key={typingIndex1} cursor={{ blink: true }} onTypingDone={onTypingDone1} avgTypingDelay={500}>
            <strong style={{ color: '#78FBFF', whiteSpace: 'nowrap' }}>{typingWords1[typingIndex1]}</strong>
          </Typist>
          </span>
          </Box>
        </Box>
        <Typography component='div' sx={{ color: '#FFF', fontSize: 18 }}>Sia: Supercharge your work, life, and memory
          with ChatGPT AI-driven, personalized Generative chatbots.</Typography>
        <Box mt={4}>
          <Button variant='contained' color='error' size='large' href='about-sia.html' endIcon={<ArrowRightOutlined />}>Join
            Us to receive updates</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroMainSection;
