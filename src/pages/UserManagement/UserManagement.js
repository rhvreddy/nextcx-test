import React, {useState, Fragment, useEffect, useMemo, useRef, useCallback} from 'react';
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {
    Grid,
    Typography,
    Box,
    Button,
    Stack,
    Dialog,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    OutlinedInput,
    InputAdornment,
    FormHelperText,
    FormControl,
    Tooltip,
    DialogTitle,
    Divider, DialogContent, DialogContentText, DialogActions, Skeleton, Select, MenuItem
} from "@mui/material";
import UserDetailsForm from "../../components/ManagementForm/UserDetailsForm";
import {dispatch} from "../../store";
import {makeStyles, useTheme} from "@mui/styles";
import {useDispatch, useSelector} from "react-redux";
import {toast, ToastContainer} from "react-toastify";
import {PersonAddAlt} from "@mui/icons-material";
import {MdDomainAdd, MdOutlineSupervisorAccount} from "react-icons/md";
import {DefaultColumnFilter, renderFilterTypes} from "../../utils/react-table";
import {useExpanded, useFilters, useGlobalFilter, useTable} from "react-table";
import PropTypes from "prop-types";
import MainCard from "../../components/MainCard";
import ScrollX from "../../components/ScrollX";
import Loader from "../../components/Loader/Loader";
import {getUserInfo, updateProfileInfo} from "../../store/reducers/profile";
import {useNavigate} from "react-router-dom";
import {fetchAllAdminsInBusiness, fetchAllBusinessIds, fetchUserRecords} from "../../store/reducers/userRecords";
import SearchIcon from "@mui/icons-material/Search";
import {
    fetchBotRecords,
    generateBusinessId,
    validateProfileCreationForm, validateSuperAdminCreation
} from "../../store/reducers/botRecords";
import {
    ClockCircleOutlined,
    CloseOutlined,
    DeleteTwoTone, DownOutlined,
    EditTwoTone,
    EyeTwoTone,
    RightOutlined
} from "@ant-design/icons";
import IconButton from "../../components/@extended/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import {appRoles, REACT_APP_APP_BACK_END_BASE_URL} from "../../config";
import axios from "axios";

import UserDetailsUpdateForm from "../../components/ManagementForm/UserDetailsUpdateForm";
import {triggerNotification} from "../../store/reducers/chat";
import mockData from "../../utils/mock-data";
import BizIdGenerationForm from "../../components/ManagementForm/CreateBizIdForm";

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

