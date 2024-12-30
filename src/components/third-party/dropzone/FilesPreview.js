import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import {List, ListItemText, ListItem, Typography,Stack,Box,Tooltip} from '@mui/material';

// project import
import IconButton from 'components/@extended/IconButton';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
// utils
import getDropzoneData from 'utils/getDropzoneData';

// assets
import { CloseCircleFilled, FileFilled, FileExcelOutlined } from '@ant-design/icons';

// ==============================|| MULTI UPLOAD - PREVIEW ||============================== //

export default function FilesPreview({ showList = false, files, onRemove, type,customStyles }) {
  const theme = useTheme();
  const hasFile = files.length > 0;
  const layoutType = type;

  return (
    <List
      disablePadding
      sx={{ ...(hasFile && layoutType !== 'STANDARD' && { my: 3 }), ...(layoutType === 'STANDARD' && { width: 'calc(100% - 84px)' }),display:"flex" }}
    >
      {files.map((file, index) => {
        const { key, name, size, preview, type } = getDropzoneData(file, index);
        if (showList) {
          return (
            <Tooltip title={name} key={key}>
            <Stack>
            <ListItem
              sx={{
                p: 0,
                m: 0.5,
                width: layoutType === 'STANDARD' ? 64 : 80,
                height: layoutType === 'STANDARD' ? 64 : 80,
                borderRadius: 1.25,
                position: 'relative',
                display: 'inline-flex',
                verticalAlign: 'text-top',
                border: `solid 1px ${theme.palette.divider}`,
                overflow: 'hidden'
              }}
            >
              {
                customStyles ? (name.endsWith('.pdf') ? <PictureAsPdfIcon style={{ width: '100%', fontSize: '1.5rem',height:"2em" }}/> : <FileExcelOutlined style={{ width: '100%', fontSize: '3rem' }}/>) :
                  (type?.includes('image') && <img alt="preview" src={preview} style={{ width: '100%' }} />)
                  (!type?.includes('image') && <FileFilled style={{ width: '100%', fontSize: '1.5rem' }} />)
              }

              {onRemove && (
                <IconButton
                  size="small"
                  color="error"
                  shape="rounded"
                  onClick={() => onRemove(file)}
                  sx={{
                    fontSize: '0.875rem',
                    bgcolor: 'background.paper',
                    p: 0,
                    width: 'auto',
                    height: 'auto',
                    top: 2,
                    right: 2,
                    position: 'absolute'
                  }}
                >
                  <CloseCircleFilled />
                </IconButton>
              )}
            </ListItem>
              {
                customStyles && <Box sx={{display:"flex",marginLeft:"5px"}}>
                  <Typography sx={{width:"55px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} variant="h9">{name}</Typography>
                  <Typography variant="h9">{name.endsWith('.pdf') ? '.pdf' : '.xlsx'}</Typography>
                </Box>
              }
            </Stack>
            </Tooltip>
          );
        }

        return (
          <ListItem
            key={key}
            sx={{
              my: 1,
              px: 2,
              py: 0.75,
              borderRadius: 0.75,
              border: (theme) => `solid 1px ${theme.palette.divider}`
            }}
          >
            <FileFilled style={{ width: '30px', height: '30px', fontSize: '1.15rem', marginRight: 4 }} />

            <ListItemText
              primary={typeof file === 'string' ? file : name}
              secondary={typeof file === 'string' ? '' : size}
              primaryTypographyProps={{ variant: 'subtitle2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />

            {onRemove && (
              <IconButton edge="end" size="small" onClick={() => onRemove(file)}>
                <CloseCircleFilled style={{ fontSize: '1.15rem' }} />
              </IconButton>
            )}
          </ListItem>
        );
      })}
    </List>
  );
}

FilesPreview.propTypes = {
  showList: PropTypes.bool,
  files: PropTypes.array,
  onRemove: PropTypes.func,
  type: PropTypes.string
};
