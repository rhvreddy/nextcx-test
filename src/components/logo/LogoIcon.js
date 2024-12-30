// material-ui
import { useTheme } from '@mui/material/styles';
import logoDark from 'assets/images/sia/SIA_Logo_Dark_Blue_V02.svg';
import { useState, useEffect } from 'react';
import {mainAppName} from "../../consts";

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoIconDark from 'assets/images/logo-icon-dark.svg';
 * import logoIcon from 'assets/images/logo-icon.svg';
 *
 */

// ==============================|| LOGO ICON SVG ||============================== //

const LogoIcon = () => {
  const theme = useTheme();




  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     *
     */
    <>
      <img style={{width:mainAppName?.toLowerCase() === "sia"  ? "150px" : "200px"}} src={theme.palette.mode === 'dark' ? (mainAppName?.toLowerCase() === "sia" ? "https://d3dqyamsdzq0rr.cloudfront.net/sia/images/SIA_Logo_Dark_Blue_V02.png" : 'https://d3dqyamsdzq0rr.cloudfront.net/sia/images/nextcx-logo.png') : (mainAppName?.toLowerCase() === "sia" ? "https://d3dqyamsdzq0rr.cloudfront.net/sia/images/SIA_Logo_Dark_Blue_V02.png" :'https://d3dqyamsdzq0rr.cloudfront.net/sia/images/nextcx-logo.png')} alt="NextCX" width="200"  />

    </>
  );
};

export default LogoIcon;
