import PropTypes from 'prop-types';

// material-ui
import { CameraOutlined } from '@ant-design/icons';
import { Typography, Stack, CardMedia } from '@mui/material';

// assets
import UploadCover from 'assets/images/upload/upload.svg';

// ==============================|| UPLOAD - PLACEHOLDER ||============================== //

export default function PlaceholderContent({ type,customStyles,isFileLimit }) {
  return (
    <>
      {type !== 'STANDARD' && (
        <Stack justifyContent="center" direction="column"  sx={{textAlign: 'center'}}>
          <Stack
            spacing={2}
            alignItems="center"
            justifyContent={"center"}
            direction={{ xs: 'column', md: 'row' }}
            sx={{ width: 1, textAlign: { xs: 'center', md: 'left' },ml:customStyles ? 1 : 0 }}
          >
            <CardMedia component="img" image={UploadCover} sx={{ width: 75 }} />
            <Stack sx={{ p: 2 }} spacing={1}>
              <Typography variant="h6">Drag & Drop or Select file</Typography>

              <Typography color="primary">
                Drop files here or click&nbsp;
                <Typography component="span" color="primary" sx={{ textDecoration: 'underline' }}>
                  browse
                </Typography>
                &nbsp;through your machine
              </Typography>
            </Stack>
          </Stack>
           <Stack my={0.5}>
            <Typography variant="body2">*Note: {customStyles ? 'Maximum 3 PDFs and 1 Excel is allowed to upload' : `A minimum of 1 and a maximum of ${isFileLimit ? isFileLimit : "3"} PDFs can be uploaded` }</Typography>
          </Stack>
        </Stack>
      )}
      {type === 'STANDARD' && (
        <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
          <CameraOutlined style={{ fontSize: '32px' }} />
        </Stack>
      )}
    </>
  );
}
PlaceholderContent.propTypes = {
  type: PropTypes.string
};
