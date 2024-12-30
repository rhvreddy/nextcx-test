import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Box,
  Button, FormHelperText,
  Grid, Link,
  Stack, TextField,
  Typography
} from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import {fetchAIAppsDocument} from '../../store/reducers/botRecords';

import {useFormik} from "formik";
import * as Yup from 'yup';
import {addCustomGuardRail} from "../../store/reducers/botRecords";
import {toast} from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";

const AddNewGuardRailDialog = ({openAddNewDialog, setOpenAddNewDialog, handleCustomGuardRail}) => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const [sampleGuardRailConfig, setSampleGuardRailConfig] = useState({});
  const [customGuardRailIntegrating, setcustomGuardRailIntegrating] = useState(false);
  const businessId = localStorage.getItem("businessId");

  useEffect(() => {
    dispatch(fetchAIAppsDocument({documentName:"sampleGuardRailConfig", userId:localStorage.getItem("userId") || ""})).then((action)=>{
      if(action?.error){
        toast.error(action?.payload?.message)
      }
      else{
        setSampleGuardRailConfig(action?.payload?.result?.sampleGuardRailConfig?.sampleGuardRailConfig || {});
      }
    }).catch((err)=>{
      toast.error("Error occurred while fetching guard rail configuration")
    })
  }, []);

  const downloadSampleGuardRail = () => {
    const jsonString = JSON.stringify(sampleGuardRailConfig, null, 2);

    const blob = new Blob([jsonString], {type: "application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_guard_rail.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const formik = useFormik({
    initialValues: {
      openAPISpec: ""
    },
    validationSchema: Yup.object().shape({
      openAPISpec: Yup.string()
        .required('Open API Spec is required')
        .test(
          'is-json',
          'Please provide valid JSON',
          value => {
            try {
              JSON.parse(value);
              return true;
            } catch (e) {
              return false;
            }
          }
        )
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
        const payload = {
          openAPISpec: JSON.parse(values?.openAPISpec),
          businessId: businessId
        }
        setcustomGuardRailIntegrating(true);
        dispatch(addCustomGuardRail(payload)).then(action => {
          setcustomGuardRailIntegrating(false);
          setOpenAddNewDialog(false);
          formik.resetForm();
          if(action?.payload?.status?.toLowerCase() === "success") {
            handleCustomGuardRail(true);
            toast.success("Custom guard rail has been successfully added to the Business.");
          } else {
            toast.error(action?.payload?.message);
          }
        })
      }
    }
  )

  return (
    <Dialog
      fullWidth
      open={openAddNewDialog}
    >
      <DialogTitle>
        <Box style={{padding:"5px 10px", width:"100%",display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
          <Typography variant="h3">Define Guard Rail</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: "10px",
          columnGap: "10px",
          flexWrap: "wrap",
          px: "1rem"
        }}>
          <form noValidate onSubmit={formik.handleSubmit}>
            <Grid item xs={12} sm={4}>
              <Link sx={{textDecoration: "underline", cursor: "pointer"}} align="left" onClick={downloadSampleGuardRail}>
                Download Sample Guard Rail
              </Link>
            </Grid>
            <Grid item xs={12} mt={2}>
              <TextField spellCheck='false' id='instruction' name='openAPISpec'
                         placeholder={JSON.stringify(sampleGuardRailConfig, null, 2)}
                         fullWidth
                         multiline rows={10}
                         value={formik?.values?.openAPISpec}
                         onChange={formik.handleChange}
                         label='Enter Open API Spec(JSON)'
                         InputLabelProps={{style: {lineHeight: '1rem'}}}
                         error={formik.touched.openAPISpec && Boolean(formik.errors.openAPISpec)}/>
              {formik.touched.openAPISpec && formik.errors.openAPISpec && (
                <FormHelperText error id="helper-text-first-name">
                  {formik.errors.openAPISpec}
                </FormHelperText>
              )}
            </Grid>
            <Grid xs={12} sx={{display:"flex", justifyContent:"flex-end", gap:"1rem"}} mt={3} mb={-6}>
              <Button variant="outlined" onClick={() => {
                setOpenAddNewDialog(false)
                formik.resetForm()
              }}
              sx={{pointerEvents: customGuardRailIntegrating ? "none" : "auto"}}
              >
                Cancel
              </Button>
              <Button variant="contained" type="submit" sx={{pointerEvents: customGuardRailIntegrating ? "none" : "auto"}}>
                {customGuardRailIntegrating ? <CircularProgress style={{width:"28px", height:"28px", color:"#fff"}}/>: "Submit"}
              </Button>
            </Grid>
          </form>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default AddNewGuardRailDialog;
