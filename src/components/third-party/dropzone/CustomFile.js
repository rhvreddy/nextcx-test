import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import * as XLSX from 'xlsx';
// material-ui
import {alpha, styled} from '@mui/material/styles';
import {Box, Button, Stack, Typography, Paper} from '@mui/material';

// third-party
import {useDropzone} from 'react-dropzone';

// project import
import RejectionFiles from './RejectionFiles';
import PlaceholderContent from './PlaceholderContent';
import FilesPreview from './FilesPreview';
import {stubFalse} from 'lodash-es';

const DropzoneWrapper = styled('div')(({theme}) => ({
  outline: 'none',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px dashed ${theme.palette.secondary.main}`,
  '&:hover': {opacity: 0.72, cursor: 'pointer'}
}));

// ==============================|| UPLOAD - MULTIPLE FILE ||============================== //

const CustomFileUpload = ({
                            error,
                            showList = false,
                            showSingleFile,
                            files,
                            setFieldValue,
                            setFileError,
                            fileError,
                            sx,
                            type,
                            onUpload,
                            customStyles,
                            isCustom,
                            selectedFiles,
                            isFileLimit
                          }) => {
  const {getRootProps, getInputProps, isDragActive, isDragReject, fileRejections} = useDropzone({
    maxFiles: isFileLimit ? isFileLimit : 3,
    multiple: true,
    accept: {
      "application/pdf": []
    },
    onDrop: (acceptedFiles) => {

      if (files) {
        getSelectedFiles([...acceptedFiles]);
      } else {
        setFieldValue(
          isCustom ? 'files[customFiles]' : 'files',
          acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file)
            })
          )
        );
      }
    }
  });

  const onRemoveAll = () => {
    setFieldValue('files', null);
  };

  const onRemove = (file) => {
    const filteredItems = files && files.filter((_file) => _file !== file);
    if (isCustom) {
      setFieldValue('files[customFiles]', filteredItems)
    } else {
      setFieldValue('files', filteredItems);
    }

  };

  async function getSelectedFiles(files) {
    const maxPdfCount = isFileLimit ? isFileLimit : 3;

    let pdfCount = selectedFiles?.filter((file) => file.type === "application/pdf").length;

    let newSelectedFiles = [...selectedFiles];

    if (files?.length > 0 && selectedFiles?.length < maxPdfCount) {
      for (let file of files) {
        if (file?.type === "application/pdf" && pdfCount < maxPdfCount) {
          setFileError(false);
          newSelectedFiles.push(
            Object.assign(file, {
              preview: URL.createObjectURL(file)
            })
          );
          pdfCount++;
        } else {
          setFileError(true);
        }
      }
      setFieldValue(isCustom ? 'files[customFiles]' : 'files', newSelectedFiles);
    } else {
      setFileError(true);
    }
  }

  return (
    <>
      <Box
        sx={{
          width: '100%',
          ...(type === 'STANDARD' && {width: 'auto', display: 'flex'}),
          ...sx
        }}
      >
        <Stack {...(type === 'STANDARD' && {alignItems: 'center'})}>
          <DropzoneWrapper
            {...getRootProps()}
            sx={{
              ...(type === 'STANDARD' && {
                p: 0,
                m: 1,
                width: 64,
                height: 64
              }),
              ...(isDragActive && {opacity: 0.72}),
              ...((isDragReject || error) && {
                color: 'error.main',
                borderColor: 'error.light',
                bgcolor: 'error.lighter'
              })
            }}
          >
            <input {...getInputProps()} />
            <PlaceholderContent isFileLimit={isFileLimit} customStyles={customStyles} type={type}/>
          </DropzoneWrapper>
          {type === 'STANDARD' && files && files.length > 1 && (
            <Button variant="contained" color="error" size="extraSmall" onClick={onRemoveAll}>
              Remove all
            </Button>
          )}
        </Stack>
        {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} customStyles={customStyles}/>}
        {files && files.length > 0 &&
          <FilesPreview customStyles={true} files={files} showList={showList} onRemove={onRemove} type={type}/>}
      </Box>

      {fileError && <Paper
        variant="outlined"
        sx={{
          py: 1,
          px: 2,
          mt: 3,
          borderColor: 'error.light',
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.08)
        }}
      > <Typography color="error">Error: Please upload a maximum of {isFileLimit ? isFileLimit : "3"}  PDFs </Typography></Paper>}
      {type !== 'STANDARD' && files && files.length > 0 && (
        <></>
      )}
    </>
  );
};

CustomFileUpload.propTypes = {
  error: PropTypes.bool,
  showList: PropTypes.bool,
  files: PropTypes.array,
  setFieldValue: PropTypes.func,
  onUpload: PropTypes.func,
  sx: PropTypes.object,
  type: PropTypes.string
};

export default CustomFileUpload;
