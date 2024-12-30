import { Button, Typography } from '@mui/material';
import React, {useEffect} from 'react';
import {useNavigate} from "react-router-dom"
import Header from '../../layout/MainLayout/Header';
import Footer from "../../layout/MainLayout/Footer"
import {useSelector} from "react-redux";
import config from "../../config";
import {initializeAutoLogin} from "../../store/reducers/profile";
import {dispatch} from "../../store";

export default function ErrorPage(){
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.profile)

    useEffect(() => {

      if(user?.appRoles?.length > 0) {
        navigate(config.defaultPath, {replace: true});
        dispatch(initializeAutoLogin({user:user}))
      }
    }, [user])

    return(
      <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",height:"100vh"}}>
        <Header isAccessDenied={true}/>
        <Typography variant="h1">401</Typography>
        <Typography color="textSecondary" align="center" sx={{ width: { xs: '73%', sm: '61%' } }}>
          You don't have permission to access this page. Please contact admin to get access.
        </Typography>
        <Footer customWidth={true}/>
      </div>
    )
}
