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
    borderColor: '#ff2c55',
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

const TermsConditionsPage = () => {
  const classes = useStyles();

  return (
    <Container className={classes.container}>
      <Box textAlign="center" sx={{padding: "26px 0", marginBottom: "16px"}}>
        <Typography variant="h4" className={classes.heading}>
          Terms and Conditions
        </Typography>
        <hr className={classes.divider}/>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" className={classes.section}>
            Please read these Terms and Conditions ("Terms") carefully before using the
            <a href="https://www.nextcx.ai"> Nextcx.AI </a> AI-based bot builder application ("Application") operated by
            <a href="https://www.nextcx.ai"> Nextcx.AI </a>("we," "us," or "our").
            These Terms govern your use of the Application and its associated services. By accessing or using the Application,
            you agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not access or use the Application.
          </Typography>
        </Grid>
        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Use of the Application
          </Typography>
          <Stack sx={{gap: "1rem"}}>
            <Typography className={classes.paragraphs}>
              The  <a href="https://www.nextcx.ai"> Nextcx.AI </a>Application provides tools and features to create, deploy, and manage AI-based bots. You may use the Application for personal or business purposes, subject to compliance with these Terms.
            </Typography>
            <Typography className={classes.paragraphs}>
               You must be at least 18 years old to use the Application. If you are using the Application on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
            </Typography>
            <Typography className={classes.paragraphs}>
               You are solely responsible for all activities and content generated using the Application. You agree not to use the Application for any illegal, harmful, or unethical purposes.
            </Typography>
            <Typography className={classes.paragraphs}>
               We reserve the right to modify, suspend, or discontinue the Application at any time without prior notice.
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Intellectual Property
          </Typography>
          <Stack sx={{gap: "1rem"}} className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
               All intellectual property rights in the Application, including but not limited to copyrights, trademarks, trade secrets, and patents, belong to  <a href="https://www.nextcx.ai"> Nextcx.AI </a> or its licensors.
            </Typography>
              <Typography  className={classes.paragraphs}>
                 You are granted a limited, non-exclusive, non-transferable license to use the Application for its intended purpose. This license does not permit you to modify, distribute, sell, or sublicense the Application or any of its components.
              </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            User Content
          </Typography>
          <Stack className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
               The Application may allow you to submit or upload content, such as bot designs, scripts, or other materials ("User Content"). By submitting User Content, you grant us a worldwide, royalty-free, non-exclusive license to use, reproduce, modify, adapt, publish, translate, distribute, and display the User Content in connection with the Application.
            </Typography>
            <Typography className={classes.paragraphs}>
               You represent and warrant that you have all necessary rights to submit the User Content and that it does not infringe upon any third-party rights or violate any applicable laws.
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Privacy
          </Typography>
          <Stack className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
               We collect and process personal information in accordance with our Privacy Policy. By using the Application, you consent to such collection and processing and warrant that all data provided by you is accurate.
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Disclaimer of Warranty
          </Typography>
          <Stack sx={{gap: "1rem"}} className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
               The Application is provided on an "as is" and "as available" basis, without any warranties or conditions, express or implied. We do not warrant that the Application will be error-free, uninterrupted, or free from viruses or other harmful components.
            </Typography>
            <Typography className={classes.paragraphs}>
               We are not responsible for the accuracy, reliability, or quality of any User Content or the results obtained from the use of the Application.
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Limitation of Liability
          </Typography>
          <Stack className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
               To the extent permitted by law, we shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with the use or inability to use the Application, even if we have been advised of the possibility of such damages.
            </Typography>
            <Typography className={classes.paragraphs}>
               You agree to indemnify and hold us harmless from any claims, damages, liabilities, and expenses (including attorneys' fees) arising out of your use of the Application or any violation of these Terms.
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Termination
          </Typography>
          <Stack className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
             We may terminate or suspend your access to the Application at any time, with or without cause, without prior notice or liability.
            </Typography>
            <Typography className={classes.paragraphs}>
            Upon termination, all licenses and rights granted to you under these Terms will immediately cease.
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Entire Agreement
          </Typography>
          <Stack className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
               These Terms constitute the entire agreement between you and  <a href="https://www.nextcx.ai"> Nextcx.AI </a> regarding the use of the Application and supersede any prior agreements or understandings, whether oral or written.
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" className={classes.subSection}>
            Contact Information
          </Typography>
          <Stack className={classes.paragraphs}>
            <Typography className={classes.paragraphs}>
               If you have any questions or concerns about these Terms or the Application, please contact us at info@skil.ai.
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} className={classes.section}>
          <Typography variant="h6" >
            By using the  <a href="https://www.nextcx.ai"> Nextcx.AI </a> AI-based bot builder application, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TermsConditionsPage;
