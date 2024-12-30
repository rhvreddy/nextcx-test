import PropTypes from 'prop-types';
import React, {useEffect, useState, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import './BotInfoEditForm.css';
import {appRoles, CLIENT_ID, REACT_APP_APP_BACK_END_BASE_URL} from 'config';
import UploadMultiFile from '../../../../../components/third-party/dropzone/MultiFile';
import axios from 'axios';

// material-ui
import {styled, useTheme} from '@mui/material/styles';
import {SketchPicker} from 'react-color';
import {
    Box,
    Button,
    Card, CircularProgress, Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormHelperText,
    FormLabel,
    Grid,
    Link,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import {Link as RouterLink} from 'react-router-dom';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import * as yup from 'yup';
import {Form, FormikProvider, useFormik} from 'formik';

// project imports
import Avatar from 'components/@extended/Avatar';
import {CameraOutlined, DeleteFilled} from '@ant-design/icons';
import Switch from '@mui/material/Switch';
import {validImageTypes} from '../../../../../consts';
import {triggerNotification} from "../../../../../store/reducers/chat";
import {triggerWorkerFunction} from "../../../../../store/reducers/menu";

const AntSwitch = styled(Switch)(({theme}) => ({
    width: 28,
    height: 16,
    padding: 0,
    marginTop: '10px',
    display: 'flex',
    '&:active': {
        '& .MuiSwitch-thumb': {
            width: 15
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(9px)'
        }
    },
    '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
            transform: 'translateX(12px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: theme.palette.mode === 'dark' ? '#52c41a' : '#52c41a'
            }
        }
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
        width: 12,
        height: 12,
        borderRadius: 6,
        transition: theme.transitions.create(['width'], {
            duration: 200
        })
    },
    '& .MuiSwitch-track': {
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
        boxSizing: 'border-box'
    }
}));
AntSwitch.displayName = 'AntSwitch';

const getValidationSchema = (creationType) => {
    return yup.object({
        botName: yup.string().required('GPT Name is required'),
        salesTeamEmail: creationType === "lead_generation" ? yup.string().email('Must be a valid email').max(255).required('Sales Team Email is required') : null
    });
};

