import React, {useEffect, useMemo, useRef, useState} from 'react';
import Avatar from 'components/@extended/Avatar';
import "./table.css"

// material-ui
import {
  Chip,
  Dialog,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Typography,
  Paper,
  TableContainer,
  InputAdornment,
  OutlinedInput,
  FormControl,
  FormHelperText,
  DialogTitle,
  Divider,
  DialogContent,
  DialogContentText,
  DialogActions, Box, TextField, Link, Skeleton, Tooltip, ListItem, Alert
} from '@mui/material';
import {Button} from '@mui/material';
// project imports
import {CLIENT_ID, REACT_APP_APP_BACK_END_BASE_URL, REACT_APP_APP_S_CODE} from 'config';
import {useDispatch, useSelector} from 'react-redux';
import {Search, InsertDriveFile, Delete} from '@mui/icons-material';
import PropTypes from 'prop-types';
import MainCard from '../../components/MainCard';
import ScrollX from '../../components/ScrollX';
import {useExpanded, useFilters, useGlobalFilter, useTable} from 'react-table';
import {createTheme, ThemeProvider, useTheme} from '@mui/material/styles';
import {CheckOutlined, ClockCircleOutlined, DownOutlined, FileExcelOutlined, RightOutlined} from '@ant-design/icons';
import {MdOutlineUploadFile} from 'react-icons/md';
import {renderFilterTypes, GlobalFilter, DefaultColumnFilter, SelectColumnFilter} from 'utils/react-table';
import {useNavigate} from 'react-router-dom';
import {getUserInfo} from '../../store/reducers/profile';
import {makeStyles} from "@mui/styles";
import ModelCompareChart from './ModelCompareChart'; // Import your chart component


// import PropTypes from 'prop-types';
import {useCallback, Fragment} from 'react';
// material-ui
import Loader from '../../components/Loader/Loader';
import {fetchBotRecords, getAllModels, modelComparison, startModelUpgrade} from "../../store/reducers/botRecords";
import {triggerNotification} from "../../store/reducers/chat";
import mockData from "../../utils/mock-data";
import {compareBotVersions, isCurrentBotVersionGreater} from '../../utils/reusable-functions';
import ModelDetailsCard from "./ModelDetailsCard";
import {toast} from "react-toastify";
import * as XLSX from "xlsx";
import {MdStart,MdOutlineFileDownload,MdOutlineDifference } from "react-icons/md";
import { IoIosPlayCircle } from "react-icons/io";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";


const customTheme = createTheme({
  palette: {
    primary: {
      main: '#6e45e9'
    },
    secondary: {
      main: '#EDE4FF'
    }
  }
});

let modelComparisonResults;

