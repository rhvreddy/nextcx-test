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
  Tooltip,
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
  DialogActions
} from '@mui/material';
import {Button} from '@mui/material';
// project imports
import {CLIENT_ID, REACT_APP_APP_BACK_END_BASE_URL, REACT_APP_APP_S_CODE} from 'config';
import {useDispatch, useSelector} from 'react-redux';
import SearchIcon from '@mui/icons-material/Search';
import PropTypes from 'prop-types';
import MainCard from '../../../../components/MainCard';
import ScrollX from '../../../../components/ScrollX';
import {useExpanded, useFilters, useGlobalFilter, useTable} from 'react-table';
import {useTheme} from '@mui/material/styles';
import {CheckOutlined, CloseOutlined, DeleteTwoTone, EditTwoTone, EyeTwoTone} from '@ant-design/icons';
import IconButton from '../../../../components/@extended/IconButton';
import ButtonAppBar from './ButtonAppBar';
import axios from 'axios';
import BotInfoEditForm from './BotInfoEditForm/BotInfoEditForm';
import BotInfoViewForm from './BotInfoViewForm/BotInfoViewForm';
import {renderFilterTypes, GlobalFilter, DefaultColumnFilter, SelectColumnFilter} from 'utils/react-table';
import {useNavigate} from 'react-router-dom';
import ChatWidget from '../../../../pages/apps/chat-widget';
import {getUserInfo} from '../../../../store/reducers/profile';
import {fetchBotRecords} from '../../../../store/reducers/botRecords';
import {makeStyles} from "@mui/styles"
import {toast} from "react-toastify";

// import PropTypes from 'prop-types';
import {useCallback, Fragment} from 'react';

