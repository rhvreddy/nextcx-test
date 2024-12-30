import PropTypes from 'prop-types';

// material-ui
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel, Link, ListItem,
  ListItemIcon, ListItemSecondaryAction,
  Stack,
  TextField,
  List,
  Typography, FormHelperText
} from '@mui/material';

// third-party
import { useFormik } from 'formik';
import * as yup from 'yup';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import { EnvironmentOutlined, FileExcelOutlined } from '@ant-design/icons';
import UploadSingleFile from '../../../../../components/third-party/dropzone/SingleFile';
import UploadMultiFile from '../../../../../components/third-party/dropzone/MultiFile';
import { useState } from 'react';

const validationSchema = yup.object({

});

// ==============================|| VALIDATION WIZARD - PAYMENT ||============================== //

export default function UploadTemplateForm({ botFormData, setBotFormData, handleNext, handleBack, setErrorIndex }) {
  const formik = useFormik({
    initialValues: {
      files: botFormData.templateFiles
    },
    validationSchema,
    onSubmit: (values) => {
      // console.log('UploadTemplateForm values ->', values);
      setBotFormData({
        ...botFormData,
        templateFiles: values.files
      });
      handleNext();
    }
  });
  const [list, setList] = useState(false);
  const [showSingleFile, setShowSingleFile] = useState(true);

  return (
    <>
      <Typography variant='h5' gutterBottom sx={{ mb: 2 }} >
        Upskill your bot knowledge in simple questions and answers..!
        </Typography>
        <Typography  gutterBottom sx={{ mb: 2 }} >
        The FAQs you upload here will be trained and would be available live.
      </Typography>
      <form onSubmit={formik.handleSubmit} style={{ overflow: "hidden"}}>
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <Stack spacing={0.5}>
              <List>
                <ListItem>
                  <FileExcelOutlined/>
                    <Link sx={{marginLeft:'5px'}} align="left" href="https://skil-ai-cf.s3.amazonaws.com/sample/bot-creation-excel-example-01.xlsx" target="_blank">
                    Download Sample Q&A Template
                  </Link>
                </ListItem>
              </List>
            </Stack>
          </Grid>
        </Grid>
        <Grid container spacing={3} maxHeight={{xs:"200px",sm:"0",md:"0",}} overflow={{xs:"auto"}}>
          <Grid item xs={12}>
            <Stack spacing={1.5}  alignItems="center">
              <UploadMultiFile showList={list} showSingleFile={showSingleFile} setFieldValue={formik.setFieldValue} files={formik.values.files} error={formik.touched.files && !!formik.errors.files}/>
              {formik.touched.files && formik.errors.files && (
                <FormHelperText error id="standard-weight-helper-text-password-login-01">
                  {formik.errors.files}
                </FormHelperText>
              )}
            </Stack>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between">
            <Button onClick={handleBack} sx={{ my: 3, ml: 1 }}>
              Back
            </Button>
            <AnimateButton>
              <Button variant="contained" type="submit" sx={{ my: 3, ml: 1 }} onClick={() => setErrorIndex(1)}>
                Next
              </Button>
            </AnimateButton>
          </Stack>
        </Grid>
      </form>
    </>
  );
}

UploadTemplateForm.propTypes = {
  paymentData: PropTypes.object,
  setPaymentData: PropTypes.func,
  handleNext: PropTypes.func,
  handleBack: PropTypes.func,
  setErrorIndex: PropTypes.func
};
