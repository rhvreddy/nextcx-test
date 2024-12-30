import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import {createTheme, ThemeProvider, useTheme} from '@mui/material/styles';
import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import BotCreateWizard from './basic';
import {Button, Grid, Typography} from '@mui/material';
import {ClockCircleOutlined, SmileFilled} from '@ant-design/icons';
import {useSelector} from "react-redux";
import {makeStyles} from "@mui/styles";
import {dispatch} from "../../../../store";
import {triggerNotification} from "../../../../store/reducers/chat";
import {getUserInfo} from "../../../../store/reducers/profile";


const customTheme = createTheme({
  palette: {
    primary: {
      // Purple and green play nicely together.
      // previous theme - main: 'rgb(25, 118, 210)'
      main: '#6e45e9'
    },
    secondary: {
      // This is green.A700 as hex.
      // previous theme - main: '#e6f7ff'
      main: '#EDE4FF'
    }
  }
});

function ReactTable({handleAdd}) {

}

ReactTable.propTypes = {

  handleAdd: PropTypes.func
};

const customFormTitle = "Create a New User Profile"

export default function ButtonAppBar(props) {
  const [add, setAdd] = useState(false);
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [formSubmittedStatus, setFormSubmittedStatus] = useState({isSubmit: false, message: ""})
  const menu = useSelector((state) => state.menu)
  const profile = useSelector(state => state.profile)
  const {drawerOpen} = menu;
  const theme = useTheme();

  useEffect(() => {
    if (localStorage.getItem("botInfo")) {
      dispatch(getUserInfo(localStorage.getItem("userId")))
      document.getElementById("createBotButton").click()
    }
  }, []);

  const useStyles = makeStyles({
    searchBar: {
      position: "fixed",
      zIndex: 1111,
      background: "#ffff",
      width: drawerOpen ? `calc(100% - 260px)` : `calc(100% - 60px)`,
      '@media screen and (max-width : 1266px)': {
        width: "100% "
      }
    }
  })

  const styles = useStyles()
  const botCreatedResponse = () => {
    props?.requestResponse();
  };

  const refreshBotRecords = () => {
    props.requestResponse();
  };

  const handleAdd = () => {
    setAdd(!add);
    props.handleOpenCreateBotScreen(!add)
  };


  return (
    <Grid container>
      <Grid item xs={12} paddingTop="0px !important" className={styles.searchBar}>
      <ThemeProvider theme={customTheme}>
      <Box sx={{
        background: theme.palette.primary.lighter,
        py: "15px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
      }}>
          <Typography variant='h6' sx={{flexGrow: 1, color:"#000", paddingLeft: "20px"}}>
            Create (or) manage your GPT(S)
          </Typography>
          <Box sx={{display: {xs: 'none', sm: 'block', background: theme.palette.primary.lighter}}}>
            <Button id={"createBotButton"} color='primary' variant='contained'
                    sx={{mr: '10px', alignItems: "flex-start", pointerEvents: add ? "none" : "normal"}}
                    endIcon={<SmileFilled/>} onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}>Create GPT</Button>

            <Button color='success' variant='contained' endIcon={<ClockCircleOutlined/>}
                    sx={{alignItems: "flex-start", pointerEvents: add ? "none" : "normal", mr:"18px"}} onClick={(e) => {
              dispatch(triggerNotification({isNotify: true}));
              e.stopPropagation();
              refreshBotRecords();
            }}>Refresh</Button>
          </Box>
      </Box>
      {add && <BotCreateWizard requestResponse={botCreatedResponse} onCancel={handleAdd}/>}
    </ThemeProvider>
      </Grid>
    </Grid>
  );
}
