import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';

// project import
import DynamicNavDrawerHeaderStyled from './DynamicNavDrawerHeaderStyled';
import Logo from 'components/logo';
import { useSelector } from 'react-redux';

// ==============================|| DRAWER HEADER ||============================== //

const ChatDrawerHeader = ({ open }) => {
  const menu = useSelector((state) => state.menu);
  const { drawerOpen } = menu;
  const theme = useTheme();

  return (
    <DynamicNavDrawerHeaderStyled theme={theme} open={drawerOpen}>
      <Logo isIcon={drawerOpen} sx={{ width: !drawerOpen ? 35 : 'auto', height: 35 }} />
    </DynamicNavDrawerHeaderStyled>
  );
};

ChatDrawerHeader.propTypes = {
  open: PropTypes.bool
};

export default ChatDrawerHeader;
