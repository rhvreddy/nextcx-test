import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { Link, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

const Footer = ({customWidth}) => {
  const menu = useSelector((state) => state.menu);
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('lg'));
  const { drawerOpen } = menu;

  return (
    <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{
      p: '24px 16px 0px',
      mt: 'auto',
      backgroundColor: "#F4F5F7",
      position: 'fixed',
      zIndex:'1000',
      bottom: '0',
      width: (drawerOpen && !customWidth) ? 'calc(100% - 260px)' : (!matchDownMD && !customWidth) ? 'calc(100% -' +
        ' 60px)' : '100%'
    }}>
      <Typography variant='caption'>&copy; All rights reserved</Typography>
      <Stack spacing={1.5} direction='row' justifyContent='space-between' alignItems='center'>
        <Link component={RouterLink} to='#' target='_blank' variant='caption' color='textPrimary'>
        About us
      </Link>
        <Link component={RouterLink} to='https://www.nextcx.ai/legal/privacy-policy' target='_blank' variant='caption' color='textPrimary'>
        Privacy
      </Link>
        <Link component={RouterLink} to='https://www.nextcx.ai/legal/terms-of-service' target='_blank' variant='caption' color='textPrimary'>
        Terms
      </Link>
    </Stack>
  </Stack>
  )
};

export default Footer;
