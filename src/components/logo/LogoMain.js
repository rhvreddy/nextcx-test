import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import logoDark from 'assets/images/sia/SIA_Logo_Dark_Blue_V02.svg';
import {useSelector} from "react-redux";
import {mainAppName} from "../../consts";
/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

const LogoMain = ({ reverse, width,layout }) => {
  const theme = useTheme();
  const menuState = useSelector(state => state.menu);

  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={theme.palette.mode === 'dark' ? logoDark : logo} alt="Mantis" width="100" />
     *
     */
    <>
        <img src={(theme.palette.mode === 'dark' || layout && layout === "home")  ? (mainAppName?.toLowerCase() === "sia" ? "https://d3dqyamsdzq0rr.cloudfront.net/sia/images/SIA_Logo_V2_White_01.png" :'https://d3dqyamsdzq0rr.cloudfront.net/sia/images/nextcx-logo.png') :((!menuState?.componentDrawerOpen && width) ? (mainAppName?.toLowerCase() === "sia" ? "https://d3dqyamsdzq0rr.cloudfront.net/sia/images/SIA_Logo_Dark_Blue_V02.png" : 'https://d3dqyamsdzq0rr.cloudfront.net/docubaat/images/nextcx-logo-without-titile.png') : (mainAppName?.toLowerCase() === "sia" ? "https://d3dqyamsdzq0rr.cloudfront.net/sia/images/SIA_Logo_V2_White_01.png" : 'https://d3dqyamsdzq0rr.cloudfront.net/sia/images/nextcx-logo-black-background.png'))} alt="NextCX" width={(!menuState?.componentDrawerOpen && width) ? 50 : 200} />
    </>
  );
};

LogoMain.propTypes = {
  reverse: PropTypes.bool
};

export default LogoMain;
