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
  DialogActions, Box, TextField, Link, Skeleton,Tooltip
} from '@mui/material';
import {Button} from '@mui/material';
// project imports
import {CLIENT_ID, REACT_APP_APP_BACK_END_BASE_URL, REACT_APP_APP_S_CODE} from 'config';
import {useDispatch, useSelector} from 'react-redux';
import SearchIcon from '@mui/icons-material/Search';
import PropTypes from 'prop-types';
import MainCard from '../../components/MainCard';
import ScrollX from '../../components/ScrollX';
import {useExpanded, useFilters, useGlobalFilter, useTable} from 'react-table';
import {createTheme, ThemeProvider, useTheme} from '@mui/material/styles';
import {CheckOutlined, ClockCircleOutlined, DownOutlined, RightOutlined} from '@ant-design/icons';
import {renderFilterTypes, GlobalFilter, DefaultColumnFilter, SelectColumnFilter} from 'utils/react-table';
import {useNavigate} from 'react-router-dom';
import {getUserInfo} from '../../store/reducers/profile';
import {makeStyles} from "@mui/styles"

// import PropTypes from 'prop-types';
import {useCallback, Fragment} from 'react';
// material-ui
import Loader from '../../components/Loader/Loader';
import {
  addMultiAgentRequest,
  fetchAIAppsDocument,
  fetchBotRecords
} from '../../store/reducers/botRecords';
import {MULTI_AGENT_CONFIG} from '../../demo_config';
import LinearProgress from '@mui/material/LinearProgress';
import {toast} from "react-toastify";
import {triggerNotification} from "../../store/reducers/chat";
import mockData from "../../utils/mock-data";
import { compareBotVersions, isCurrentBotVersionGreater } from '../../utils/reusable-functions';


