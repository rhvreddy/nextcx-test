import React from 'react';
import {
  Typography,
  Container,
  Grid,
  Stack,
  Box
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: "Lato"
  },
  heading: {
    color: "#ff2c55",
    textShadow: "0px 0px 10px rgb(0 0 0 / 30%)",
    fontSize: "3rem",
    fontFamily: "Lato",
    fontWeight: 700
  },
  divider: {
    borderColor: "#ff2c55",
    width: "60px",
    marginTop: "2px",
    height: 0,
    display: "inline-block",
    border: "1px solid #1e8190",
    marginLeft: "5px",
    marginRight: "5px",
    marginBottom: "18px",
  },
  section: {
    marginBottom: theme.spacing(2),
    fontFamily: "Lato",
    fontSize: "16px"
  },
  subSection: {
    marginBottom: theme.spacing(1),
    color: "#4275dc",
    fontFamily: `"Lato", Sans-serif`,
    fontSize: '35px',
    fontWeight: 700,
  },
  paragraphs: {
    fontFamily: "Lato",
    fontSize: "16px"
  },
}));

const PrivacyPolicyPage = () => {
  const classes = useStyles();

  return (
    <Container className={classes.container}>
      <Box textAlign="center" sx={{padding: "26px 0", marginBottom: "16px"}}>
        <Typography variant="h4" className={classes.heading}>
          Privacy Policy
        </Typography>
        <hr className={classes.divider}/>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" className={classes.section}>
            <a href="https://www.nextcx.ai"> Nextcx.AI </a>is committed to protecting your privacy. This policy explains
            our practices regarding information collection, use, and disclosure by our chatbot.
          </Typography>
        </Grid>
        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Information Collection
          </Typography>
          <Stack sx={{gap: "1rem"}}>
            <Typography className={classes.paragraphs}>
              Our chatbot collects the following information:
            </Typography>
            <Typography className={classes.paragraphs}>
              User provided information (e.g., name, email, phone number)
            </Typography>
            <Typography className={classes.paragraphs}>
              Chat logs, including message content and timestamps
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Use of Information
          </Typography>
          <Stack sx={{gap: "1rem"}} className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
              We use the information we collect from our chatbot to:
            </Typography>
            <Box sx={{display: "flex", flexDirection: "row"}}>
              <CheckCircleIcon/>
              <Typography sx={{ml: 1}} className={classes.paragraphs}>Provide and improve our chatbot
                services</Typography>
            </Box>
            <Box sx={{display: "flex", flexDirection: "row"}}>
              <CheckCircleIcon/>
              <Typography sx={{ml: 1}} className={classes.paragraphs}>
                Respond to user inquiries and support requests
              </Typography>
            </Box>
            <Box sx={{display: "flex", flexDirection: "row"}}>
              <CheckCircleIcon/>
              <Typography sx={{ml: 1}} className={classes.paragraphs}>
                Send promotional or marketing communications
              </Typography>
            </Box>
            <Box sx={{display: "flex", flexDirection: "row"}}>
              <CheckCircleIcon/>
              <Typography sx={{ml: 1}} className={classes.paragraphs}>
                We may share your information with third-party service providers, such
                as chatbot hosting platforms, for the purpose of providing our
                services. We will not sell, rent, or trade your information.
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Cookies and Other Tracking Technologies
          </Typography>
          <Stack className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
              Our chatbot may use cookies or similar technologies to analyze usage
              and improve our services. We may also partner with third-party
              advertising networks to provide relevant advertisements based on your
              interests.
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Data Retention
          </Typography>
          <Stack className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
              We will retain your information for as long as necessary to provide
              our services, unless otherwise required by law.
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Content Disclaimer
          </Typography>
          <Stack sx={{gap: "1rem"}} className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
              While we strive to provide accurate and respectful content through our
              chatbot, there may be instances where the chatbot generates content
              that some users may find offensive, inappropriate, or misleading. We
              cannot guarantee that all content generated by our chatbot will be
              free from such issues, and we disclaim any liability for any harm or
              damages resulting from your interaction with the chatbot.
            </Typography>
            <Typography className={classes.paragraphs}>
              By using our chatbot, you understand and agree that you are solely
              responsible for your interactions with the chatbot and any content
              generated during those interactions. We encourage users to report any
              offensive or inappropriate content by contacting us at{' '}
              <a href="mailto:info@nextcx.ai">info@nextcx.ai</a> so that we can take
              appropriate action to improve our chatbot.
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Security
          </Typography>
          <Stack className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
              We take reasonable precautions to protect your information, such as
              SSL encryption, to prevent unauthorized access, disclosure, or misuse.
              However, no method of transmission over the internet or electronic
              storage is 100% secure.
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Changes to Policy
          </Typography>
          <Stack className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
              We may update this privacy policy from time to time. We will notify
              you of any material changes by posting the new policy on our website.
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Contact Us
          </Typography>
          <Stack className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
              If you have any questions or concerns about this privacy policy or our
              chatbot practices, please contact us at{' '}
              <a href="mailto:info@nextcx.ai">info@nextcx.ai</a>
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PrivacyPolicyPage;
