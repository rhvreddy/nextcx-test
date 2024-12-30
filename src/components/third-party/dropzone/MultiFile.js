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

const MultiFileUpload = ({
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
                           isFileLimit,
                           selectedFiles
                         }) => {

  const originalKeys = ["Question", "Answer", "Reference Link"]
  const [isValidFormat, setIsValidFormat] = useState(true);
  const {getRootProps, getInputProps, isDragActive, isDragReject, fileRejections} = useDropzone({
    maxFiles: isFileLimit ? isFileLimit : null,
    multiple: true,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      "application/pdf": []
    },
    onDrop: (acceptedFiles) => {
      if (files) {
        if (showSingleFile) {
          setFieldValue(isCustom ? 'files[customFiles]' : 'files', [
            ...acceptedFiles.map((file) =>
              Object.assign(file, {
                preview: URL.createObjectURL(file)
              })
            )
          ]);
        } else {
          if (customStyles) {
            getSelectedFiles([...acceptedFiles]);
          } else {
            setFieldValue(isCustom ? 'files[customFiles]' : 'files', [
              ...files,
              ...acceptedFiles.map((file) =>
                Object.assign(file, {
                  preview: URL.createObjectURL(file)
                })
              )
            ]);
          }
        }
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

  async function getSelectedFiles(files) {
    const maxPdfCount = 3;
    const maxExcelCount = 1;

    let pdfCount = selectedFiles?.filter((file) => file.type === "application/pdf").length;
    let excelCount = selectedFiles?.filter((file) => file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").length;

    let newSelectedFiles = [...selectedFiles];

    if (files?.length > 0 && selectedFiles?.length < isFileLimit) {
      for (let file of files) {
        if (file?.type === "application/pdf" && pdfCount < maxPdfCount) {
          setIsValidFormat(true);
          setFileError(false);
          newSelectedFiles.push(
            Object.assign(file, {
              preview: URL.createObjectURL(file)
            })
          );
          pdfCount++;
        } else if (file?.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && excelCount < maxExcelCount) {
          const isValid = await readFile(file).then((res) => {
            if (res) {
              setIsValidFormat(true);
              setFileError(false);
              newSelectedFiles.push(
                Object.assign(file, {
                  preview: URL.createObjectURL(file)
                })
              );
              excelCount++;
            } else {
              setIsValidFormat(false);
            }
          });
        } else {
          setFileError(true);
        }
      }
      setFieldValue(isCustom ? 'files[customFiles]' : 'files', newSelectedFiles);
    } else {
      setFileError(true);
    }
  }

  const onRemoveAll = () => {
    setFieldValue(isCustom ? 'files[customFiles]' : 'files', null);
  };

  const onRemove = (file) => {
    const filteredItems = files && files.filter((_file) => _file !== file);
    setFieldValue(isCustom ? 'files[customFiles]' : 'files', filteredItems);
    if (file?.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      setIsValidFormat(true);
    }
  };

  const readFile = async (file) => {
    return new Promise(async resolve => {
      const wb = new FileReader();
      wb.readAsBinaryString(file);
      if (wb.readAsBinaryString) {
        wb.onload = async (e) => {
          const processResult = await processExcel(wb.result);
          resolve(processResult);
        }
      }
    })
  }

  async function processExcel(data) {
    const workbook = XLSX.read(data, {type: 'binary'});
    const firstSheet = workbook.SheetNames[0];
    const excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
    let keys = Object.keys(excelRows[0]);
    let res = await compare(originalKeys, keys);
    return res;
  }

  function compare(array1, array2) {
    array1.sort();
    array2.sort();
    for (let i = 0; i < array1.length; i++) {
      if (array1[i]?.toLowerCase() !== array2[i]?.toLowerCase()) return false;
    }
    return true;
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
              ...((isDragReject || error || !isValidFormat) && {
                color: 'error.main',
                borderColor: 'error.light',
                bgcolor: 'error.lighter'
              })
            }}
          >
            <input {...getInputProps()} />
            <PlaceholderContent customStyles={customStyles} type={type}/>
          </DropzoneWrapper>
          {type === 'STANDARD' && files && files.length > 1 && (
            <Button variant="contained" color="error" size="extraSmall" onClick={onRemoveAll}>
              Remove all
            </Button>
          )}
        </Stack>
        {!isValidFormat && <Typography color="error">Error: The file uploaded is not in the required format.
          Please refer to the sample excel file to understand the required structure. </Typography>
        }
        {fileRejections.length > 0 && !fileError &&
          <RejectionFiles fileRejections={fileRejections} customStyles={customStyles}/>}
        {files && files.length > 0 &&
          <FilesPreview customStyles={customStyles} files={files} showList={showList} onRemove={onRemove} type={type}/>}
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
      > <Typography color="error">Error: Please upload a maximum of 3 PDFs and 1 Excel file. </Typography></Paper>}
      {type !== 'STANDARD' && files && files.length > 0 && (
        <></>
      )}
    </>
  );
};

MultiFileUpload.propTypes = {
  error: PropTypes.bool,
  showList: PropTypes.bool,
  files: PropTypes.array,
  setFieldValue: PropTypes.func,
  onUpload: PropTypes.func,
  sx: PropTypes.object,
  type: PropTypes.string
};

export default MultiFileUpload;