// material-ui
import {alpha} from '@mui/material/styles';
import {Box, Skeleton} from '@mui/material';


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
            background: theme.palette.secondary[200], "&:hover": {
              background: `${theme.palette.secondary.light} !important`
            }
          }}
        >
          {row.cells.map((cell, index) => (
            <TableCell key={index} {...cell.getCellProps([{className: cell.column.className}])}>
              {cell.render(cell.column.SubCell ? 'SubCell' : 'Cell', {
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

// third-party

// project import
import mockData from 'utils/mock-data';

// assets
import {DownOutlined, RightOutlined} from '@ant-design/icons';
import Loader from '../../../../components/Loader/Loader';
import {displayChatComponent, triggerNotification} from "../../../../store/reducers/chat";
import CircularProgress from "@mui/material/CircularProgress";
import {dispatch} from "../../../../store";
import Widget from "../../../../menu-items/widget";
import GPTWidget from "../../../../components/DynamicChatWidget/GPTWidget";
import { compareBotVersions, isCurrentBotVersionGreater } from '../../../../utils/reusable-functions';


// ==============================|| FORMS WIZARD - BASIC ||============================== //
function ReactTable({
                      columns: userColumns,
                      data,
                      renderRowSubComponent,
                      clearFilter,
                      confirmAllFiltersCleared,
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
    if (clearFilter) {
      setAllFilters([]);
      confirmAllFiltersCleared(true);
    }
  }, [clearFilter]);

  useEffect(() => {
    const updatedFilters = tableFilters.reduce((acc, {id, value}) => {
      acc[id] = value;
      return acc;
    }, {});
    getTableFilters(updatedFilters)
    setFilters(updatedFilters);
  }, [tableFilters]);


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
                    {column.canFilter ? column.render('Filter') : null}
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
                      {cell?.column?.id === 'Actions' || cell?.column?.id === "interpreterId" ?
                        <div ref={(el) => {
                          if (el) {
                            try {
                              const button = el.getElementsByClassName('MuiButtonBase-root');
                              if (button && row.isExpanded) {
                                for (let btn of button) {
                                  btn.style.pointerEvents = row.isExpanded ? "none" : "auto";
                                  btn.style.mixBlendMode = "soft-light";
                                }
                              } else if (button && !row.isExpanded) {
                                for (let btn of button) {
                                  btn.style.pointerEvents = row.original.status === "Active" || (row.original.status === "Published" && btn.ariaLabel !== "Edit") || row.original.status.toLowerCase() === "error" ? "auto" : "none";
                                  btn.style.mixBlendMode = "inherit";
                                }
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



function findDeleteFlagStatus(status, lastUpdate) {
  const currentTime = new Date().getTime();
  return status === 'in-progress' && currentTime - lastUpdate > 24 * 60 * 60 * 1000;
}

function readyForDelete(row) {
  //if status is not active and last update is using updatedAtUnixTime > 24 hours.. then mark this for delete and show status as error

  const status = row?.original?.status;
  const interpreterId = row?.original?.interpreterId;
  const lastUpdate = row?.original?.updatedAtUnixTime;

  let deleteFlag = findDeleteFlagStatus(status, lastUpdate);
  if (!interpreterId) {
    deleteFlag = true;
  }
  if (deleteFlag) {
    row.status = 'error';
  }
  return deleteFlag;
}

function getProperInProgressState(row, value) {
  const status = row?.original?.status;
  const lastUpdate = row?.original?.updatedAtUnixTime;

  const deleteFlag = findDeleteFlagStatus(status, lastUpdate);

  if (deleteFlag) {
    updateBotErrorStatus(row)
    return <Chip color="error" label="Error" size="small" variant="light"/>;
  }
  return <Chip color="info" label="In-Progress" size="small" variant="light"/>;
}

const updateBotErrorStatus = (row) => {
  let botRecId = {
    botRecordId: row?.original?.botRecordId
  };
  botRecId['status'] = 'Error';
  JSON.stringify(botRecId);
  const config = {
    method: 'post',
    url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/update-bot-status-by-record-id`,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: botRecId
  };
  axios(config)
    .then((res) => {
      if (res?.status === 200 && res?.data?.status === 'Success') {
        dispatch(triggerNotification({isNotify: true}))
        dispatch(fetchBotRecords({
          payload: {
            clientId: CLIENT_ID,
            createdBy: localStorage.getItem("userId"),
            appRoles: localStorage.getItem("appRoles"),
          },
          params: {searchTerm: '', skip: 0, limit: 50}
        }));
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

function checkDeleteStatus(row) {
  if (row?.original?.status) {
    return row?.original?.status && row?.original?.status !== 'Inactive';
  } else {
    return true;
  }
}

const BotCreateWizard = () => {
  const LIMIT = 50
  const theme = useTheme();
  const menu = useSelector((state) => state.menu)
  const widgetState = useSelector((state) => state.chat)
  const {drawerOpen} = menu;
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [add, setAdd] = useState(false);
  const [columnsData, setColumnData] = useState([]);
  const [clearAllFilters, setClearAllFilters] = useState(false);
  const [showClearFilter, setShowClearFilter] = useState(false);
  const [view, setView] = useState(false);
  const [data, setData] = useState([]);
  const [subData, setSubData] = useState([])
  const [interpreterId, setInterpreterId] = useState('');
  const [version, setVersion] = useState('');
  const [recordId, setRecordId] = useState('');
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCellData, setSelectedCellData] = useState();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const deleteInfo = useRef({botInfo: "", description: "Are you sure you want to delete the GPT"});
  const userDetails = useRef({});
  let userId = localStorage.getItem('userId');
  const [limit, setLimit] = useState(LIMIT)
  const [skip, setSkip] = useState(0)
  const [isCreateBotScreenOpen, setIsCreateBotScreenOpen] = useState(false);
  const containerRef = useRef(null);
  const publishStatus = useRef("");

  const profile = useSelector(state => state.profile)
  const botRecords = useSelector(state => state.botRecords)

  const debouncedSearchQuery = useMemo(() => _.debounce((value) => {
    dispatch(fetchBotRecords({
      payload: {
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

  const handleGetRequestStatus = (message, status) => {
    switch (status) {
      case "success":
        return toast.success(message);
        break;
      case "error" :
        return toast.error(message);
        break;
    }
  }

  const handleCloseDeleteDialog = () => {
    setIsDisable(false);
    setOpenDeleteDialog(false);
    deleteInfo.current = {botInfo: "", ...deleteInfo.current}
  }

  const handleGetConfirmation = (id) => {
    if (id === "yes") {
      setIsDisable(true);
      deleteBotRecord(deleteInfo.current.botInfo)
    } else {
      handleCloseDeleteDialog();
    }
  }

  const displayDeleteDialog = () => {
    return (
      <Dialog open={openDeleteDialog} aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description">
        <Box>
          <DialogTitle id="alert-dialog-title" sx={{fontSize: "18px"}}>Confirm Deletion</DialogTitle>
          <Divider/>
          <DialogContent>
            <DialogContentText sx={{textAlign: "center", fontSize: "16px"}} id="alert-dialog-description">
              {deleteInfo.current.description}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{justifyContent: "center", gap: "1rem", paddingBottom: "1rem"}}>
            <Button variant="outlined" autoFocus
                    sx={{fontSize: "16px", pointerEvents: isDisable ? "none" : "normal", lineHeight: 1}}
                    onClick={() => handleGetConfirmation("no")}>No</Button>
            <Button variant="contained" autoFocus
                    sx={{fontSize: "16px", pointerEvents: isDisable ? "none" : "normal", lineHeight: 1}}
                    onClick={() => handleGetConfirmation("yes")}>{isDisable ?
              <CircularProgress style={{width: "20px", height: "19px", color: "#ffff"}}/> : "Yes"}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    )
  }

  useEffect(() => {
    if (profile?.user) {
      const {user} = profile
      if (user?.appRoles?.length === 0) {
        navigate("/access-denied")
      }
    } else {
      dispatch(getUserInfo(userId))
    }
    dispatch(displayChatComponent(false));
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
          // add onClick property to the cell to toggle the visibility of the "Bot Record Id" column
          const toggleShow = () => {
            const data = columns.filter(each => each)
            // update the input element's value
            const selectedCellInfo = {}
            selectedCellInfo.botRecordId = row?.original?.botRecordId,
              selectedCellInfo.botId = row?.original?.interpreterId,
              selectedCellInfo.version = row?.original?.version
            setSelectedCellData(selectedCellInfo)
            dispatch(displayChatComponent(true))
            setColumnData([...data])
            document.documentElement.scrollTop = 0;
          }
          return (
            <Button
              sx={(row?.original?.status?.toLowerCase() === "active" || row?.original?.status === "Published") ? {color: theme.palette.primary.main} : {color: theme.palette.secondary.dark}}
              onClick={(e) => {
                e.preventDefault();
                if (row?.original?.status?.toLowerCase() === "active" || row?.original?.status === "Published") {
                  toggleShow();
                }
              }}>
              {value}
            </Button>
          );
        },
      },
      {
        Header: 'GPT Record Id',
        accessor: 'botRecordId',
        show: false,
        showFilterIcon: true
      },
      {
        Header: 'Type of GPT',
        accessor: 'botUseCase',
        show: false,
        showFilterIcon: true
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
        Header: 'Created At',
        accessor: 'createdAt',
        showFilterIcon: true,
        Cell: ({row, value}) => {
          const newValue = value && typeof (value) === "object" && value?.["$date"] ? value?.["$date"] : value;
          const date = new Date(newValue)
          return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear()
        }

      },
      {
        Header: 'Created By',
        accessor: 'userName',
        showFilterIcon: true,
        Cell: ({row, value}) => {
          return <div
            style={{width: '100%'}}>{value ? <div style={{display: 'flex', alignItems: 'center'}}>{value}</div> :
            <div style={{width: "100%", display: 'flex', alignItems: 'center', justifyContent: "center"}}>
              <div style={{width: '20px', borderTop: '1px solid black', height: '0px'}}></div>
            </div>}</div>;
        }
      },
      {
        Header: 'Status',
        accessor: 'status',
        Filter: SelectColumnFilter,
        filter: 'includes',

        Cell: ({row, value}) => {
          switch (value) {
            case 'Inactive':
              return <Chip color='warning' label='In-active' size='small' variant='light'/>;
            case 'Active':
              return (
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Chip color='success' label='Active' size='small' variant='light'/>
                </div>
              );
            case 'in-progress':
              return getProperInProgressState(row, value);
            case 'queued':
              return <Chip label='Queued' size='small' variant='light' sx={{color: "#DD761C"}}/>;
            case 'Error':
              return <Chip color='error' label='Error' size='small' variant='light'/>;
            case 'Published':
              return <Chip color='primary' label='Published' size='small' variant='light'/>
            default:
            // return <Chip color='error' label='Error' size='small' variant='light'/>;
          }
        }
      },
      {
        Header: 'Actions',
        className: 'cell-left',
        disableSortBy: true,

        // eslint-disable-next-line
        Cell: ({row}) => {
          // eslint-disable-next-line
          const {values, isExpanded, toggleRowExpanded} = row;
          const collapseIcon = isExpanded ? (
            <CloseOutlined style={{color: theme.palette.error.main}}/>
          ) : (
            <EyeTwoTone twoToneColor={theme.palette.secondary.main}/>
          );
          return (
            <Stack direction='row' alignItems='flex-end' justifyContent='center' spacing={1}>
              {row?.original?.status && row?.original?.status?.toLowerCase() !== 'inactive' && row?.original?.status?.toLowerCase() !== 'error' &&
                <Tooltip title='View'>
                  <IconButton
                    color='primary'
                    sx={{pointerEvents: row?.original?.status && row?.original?.status === 'Active' || row?.original?.status === "Published" ? '' : 'none'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(row);
                    }}
                  >
                    <EyeTwoTone
                      twoToneColor={row?.original?.status && (row?.original?.status !== 'in-progress' && row?.original?.status !== 'queued') ? theme.palette.primary.main : theme.palette.secondary[400]}/>
                  </IconButton>
                </Tooltip>}
              {row?.original?.status && row?.original?.status?.toLowerCase() !== 'error' &&
                <Tooltip title='Edit'>
                  <IconButton
                    sx={{pointerEvents: (row?.original?.status && (row?.original?.status !== 'in-progress' && row?.original?.status !== 'queued')) && (row?.original?.publishStatus !== "Y") ? '' : 'none'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(row);
                    }}
                  >
                    <EditTwoTone
                      twoToneColor={(row?.original?.status && (row?.original?.status !== 'in-progress' && row?.original?.status !== 'queued')) && (row?.original?.publishStatus !== 'Y') ? theme.palette.primary.main : theme.palette.secondary[400]}/>
                  </IconButton>
                </Tooltip>
              }

              {row.original.status && checkDeleteStatus(row) &&
                <Tooltip title='Delete'>
                  <IconButton
                    color='primary'
                    sx={{pointerEvents: readyForDelete(row) || row?.original?.status === "Active" || row?.original?.status === "Published" || row?.original?.status?.toLowerCase() === "error" ? '' : 'none'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteInfo.current.botInfo = row;
                      setOpenDeleteDialog(true);
                    }}
                  >
                    <DeleteTwoTone
                      twoToneColor={(readyForDelete(row) || row?.original?.status === "Active" || row?.original?.status === "Published" || row?.original?.status?.toLowerCase() === "error") ? theme.palette.primary.main : theme.palette.secondary[400]}/>
                  </IconButton>
                </Tooltip>}
            </Stack>
          );
        }
      }
    ]

    setColumnData([...columns])

  }, [profile])

  const handleAdd = (row) => {
    if (row?.original?.interpreterId && row?.original?.interpreterId !== '') {
      setInterpreterId(row.original.interpreterId);
      setRecordId(row.original.botRecordId);
    }
    setAdd(!add);
  };

  const handleView = (row) => {
    if (row?.original?.interpreterId && row?.original?.interpreterId !== '') {
      setInterpreterId(row?.original.interpreterId);
    }
    if (row?.original?.versionNumber && row?.original?.versionNumber !== '') {
      setVersion(row?.original?.versionNumber);
    }
    if (row?.original?.publishStatus && row?.original?.publishStatus !== '') {
      publishStatus.current = row?.original?.publishStatus
    }
    setView(!view);
  };

  const requestAllBotRecords = () => {
    userId = localStorage?.getItem("userId");
    const {user} = profile
    dispatch(fetchBotRecords({
      payload: {
        clientId: CLIENT_ID,
        createdBy: localStorage.getItem("userId"),
        appRoles: localStorage.getItem("appRoles"),
      },
      params: {searchTerm: '', skip: 0, limit: limit}
    }));
  };

  const deleteBotRecord = (row) => {
    let botRecId = {
      botRecordId: row?.original?.botRecordId,
      userId: localStorage.getItem("userId"),
      firstName: profile?.user?.firstName,
      lastName: profile?.user?.lastName,
    };
    botRecId['status'] = 'Delete';
    JSON.stringify(botRecId);
    const config = {
      method: 'post',
      url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/update-bot-status-by-record-id`,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: botRecId
    };
    axios(config)
      .then((res) => {
        if (res?.status === 200 && res?.data?.status?.toLowerCase() === 'success') {
          handleCloseDeleteDialog();
          dispatch(triggerNotification({isNotify: true}))
          requestAllBotRecords();
          handleGetRequestStatus("GPT Deleted Successfully", "success");
        } else {
          handleGetRequestStatus("Error while deleting the GPT", "error");
          handleCloseDeleteDialog();
        }
      })
      .catch((err) => {
        handleGetRequestStatus("Error while deleting the GPT", "error");
        console.log(err);
        handleCloseDeleteDialog();
      });
  };

  const handleSearchBot = (event) => {
    setSkip(0)
    setSearchTerm(event.target.value);
  }

  useEffect(() => {
    if (botRecords?.records) {
      if (botRecords?.records?.length > 0) {
        let uniqueInterpreterIds = {};
        let dbData = botRecords?.records;
        let latestBots = [];
        dbData?.filter((item, i) => {
          if (item && item["interpreterId"]) {
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
      } else {
        setData([])
        setSubData([])
      }
    }
  }, [botRecords, dispatch])

  const renderRowSubComponent = useCallback(({row, rowProps}) => {
    const selectedRow = row?.original?.interpreterId;
    let filteredData = []
    subData.filter((record) => {
        if (record && record["interpreterId"] && record["interpreterId"] === selectedRow) {
          filteredData.push(record)
        }
      }
    )
    filteredData.sort((a, b) => compareBotVersions(b.versionNumber, a.versionNumber))
    return <SubRowAsync row={row} rowProps={rowProps} rowData={filteredData}/>;
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
      marginTop: "88px",
      background: "#ffff",
      width: drawerOpen ? `calc(100% - 235px)` : `calc(100% - 35px)`,
      '@media screen and (max-width : 1266px)': {
        width: "100% ",
        marginLeft: "24px"
      },
      '@media screen and (max-width : 600px)': {
        marginTop: "80px",
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

  const handleOpenCreateBotScreen = (isOpen) => {
    setIsCreateBotScreenOpen(isOpen);
  }

  return (
    <Grid container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ButtonAppBar requestResponse={requestAllBotRecords} handleOpenCreateBotScreen={handleOpenCreateBotScreen}
                        context={inputRef}/>
        </Grid>
        {!isCreateBotScreenOpen && <> <Grid item xs={12} className={customStyles.searchBar}>
          <FormControl fullWidth sx={{padding: "0px 10px"}} variant={"outlined"}>
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
          <Grid item xs={12} sx={{marginTop: "128px"}}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <MainCard content={false} ref={containerRef}>
                  <ScrollX>
                    <ReactTable columns={columnsData} data={data} renderRowSubComponent={renderRowSubComponent}
                                clearFilter={clearAllFilters} confirmAllFiltersCleared={getClearFilterConfirmation}
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
              { widgetState?.openChatWindow &&
                <Box sx={{position:"fixed",right:10,bottom:4,zIndex:9999,boxShadow:"1px 7px 29px -1px #a29d9d",borderRadius:"10px"}}>
                  <GPTWidget selectedCellData={selectedCellData}/>
                </Box>
              }
            </Grid>
          </Grid></>}

        <Dialog maxWidth="sm" fullWidth open={add} sx={{'& .MuiDialog-paper': {p: 0}}}>
          {add && (
            <BotInfoEditForm botId={interpreterId} onCancel={handleAdd} requestResponse={requestAllBotRecords}
                             botRecId={recordId} getRequestStatus={handleGetRequestStatus}/>
          )}
        </Dialog>
        <Dialog maxWidth="lg" fullWidth onClose={handleView} open={view} sx={{'& .MuiDialog-paper': {p: 0}}}>
          {view && <BotInfoViewForm botId={interpreterId} version={version} publishStatus={publishStatus.current} onCancel={handleView}/>}
        </Dialog>
      </Grid>
      {displayDeleteDialog()}
    </Grid>
  );
};

export default BotCreateWizard;
