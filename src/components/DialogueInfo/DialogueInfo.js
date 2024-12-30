import React, {useEffect, useState} from "react";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";

import {FormattedMessage} from 'react-intl';
import {useLocation, Link, Outlet} from 'react-router-dom';
import PropTypes from 'prop-types';
import {useTheme} from '@mui/material/styles';
import {CloseOutlined, PlusOutlined, PlusSquareOutlined} from '@ant-design/icons'

// material-ui
import {
  Button,
  Fab,
  Tooltip,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  CardContent,
  Box,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Chip,
  Typography,
  Grid,
  DialogTitle, ListItemAvatar, Avatar, Dialog, CardActionArea,
  Stack, CardHeader
} from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// assets
import {
  EditOutlined,
  MoreOutlined,
  DownOutlined,
  LayoutOutlined,
  RadiusUprightOutlined,
  SettingOutlined,
  UpOutlined,
  MessageOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import {EllipsisOutlined} from '@ant-design/icons';
import IconButton from "../@extended/IconButton";

function TabPanel({children, value, index, ...other}) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`}
         aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{pt: 2}}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number,
  index: PropTypes.number
};

function a11yProps(index) {

  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}


// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


let count = 0;

const DialogueInfo = (props) => {
  const [items, setItems] = useState(props?.data?.steps);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [editBox, setEditBox] = useState("")
  const theme = useTheme();
  const [data, setData] = useState(props?.data)
  const [editOutlined, setEditOutlined] = useState(true)
  const [isMessageDisabled, setIsMessageDisabled] = useState([])
  const [isActionDisabled, setIsActionDisabled] = useState([])
  const [showEntities, setShowEntities] = useState(true)
  const [isCustomEntity, setIsCustomEntity] = useState("")
  const [isActionUrl, setIsActionUrl] = useState(props?.data?.steps?.[1]?.url)
  const [selectedItem, setSelectedItem] = useState();

  //handling the route navigation and showing the step
  //property based on that
  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue == 0) {
      props.stepProperties("message");
    } else {
      props.stepProperties("intent");
    }

  };

  //pushing the new data into the array
  const renderData = (dataObj) => {
    data.push(dataObj)
  }

  //setting props for dialog info
  useEffect(() => {
    setItems(props?.data?.steps)
  }, [props]);


  //for drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );
    setItems(reorderedItems);
  };

  //to display the edit screen on step property
  const stepProperties = (item) => {
    setSelectedItem(item.stepId)
    if (item?.type === "message" || item?.type === "input") {
      props.messageDisplay("1");
      props.messageDetails(item)
    }
    // if (item.itemType === "Entities") {
    //   props.messageDisplay("2");
    //   props.messageDetails(item)
    // }
    if (item?.type === "action") {
      props.messageDisplay("3");
      props.messageDetails(item)
    }
  }

  // To delete entity
  const handleDeleteEntity = (data, id, index) => {
    if (isMessageDisabled.includes(id)) {
      if (index > -1) {
        props?.data?.steps?.map((item, i) => {
          item?.entityNames?.filter((ele, index) => {
            if (ele === data) {
              item?.entityNames?.splice(index, 1)
            }
          })
        })
        setShowEntities(true)
      }
      props.handleEntity(data)
    }
  }

  //For custom entity input
  const handleCustomEntity = (e, index) => {
    count = index
    setIsCustomEntity(e.target.value)
  }

  //adding custom entity to container
  const addCustomEntity = (data, index) => {
    if (isCustomEntity && isCustomEntity !== "") {
      // setEntity((prev) => [
      //   ...prev, isCustomEntity
      // ]);
      if (props?.data?.steps?.[index]?.entityNames) {
        props?.data?.steps?.[index]?.entityNames?.push(isCustomEntity)
      } else {
        let entityNames = {
          "entityNames": [
            isCustomEntity
          ]
        }
        Object.assign(props?.data?.steps?.[index], entityNames)
      }
      props?.AddCustomEntity(isCustomEntity)
      setIsCustomEntity("")
    }
  }

  //disable flow cards in dialogInfo
  const handleDisabled = (data, id) => {

    if ((data?.type === "message" || data?.type === "input") && data?.stepId === id) {
      setIsMessageDisabled([id])
    }
    if (data?.type === "action" && data?.stepId === id) {
      setIsActionDisabled([...isActionDisabled, id])
    }
  }


  return (
    <Grid container>
      <Grid item xs={12}>
        <MainCard title="Dialog Info">
          <Box>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
              <Grid item xs={12}>
                <Tabs value={value} onChange={handleChange} variant="fullWidth" aria-label="basic tabs example">
                  <Tab
                    label="Flow"
                    iconPosition="end"
                    {...a11yProps(0)}
                  />
                  <Tab
                    sx={{textAlign: "Centre"}}
                    label="Basic" {...a11yProps(2)} />
                </Tabs>
              </Grid>


              <Grid container
                    alignItems="center"
                    justifyContent="center">
                <Grid item xs={12}>

                  <TabPanel value={value} index={0}>
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                          <Grid sx={{display: "flex", flexDirection: "column", gap: "2rem"}}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                          >
                            {items?.map((item, index) => (

                              <Draggable key={item?.stepId} draggableId={item?.stepId} index={index}>
                                {(provided, snapshot) => (

                                  <Grid

                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}

                                  >
                                    <MainCard

                                      sx={{
                                        backgroundColor: selectedItem === item?.stepId ? "#d3d3d359" : "inherit"
                                      }}
                                      onClick={() => (stepProperties(item), handleDisabled(item, item?.stepId))}

                                    >
                                      <CardHeader
                                        sx={{backgroundColor: "secondary.light", width: "100%"}}
                                        title={
                                          item?.type?.charAt(0).toUpperCase()
                                          + item?.type?.slice(1)

                                        }
                                        action={
                                          <Link color="primary" href="/">
                                            <Tooltip sx={{"display": "revert"}} disableFocusListener title="Add">
                                              <Button>More</Button>
                                            </Tooltip>
                                          </Link>
                                        }
                                      />
                                      <CardActionArea component="span">
                                        {(item?.type === "message" || item?.type === "input") &&
                                          <CardContent>
                                            {
                                              isMessageDisabled?.includes(item?.stepId) ?
                                                <TextField
                                                  id="outlined-basic-fullwidth"
                                                  label="Message" value={item.text || ""}
                                                  className="MuiTypography-root MuiTypography-h4 MuiTypography-displayInline"
                                                  value={item?.text || ""}
                                                  disabled={!isMessageDisabled?.includes(item?.stepId)}
                                                  fullWidth
                                                  onChange={(e) => {
                                                    props.handleMessageUpdate(e.target.value)
                                                  }}
                                                /> : <Stack
                                                  style={item?.text !== "" ? {
                                                    border: '1px solid',
                                                    borderColor: theme.palette.grey[300],
                                                    padding: "10px"
                                                  } : {}}>
                                                  <Typography variant="h5">{item?.text}</Typography>
                                                </Stack>
                                            }


                                            {showEntities && (item?.type === "message" || item?.type === "input") &&
                                              <>
                                                <Typography variant="h5" sx={{mt: 2}}> Entities:</Typography>
                                                <Box
                                                  sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    listStyle: 'none',
                                                    border: '1px solid',
                                                    borderColor: theme.palette.grey[300],
                                                    borderRadius: 1,
                                                    minHeight: "50px",
                                                    m: 0,
                                                    p: 1.5
                                                  }}
                                                  component="ul"
                                                  key={index}
                                                >
                                                  <Stack flexDirection="row" alignItems="flex-start" flexWrap="wrap"
                                                         gap="2%" width="100%">
                                                    {item?.entityNames?.map((data, i) => (
                                                      <ListItem key={i} sx={{
                                                        padding: "0 0 10px 0",
                                                        width: "auto",
                                                        textOverflow: "ellipsis",
                                                        overflow: "hidden"
                                                      }}>
                                                        <Chip
                                                          size="medium"
                                                          variant="combined"
                                                          label={data}
                                                          onDelete={() => handleDeleteEntity(data, item?.stepId, i)}
                                                        />
                                                      </ListItem>
                                                    ))

                                                    }

                                                  </Stack>
                                                  {
                                                    isMessageDisabled?.includes(item?.stepId) &&
                                                    <TextField
                                                      placeholder="add custom entity"
                                                      value={(count === index && isCustomEntity) || ""}
                                                      onChange={(e,) => handleCustomEntity(e, index)}
                                                      fullWidth
                                                      InputProps={{
                                                        endAdornment:
                                                          (
                                                            <IconButton size="small" sx={{
                                                              fontSize: '2rem',
                                                              mt: "3px",
                                                              transform: "translate(10px,0px)"
                                                            }} onClick={() => addCustomEntity(item, index)}>
                                                              <PlusSquareOutlined/>
                                                            </IconButton>
                                                          )
                                                      }}/>
                                                  }
                                                </Box>
                                              </>
                                            }

                                          </CardContent>
                                        }
                                        {
                                          item?.type === "action" &&
                                          <CardContent>
                                            <TextField
                                              disabled={!isActionDisabled?.includes(item?.stepId)}
                                              placeholder="action url"
                                              id="url-start-adornment"
                                              onChange={(e) => {
                                                props?.handleActionUrl(e.target.value)
                                              }}
                                              value={item?.url || ""}
                                              fullWidth
                                              InputProps={{
                                                startAdornment: item?.url && 'https://'
                                              }}
                                            />
                                          </CardContent>
                                        }

                                        {/*{*/}
                                        {/*  item.itemType === "Entities" &&*/}
                                        {/*  <CardContent>*/}
                                        {/*    {editOutlined && editBox === item.id &&*/}
                                        {/*      <TextField*/}
                                        {/*        className="MuiTypography-root MuiTypography-h4 MuiTypography-displayInline"*/}
                                        {/*        value={item.message}*/}

                                        {/*        onChange={(e) => {props.handleMessageUpdate(e.target.value)}}*/}
                                        {/*      />}*/}
                                        {/*  </CardContent>*/}
                                        {/*}*/}
                                        {item.content}
                                        <ToggleButtonGroup
                                          fullWidth
                                          color="primary"
                                          exclusive
                                          aria-label="text alignment"
                                          size="small"
                                          sx={{
                                            p: 1,
                                            '& .MuiToggleButton-root': {
                                              borderRadius: 0,
                                              p: 0.75,
                                              '&:not(.Mui-selected)': {
                                                borderTopColor: 'transparent',
                                                borderBottomColor: 'transparent'
                                              },
                                              '&:first-of-type': {
                                                borderLeftColor: 'transparent'
                                              },
                                              '&:last-of-type': {
                                                borderRightColor: 'transparent'
                                              },
                                              '&:hover': {
                                                bgcolor: 'transparent',
                                                // color: theme.palette.primary.main
                                              }
                                            }
                                          }}
                                        >
                                          <ToggleButton value="web" aria-label="web" disableRipple>
                                            <SettingOutlined/>
                                          </ToggleButton>
                                          <ToggleButton
                                            onClick={() => (setEditOutlined(!editOutlined), setEditBox(item?.stepId), handleDisabled(item, item?.stepId))}
                                            value="android" aria-label="android" disableRipple>
                                            <EditOutlined/>
                                          </ToggleButton>
                                          <ToggleButton value="ios" aria-label="ios" disableRipple>
                                            <EllipsisOutlined/>
                                          </ToggleButton>
                                        </ToggleButtonGroup>

                                      </CardActionArea>
                                    </MainCard>
                                  </Grid>

                                )}
                              </Draggable>


                            ))}
                            {provided.placeholder}
                          </Grid>

                        )}

                      </Droppable>

                    </DragDropContext> </TabPanel>




                </Grid>
              </Grid>

              <Grid container alignItems="center" justifyContent="center">
                <Grid item xs={9}>
                  <TabPanel value={value} index={1}>
                    <Grid item xs={12}>
                      <Typography variant="h6">
                        DialogueID:
                      </Typography>
                      <TextField
                        id="outlined-number"
                        fullWidth
                        InputProps={{
                          readOnly: true
                        }}
                        value={props.dialogId}
                      />
                    </Grid>
                    <Grid item xs={12} sx={{mt: 2}}>
                      <Typography variant="h6">
                        DialogueName:
                      </Typography>
                      <TextField
                        id="outlined-number"
                        fullWidth
                        InputProps={{
                          readOnly: true
                        }}
                        value={props.dialogName}
                      />
                    </Grid>
                    <Grid item xs={12} sx={{mt: 2}}>
                      <Typography variant="h6">
                        IntentName:
                      </Typography>
                      <TextField
                        id="outlined-number"
                        fullWidth
                        InputProps={{
                          readOnly: true
                        }}
                        value={props.intentName}
                      />
                    </Grid>
                    {/*<Typography variant="h6">*/}
                    {/*  Nam egestas sollicitudin nisl, sit amet aliquam risus pharetra ac. Donec ac lacinia orci. Phasellus*/}
                    {/*  ut enim eu ligula placerat*/}
                    {/*  cursus in nec est.*/}
                    {/*</Typography>*/}
                  </TabPanel>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default DialogueInfo;







