const CellExpander = ({row}) => {
    const theme = useTheme();
    const collapseIcon = row.isExpanded ? <DownOutlined style={{color: theme.palette.primary.main}}/> :
        <RightOutlined/>;
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
                                        {column.canFilter && column.id !== "newModel" && column.id !== "status" ? column.render('Filter') : null}
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
                            <React.Fragment key={`row-${i}`}>
                                <TableRow {...row.getRowProps()} sx={{
                                    background: row.isExpanded ? theme.palette.primary[200] : "inherit", "&:hover": {
                                        background: row.isExpanded ? `${theme.palette.primary.light} !important` : "inherit"
                                    }
                                }}>
                                    {row.cells.map((cell, index) => (
                                        <TableCell
                                            key={index} {...cell.getCellProps([{className: cell.column.className}])}>
                                            {cell.render('Cell')}
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

const UserManagement = () => {
    const LIMIT = 50;
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const profile = useSelector(state => state.profile);
    const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
    const [openUpdateUserDialog, setOpenUpdateUserDialog] = useState(false);
    const [openCreateBizIdDialog, setOpenCreateBizIdDialog] = useState(false);
    const containerRef = useRef(null);
    const [formSubmittedStatus, setFormSubmittedStatus] = useState({isSubmit: false, message: ""});
    const [bizIdGenerateStatus, setBizIdGenerateStatus] = useState({isGenerated: false, message: ""});
    const [triggerTableRender, setTriggerTableRender] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [columnsData, setColumnData] = useState([]);
    const [data, setData] = useState([]);
    const [subData, setSubData] = useState([]);
    const [clearAllFilters, setClearAllFilters] = useState(false);
    const [showClearFilter, setShowClearFilter] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [isDisable, setIsDisable] = useState(false);
    const [customFormTitle, setCustomFormTitle] = useState("");
    const deleteInfo = useRef({userInfo: "", description: "Are you sure you want to delete the user"});
    const userInitialInfo = useRef(null);
    let userId = localStorage.getItem('userId');
    const [limit, setLimit] = useState(LIMIT);
    const [skip, setSkip] = useState(0);
    const menu = useSelector((state) => state.menu);
    const userRecords = useSelector(state => state.userRecords);
    const {drawerOpen} = menu;
    const [profileType, setProfileType] = useState("");
    const [businessMenu, setBusinessMenu] = useState([]);
    const [adminRecords, setAdminRecords] = useState([]);
    const [superAdminRecords, setSuperAdminRecords] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState({});
    const [error, setError] = useState(false)
    const [deleteProfileType, setDeleteProfileType] = useState("");
    const [selectedSuperAdmin, setSelectedSuperAdmin] = useState("");

    const styles = makeStyles({
        header: {
            position: "fixed",
            zIndex: 1111,
            background: "#fff",
            width: drawerOpen ? `calc(100% - 260px)` : `calc(100% - 60px)`,
            '@media screen and (max-width : 1266px)': {
                width: "100% "
            },
        }
    });

    const customStyles = styles();

    const handleGetUpdatedUserDetails = async (data) => {
        const payload = {
            email: data?.emailId,
            firstName: data?.firstName,
            lastName: data?.lastName,
            company: data?.companyName
        }
        let updateInfo = {
            info: payload,
            userId: userInitialInfo.current?.userId
        };
        const formData = new FormData()
        formData.append("emailUpdate", "N")
        formData.append("phoneUpdate", "N")
        formData.append("updateInfo", JSON.stringify(updateInfo))
        formData.append("isNotParsed", "Y")
        try {
            const response = await dispatch(updateProfileInfo(formData));
            if (response?.payload?.status?.toLowerCase() === "success") {
                displaySnackbarAlert("User Details Successfully Updated", "success")
                requestAllUserRecords(selectedSuperAdmin?.userId, selectedSuperAdmin?.businessId);
                handleAddUpdateUserDialog();
            } else {
                displaySnackbarAlert(response?.payload?.result?.updationResults?.message ? response?.payload?.result?.updationResults?.message : 'Error occurred please try again later', "error")
                handleAddUpdateUserDialog();
            }
        } catch (err) {
            displaySnackbarAlert('Error occurred please try again later', "error")
            console.log("err while submitting form", err);
            handleAddUpdateUserDialog();
        }
    };

    const handleCreateNewUserAndAdminProfile = async (data, role, type) => {
        try {
            delete data.businessId
            const payload = {
                ...data,
                businessId: deleteInfo?.current?.userInfo?.original?.businessId || localStorage.getItem("businessId"),
                organizationId: localStorage.getItem("organizationId"),
                adminUserId: localStorage.getItem("userId"),
                appRoles: role
            }
            const response = await dispatch(validateProfileCreationForm(payload));
            if (response?.payload?.status?.toLowerCase() === "success") {
                setFormSubmittedStatus({isSubmit: true, message: "success"});
                displaySnackbarAlert(type === "user" ? "User Successfully Added" : "Admin Successfully Added", "success");
                requestAllUserRecords(selectedSuperAdmin?.userId, selectedSuperAdmin?.businessId);
                getAllAdminsInBusiness(selectedSuperAdmin?.businessId);
                handleAddCreateProfileDialog();
            } else {
                setFormSubmittedStatus({isSubmit: true, message: "error"});
                displaySnackbarAlert(response?.payload?.result?.updationResults?.message ? response?.payload?.result?.updationResults?.message : 'Error occurred please try again later', "error");
                handleAddCreateProfileDialog();
            }
        } catch (err) {
            setFormSubmittedStatus({isSubmit: true, message: "error"});
            displaySnackbarAlert('Error occurred please try again later', "error")
            handleAddCreateProfileDialog();
            console.log("err while submitting form", err);
        }
    }

    const handleCreateSuperAdminProfile = async (data) => {
        try {
            const payload = {
                ...data,
                userId: localStorage.getItem("userId"),
                organizationId: localStorage.getItem("organizationId"),
                appRoles: [appRoles.superAdminRole]
            }
            const response = await dispatch(validateSuperAdminCreation(payload));
            if (response?.payload?.status?.toLowerCase() === "success") {
                displaySnackbarAlert(response?.payload?.result, "success");
                setFormSubmittedStatus({isSubmit: true, message: "success"});
                requestAllUserRecords(selectedSuperAdmin?.userId, selectedSuperAdmin?.businessId);
                getAllAdminsInBusiness(selectedSuperAdmin?.businessId);
                handleAddCreateProfileDialog();
            } else {
                setFormSubmittedStatus({isSubmit: true, message: "error"});
                displaySnackbarAlert(response?.payload?.message ? response?.payload?.message : "Error while creating super" +
                    " admin.", "error");
                handleAddCreateProfileDialog();
            }
        } catch (err) {
            console.log(err);
            setFormSubmittedStatus({isSubmit: true, message: "error"});
            displaySnackbarAlert("Something went wrong. Please try again.", "error");
            handleAddCreateProfileDialog();
        }
    }

    const createNewProfile = (data) => {
        switch (profileType) {
            case "user":
                handleCreateNewUserAndAdminProfile(data, [appRoles.userRole], "user");
                break;
            case "admin":
                handleCreateNewUserAndAdminProfile(data, [appRoles.adminRole], "admin");
                break;
            case "superAdmin":
                handleCreateSuperAdminProfile(data);
        }
    }

    const handleGetCreateProfileDetails = async (data) => {
        if (data?.email) {
            data["emailId"] = data?.email;
            delete data.email;
        }
        delete data?.comments;
        createNewProfile(data);
    };

    const getAllBusinessIds = async () => {
        const result = await dispatch(fetchAllBusinessIds(localStorage.getItem("userId")));
        if (result?.payload?.status?.toLowerCase() === "success" && result?.payload?.result?.length > 0) {
            setBusinessMenu(result?.payload?.result);
        } else {
            setBusinessMenu([]);
        }
    }

    const handleAddCreateProfileDialog = (type) => {
        setProfileType(type);
        switch (type) {
            case "user":
                setCustomFormTitle("Create a New User Profile");
                break;
            case "admin":
                setCustomFormTitle("Create a New Admin Profile");
                break;
            case "superAdmin":
                setCustomFormTitle("Create a Super Admin Profile");
                getAllBusinessIds();
                break;
        }
        setOpenCreateUserDialog(!openCreateUserDialog);
    };

    const handleAddUpdateUserDialog = () => {
        setOpenUpdateUserDialog(!openUpdateUserDialog);
        userInitialInfo.current = null;
    };

    const handleAddCreateBizIdDialog = () => {
        setOpenCreateBizIdDialog(!openCreateBizIdDialog);
    };

    const handleGetBizIdCreateFormDetails = async (info) => {
        info.businessWebsite = info.companyWebsite;
        delete info.companyWebsite;
        const payload = {
            ...info,
            userId: localStorage.getItem("userId")
        }
        try {
            const response = await dispatch(generateBusinessId(payload));
            if (response?.payload?.status?.toLowerCase() === "success" && response?.payload?.result) {
                displaySnackbarAlert(response?.payload?.result, "success");
                handleAddCreateBizIdDialog();
                setBizIdGenerateStatus({isSubmit: true, message: "success"});
            } else {
                displaySnackbarAlert(response?.payload?.result ? response?.payload?.result : response?.payload?.message ? response?.payload?.message : "Error while generating BizId.", "error");
                setBizIdGenerateStatus({isSubmit: true, message: "error"});
                handleAddCreateBizIdDialog();
            }
        } catch (error) {
            displaySnackbarAlert("Something went wrong. Please try again.", "error");
            setBizIdGenerateStatus({isSubmit: true, message: "error"});
            handleAddCreateBizIdDialog();
        }
    };

    const requestAllUserRecords = (userId, businessId) => {
        dispatch(fetchUserRecords({
            payload: {
                userId: userId || localStorage.getItem("userId"),
                businessId: businessId || localStorage.getItem("businessId"),
                searchTerm: {searchTerm: "", skip: 0},
                skip: 0,
                limit: limit
            }
        }));
    };

    const handleCloseDeleteDialog = () => {
        setIsDisable(false);
        setOpenDeleteDialog(false);
        deleteInfo.current = {userInfo: "", ...deleteInfo.current};
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
    };

    const deleteUserRecord = (row) => {
        const payload = {
            userId: row?.original?.userId,
            selectedAdminEmail: selectedAdmin?.email,
            selectedAdminUserId: selectedAdmin?.userId,
            userType: deleteProfileType
        };
        const config = {
            method: 'post',
            url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/app-gpt/delete/users/userId/${payload.userId}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: payload
        };
        axios(config)
            .then((res) => {
                if (res?.status === 200 && res?.data?.status?.toLowerCase() === 'success') {
                    requestAllUserRecords(selectedSuperAdmin?.userId, selectedSuperAdmin?.businessId);
                    getAllAdminsInBusiness(selectedSuperAdmin?.businessId);
                    displaySnackbarAlert(res?.data?.message, "success");
                    handleCloseDeleteDialog();
                } else {
                    displaySnackbarAlert("Error while deleting the user", "error");
                    handleCloseDeleteDialog();
                }
            })
            .catch((err) => {
                displaySnackbarAlert("Error while deleting the user", "error");
                handleCloseDeleteDialog();
                console.log(err);
            });
    };

    const handleGetConfirmation = (id) => {
        if (id === "yes") {
            if (deleteProfileType === "user") {
                deleteUserRecord(deleteInfo.current.userInfo);
            } else if (deleteProfileType === "admin") {
                if (!selectedAdmin?.email) {
                    setError(true);
                } else {
                    setError(false);
                    setSelectedAdmin({});
                    setIsDisable(true);
                    deleteUserRecord(deleteInfo.current.userInfo);
                }
            }
        } else {
            setError(false);
            setSelectedAdmin({});
            handleCloseDeleteDialog();
        }
    };

    const displayCreateProfileFormDialog = () => {
        return (
            <Dialog maxWidth="xs" open={openCreateUserDialog}
                    sx={{'& .MuiDialog-paper': {p: 4}}}>
                <UserDetailsForm customFormTitle={customFormTitle} isFormSubmitted={formSubmittedStatus}
                                 sourcePage={profileType}
                                 businessMenuOptions={businessMenu}
                                 onCloseDialog={handleAddCreateProfileDialog}
                                 getFormValues={handleGetCreateProfileDetails}/>
            </Dialog>
        );
    };

    const displayCreateBizIdFormDialog = () => {
        return (
            <Dialog maxWidth="xs" open={openCreateBizIdDialog}
                    sx={{'& .MuiDialog-paper': {p: 4}}}>
                <BizIdGenerationForm isFormSubmitted={bizIdGenerateStatus}
                                     onCloseDialog={handleAddCreateBizIdDialog}
                                     getFormValues={handleGetBizIdCreateFormDetails}/>
            </Dialog>
        );
    };

    const displayUserDetailsUpdateDialog = () => {
        return (
            <Dialog maxWidth="xs" open={openUpdateUserDialog}
                    sx={{'& .MuiDialog-paper': {p: 4}}}>
                <UserDetailsUpdateForm userInitialDetails={userInitialInfo.current}
                                       onCloseDialog={handleAddUpdateUserDialog}
                                       getFormValues={handleGetUpdatedUserDetails}/>
            </Dialog>
        );
    };

    const userDeleteDialog = () => {
        return (
            <Box>
                <DialogContent>
                    <DialogContentText sx={{textAlign: "center", fontSize: "16px"}} id="alert-dialog-description">
                        {deleteInfo.current.description}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{justifyContent: "center", gap: "1rem", paddingBottom: "1rem"}}>
                    <Button variant="outlined" autoFocus
                            sx={{fontSize: "16px", pointerEvents: isDisable ? "none" : "normal", lineHeight: 1.2}}
                            onClick={() => handleGetConfirmation("no")}>No</Button>
                    <Button variant="contained" autoFocus
                            sx={{fontSize: "16px", pointerEvents: isDisable ? "none" : "normal", lineHeight: 1.2}}
                            onClick={() => handleGetConfirmation("yes")}>{isDisable ?
                        <CircularProgress style={{width: "20px", height: "19px", color: "#ffff"}}/> : "Yes"}</Button>
                </DialogActions>
            </Box>
        )
    }

    const getAllAdminsInBusiness = async (businessId) => {
        businessId = businessId || localStorage.getItem("businessId")
        const result = await dispatch(fetchAllAdminsInBusiness(businessId));

        if (result?.payload?.status?.toLowerCase() === "success") {
            setAdminRecords(result?.payload?.result)
        }
    }

    useEffect(() => {
        if(profile?.user?.appRoles?.includes(appRoles["superAdminRole"])) {
            getAllAdminsInBusiness();
        }
    }, [profile?.user?.appRoles?.includes(appRoles["superAdminRole"])])

    useEffect(() => {
        if(selectedSuperAdmin?.businessId) {
            getAllAdminsInBusiness(selectedSuperAdmin?.businessId);
        }
    }, [selectedSuperAdmin?.businessId])

    const adminDeleteDialog = () => {
        return (
            <Box>
                <DialogContent sx={{display: "flex", flexDirection: "column", alignItems: "center", gap: 2}}>
                    {adminRecords?.length > 1 ?
                        <DialogContentText sx={{textAlign: "center", fontSize: "16px"}} id="alert-dialog-description">
                            You are about to delete an Admin. Please select a new Admin from the dropdown or Create a
                            new Admin to map the data.
                            <Select
                                fullWidth
                                value={selectedAdmin.email}
                                onChange={(e) => {
                                    const selected = adminRecords?.find(admin => admin?.email === e.target.value);
                                    setSelectedAdmin({userId: selected?.userId, email: selected?.email, businessId: selected?.businessId});
                                    setError(false);
                                }}
                                displayEmpty
                                renderValue={(value) => (value ? value : "Select Admin")}
                                sx={{
                                    mt: 1,
                                    height: "28px",
                                    textAlign: 'center',
                                    mx: "10px",
                                    width: 'auto',
                                    minWidth: 'fit-content'
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 300,
                                            width: 'auto',
                                        }
                                    }
                                }}
                                error={error}
                            >
                                <MenuItem value="" disabled>Select Admin</MenuItem>
                                {adminRecords.map((admin) => (
                                    (admin?.email !== deleteInfo?.current?.userInfo?.original?.email &&
                                        <MenuItem key={admin?.id} value={admin?.email}>
                                            {admin?.email}
                                        </MenuItem>
                                    )
                                ))}
                            </Select>
                            {error && (
                                <FormHelperText error sx={{textAlign: "center", fontSize: "1rem"}}>
                                    Please select an Admin or Create Admin.
                                </FormHelperText>
                            )}
                        </DialogContentText> :
                        <DialogContentText sx={{textAlign: "center", fontSize: "16px"}} id="alert-dialog-description">
                            No Admins found to map the data. Please create a new Admin.
                        </DialogContentText>
                    }
                </DialogContent>
                <DialogActions sx={{justifyContent: "center", mt: 2, gap: "1rem", pb: 2.5}}>
                    <Stack flexDirection="row" justifyContent={adminRecords?.length > 1 ? "space-between" : "center"}
                           width="80%">
                        {adminRecords?.length > 1 &&
                            <Stack>
                                <Button variant="contained" autoFocus
                                        sx={{
                                            fontSize: "16px",
                                            pointerEvents: isDisable ? "none" : "normal",
                                            lineHeight: 1.2
                                        }}
                                        onClick={() => {
                                            handleAddCreateProfileDialog("admin")
                                        }}
                                >Create Admin</Button>
                            </Stack>
                        }
                        <Stack flexDirection="row" gap={2}>
                            <Button variant="outlined" autoFocus
                                    sx={{
                                        fontSize: "16px",
                                        pointerEvents: isDisable ? "none" : "normal",
                                        lineHeight: 1.2
                                    }}
                                    onClick={() => handleGetConfirmation("no")}>Cancel</Button>
                            {adminRecords?.length > 1 ?
                                <Button variant="contained" autoFocus
                                        sx={{
                                            fontSize: "16px",
                                            pointerEvents: isDisable ? "none" : "normal",
                                            lineHeight: 1.2
                                        }}
                                        onClick={() => handleGetConfirmation("yes")}>{isDisable ?
                                    <CircularProgress
                                        style={{width: "20px", height: "19px", color: "#ffff"}}/> : "Submit"}</Button>
                                :
                                <Button variant="contained" autoFocus
                                        sx={{
                                            fontSize: "16px",
                                            pointerEvents: isDisable ? "none" : "normal",
                                            lineHeight: 1.2
                                        }}
                                        onClick={() => {
                                            setOpenDeleteDialog(false)
                                            handleAddCreateProfileDialog("admin")
                                        }}
                                >{isDisable ?
                                    <CircularProgress style={{
                                        width: "20px",
                                        height: "19px",
                                        color: "#ffff"
                                    }}/> : "Create Admin"}</Button>
                            }
                        </Stack>
                    </Stack>
                </DialogActions>
            </Box>
        )
    }

    const handleDeleteProfileDialog = (row) => {
        if (row?.original?.appRoles?.includes(appRoles["superAdminRole"])) {
            setDeleteProfileType("superAdmin");
        } else if (row?.original?.appRoles?.includes(appRoles["adminRole"])) {
            setDeleteProfileType("admin");
        } else {
            setDeleteProfileType("user");
        }
    }

    const displayDeleteDialog = () => {
        const renderDeleteDialog = () => {
            switch (deleteProfileType) {
                case "admin":
                    return adminDeleteDialog();
                case "user":
                    return userDeleteDialog();
                default:
                    return null;
            }
        };

        return (
            deleteProfileType !== "superAdmin" &&
            <Dialog
                open={openDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {renderDeleteDialog()}
            </Dialog>
        );
    };

    const debouncedSearchQuery = useMemo(() => _.debounce((value) => {
        dispatch(fetchUserRecords({
            payload: {
                userId: localStorage.getItem("userId"),
                businessId: localStorage.getItem("businessId"),
                searchTerm: value, skip: value?.skip, limit: limit
            }
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
            if (userRecords?.status !== 'loading' && scrollTop + clientHeight >= scrollHeight - 20) {
                if (userRecords?.totalNumberOfRecords > userRecords?.records.length) {
                    setSkip(skip + limit);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [userRecords?.status]);

    const handleSetColumnsData = () => {
        const columns = [
            {
                Header: 'User Id',
                accessor: 'userId',
                showFilterIcon: true,
                Cell: ({row, value}) => {
                    return value;
                },
            },
            {
                Header: 'First Name',
                accessor: 'firstName',
                showFilterIcon: true,
            },
            {
                Header: 'Last Name',
                accessor: 'lastName',
                showFilterIcon: true,
            },
            {
                Header: 'Email',
                accessor: 'email',
                showFilterIcon: true
            },
            {
                Header: 'Company',
                accessor: 'company',
                showFilterIcon: true
            },
            {
                Header: 'Created At',
                accessor: 'createdAt',
                showFilterIcon: true,
                Cell: ({row, value}) => {
                    const date = new Date(value);
                    return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
                }
            },
            {
                Header: 'Actions',
                className: 'cell-left',
                disableSortBy: true,
                Cell: ({row}) => {
                    return (
                        <Stack direction='row' alignItems='flex-end' justifyContent='center' spacing={1}>

                            <Tooltip title='Edit'>
                                <IconButton color="primary" onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenUpdateUserDialog(true);
                                    userInitialInfo.current = row?.original;
                                }}
                                >
                                    <EditTwoTone
                                        twoToneColor={theme.palette.primary.main}/>
                                </IconButton>
                            </Tooltip>


                            <Tooltip title='Delete'>
                                <IconButton
                                    color='primary'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteInfo.current.userInfo = row;
                                        setOpenDeleteDialog(true);
                                        handleDeleteProfileDialog(row);
                                    }}
                                >
                                    <DeleteTwoTone
                                        twoToneColor={theme.palette.primary.main}/>
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    );
                }
            }
        ]

        if (profile?.user?.appRoles?.includes(appRoles["superAdminRole"]) || selectedSuperAdmin) {
            columns.unshift({
                Header: () => null,
                id: 'expander',
                className: 'cell-center',
                Cell: CellExpander,
                SubCell: () => null
            })
        }

        setColumnData([...columns])
    };

    useEffect(() => {
        if (triggerTableRender) {
            handleSetColumnsData();
            setTriggerTableRender(false);
        }
    }, [triggerTableRender]);

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
    }, [profile, selectedSuperAdmin]);

    const handleSearchUser = (event) => {
        setSkip(0)
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        if (userRecords?.records) {
            if (userRecords?.records?.length > 0) {
                let dbData = userRecords?.records;
                let adminUserRecords = []
                if(profile?.user?.appRoles?.includes(appRoles["masterAdminRole"]) && !selectedSuperAdmin) {
                    dbData = dbData?.filter((item, i) => {
                        if (item && item.adminUserId) {
                            adminUserRecords.push(item)
                        }

                        return item?.appRoles?.includes(appRoles["superAdminRole"]);
                    })
                    setSuperAdminRecords(dbData);
                } else if(profile?.user?.appRoles?.includes(appRoles["superAdminRole"]) || selectedSuperAdmin) {
                    dbData = dbData?.filter((item, i) => {
                        if (item && item.adminUserId) {
                            adminUserRecords.push(item)
                        }
                        //For Super Admins, we have to display Admins in the main row and normal users created by Admin in sub rows.
                        //For Admins, we have to display the users created by Admin directly without sub rows.
                      return item?.appRoles?.includes(appRoles["adminRole"])
                    })
                }
                setData(dbData);
                setSubData(adminUserRecords);
            } else {
                setData([])
                setSubData([])
            }
        }
    }, [userRecords, dispatch]);

    const renderRowSubComponent = useCallback(({row, rowProps}) => {
        const selectedRow = row?.original?.userId;
        let filteredData = [];
        subData.filter((record) => {
                if (record && record["adminUserId"] && record["adminUserId"] === selectedRow) {
                    filteredData.push(record);
                }
            }
        )

        return <SubRowAsync row={row} rowProps={rowProps} rowData={filteredData}/>;
    }, [subData]);

    const handleClearAllFilters = () => {
        if (searchTerm) {
            setSearchTerm("");
        }
        setClearAllFilters(true);
    };

    const getClearFilterConfirmation = (isCleared) => {
        if (isCleared) {
            setClearAllFilters(false);
        }
    };

    const getTableFilters = (filterData) => {
        let filterKeys = [];
        for (let key in filterData) {
            filterKeys.push(key);
        }
        if (filterKeys?.length > 0) {
            setShowClearFilter(true);
        } else {
            setShowClearFilter(false);
        }
    };

    const extractBusinessName = (businessId) => {
        //Excluding the last array element in by splitting businessId with "_" to get actual businessName
        const arr = businessId.split("_");
        let businessName = "";
        for(let i=0; i<arr.length-2; i++) {
            businessName += arr[i]+"_";
        }
        businessName += arr[arr.length-2];
        return businessName;
    }

    return (
        <Grid container>
            <Grid item xs={12} paddingTop="0px !important" className={customStyles.header}>
                <ThemeProvider theme={customTheme}>
                    <Box sx={{
                        background: theme.palette.primary.lighter,
                        py: "10px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between"
                    }}>
                        <Typography variant="h5" fontWeight="500" sx={{paddingLeft: "10px"}}>Create (or) manage
                            users</Typography>
                        <Stack flexDirection="row" gap="8px" marginRight="18px">
                            {profile?.user?.appRoles?.includes(appRoles["masterAdminRole"]) &&
                              <Select
                                fullWidth
                                value={selectedSuperAdmin?.email}
                                onChange={(e) => {
                                    const selected = superAdminRecords?.find(superAdmin => superAdmin?.email === e.target.value);
                                    if(e.target.value) {
                                        setSelectedSuperAdmin(selected);
                                    } else {
                                        setSelectedSuperAdmin("");
                                    }
                                    requestAllUserRecords(selected?.userId, selected?.businessId);
                                }}
                                displayEmpty
                                renderValue={(value) => (value  || "Select Business")}
                                sx={{
                                    height: "2.5rem",
                                    textAlign: 'center',
                                    mx: "10px",
                                    width: 'auto',
                                    minWidth: 'fit-content',
                                    backgroundColor: (theme) => theme.palette.primary.main,
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette.primary.dark,
                                    },
                                    '.MuiSelect-icon': {
                                        color: 'white',
                                    },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 300,
                                            width: 'auto',
                                        }
                                    }
                                }}
                                error={error}
                              >
                                  <MenuItem value="">Select None</MenuItem>
                                  {superAdminRecords?.map((superAdmin) => (
                                      <MenuItem key={superAdmin?.id} value={superAdmin?.email}>
                                          {superAdmin?.email} - {extractBusinessName(superAdmin?.businessId)}
                                      </MenuItem>
                                  ))}
                              </Select>
                            }
                            {profile?.user?.appRoles?.includes(appRoles["masterAdminRole"]) &&
                                <Button color="primary" variant="contained" sx={{
                                    mr: '10px',
                                    alignItems: "flex-start",
                                    whiteSpace: "nowrap",
                                    height: "fit-content"
                                }}
                                        endIcon={<MdDomainAdd/>} onClick={() => handleAddCreateBizIdDialog()}>
                                    Create Biz ID
                                </Button>}
                            {profile?.user?.appRoles?.includes(appRoles["masterAdminRole"]) &&
                                <Button color="primary" variant="contained" sx={{
                                    mr: '10px',
                                    alignItems: "flex-start",
                                    whiteSpace: "nowrap",
                                    height: "fit-content"
                                }}
                                        endIcon={<MdOutlineSupervisorAccount/>}
                                        onClick={() => handleAddCreateProfileDialog("superAdmin")}>
                                    Create Super Admin
                                </Button>}
                            {profile?.user?.appRoles?.includes(appRoles["superAdminRole"]) &&
                                <Button color="primary" variant="contained" sx={{
                                    mr: '10px',
                                    alignItems: "flex-start",
                                    whiteSpace: "nowrap",
                                    height: "fit-content"
                                }}
                                        endIcon={<PersonAddAlt/>} onClick={() => handleAddCreateProfileDialog("admin")}>
                                    create Admin
                                </Button>}
                            {profile?.user?.appRoles?.includes(appRoles["adminRole"]) &&
                                <Button color="primary" variant="contained" sx={{
                                    mr: '10px',
                                    alignItems: "flex-start",
                                    whiteSpace: "nowrap",
                                    height: "fit-content"
                                }}
                                        endIcon={<PersonAddAlt/>} onClick={() => handleAddCreateProfileDialog("user")}>
                                    create user
                                </Button>}
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
                        onChange={handleSearchUser}
                        value={searchTerm}
                        sx={{ml: 0, paddingRight: "10px", width: "100%", background: "white"}}
                        endAdornment={<InputAdornment position="end"><SearchIcon/></InputAdornment>}
                    />
                    <Box sx={{display: "flex", justifyContent: "space-between"}}>
                        <FormHelperText sx={{width: "50%"}}>Type any keyword</FormHelperText>
                        {(showClearFilter || searchTerm !== "") &&
                            <Button onClick={handleClearAllFilters}>Clear Filters</Button>}
                    </Box>
                </FormControl>
            </Grid>
            <Grid item xs={12} sx={{marginTop: "150px"}}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <MainCard content={false} ref={containerRef}>
                            <ScrollX>
                                <ReactTable columns={columnsData} data={data}
                                            renderRowSubComponent={renderRowSubComponent}
                                            clearFilter={clearAllFilters}
                                            confirmAllFiltersCleared={getClearFilterConfirmation}
                                            getTableFilters={getTableFilters}/>
                                {userRecords.loading && (
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
            {displayCreateProfileFormDialog()}
            {displayUserDetailsUpdateDialog()}
            {displayCreateBizIdFormDialog()}
            {displayDeleteDialog()}
        </Grid>
    )
}

export default UserManagement;
