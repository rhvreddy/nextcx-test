import {useTheme} from '@mui/material/styles';
import {makeStyles} from '@mui/styles';
import {Box} from '@mui/system';
import {Accordion, AccordionDetails, AccordionSummary, Grid, Typography, Stack} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BaseModelComponent from '../../components/DemoComponents/BaseModelComponent';
import {BASE_MODELS} from '../../demo_config';
import {mainAppName} from "../../consts";
import {useEffect, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import {toast} from 'react-toastify';
import {useSelector} from "react-redux";
import {getAllModels} from "../../store/reducers/botRecords";
import {dispatch} from "../../store";
import ModelDetailsCard from "../ModelUpgrade/ModelDetailsCard";

export default function BaseModels() {

  const [open, setOpen] = useState(false);
  const menu = useSelector((state) => state.menu)
  const {drawerOpen} = menu;
  const [baseModels, setBaseModels] = useState([]);

  useEffect(() => {
    dispatch(getAllModels()).then(action => {
      if(action?.payload?.status?.toLowerCase() === "success") {
        const models = action?.payload?.result;
        const groupedByCompany = Object?.values(models?.reduce((acc, model) => {
          const company = model?.metadata?.parent_company;

          if (!acc[company]) {
            acc[company] = {
              parentCompany: company,
              description: model?.metadata?.parent_company_description,
              versions: []
            };
          }

          acc[company].versions.push({
            model: model?.model,
            metadata: model?.metadata
          });
          return acc;
        }, {}));

        setBaseModels(groupedByCompany);
      } else {
        toast.error("Unable to fetch Models, Please try again!")
      }
    });
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    // Handle form submission here.. show a toast "Request submitted Successfully" and close the dialog
    // show a toast "Request submitted Successfully"
    toast.success("Request Submitted Successfully");

    handleClose();
    console.log(event.target);
  };

  const AccordionComponent = (props) => {
    const {model} = props;
    return (
      <Accordion style={{width: "90%", border:`1px solid #00000122`}}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon fontSize={"large"} color={"black"}/>}
        >
          <Grid container style={{
            padding: "5px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            rowGap: "5px"
          }}>
            <Grid item>
              <span style={{fontSize: "20px", fontWeight: "700"}}>{model?.parentCompany} </span>
              {/*<span style={{fontSize: "16px", fontWeight: "400"}}>| {model?.modelName}</span>*/}
            </Grid>
            <Grid item>
              {model?.description}
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails style={{display: "flex", columnGap: "15px", rowGap: "10px", flexWrap: "wrap"}}>
          {model?.versions.map((modelVersion) => {
            return (
              <ModelDetailsCard config={modelVersion?.metadata || {}} modelName={modelVersion?.model}/>
            )
          })
          }
        </AccordionDetails>
      </Accordion>
    )
  }


  const theme = useTheme();
  let useStyles = makeStyles(() => ({
    container: {
      display: "flex",
      flexDirection: "column",
      rowGap: "10px",
      alignItems: "center",
      marginTop: "150px",
      [theme.breakpoints.down("sm")]: {
        height: "100vh",
      },
      [theme.breakpoints.down("xl")]: {
        height: "84vh",
      },
      [theme.breakpoints.up("xl")]: {
        height: "87vh",
      }
    },
    header: {
      position: "fixed",
      zIndex: 1111,
      background: "#ffff",
      padding: "20px 0px 20px 20px",
      boxShadow: "0px -6px 8px rgb(0 0 0)",
      width: drawerOpen ? `calc(100% - 260px)` : `calc(100% - 60px)`,
      '@media screen and (max-width : 1266px)': {
        width: "100% "
      }
    }
  }))

  const styles = useStyles()

  return (
    <>
      <Box className={styles.header}>
        <Typography variant="h3">Base Models</Typography>
        <Typography>Base Models available in {mainAppName} </Typography>
        <Stack flexDirection="row" justifyContent="flex-end" paddingRight="20px">
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Request new Model
          </Button>
        </Stack>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Request New Model</DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <TextField autoFocus margin="dense" name="name" label="Model Provider" type="text" fullWidth/>
            <TextField autoFocus margin="dense" name="name" label="Model Name" type="text" fullWidth/>
            <TextField margin="dense" name="version" label="Model Version" type="text" fullWidth/>
            <TextField margin="dense" name="description" label="Model Description" type="text" fullWidth/>
            {/* Add more fields as necessary */}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Box className={styles.container}>
        {
          baseModels?.map((model) => {
            return (
              <AccordionComponent model={model}/>
            )
          })
        }
      </Box>
    </>
  )
}
