import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

// material-ui
import {ButtonBase} from '@mui/material';

// project import
import LogoMain from './LogoMain';
import LogoIcon from './LogoIcon';
import config, {footerDisabledPages} from 'config';
import {useSelector} from 'react-redux';
import {useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = ({reverse, isIcon, sx, to, layout}) => {
  const {user} = useSelector((state) => state?.profile)
  const [showIconWithoutTitle, setShowIconWithoutTitle] = useState(false);


  useEffect(() => {
    let currentHref = window.location.href;
    if(footerDisabledPages.some((page)=>currentHref.includes(page))){
      // setShowIconWithoutTitle(true)
    }
  }, []);

  return <>
    <ButtonBase disableRipple
                sx={sx}>
      {showIconWithoutTitle?
        <img width="50" src={'https://d3dqyamsdzq0rr.cloudfront.net/docubaat/images/nextcx-logo-without-titile.png'} alt="NextCX" />
        :(isIcon ? <LogoIcon/> : <LogoMain isIcon={isIcon} layout={layout} reverse={reverse} width={sx?.width}/>)}
    </ButtonBase>
  </>
}

LogoSection.propTypes = {
  reverse: PropTypes.bool,
  isIcon: PropTypes.bool,
  sx: PropTypes.object,
  to: PropTypes.string
};

export default LogoSection;
