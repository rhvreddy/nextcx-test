import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import {Box, Card} from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

const AuthCard = ({ children, ...other }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        maxWidth: { xs: 400, lg: 475 },
        margin: { xs: 2.5, md: 3 },
        '& > *': {
          flexGrow: 1,
          flexBasis: '50%'
        },
        background: "#000",
        boxShadow: "0px 0px 3px 2px rgba(70, 70, 70)",
      }}
      content={false}
      {...other}
      border={false}
      borderRadius="25px"
      shadow={theme.customShadows.z1}
    >
      <Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>{children}</Box>
    </Card>
  );
};

AuthCard.propTypes = {
  children: PropTypes.node
};

export default AuthCard;
