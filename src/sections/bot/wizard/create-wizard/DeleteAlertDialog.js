import { useState } from 'react';

// material-ui
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

// ==============================|| DIALOG - ALERT ||============================== //

export default function DeleteAlertDialog() {
  const [open, setOpen] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <Box sx={{ p: 1, py: 1.5 }}>
          <DialogTitle id="alert-dialog-title">Delete BOT</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              BOT will be deleted permanently.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="error" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleClose}>
              Agree
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
