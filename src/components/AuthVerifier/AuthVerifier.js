import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import config from "config"


const AuthVerifier = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const appRoles = localStorage.getItem("appRoles");

  useEffect(() => {
    if (userId && appRoles?.length > 0) {
      navigate(config.defaultPath, {replace: true});
    } else {
      navigate("/register");
    }
  }, [])
  return <></>;
};

export default AuthVerifier;
