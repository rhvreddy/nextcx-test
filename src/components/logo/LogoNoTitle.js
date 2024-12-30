// material-ui
import { useTheme } from '@mui/material/styles';

const LogoIcon = () => {
  const theme = useTheme();

  return (
    <>
      <img src={theme.palette.mode === 'dark' ? 'https://d3dqyamsdzq0rr.cloudfront.net/docubaat/images/nextcx-logo-without-titile.png' : 'https://d3dqyamsdzq0rr.cloudfront.net/docubaat/images/nextcx-logo-without-titile.png'} alt="NextCX" width="60"  />
    </>
  );
};

export default LogoIcon;
