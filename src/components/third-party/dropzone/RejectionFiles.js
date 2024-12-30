import PropTypes from 'prop-types';

// material-ui
import { alpha } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';

// utils
import getDropzoneData from 'utils/getDropzoneData';

// ==============================|| DROPZONE - REJECTION FILES ||============================== //

export default function RejectionFiles({ fileRejections,customStyles }) {
  return (
    fileRejections?.[0]?.errors?.[0]?.code !== "too-many-files" && <Paper
      variant="outlined"
      sx={{
        py: 1,
        px: 2,
        mt: 3,
        borderColor: 'error.light',
        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08)
      }}
    >
      {!customStyles && fileRejections.map(({ file, errors }) => {
        const { path, size } = getDropzoneData(file);

        return (

          <Box key={path} sx={{ my: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {path} - {size ? size : ''}
            </Typography>

            {errors.map((error) => (
              <Box key={error.code} component="li" sx={{ typography: 'caption' }}>
                {error.message}
              </Box>
            ))}
          </Box>
        );
      })}

      {customStyles && fileRejections && (
        <Typography color="error">Error: Please upload a maximum of 3 PDFs and 1 Excel file </Typography>)}
    </Paper>
  );
}

RejectionFiles.propTypes = {
  fileRejections: PropTypes.array
};
