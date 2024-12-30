import PropTypes from 'prop-types';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

// project import
import config from 'config';
import useAuth from 'hooks/useAuth';
import {useSelector} from 'react-redux';

// ==============================|| GUEST GUARD ||============================== //

const GuestGuard = ({children}) => {
  const {isLoggedIn, user} = useSelector(state => state.profile);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.appRoles?.length > 0) {
        navigate(config.defaultPath, {replace: true});
      } else {
        navigate(config.pricingPage, {replace: true})
      }
    }
  }, [isLoggedIn, navigate]);

  return children;
};

GuestGuard.propTypes = {
  children: PropTypes.node
};

export default GuestGuard;
