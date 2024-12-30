import React, {useEffect, useState} from "react";
// material-ui
import {
  FormControl,
  TextField,
  Box,
  Grid
} from '@mui/material';


const ActionInfo = (props) => {

  return (

    <Grid container spacing={1}>
      <Grid item xs={12} sx={{mt: 1, pr: 2}}>
        <Box sx={{bgcolor: 'secondary.lighter', color: 'secondary.A300', p: 1, mb: 2}}>
          Action
        </Box>
        <FormControl fullWidth>
          <Box sx={{mt: 1}}>
            <TextField
              fullWidth
              placeholder="action url"
              value={props?.actionUrl || ""}
              onChange={(e) => props?.handleActionUrl(e.target.value)}
              id="url-start-adornment"
              InputProps={{
                startAdornment: props?.actionUrl && 'https://'
              }}
            />
          </Box>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default ActionInfo;







































