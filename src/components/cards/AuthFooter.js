// material-ui
import { Container, Link, Stack, Typography, useMediaQuery } from '@mui/material';

// ==============================|| FOOTER - AUTHENTICATION ||============================== //

const AuthFooter = () => {
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <Container>
      <Stack
        direction={matchDownSM ? 'column' : 'row'}
        justifyContent={matchDownSM ? 'center' : 'space-between'}
        spacing={2}
        textAlign={matchDownSM ? 'center' : 'inherit'}
      >
        <Typography variant="subtitle2" color="secondary" component="span">
          This site is protected by{' '}
          <Typography component={Link} variant="subtitle2" href="https://www.nextcx.ai/legal/privacy-policy" target="_blank" underline="hover" color="#fff">
            Privacy Policy
          </Typography>
        </Typography>
        <Typography
            variant="subtitle2"
            color="#fff"
           component={Link}
           href="https://www.nextcx.ai/legal/terms-of-service"
            target="_blank"
           underline="hover"
          >
            Terms and Conditions
          </Typography>
      </Stack>
    </Container>
  );
};

export default AuthFooter;