// ==============================|| FORMS WIZARD - BASIC ||============================== //

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
              {cell?.column?.id === 'Actions' ?
                <div ref={(el) => {
                  if (el) {
                    try {
                      const button = el.querySelector('button');
                      if (button) {
                       if(data[i]?.isLatest) {
                         button.disabled = (data[i]?.status === 'Active' || data[i]?.status === "Published") ? false : true;
                         button.style.background = (data[i]?.status === 'Active' || data[i]?.status === "Published") ? theme.palette.primary.main : theme.palette.secondary.light ;
                         button.style.color= theme.palette.primary.contrastText
                       }else{
                         button.disabled = true;
                         button.style.background = theme.palette.secondary.light;
                         button.style.color= theme.palette.primary.contrastText
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
            <>
              <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => (
                  <TableCell key={index} {...column.getHeaderProps([{className: column.className}])}>
                    {column.render('Header')}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={`filter-${i}`}>
                {headerGroup.headers.map((column, index) => (
                  <TableCell key={index}>
                    {column.canFilter && column.id !== "newModel" ? column.render('Filter') : null}
                  </TableCell>
                ))}
              </TableRow>
            </>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            const rowProps = row.getRowProps();
            return (
              <Fragment key={i}>
                <TableRow {...row.getRowProps()} sx={{
                  background: row.isExpanded ? theme.palette.primary[200] : "inherit", "&:hover": {
                    background: row.isExpanded ? `${theme.palette.primary.light} !important` : "inherit"
                  }
                }}>
                  {row.cells.map((cell, index) => (
                    <TableCell key={index} {...cell.getCellProps([{className: cell.column.className}])}>
                      {cell?.column?.id === 'Actions' ?
                        <div ref={(el) => {
                          if (el) {
                            try {
                              const button = el.querySelector('button');
                              if (button && row.isExpanded) {
                                button.disabled = row.isExpanded ? true : false;
                                button.style.mixBlendMode = "soft-light";
                                button.style.color= theme.palette.primary.contrastText
                              } else if (button && !row.isExpanded) {
                                button.disabled = (row?.original?.status === 'Active' || row?.original?.status === "Published") ? false : true;
                                button.style.mixBlendMode = "inherit";
                                button.style.background = (row?.original?.status === 'Active' || row?.original?.status === "Published") ? theme.palette.primary.main : theme.palette.secondary.light;
                                button.style.color= theme.palette.primary.contrastText
                              }
                            } catch (e) {
                            }
                          }
                        }}>{cell.render('Cell')}</div> : cell.render('Cell')}
                    </TableCell>
                  ))}
                </TableRow>
                {row.isExpanded && renderRowSubComponent({row, rowProps, visibleColumns})}
              </Fragment>
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

const MultiAgent = () => {
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
  const [newModelOptions, setNewModelOptions] = useState(["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo", "Llama3.1", "Llama2", "Claude 3.5 Sonnet", "Mixtral-7b", "Mistral-Large-Instruct-2407", "codellama:7b", "codellama:34b", "codellama:70b"]);
  const [newModelVal, setNewModelVal] = useState({})
  const [triggerTableRender, setTriggerTableRender] = useState(false);
  const [searchTerm, setSearchTerm] = useState('')
  const userDetails = useRef({});
  let userId = localStorage.getItem('userId');
  const [limit, setLimit] = useState(LIMIT)
  const [skip, setSkip] = useState(0)
  const containerRef = useRef(null);
  const [showGenericDialog, setShowGenericDialog] = useState(false);
  const [multiAgentDialogState, setMultiAgentDialogState] = useState(false);
  const [selectedBotInfo, setSelectedBotInfo] = useState({});
  const sampleBotWorkFlows = useRef({});
  const [currentBotSampleWorkflow, setCurrentBotSampleWorkflow] = useState({});
  const [isUpdating,setIsUpdating] = useState(false);

  const profile = useSelector(state => state.profile)
  const botRecords = useSelector(state => state.botRecords)

  const fetchAllSampleBotWorkflows = ()=>{
    dispatch(fetchAIAppsDocument({documentName:"sampleBotWorkflows", userId:localStorage.getItem("userId") || ""}))
      .then((action) => {
        if (action?.error) {
          toast.error(action?.payload?.message);
        } else {
          sampleBotWorkFlows.current =  action?.payload?.result?.sampleBotWorkflows?.sampleBotWorkflows || {}
        }
      })
      .catch((err) => {
        toast.error(err?.message);
      })
  }

  const debouncedSearchQuery = useMemo(() => _.debounce((value) => {
    dispatch(fetchBotRecords({
      payload: {
        restrictBotUseCase: "basic",
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

  useEffect(()=>{
    fetchAllSampleBotWorkflows()
  },[])

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


  const requestAllBotRecords = () => {
    userId = localStorage?.getItem("userId");
    const {user} = profile
    dispatch(fetchBotRecords({
      payload: {
        restrictBotUseCase: "basic",
        restrictPublished: "Y",
        clientId: CLIENT_ID,
        createdBy: localStorage.getItem("userId"),
        appRoles: localStorage.getItem("appRoles"),
      },
      params: {searchTerm: '', skip: 0, limit: limit}
    }));
  };

  const handleOnstart = (row, e) => {
    let selectedCellInfo = {
      userId: localStorage.getItem("userId")
    };
    const userData = profile?.user ? profile?.user : {};
    if (row?.original && row?.original?.botRecordId) {
      selectedCellInfo["botInfo"] = row?.original;
      selectedCellInfo['botRecordId'] = row?.original?.botRecordId;
      selectedCellInfo['sourcePage'] = "multi-agent";
      selectedCellInfo["userName"] = userData?.firstName + " " + userData?.lastName
    }
    if(sampleBotWorkFlows?.current[row?.original?.botUseCase]) {
      setCurrentBotSampleWorkflow(sampleBotWorkFlows?.current[row?.original?.botUseCase])
    }
    else{
      setCurrentBotSampleWorkflow(sampleBotWorkFlows?.current["default_workflow"] || {})
    }
    setSelectedBotInfo(selectedCellInfo);
    let modelVal = newModelVal?.botRecordIds?.[row?.original?.botRecordId];
    setMultiAgentDialogState(true)
    setShowGenericDialog(true);
  }

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
        Header: 'Current Model',
        accessor: 'aiModel',
        showFilterIcon: true,
        Cell: ({row, value}) => {
          return value ? value : "gpt-4o";
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
            case "in-progress":
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
            <Stack direction='row' alignItems='flex-end' justifyContent='center' spacing={1}>
              <Button variant="contained" disabled={row?.original?.status && row?.original?.status === 'Active' || row?.original?.status === "Published" ? false : true} sx={{background: row?.original?.status && row?.original?.status === 'Active' || row?.original?.status === "Published" ? theme.palette.primary.main : theme.palette.secondary.light,whiteSpace: "nowrap"}} onClick={(e) => handleOnstart(row, e)}>Define
                workflow</Button>
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
    if (botRecords?.records) {
      if (botRecords?.records?.length > 0) {
        let allBotRecords = JSON.parse(JSON.stringify(botRecords?.records));
        let uniqueInterpreterIds = {};
        allBotRecords?.filter((record,index) => {
          if(record?.status?.toLowerCase() !== "error"){
            record["isValidRecord"] = true;
          }else if(record?.status?.toLowerCase() === "error" && record?.sourcePage?.toLowerCase() === "multi-agent"){
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
    )
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

  const downloadSampleWorkflow = () => {
    const jsonString = JSON.stringify(currentBotSampleWorkflow, null, 2);

    const blob = new Blob([jsonString], {type: "application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_workflow.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const MultiAgentActionDialog = () => {
    const [inputData, setInputData] = useState("")
    const [isErrorCase, setIsErrorCase] = useState(false);
    const handleClose = () => {
      setIsErrorCase(false)
      setMultiAgentDialogState(false);
    }

    const handleSubmit = () => {
      if (inputData) {
        setIsErrorCase(false);
        setIsUpdating(true)
        dispatch(addMultiAgentRequest({...selectedBotInfo, workflow: inputData}))
          .then((action) => {
            if (action?.error) {
              toast.error(action?.payload?.message);
            } else {
              toast.success("Workflow successfully defined. Now you can proceed with the next steps");
              requestAllBotRecords();
            }
          })
          .catch((err) => {
            toast.error(err?.message);
          }).finally(() => {
          setIsUpdating(false);
          setMultiAgentDialogState(false);
        })
      } else {
        setIsErrorCase(true)
      }
    }
    return (
      <>
        <Dialog maxWidth style={{padding: "5px 10px"}} open={multiAgentDialogState}>
          {isUpdating && <LinearProgress style={{width: "100%"}}/>}
          <DialogTitle id="alert-dialog-title">
            <h2 style={{margin: 0, padding: 0}}>Define workflow</h2>
          </DialogTitle>
          <DialogContent style={{padding: "10px 25px", width: "80vw"}}>
            <Typography style={{textDecoration: "underline", cursor: "pointer", color: theme.palette.primary.main}}
                        onClick={downloadSampleWorkflow}>Download sample workflow</Typography>
            <TextField style={{marginTop: "10px"}} error={isErrorCase}
                       placeholder={JSON.stringify(currentBotSampleWorkflow, null, 2)}
                       fullWidth
                       multiline rows={10}
                       onChange={(e) => {
                         const input = e.target.value;
                         try {
                           const parsedData = JSON.parse(input);
                           const formattedData = JSON.stringify(parsedData);
                           setInputData(formattedData);
                         } catch (err) {
                           setInputData(input);
                         }
                       }}
                       label=''/>
            {isErrorCase && <p style={{color: "red", fontSize: "15px"}}>configuration must be required</p>}
          </DialogContent>
          <DialogActions sx={{gap:"2rem",margin:"1rem"}}>
            <Button variant="outlined" onClick={handleClose} disabled={isUpdating}>Cancel</Button>
            <Button variant="contained" autoFocus disabled={isUpdating} onClick={handleSubmit}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }

  return (
    <Grid container>
      {MultiAgentActionDialog()}
      {/*<Grid container spacing={3}>*/}
      <Grid item xs={12} paddingTop="0px !important" className={customStyles.searchBar}>
        <ThemeProvider theme={customTheme}>
          <Box sx={{
            background: theme.palette.primary.lighter,
            py: "15px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            <Typography variant="h5" fontWeight="500" sx={{paddingLeft: "10px"}}>Multi Agent</Typography>
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
            endAdornment={<InputAdornment position="end"><SearchIcon/></InputAdornment>}
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
      {/*</Grid>*/}
    </Grid>
  );
};

export default MultiAgent;