function SubRows({row, rowProps, data, loading}) {
  const theme = useTheme();

  if (loading) {
    return (
      <>
        {[0, 1, 2].map((item) => (
          <TableRow key={item}>
            <TableCell/>
            {[0, 1, 2, 3, 4, 5].map((col) => (
              <TableCell key={col}>
                <Skeleton animation="wave"/>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  }

  return (
    <>
      {data.map((x, i) => (
        <TableRow
          key={`sub-${data.id}-${i}`}
          {...{...rowProps, key: `${i}-${rowProps.key}`}}
          sx={{
            background: theme.palette.secondary[100], "&:hover": {
              background: `${theme.palette.secondary[200]} !important`
            }
          }}
        >
          {row.cells.map((cell, index) => (
            <TableCell key={index} {...cell.getCellProps([{className: cell.column.className}])}>
              {cell?.column?.id === 'Actions' || cell?.column?.id === 'newModel' ?
                <div ref={(el) => {
                  if (el) {
                    try {
                      const button = el.getElementsByClassName('MuiButtonBase-root');
                      const selectBtn = el.getElementsByClassName('MuiSelect-select');
                      if (button) {
                        for (let btn of button) {
                          if (btn.ariaLabel && btn.ariaLabel === "start") {
                            if ((!data[i]?.isLatest || btn?.id === "disable")) {
                              if (btn?.id === "disable" && !data[i]?.isLatest) {
                                btn.style.pointerEvents = "none"
                              }
                              btn.style.background = theme.palette.secondary.light;
                              btn.disabled = true;
                            } else {
                              if ((data[i]?.upgradeCount >= 5 || btn?.id === "disable")) {
                                btn.style.background = theme.palette.secondary.light;
                                btn.disabled = true;
                              } else {
                                btn.style.background = (data[i]?.status === 'Active' || data[i]?.status === "Published") ? theme.palette.primary.main : theme.palette.secondary.light;
                                btn.disabled = (data[i]?.status === 'Active' || data[i]?.status === "Published") ? false : true;
                              }
                            }
                          } else {
                            if (btn?.ariaLabel === "compare") {
                              if ((!data[i]?.isLatest || btn?.id === "disable")) {
                                if (btn?.id === "disable" && !data[i]?.isLatest) {
                                  btn.style.pointerEvents = "none"
                                }
                                btn.style.background = theme.palette.secondary.light;
                                btn.disabled = true;
                              }
                              if(data[i]?.isLatest) {
                                btn.disabled = (data[i]?.status === 'Active' || data[i]?.status === "Published") && btn?.id === "enable" ? false : true;
                                btn.style.background = (data[i]?.status === 'Active' || data[i]?.status === "Published") && btn?.id === "enable" ? theme.palette.primary.main : theme.palette.secondary.light ;
                              }else{
                                btn.disabled = true;
                                btn.style.background = theme.palette.secondary.light;
                              }

                            }else if(btn?.ariaLabel === "download"){
                              if(data[i]?.isLatest) {
                                btn.disabled = data[i]?.modelUpgradeReportS3Info?.s3Url &&  (data[i]?.status === 'Active' || data[i]?.status === "Published") ? false : true;
                                btn.style.background = data[i]?.modelUpgradeReportS3Info?.s3Url && (data[i]?.status === 'Active' || data[i]?.status === "Published") ? theme.palette.primary.main : theme.palette.secondary.light ;
                              }else{
                                btn.disabled = true;
                                btn.style.background = theme.palette.secondary.light;
                                btn.style.pointerEvents = "none"
                              }
                            } else {
                              btn.style.background = (data[i]?.status === 'Active' || data[i]?.status === "Published") ? theme.palette.primary.main : theme.palette.secondary.light;
                              btn.disabled = (data[i]?.status === 'Active' || data[i]?.status === "Published") ? false : true;
                            }
                          }
                        }
                      }
                      if(selectBtn && selectBtn[0]){
                        if(data[i]?.isLatest){
                          selectBtn[0].style.pointerEvents = (data[i]?.status === 'Active' || data[i]?.status === "Published") ? "auto" : "none";
                        }else{
                          selectBtn[0].style.pointerEvents = "none";
                        }
                      }
                    } catch (err) {

                    }
                  }
                }
                }> {cell.render(cell.column.SubCell ? 'SubCell' : 'Cell', {
                  value: cell.column.accessor && cell.column.accessor(x, i),
                  row: {...row, original: x}
                })}</div> : cell.render(cell.column.SubCell ? 'SubCell' : 'Cell', {
                  value: cell.column.accessor && cell.column.accessor(x, i),
                  row: {...row, original: x}
                })}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

SubRows.propTypes = {
  row: PropTypes.object,
  rowProps: PropTypes.any,
  data: PropTypes.array,
  loading: PropTypes.bool
};

function SubRowAsync({row, rowProps, rowData}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const numRows = mockData(1);


  useEffect(() => {
    const timer = setTimeout(() => {
      setData(rowData);
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line
  }, []);

  return <SubRows row={row} rowProps={rowProps} data={data} loading={loading}/>;
}

SubRowAsync.propTypes = {
  row: PropTypes.object,
  rowProps: PropTypes.any
};

const CellExpander = ({row}) => {
  const theme = useTheme();
  const collapseIcon = row.isExpanded ? <DownOutlined style={{color: theme.palette.primary.main}}/> : <RightOutlined/>;
  return (
    <Box sx={{fontSize: '0.75rem', color: 'text.secondary'}} {...row.getToggleRowExpandedProps()}>
      {collapseIcon}
    </Box>
  );
};

CellExpander.propTypes = {
  row: PropTypes.object
};

function ReactTable({
                      columns: userColumns, data, clearFilter,
                      confirmAllFiltersCleared,
                      renderRowSubComponent,
                      getTableFilters
                    }) {
  const [filters, setFilters] = useState({});
  const theme = useTheme();
  const filterTypes = useMemo(() => renderFilterTypes, []);
  const defaultColumn = useMemo(() => ({Filter: DefaultColumnFilter}), []);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    visibleColumns,
    state: {globalFilter, filters: tableFilters},
    setAllFilters,
    preGlobalFilteredRows,
    setGlobalFilter,
    resetResizing
  } = useTable(
    {
      columns: userColumns,
      data,
      defaultColumn,
      filterTypes,
      autoResetColumnWidths: true,
      initialState: {
        filters: Object.entries(filters).map(([columnId, filterValue]) => ({
          id: columnId,
          value: filterValue,
        })),
      },
    },

    useGlobalFilter,
    useFilters,
    useExpanded
  );

  useEffect(() => {
    const updatedFilters = tableFilters.reduce((acc, {id, value}) => {
      acc[id] = value;
      return acc;
    }, {});
    setFilters(updatedFilters);
    getTableFilters(updatedFilters)
  }, [tableFilters]);

  useEffect(() => {
    if (clearFilter) {
      setAllFilters([]);
      confirmAllFiltersCleared(true);
    }
  }, [clearFilter]);

  return (
    <TableContainer component={Paper} {...getTableProps()}>
      <Table>
        <TableHead>
          {headerGroups.map((headerGroup, i) => (
            <React.Fragment key={`headerGroup-${i}`}>
              <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => (
                  <TableCell key={`headerCell-${index}`} {...column.getHeaderProps([{className: column.className}])}>
                    {column.render('Header')}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={`filter-${i}`}>
                {headerGroup.headers.map((column, index) => (
                  <TableCell key={`filterCell-${index}`}>
                    {column.canFilter ? column.render('Filter') : null}
                  </TableCell>
                ))}
              </TableRow>
            </React.Fragment>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            const rowProps = row.getRowProps();
            return (
              <React.Fragment key={`row-${i}`}>
                <TableRow {...row.getRowProps()} sx={{
                  background: row.isExpanded ? theme.palette.primary[200] : "inherit", "&:hover": {
                    background: row.isExpanded ? `${theme.palette.primary.light} !important` : "inherit"
                  }
                }}>
                  {row.cells.map((cell, index) => (
                    <TableCell key={`cell-${index}`} {...cell.getCellProps([{className: cell.column.className}])}>
                      {cell?.column?.id === 'Actions' || cell?.column?.id === 'newModel' ?
                        <div ref={(el) => {
                          if (el) {
                            try {
                              const button = el.getElementsByClassName('MuiButtonBase-root');
                              const selectBtn = el.getElementsByClassName('MuiSelect-select');
                              if (button && row.isExpanded) {
                                for (let btn of button) {
                                  btn.disabled = row.isExpanded ? true : false;
                                  btn.style.mixBlendMode = "soft-light";
                                }
                              } else if (button && !row.isExpanded) {
                                for (let btn of button) {
                                  if (btn.ariaLabel && btn.ariaLabel === "start" && (row.original.upgradeCount && row.original.upgradeCount >= 5 || btn?.id === "disable")) {
                                    btn.style.background = theme.palette.secondary.light;
                                    btn.disabled = true;
                                    btn.style.mixBlendMode = "inherit"
                                  } else if (btn?.ariaLabel === "compare" && btn?.id === "disable") {
                                      btn.style.background = theme.palette.secondary.light;
                                      btn.disabled = true;
                                      btn.style.mixBlendMode = "inherit"
                                    }else if(btn?.ariaLabel === "download" && btn?.id === "disable"){
                                    btn.style.background = theme.palette.secondary.light;
                                    btn.disabled = true;
                                    btn.style.mixBlendMode = "inherit"
                                  }
                                  else {
                                      btn.style.background = (row?.original?.status === 'Active' || row?.original?.status === "Published") ? theme.palette.primary.main : theme.palette.secondary.light
                                      btn.disabled = (row?.original?.status === 'Active' || row?.original?.status === "Published") ? false : true;
                                      btn.style.mixBlendMode = "inherit"
                                    }
                                }
                              }
                              if (selectBtn && selectBtn[0] && row.isExpanded) {
                                selectBtn[0].style.pointerEvents = row.isExpanded ? "none" : "auto";
                              } else if (selectBtn && selectBtn[0] && !row.isExpanded) {
                                selectBtn[0].style.pointerEvents = (row?.original?.status === 'Active' || row?.original?.status === "Published") ? "auto" : "none";
                              }
                            } catch (e) {
                            }

                          }
                        }}>{cell.render('Cell')}</div> : cell.render('Cell')}
                    </TableCell>
                  ))}
                </TableRow>
                {row.isExpanded && renderRowSubComponent({row, rowProps, visibleColumns})}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  renderRowSubComponent: PropTypes.any
};


ModelCompareChart.propTypes = {series: PropTypes.arrayOf(PropTypes.any)};
const ModelUpgrade = () => {
  const LIMIT = 50
  const theme = useTheme();
  const menu = useSelector((state) => state.menu)
  const {drawerOpen} = menu;
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [columnsData, setColumnData] = useState([]);
  const [data, setData] = useState([]);
  const [subData, setSubData] = useState([])
  const [clearAllFilters, setClearAllFilters] = useState(false);
  const [showClearFilter, setShowClearFilter] = useState(false);
  const [newModelVal, setNewModelVal] = useState({})
  const [triggerTableRender, setTriggerTableRender] = useState(false);
  const [searchTerm, setSearchTerm] = useState('')
  const userDetails = useRef({});
  let userId = localStorage.getItem('userId');
  const [limit, setLimit] = useState(LIMIT)
  const [skip, setSkip] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modelComparisonInfo, setModelComparisonInfo] = useState({})
  const [showFile, setShowFile] = useState(false);
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const originalKeys = ["Query"];
  const [isValidFormat, setIsValidFormat] = useState(true);
  const newModelOptions = useRef([])
  const activeBotRecord = useRef()
  const selectedModels = useRef()
  const [modelUpgradePending, setModelUpgradePending] = useState(false);

  const [selectedChartData, setSelectedChartData] = useState([]);
  const [selectedModelNames, setSelectedModelNames] = useState([]);
  const [openModelCompareDialog, setOpenModelCompareDialog] = useState(false);


  const containerRef = useRef(null);

  const profile = useSelector(state => state.profile)
  const botRecords = useSelector(state => state.botRecords)

  const debouncedSearchQuery = useMemo(() => _.debounce((value) => {
    dispatch(fetchBotRecords({
      payload: {
        restrictPublished: "Y",
        clientId: CLIENT_ID,
        createdBy: localStorage.getItem("userId"),
        appRoles: localStorage.getItem("appRoles"),
      },
      params: {searchTerm: value, skip: value?.skip, limit: limit}
    }));
  }, 500), [dispatch]);

  useEffect(() => {
    debouncedSearchQuery({searchTerm, skip: skip});
  }, [searchTerm, debouncedSearchQuery, skip]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      if (botRecords?.status !== 'loading' && scrollTop + clientHeight >= scrollHeight - 20) {
        if (botRecords?.totalNumberOfRecords > botRecords?.records.length) {
          setSkip(skip + limit);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [botRecords?.status]);

  const handleChangeModelOptions = async (rowId, e) => {
    if (e.target.value) {
      let botRecordId = rowId.original.botRecordId;
      setNewModelVal((prevValues) => {
        const updatedBotRecordIds = {...prevValues.botRecordIds};
        updatedBotRecordIds[botRecordId] = e.target.value;
        return {
          ...prevValues,
          botRecordIds: updatedBotRecordIds,
        };
      });
      setTriggerTableRender(true);
    }
  };

  const displaySnackbarAlert = (message, status) => {
    switch (status) {
      case "success":
        return toast.success(message);
        break;
      case "error" :
        return toast.error(message);
        break;
    }
  }

  const CompareModels = () => {
    let currentModelDetails = modelComparisonInfo?.[0], newModelDetails = modelComparisonInfo?.[1];

    return (
      <Grid sx={{display:"flex", flexDirection: {xs: "colum", sm:"row"}, gap: "10px", alignItems: "stretch"}}>
            {modelComparisonInfo?.map((model, index) => (
              <Grid sx={{ display: 'flex'}}>
                <ModelDetailsCard key={index} config={model || {}}/>
              </Grid>
            ))}
      </Grid>
    )
  }

  const handleOnstart = async (row, e) => {
    let modelVal = newModelVal?.botRecordIds?.[row?.original?.botRecordId];
    let models = [row?.original?.aiModel ? row?.original?.aiModel : "gpt-4o", modelVal];
    models = JSON.stringify(models);
    activeBotRecord.current = row?.original;
    selectedModels.current = {currentModel: row?.original?.aiModel, newModel: modelVal}

    const response = await dispatch(modelComparison(models));

    if(response?.payload?.status?.toLowerCase() === "success") {
      setDialogOpen(true);
      modelComparisonResults = response?.payload?.result[0]?.metadata
      modelComparisonResults = Object?.entries(modelComparisonResults)?.map(([modelName, modelDetails]) => {
        return { modelName, ...modelDetails };
      });

      modelComparisonResults[0].modelType = "Current Model";
      modelComparisonResults[1].modelType = "New Model";
      setModelComparisonInfo(modelComparisonResults)
    } else {
      displaySnackbarAlert("Model details not found, Please try again!", "error");
    }
  }

  const handleDownloadClick = (row, e) => {
    const fileDownloadUrl = row?.original?.modelUpgradeReportS3Info?.s3Url;
    if(fileDownloadUrl) {
      const link = document.createElement('a');
      link.href = fileDownloadUrl;
      link.download = '';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const removeUploadedFile = () => {
    setShowFile(false);
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  const handleFileUpload = (event) => {
    const file = event?.target?.files[0];
    const maxSizeInBytes = 5 * 1024 * 1024;

    if(file) {
      const fileExtension = file?.name?.split(".").pop();
      if(fileExtension !== "xls" && fileExtension !== "xlsx") {
        displaySnackbarAlert("Please select a valid file type. Supported types: xlsx, xls", "error");
      } else if(file?.size > maxSizeInBytes) {
        displaySnackbarAlert("Please insert an file with size lesser or eqaul to 5 Mb", "error");
      } else {
        readFile(file).then((res) => {
          if(res) {
            setIsValidFormat(true);
            setFile(file);
            setShowFile(true);
            setFileName(file?.name);
          } else {
            setFile(null);
            setShowFile(false);
            setFileName(file?.name);
            setIsValidFormat(false);
          }
        })
      }
    }
  }

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
    for(let i=0; i<originalKeys.length; i++) {
      if(originalKeys[i]?.toLowerCase() !== keys[i]?.toLowerCase()) {
        return false;
      }
    }
    return originalKeys?.length === keys?.length;
  }

  const handleUploadClick = () => {
    inputRef.current.click();
  };

  const handleConfirmClick = () => {
      setModelUpgradePending(true);
    const userData = profile?.user ? profile?.user : {};
      const formData = new FormData();
      formData.append("excelFile", file);
      const data = {
        botRecordId: activeBotRecord?.current?.botRecordId,
        newModel: selectedModels.current?.newModel,
        currentModel: selectedModels?.current?.currentModel,
        gptId: activeBotRecord?.current?.interpreterId,
        gptName: activeBotRecord?.current?.botName,
        version: activeBotRecord?.current?.versionNumber,
        upgradeCount: activeBotRecord?.current?.upgradeCount ? activeBotRecord?.current?.upgradeCount + 1: 1,
        sourcePage: "model-upgrade",
        userId:localStorage.getItem("userId"),
        userName:userData?.firstName + " " + userData?.lastName
      }
      formData.append("data", JSON.stringify(data));

      dispatch(startModelUpgrade(formData)).then(action => {
        if(action?.payload?.status?.toLowerCase() === "success") {
          handleCloseDialog();
          setModelUpgradePending(false);
          if(file) {
            displaySnackbarAlert("Model upgraded successfully. You will be notified when Status report is ready to download.", "success");
          } else {
            displaySnackbarAlert("Model upgraded successfully.", "success");
          }

          requestAllBotRecords();
        } else {
          handleCloseDialog();
          setModelUpgradePending(false);
          displaySnackbarAlert(action?.payload?.message || "Something went wrong, Please try again!", "error");
        }
      })
  }

  const DisplayUploadedFile = () => {
    return (
        <Box style={{display: "flex", flexDirection: "row", alignItems: "center", columnGap: "5px"}}>
          <Alert icon={<InsertDriveFile fontSize={"inherit"}/>} severity="success">
            <Tooltip title={fileName}>
              <Typography style={{
                width: "300px",
                whiteSpace: "nowrap",
                overflowX: "hidden",
                textOverflow: "ellipsis"
              }}>{fileName}</Typography>
            </Tooltip>
          </Alert>
          <Delete onClick={removeUploadedFile} style={{cursor: "pointer", padding: 0, margin: 0, fontSize:"18px"}}
                                   fontSize={"inherit"} color={"error"}/>
        </Box>
    )
  }

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFile(null);
    setShowFile(false);
    setIsValidFormat(true);
  }

  const handleOpenDialog = () => {
    return (
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md">
        <Box sx={{p: 1, py: 1.5, mt:1}}>
          <DialogContent>
            <CompareModels/>
            <Stack flexDirection="row">
              <ListItem sx={{mt:1}}>
                <FileExcelOutlined/>
                <Link sx={{marginLeft: '5px'}} align="left"
                      href="https://skil-ai-cf.s3.amazonaws.com/sample/appgpt-model-ugprade-sample-test-queries-v0.xlsx"
                      target="_blank">
                  Download Sample Excel File
                </Link>
              </ListItem>
              <Stack width="100%" alignItems="center">
                <input
                  accept='.xls*'
                  name="excelFile"
                  type="file"
                  style={{display: 'none'}}
                  ref={inputRef}
                  onChange={(e) => handleFileUpload(e)}
                />
                <Stack width="95%" flexDirection="row" alignItems="center" justifyContent="space-between">
                  <Button
                    variant="outlined"
                    onClick={handleUploadClick}
                    sx={{width: "fit-content", mt:2, pointerEvents: modelUpgradePending ? "none" : "auto"}}
                  >
                    <MdOutlineUploadFile style={{fontSize: "20px"}}/>
                    Upload File
                  </Button>
                  <Typography sx={{mt:2}}>Note: Max file size limit is 5 MB</Typography>
                </Stack>
                <Grid item xs={12}>
                  {showFile && DisplayUploadedFile()}
                  {!isValidFormat && <Typography color="error" sx={{maxWidth: "400px"}}>Error: The file uploaded is not in the required format.
                    Please refer to the sample excel file to understand the required structure. </Typography>
                  }
                </Grid>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{justifyContent: "center", gap: "1rem", mt:"1rem"}}>
            <Button variant="outlined" sx={{fontSize: "16px", pointerEvents: modelUpgradePending ? "none" : "auto"}} onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button variant="contained" sx={{fontSize: "16px", pointerEvents: modelUpgradePending ? "none" : "auto"}} onClick={handleConfirmClick}>
              {modelUpgradePending ? <CircularProgress style={{width:"28px", height:"28px", color:"#fff"}}/>: "Confirm"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    );
  }

  const handleCompare = async (e, row) => {
    e.preventDefault();
    try {
      const currModel = row.original?.aiModel ? row.original.aiModel : "gpt-4o";
      const newModel = newModelVal?.botRecordIds?.[row?.original?.botRecordId];
      if(newModel === currModel){
        displaySnackbarAlert("Please select different model to compare","error");
        return;
      }
      const payload = JSON.stringify([currModel,newModel]);
      const compareResult = await dispatch(modelComparison(payload));
      if(compareResult?.payload?.status?.toLowerCase() === "success" && compareResult?.payload?.result?.length > 0){
        const metrics = compareResult?.payload?.result?.[0]?.metrics;
        const chartData = [];
        const  chartNames = [];
        let isChartNames = false;
        for (let data in metrics){
          if(data){
            let dataValues = [];
            for (let item in metrics[data]){
              dataValues.push(metrics[data][item]);
              if(!isChartNames){
                const capatilize = item
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                chartNames.push(capatilize);
              }
            }
            chartData.push({name:data,data:dataValues});
            isChartNames = true;
          }
        }
        setSelectedChartData(chartData);
        setSelectedModelNames(chartNames);
        setOpenModelCompareDialog(true);
      }else{
        displaySnackbarAlert("Model details not found, Please try again!", "error");
      }
    }catch (err){
      console.log(err);
    }
  };

  const handleSetColumnsData = () => {
    const columns = [
      {
        Header: () => null,
        id: 'expander',
        className: 'cell-center',
        Cell: CellExpander,
        SubCell: () => null
      },
      {
        Header: 'GPT Id',
        accessor: 'interpreterId',
        showFilterIcon: true,
        Cell: ({row, value}) => {
          return value;
        },
      },
      {
        Header: 'GPT Name',
        accessor: 'botName',
        showFilterIcon: true,

        Cell: ({row, value}) => {
          return (
            <div dangerouslySetInnerHTML={{__html: value}}/>
          );
        },
      },

      {
        Header: 'Version',
        accessor: 'versionNumber',
        showFilterIcon: true,

      },
      {
        Header: 'Old Model',
        accessor: 'oldModel',
        showFilterIcon: true,
        Cell: ({row, value}) => {
          return value ? value : 'NA'
        }
      },
      {
        Header: 'Current Model',
        accessor: 'aiModel',
        showFilterIcon: true,
        Cell: ({row, value}) => {
          return value ? value : "gpt-4o";
        }
      },
      {
        Header: 'New Model',
        accessor: "newModel",
        showFilterIcon: true,
        Cell: ({row, value}) => {
          return (
            <>
              <Select fullWidth sx={{minWidth: 200}}
                      value={newModelVal?.["botRecordIds"]?.[row.original.botRecordId] || ''} placeholder="New Model"
                      disabled={row?.original?.status?.toLowerCase() === "active" || row?.original?.status?.toLowerCase() === "published" ? false : true}
                      displayEmpty inputProps={{'aria-label': 'New Model'}}
                      onChange={(e) => handleChangeModelOptions(row, e)}>
                <MenuItem value="" disabled>
                  <Typography color={theme.palette.secondary[800]}>None</Typography>
                </MenuItem>
                {newModelOptions?.current?.map((item, i) =>
                  (item !== (row?.original?.aiModel || "gpt-4o") && <MenuItem key={i} value={item}>{item}</MenuItem>)
                )}
              </Select>
            </>
          )
        }
      },
      {
        Header: 'Status',
        accessor: 'status',
        Filter: SelectColumnFilter,
        filter: 'includes',
        Cell: ({row, value}) => {
          switch (value) {
            case 'Active':
              return <Chip color='success' label='Active' size='small' variant='light'/>
            case 'Published':
              return <Chip color='primary' label='Published' size='small' variant='light'/>
            case 'in-progress':
              return <Chip color="info" label="In-Progress" size="small" variant="light"/>;
            case 'queued':
              return <Chip label='Queued' size='small' variant='light' sx={{color: "#DD761C"}}/>;
            case 'Error':
              return <Chip color='error' label='Error' size='small' variant='light'/>;
            default:
            // return <Chip color='error' label='Error' size='small' variant='light'/>;
          }
        }
      },
      {
        Header: 'Actions',
        className: 'cell-left',
        disableSortBy: true,
        Cell: ({row}) => {
          return (
            <Stack direction='row' alignItems='flex-end' justifyContent='center' spacing={1} gap="8px">
              <Tooltip title={!newModelVal?.["botRecordIds"]?.[row.original.botRecordId] ? "Select new model to" +
                " compare" : "Compare"}>
                <IconButton variant="contained" aria-label="compare"
                        id={newModelVal?.["botRecordIds"]?.[row.original.botRecordId] ? "enable" : "disable"}
                        onClick={(e) => handleCompare(e, row)}
                        sx={{backgroundColor: newModelVal?.["botRecordIds"]?.[row.original.botRecordId] ? theme.palette.primary.main : theme.palette.secondary.light,boxShadow:"rgba(0, 0, 0, 0.2) 0px 4px 8px 0px"}}><MdOutlineDifference style={{width:"30px",height:"26px",color:"#fff"}}/>
                </IconButton>
              </Tooltip>
              <Tooltip title={row?.original?.upgradeCount >= 5 ? "You have reached your maximum limit of model" +
                " upgrades." : (!newModelVal?.["botRecordIds"]?.[row.original.botRecordId] ? "Select new model to" +
                " start" : "Start")}>
                <IconButton variant="contained"
                        id={newModelVal?.["botRecordIds"]?.[row.original.botRecordId] ? "enable" : "disable"}
                        disabled={row?.original?.status && row?.original?.status === 'Active' || row?.original?.status === "Published" ? false : true}
                        aria-label="start"
                        sx={{background: row?.original?.status && row?.original?.status === 'Active' || row?.original?.status === "Published" ? theme.palette.primary.main : theme.palette.secondary.light,boxShadow:"rgba(0, 0, 0, 0.2) 0px 4px 8px 0px"}}
                        onClick={(e) => handleOnstart(row, e)}><IoIosPlayCircle style={{width:"30px",height:"26px",color:"#fff"}}/>
                </IconButton>
              </Tooltip>

              <Tooltip title="Download">
                <IconButton variant="contained" aria-label="download"
                            disabled={row?.original?.modelUpgradeReportS3Info?.s3Url && (row?.original?.status && row?.original?.status === 'Active' || row?.original?.status === "Published") ? false : true}
                            id={row?.original?.modelUpgradeReportS3Info?.s3Url ? "enable" : "disable"} sx={{boxShadow:"rgba(0," +
                    " 0," +
                    " 0, 0.2)" +
                    " 0px 4px 8px" +
                    " 0px",background: row?.original?.status && row?.original?.status === 'Active' || row?.original?.status === "Published" ? theme.palette.primary.main : theme.palette.secondary.light}} onClick={(e) => handleDownloadClick(row, e)}>
                  < MdOutlineFileDownload style={{width:"30px",height:"26px",color:"#fff"}}/>
                </IconButton>
              </Tooltip>

            </Stack>
          );
        }
      }
    ]

    setColumnData([...columns])
  }

  useEffect(() => {
    if (triggerTableRender) {
      handleSetColumnsData();
      setTriggerTableRender(false)
    }
  }, [triggerTableRender])

  useEffect(() => {
    if (profile?.user) {
      const {user} = profile
      if (user?.appRoles?.length === 0) {
        navigate("/access-denied")
      }
    } else {
      dispatch(getUserInfo(userId))
    }
    handleSetColumnsData();
  }, [profile])

  const handleSearchBot = (event) => {
    setSkip(0)
    setSearchTerm(event.target.value);
  }

  useEffect(() => {
    dispatch(getAllModels("data")).then(action => {
      if(action?.payload?.status?.toLowerCase() === "success") {
        const fetchedModels = action?.payload?.result?.map(item => item.model); //converting array of objects to array of strings
        newModelOptions.current = fetchedModels
      }
    })
  },[])

  useEffect(() => {
    if (botRecords?.records) {
      if (botRecords?.records?.length > 0) {
        let allBotRecords = JSON.parse(JSON.stringify(botRecords?.records));
        let uniqueInterpreterIds = {};
        allBotRecords?.filter((record,index) => {
          if(record?.status?.toLowerCase() !== "error"){
            record["isValidRecord"] = true;
          }else if(record?.status?.toLowerCase() === "error" && record?.sourcePage?.toLowerCase() === "model-upgrade"){
            record["isValidRecord"] = true;
          }else{
            record["isValidRecord"] = false;
          }
        });
        let dbData = allBotRecords;
        let latestBots = [];
        let botRecordIds = {};
        dbData?.filter((item, i) => {
          if (item && item["interpreterId"] && item?.isValidRecord) {
            let prevStoredVersion = latestBots.find(bot => item.interpreterId === bot.interpreterId)?.versionNumber;
            let prevStoredIndex = latestBots.findIndex(bot => item.interpreterId === bot.interpreterId);
            if (!uniqueInterpreterIds[item["interpreterId"]] || isCurrentBotVersionGreater(item.versionNumber, prevStoredVersion)) {
              if (uniqueInterpreterIds[item["interpreterId"]] === 1) {
                latestBots.splice(prevStoredIndex, 1);
              }
              uniqueInterpreterIds[item["interpreterId"]] = 1;
              latestBots.push(item);
            }
          }
        });
        setData(latestBots);
        setSubData(dbData);
        setNewModelVal((prevValues) => ({
          ...prevValues,
          botRecordIds
        }));
      } else {
        setData([])
        setSubData([])
      }
    }
  }, [botRecords, dispatch]);

  const renderRowSubComponent = useCallback(({row, rowProps}) => {
    const selectedRow = row?.original?.interpreterId;
    let filteredData = [];
    subData.filter((record) => {
        if (record && record["interpreterId"] && record["interpreterId"] === selectedRow) {
          filteredData.push(record);
        }
      }
    );
    const updatedData = filteredData.map((item, index) => {
      if (item?.status?.toLowerCase() !== "error" && index === 0) {
        item.isLatest = true;
      } else if (index === 0 && item?.status?.toLowerCase() === "error") {
        for (let i = 1; i < filteredData.length; i++) {
          if (filteredData[i]?.status?.toLowerCase() !== "error") {
            filteredData[i].isLatest = true;
            break;
          }
        }
      }
      return item;
    });

    updatedData.sort((a, b) => compareBotVersions(b.versionNumber, a.versionNumber));
    return <SubRowAsync row={row} rowProps={rowProps} rowData={updatedData}/>;
  }, [subData]);

  const styles = makeStyles({
    input: {
      '&::placeholder': {
        color: "black",
        fontWeight: 700,
      }
    },
    searchBar: {
      position: "fixed",
      zIndex: 1111,
      background: "#ffff",
      width: drawerOpen ? `calc(100% - 260px)` : `calc(100% - 60px)`,
      '@media screen and (max-width : 1266px)': {
        width: "100% "
      }
    }
  })

  const customStyles = styles();

  const requestAllBotRecords = () => {
    userId = localStorage?.getItem("userId");
    const {user} = profile
    dispatch(fetchBotRecords({
      payload: {
        restrictPublished: "Y",
        clientId: CLIENT_ID,
        createdBy: localStorage.getItem("userId"),
        appRoles: localStorage.getItem("appRoles"),
      },
      params: {searchTerm: '', skip: 0, limit: limit}
    }));
  };

  const handleClearAllFilters = () => {
    if (searchTerm) {
      setSearchTerm("")
    }
    setClearAllFilters(true);
  }

  const getClearFilterConfirmation = (isCleared) => {
    if (isCleared) {
      setClearAllFilters(false);
    }
  }

  const getTableFilters = (filterData) => {
    let filterKeys = [];
    for (let key in filterData) {
      filterKeys.push(key)
    }
    if (filterKeys?.length > 0) {
      setShowClearFilter(true);
    } else {
      setShowClearFilter(false);
    }
  }

  return (
    <Grid container>
      <Grid item xs={12} paddingTop="0px !important" className={customStyles.searchBar}>
        <ThemeProvider theme={customTheme}>
          <Box sx={{
            background: theme.palette.primary.lighter,
            py: "15px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            <Typography variant="h5" fontWeight="500" sx={{paddingLeft: "10px"}}>Model Upgrade</Typography>
            <Stack flexDirection="row" gap="8px" marginRight="18px">
              <Button color='success' variant='contained' endIcon={<ClockCircleOutlined/>}
                      sx={{alignItems: "flex-start"}} onClick={(e) => {
                e.stopPropagation();
                requestAllBotRecords();
                dispatch(triggerNotification({isNotify: true}));
              }}>Refresh</Button>
            </Stack>
          </Box>
        </ThemeProvider>
        <FormControl fullWidth sx={{padding: "10px"}} variant={"outlined"}>
          <OutlinedInput
            id="outlined-adornment-amount"
            placeholder={"Search"}
            classes={{
              input: customStyles.input,
            }}
            onChange={handleSearchBot}
            value={searchTerm}
            sx={{ml: 0, paddingRight: "10px", width: "100%", background: "white"}}
            endAdornment={<InputAdornment position="end"><Search/></InputAdornment>}
          />
          <Box sx={{display: "flex", justifyContent: "space-between"}}>
            <FormHelperText sx={{width: "50%"}}>Type any keyword</FormHelperText>
            {(showClearFilter || searchTerm !== "") && <Button onClick={handleClearAllFilters}>Clear Filters</Button>}
          </Box>
        </FormControl>
      </Grid>
      <Grid item xs={12} sx={{marginTop: "150px"}}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <MainCard content={false} ref={containerRef}>
              <ScrollX>
                <ReactTable columns={columnsData} data={data} renderRowSubComponent={renderRowSubComponent}
                            clearFilter={clearAllFilters}
                            confirmAllFiltersCleared={getClearFilterConfirmation}
                            getTableFilters={getTableFilters}/>
                {botRecords.loading && (
                  <Grid item xs={12} sx={{
                    display: "flex",
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: "100%",
                    p: 2,
                    gap: 2
                  }}>
                    <Loader/><Typography variant={'h6'}>Loading items</Typography>
                  </Grid>
                )}
              </ScrollX>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>

      <Dialog open={openModelCompareDialog} onClose={() => setOpenModelCompareDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Model Comparison</DialogTitle>
        <DialogContent>
          <ModelCompareChart series={selectedChartData} models={selectedModelNames}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModelCompareDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {handleOpenDialog()}
    </Grid>
  );
};

export default ModelUpgrade;