const EditBotInfo = ({onCancel, botId, requestResponse, botRecId, getRequestStatus}) => {
    const theme = useTheme();
    const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch();
    const [FaqFileName, setFaqFileName] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [avatar, setAvatar] = useState('');
    const [displayColorPicker, setDisplayColorPicker] = useState(false);
    const [originalRecord, setOriginalRecord] = useState({});
    const [fileError, setFileError] = useState(false);
    const [isSaveDisabled, setIsSaveDisabled] = useState(false);
    const [isPublishDisabled, setIsPublishDisabled] = useState(false);
    const containerRef = useRef(null);
    let userId = localStorage.getItem("userId");
    const userInfo = useSelector(state => state.profile)
    const [runWorker, setRunWorker] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false);
    const [publishedBotRecords, setPublishedBotRecords] = useState([])

    function handlePickerOpen() {
        setDisplayColorPicker(state => !state);
    }

    function handlePickerClose() {
        setDisplayColorPicker(false);
    }

    useEffect(() => {
        if (runWorker) {
            dispatch(triggerWorkerFunction({isWorkerInvoked: true, type: "bot"}))
        }
    }, [runWorker]);

    useEffect(() => {
        let config = {
            method: 'get',
            url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/get-bot-details/${botRecId}`,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        axios(config)
            .then((res) => {
                let botDataObj = res.data.data[0];
                setOriginalRecord(botDataObj);
            })
            .catch((err) => {
                console.log(err);
            });

        const interpreterId = botId;
        config = {
            method: 'get',
            url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/get-published-records/${interpreterId}`,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        axios(config)
            .then((res) => {
                setPublishedBotRecords(res.data.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            botName: originalRecord?.botName ? originalRecord?.botName : "",
            botDescription: originalRecord?.description ? originalRecord?.description : "",
            version: originalRecord?.versionNumber ? originalRecord?.versionNumber : "",
            parentVersion: originalRecord?.parentVersionNumber ? originalRecord?.parentVersionNumber?.toFixed(1) : "",
            botColor: originalRecord?.botColor ? originalRecord?.botColor : "",
            salesTeamEmail: originalRecord?.emails?.[0],
            files: {
                avatar: originalRecord?.avatarFileS3Info?.s3Location ? originalRecord?.avatarFileS3Info?.s3Location : null,
                customFiles: []
            }
        },
        validationSchema: getValidationSchema(originalRecord?.botUseCase),
        onSubmit: (values, {setSubmitting}) => {
            try {
                updateBotInfo(values);
                setSubmitting(false);
            } catch (error) {
                console.error(error);
            }
        }
    });

    function updateBotInfo(values) {
        setIsSaveDisabled(true);
        const userData = userInfo?.user ? userInfo?.user : {};
        let formData = new FormData();
        let botObject = {
            botName: values.botName,
            version: values.version,
            interpreterId: botId,
            botRecordId: botRecId,
            userId: userId,
            adminUserId: userData?.adminUserId ? userData?.adminUserId : "",
            userName: userData?.firstName + " " + userData?.lastName,
            clientId: CLIENT_ID,
            businessId: localStorage.getItem('businessId'),
            organizationId: localStorage.getItem('organizationId'),
            sourcePage: "wizard"
        };
        if (values?.emails?.length > 0) {
            botObject["emails"] = [formik.values.salesTeamEmail]
        }

        if (values && values.files?.avatar && avatar) {
            formData.append('avatarFile', avatar, avatar.name);
        }

        if (formik.initialValues.botDescription !== values.botDescription) {
            botObject['botDescription'] = values.botDescription;
        }
        if (formik.initialValues.botColor !== values.botColor) {
            botObject['botColor'] = values.botColor;
        }

        if (values.files.customFiles?.length > 0) {
            let fileNames = [];
            values.files.customFiles?.map((file, index) => {
                fileNames.push(file.name);
                formData.append(
                    `businessInfoAttachments`,
                    file,
                    file?.name
                );
            });
            botObject.businessInfoFileNames = fileNames;
        }

        formData.append('botObject', JSON.stringify(botObject));
        let initiateBotUrl = "/ai-bots/v0/initiate-bot-upsert";
        let appGptUrl = "/ai-bots/v0/app-gpt/upsert-bot";
        const config = {
            method: 'post',
            url: REACT_APP_APP_BACK_END_BASE_URL + appGptUrl,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: formData
        };

        try {
            axios(config).then((res) => {
                if (res?.status === 200 && res?.data?.status?.toLowerCase() === "success") {
                    setRunWorker(true);
                    requestResponse();
                    getRequestStatus("GPT Info Updated Successfully", "success");
                    onCancel();
                } else {
                    getRequestStatus(res?.data?.message || "Failed to update GPT Info", "error");
                    onCancel();
                }
                setIsSaveDisabled(false);
                dispatch(triggerNotification({isNotify: true}))
            }).catch((err) => {
                getRequestStatus("Something went wrong. Please try again.", "error");
                console.log('error from server for the bot updation ->', err);
                setIsSaveDisabled(false);
                onCancel();
            });
        } catch (err) {
            getRequestStatus("Something went wrong. Please try again.", "error");
            setIsSaveDisabled(false);
            onCancel();
        }

    }

    function publishBot() {
        setIsPublishDisabled(true);
        let botObject = {
            interpreterId: botId,
            botRecordId: botRecId,
            version: originalRecord?.versionNumber,
            userId: userId
        };
        const config = {
            method: 'post',
            url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/publish-bot`,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: botObject
        };

        axios(config).then((res) => {
            if (res?.status === 200 && res?.data) {
                requestResponse();
                getRequestStatus("GPT published successfully", "success");
                dispatch(triggerNotification({isNotify: true}));
                onCancel();
            } else {
                getRequestStatus("Failed to publish GPT", "error");
                console.log(' Failed to update Bot Info');
                onCancel();
            }
            setIsPublishDisabled(false);
        }).catch((err) => {
            getRequestStatus("Something went wrong. Please try again.", "error");
            console.log('error from server for the bot updation ->', err);
            setIsPublishDisabled(false);
            onCancel();
        });

    }

    function getUrl(urlData) {
        const config = {
            method: 'post',
            url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/get-file-url`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: urlData
        };
        axios(config).then((res) => {
            setFileUrl(res.data);
        }).catch((err) => {
            console.log('error from server for the  url  ->', err);
        });
    }

    function handleAvatarChange(image) {
        if (image) {
            if (validImageTypes.includes(image.type)) {
                setAvatar(image);
                formik.setFieldValue("files[avatar]", URL.createObjectURL(image));
            } else {
                getRequestStatus("Please select a valid image type. Supported types: jpg, jpeg, png", "error")
            }
        }
    }

    useEffect(() => {
        if ((containerRef.current && formik.values.files.customFiles?.length > 0) || fileError) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [formik.values.files.customFiles]);


    function handleColorChange(e) {
        let value = `rgba(${e.rgb.r},${e.rgb.g},${e.rgb.b},${e.rgb.a})`;
        formik.setFieldValue("botColor", value)
    }

    const handleOpenDialog = () => {
        return (
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <Box sx={{p: 1, py: 1.5}}>
                    <DialogContent>
                        <Typography sx={{textAlign: "center", fontSize: "16px"}}>
                            Publishing this bot will replace the currently active published bot. Would you like to
                            continue with
                            publishing?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{justifyContent: "center", gap: "1rem"}}>
                        <Button variant="outlined"
                                sx={{fontSize: "16px", pointerEvents: isPublishDisabled ? "none" : "auto"}}
                                onClick={() => setDialogOpen(false)}>
                            No
                        </Button>
                        <Button variant="contained" sx={{fontSize: "16px"}} onClick={publishBot}
                                disabled={isPublishDisabled}>
                            Yes
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        );
    }

    const handlePublishClick = () => {
        if (publishedBotRecords.length > 0) {
            setDialogOpen(true);
        } else {
            publishBot();
        }
    }

    return (
        <Card>
            <FormikProvider value={formik}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Form autoComplete='off' noValidate onSubmit={formik.handleSubmit}>
                        <DialogTitle>Edit Bot</DialogTitle>
                        <Divider/>
                        <DialogContent sx={{p: 2.5, maxHeight: "60vh"}} ref={containerRef}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={3}>
                                    <Stack direction='row' justifyContent='center' sx={{mt: 3}}>
                                        <FormLabel
                                            htmlFor='change-avtar'
                                            sx={{
                                                position: 'relative',
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                '&:hover .MuiBox-root': {opacity: 1},
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Avatar className='avatarImg' alt='Avatar 1'
                                                    src={formik.values.files.avatar}
                                                    sx={{
                                                        width: 72,
                                                        height: 72,
                                                        border: '1px dashed',
                                                        'objectFit': 'scale-down'
                                                    }}/>
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    backgroundColor: formik.values.files.avatar ? (theme.palette.mode === 'dark' ? 'rgba(255,' +
                                                        ' 255, 255, .75)' : 'rgba(0,0,0,.65)') : "#ffff",
                                                    width: '100%',
                                                    height: '100%',
                                                    opacity: formik.values.files.avatar ? 0 : 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    "&:hover": {
                                                        backgroundColor: "#808080b5",
                                                    }
                                                }}
                                            >
                                                <Stack spacing={0.5} justifyContent="center" alignItems='center'
                                                       sx={{
                                                           backgroundColor: "rgba(139, 106, 237, 0.75)",
                                                           width: "inherit",
                                                           height: "inherit",
                                                           "&:hover": {
                                                               backgroundColor: "#808080b5",
                                                           }
                                                       }}>
                                                    <CameraOutlined style={{
                                                        color: theme.palette.secondary.lighter,
                                                        fontSize: '22px',
                                                        width: "24px",
                                                        height: "22px"
                                                    }}/>
                                                    <Typography fontWeight="500"
                                                                sx={{color: 'secondary.lighter'}}>Upload</Typography>
                                                </Stack>
                                            </Box>
                                        </FormLabel>
                                        <TextField
                                            type='file'
                                            id='change-avtar'
                                            label='Outlined'
                                            variant='outlined'
                                            sx={{display: 'none'}}
                                            onChange={(e) => {
                                                handleAvatarChange(e.target.files[0]);
                                            }}
                                            inputProps={{accept: 'image/*'}}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <Stack spacing={0.5}>
                                                <TextField spellCheck='false' id='botName' inputProps={{maxLength: 25}}
                                                           name='botName'
                                                           placeholder='Nextcx' fullWidth
                                                           value={formik.values.botName || ''}
                                                           onChange={formik.handleChange}
                                                           error={formik.touched.botName && Boolean(formik.errors.botName)}
                                                           helperText={formik.touched.botName && formik.errors.botName}
                                                           label='Bot Name*'/>
                                            </Stack>
                                        </Grid>
                                        {
                                            originalRecord?.botUseCase === "lead_generation" &&
                                            <Grid item xs={12} sm={6}>
                                                <Stack spacing={0.5}>
                                                    <TextField id='salesTeamEmail' name='salesTeamEmail'
                                                               placeholder='Sales Team Email' fullWidth
                                                               value={formik.values.salesTeamEmail}
                                                               onBlur={formik.handleBlur}
                                                               onChange={formik.handleChange}
                                                               error={formik.touched.salesTeamEmail && Boolean(formik.errors.salesTeamEmail)}
                                                               helperText={formik.touched.salesTeamEmail && formik.errors.salesTeamEmail}
                                                               label='Sales Team Email*'/>
                                                </Stack>
                                            </Grid>
                                        }
                                        <Grid item xs={12}>
                                            <Stack spacing={1.25}>
                                                <TextField spellCheck='false' id='botDescription' multiline
                                                           rows={2} onChange={formik.handleChange}
                                                           value={formik.values.botDescription || ''}
                                                           placeholder='Smart Bot' fullWidth label={'Bot Description'}
                                                           InputLabelProps={{style: {lineHeight: '1rem'}}}/>
                                            </Stack>
                                        </Grid>

                                        <Grid container direction='row' spacing={2} sx={{mt: "10px", ml: "10px"}}>
                                            <Grid item xs={12} sm={6}>
                                                <Stack spacing={0.5}>
                                                    <TextField
                                                        placeholder='Bot Theme Color'
                                                        label='Bot Theme Color'
                                                        value={formik.values.botColor || ''}
                                                        onClick={() => handlePickerOpen()}
                                                        id='uiPrimaryColor'
                                                        InputProps={{
                                                            endAdornment: (
                                                                <>
                                                                    <Grid>
                                                                        <Stack sx={{
                                                                            background: formik.values.botColor,
                                                                            width: '50px',
                                                                            height: '29px',
                                                                            borderRadius: '10px',
                                                                            cursor: 'pointer'
                                                                        }}/>
                                                                    </Grid>

                                                                </>
                                                            ), readOnly: true
                                                        }}
                                                    />
                                                    {displayColorPicker ?
                                                        <Grid sx={{position: 'absolute', zIndex: '2', bottom: '11rem'}}>
                                                            <Grid onClick={() => handlePickerClose()}
                                                                  sx={{
                                                                      position: 'fixed',
                                                                      top: '0px',
                                                                      right: '0px',
                                                                      bottom: '0px',
                                                                      left: '0px'
                                                                  }}/>
                                                            <SketchPicker color={formik.values.botColor}
                                                                          id='uiPrimaryColor'
                                                                          onChange={(e) => handleColorChange(e)}/>
                                                        </Grid> : null}
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <TextField
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                    id='botVersion'
                                                    inputProps={{maxLength: 10}}
                                                    name='botVersion'
                                                    placeholder='Sia'
                                                    value={formik.values.version || ''}
                                                    label='Current Version'
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <TextField
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                    id='botParentVersion'
                                                    name='botParentVersion'
                                                    value={formik.values.parentVersion || 0}
                                                    label='Parent Version'
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Stack>
                                                <Typography variant='h5' gutterBottom sx={{'marginBottom': ' -4px'}}>
                                                    Bot knowledge
                                                </Typography>

                                                <Link sx={{marginLeft: '5px', marginTop: '10px', marginBottom: '10px'}}
                                                      align='left'
                                                      href={fileUrl} target='_blank'>{FaqFileName}</Link>
                                                <Typography variant='subtitle2' gutterBottom
                                                            sx={{'marginBottom': '-2px'}} color='error'>
                                                    Note :
                                                </Typography>
                                                <Typography variant='subtitle2' gutterBottom
                                                            sx={{'marginBottom': '4px'}}>
                                                    Please make sure to have all the required FAQs in the excel sheet
                                                    that you
                                                    upload as they only would be available live and would replace the
                                                    FAQs that were fed to the
                                                    bot previously.
                                                </Typography>
                                                <UploadMultiFile showList={true} isCustom={true}
                                                                 customStyles={true} fileError={fileError}
                                                                 setFileError={setFileError}
                                                                 isFileLimit={4}
                                                                 selectedFiles={formik.values.files.customFiles}
                                                                 showSingleFile={false}
                                                                 setFieldValue={formik.setFieldValue}
                                                                 files={formik.values.files?.customFiles}
                                                                 error={formik.touched.files?.customFiles && !!formik.errors.files?.customFiles}/>
                                                {formik.touched.files?.customFiles && formik.errors.files?.customFiles && (
                                                    <FormHelperText error
                                                                    id='standard-weight-helper-text-password-login-01'>
                                                        {formik.errors.files?.customFiles}
                                                    </FormHelperText>

                                                )}
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <Divider/>
                        <DialogActions sx={{padding: matchDownSm ? '0.5rem' : '1rem'}}>
                            <Grid container justifyContent='space-between' alignItems='center'>
                                <Grid item>
                                    <Button variant={"contained"} onClick={onCancel}
                                            disabled={isPublishDisabled || isSaveDisabled}>
                                        Cancel
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Stack direction='row' spacing={2} alignItems='center'>
                                        {(userInfo?.user?.appRoles?.includes(appRoles["masterAdminRole"]) || userInfo?.user?.appRoles?.includes(appRoles["superAdminRole"]) || userInfo?.user?.appRoles?.includes(appRoles["adminRole"])) &&
                                            <RouterLink
                                                style={{textDecoration: 'none',pointerEvents : isPublishDisabled || isSaveDisabled ? "none" : "auto"}}
                                                to={'/bot-builder/bot-details/' + botRecId}
                                            >
                                                <Button variant='contained'
                                                        disabled={isSaveDisabled || isPublishDisabled}
                                                        onClick={() => localStorage.setItem('botId', botId)}>
                                                    {matchDownSm ? 'Edit Screen' : 'Edit Advance Screen'}
                                                </Button>
                                            </RouterLink>}
                                        <Button variant='contained' onClick={handlePublishClick}
                                                disabled={publishedBotRecords.find(record => record.botRecordId === botRecId) || isSaveDisabled} sx={{pointerEvents: isPublishDisabled ? "none" : "auto"}}>
                                            {
                                                isPublishDisabled ?   <CircularProgress sx={{
                                                    color: "#ffff", height: "26px !important", width: "26px" +
                                                        " !important"
                                                }}/> : "Publish"
                                            }
                                        </Button>
                                        <Button type='submit' variant='contained'
                                                disabled={!formik.dirty || isPublishDisabled} sx={{pointerEvents: isSaveDisabled ? "none" : "auto"}}>
                                            {
                                             isSaveDisabled ?   <CircularProgress sx={{
                                                    color: "#ffff", height: "26px !important", width: "26px" +
                                                        " !important"
                                                }}/> : "Save"
                                            }
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </DialogActions>
                    </Form>
                    {handleOpenDialog()}
                </LocalizationProvider>
            </FormikProvider>
        </Card>
    );
};


EditBotInfo.propTypes = {
    customer: PropTypes.any,
    onCancel: PropTypes.func
};

export default EditBotInfo;
