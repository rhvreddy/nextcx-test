import { Typography } from '@mui/material';
import React, {useEffect} from 'react';
import {useNavigate} from "react-router-dom"
import Header from '../../layout/MainLayout/Header';
import Footer from "../../layout/MainLayout/Footer"
import {useSelector} from "react-redux";
import config from "../../config";
import {initializeAutoLogin} from "../../store/reducers/profile";
import {dispatch} from "../../store";

export default function CustomErrorPage(){
    const navigate = useNavigate()
    const { user, isAdminPathRestricted } = useSelector((state) => state.profile)
    let queryParams = new URLSearchParams(window.location.search)

    useEffect(() => {

      if(user?.appRoles?.length > 0 && !isAdminPathRestricted) {
        navigate(config.defaultPath, {replace: true});
        dispatch(initializeAutoLogin({user:user}))
      }
    }, [user])

    return(
      <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",height:"100vh"}}>
        <Header isAccessDenied={true}/>
        <Typography variant="h1">{queryParams.get("errorCode")? queryParams.get("errorCode"): "401"}</Typography>
        <Typography color="textSecondary" align="center" sx={{ width: { xs: '73%', sm: '61%' } }}>
          {queryParams.get("errorMessage")? queryParams.get("errorMessage"): "You don't have permission to access this page. Please contact admin to get access."}
        </Typography>
        <Footer customWidth={true}/>
      </div>
    )
}
