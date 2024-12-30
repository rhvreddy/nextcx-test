import React, {useState} from "react";
import {
  AppBar,Stack,
  Toolbar, useMediaQuery,useTheme
} from "@mui/material";
import {Link} from "react-router-dom";
import LogoMain from "../logo/LogoMain";


const CommonHeader = () => {
  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down("lg"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  return(
    <AppBar position="fixed" sx={{background: "#ffff", boxShadow: "none", width: "100%", top: "0", zIndex: "1200"}}>
      <Toolbar>
          <Stack flexDirection="row" justifyContent="start" width="100%">
            <Link to="/" style={{textDecoration: "none", display: "flex", gap: "10px"}}>
              <LogoMain/>
            </Link>
          </Stack>
      </Toolbar>
    </AppBar>
  )
}

export default CommonHeader;
