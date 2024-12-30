import React, {useEffect, useState} from "react";

import {useLocation, Link, Outlet} from 'react-router-dom';
import PropTypes from 'prop-types';
import {useTheme} from '@mui/material/styles';

const avatarImage = require.context('assets/images/users', true);


// material-ui
import {
  Button,
  Fab,
  Stack,
  FormControl,
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
  InputLabel,
  DialogTitle, ListItemAvatar, Avatar, Dialog, CardHeader

} from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
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
  MenuUnfoldOutlined,
  PlusSquareOutlined
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

const data = [
  {
    id: "item-1",
    content: <MainCard
      title="Message"
      secondary={

        <Link color="primary" href="/">
          <Tooltip sx={{"display": "revert"}} disableFocusListener title="Add">
            <Button>More</Button>
          </Tooltip>
        </Link>
      }
      content={false}
    >
      <CardContent>

        <Typography variant="body1">I can help you with That</Typography>
      </CardContent>
      <Divider/>
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
        <ToggleButton value="android" aria-label="android" disableRipple>
          <EditOutlined/>
        </ToggleButton>
        <ToggleButton value="ios" aria-label="ios" disableRipple>
          <EllipsisOutlined/>
        </ToggleButton>
      </ToggleButtonGroup>
    </MainCard>
  },
  {
    id: "item-2",
    content: <MainCard
      title="Question"
      secondary={
        <Link color="primary" href="/">
          <Tooltip sx={{"display": "revert"}} disableFocusListener title="Add">
            <Button>More</Button>
          </Tooltip>
        </Link>
      }
      content={false}


    >
      <CardContent>

        <Typography variant="body1" sx={{marginBottom: "32px"}}>Please provide me your case number </Typography>
        <TextField required id="outlined-required" sx={{
          width: "312px",
          marginLeft: "-21px"
        }} placeholder="Entity Name*"/>
      </CardContent>
      <Divider/>
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
        <ToggleButton value="android" aria-label="android" disableRipple>
          <EditOutlined/>
        </ToggleButton>
        <ToggleButton value="ios" aria-label="ios" disableRipple>
          <EllipsisOutlined/>
        </ToggleButton>
      </ToggleButtonGroup>
    </MainCard>
  },
  {
    id: "item-3",
    content: <MainCard
      title="Action"
      secondary={
        <Link color="primary" href="/">
          <Tooltip sx={{"display": "revert"}} disableFocusListener title="Add">
            <Button>More</Button>
          </Tooltip>
        </Link>
      }
      content={false}


    >
      <CardContent>


        <TextField
          placeholder="action url"
          id="url-start-adornment"
          InputProps={{
            startAdornment: 'https://'
          }}
        />
      </CardContent>
      <Divider/>
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
        <ToggleButton value="android" aria-label="android" disableRipple>
          <EditOutlined/>
        </ToggleButton>
        <ToggleButton value="ios" aria-label="ios" disableRipple>
          <EllipsisOutlined/>
        </ToggleButton>
      </ToggleButtonGroup>
    </MainCard>,
  }

];

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


const MessageInfo = (props) => {
  const theme = useTheme();
  const [disableButton, setDisableButton] = useState(true)
  const [editEntities, setEditEntities] = useState([])
  const [isCustomEntity, setIsCustomEntity] = useState("")


  useEffect(() => {
    setEditEntities(props?.entities)
  }, [props?.entities])


  //for updating the message on edit
  const handleChange = (message) => {
    props.updateMessage(message)
  };

  const handleDeleteEntity = (data, index) => {
    if (index > -1) {
      props?.data?.steps?.map((item, i) => {
        item?.entityNames?.filter((ele, index) => {
          if (ele === data) {
            item?.entityNames?.splice(index, 1)
          }
        })
      })
      editEntities?.splice(index, 1);
    }
    setEditEntities((prev) => [
      ...prev
    ]);
    props.handleEntity(data)
  }
  const handleCustomEntity = (e) => {
    setIsCustomEntity(e.target.value)
  }
  const addCustomEntity = () => {
    if (isCustomEntity && isCustomEntity !== "") {
      props?.entities?.push(isCustomEntity)
      props.addEntityFromStepProp(isCustomEntity)
      setIsCustomEntity("")
    }
  }

  return (

    <Grid container>
      <Grid item xs={12} sm={6} md={12} >
        <CardHeader
          sx={{padding:"0"}}
          title={
            <TextField
              id="outlined-basic-fullwidth"
              label="Message"
              fullWidth
              disabled={disableButton}
              InputProps={{
                endAdornment: (
                  <Link onClick={() => setDisableButton(!disableButton)}>
                    <EditTwoToneIcon/>
                  </Link>
                )
              }}
              required id="outlined-required" placeholder="Required *"
              value={props?.message || ""}
              onChange={(e) => handleChange(e.target.value)}
            />
          }

        />
      </Grid>
      <Grid item xs={12} sx={{mt: 2}}>
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
            p: 1.5,
            m: 0
          }}
          component="ul"
        >
          <Stack flexDirection="row" alignItems="flex-start" flexWrap="wrap" gap="2%" width="100%">
            {editEntities?.map((data, i) => (
              <ListItem key={i}
                        sx={{padding: "0 0 10px 0", width: "auto", textOverflow: "ellipsis", overflow: "hidden"}}>
                <Chip
                  size="small"
                  variant="combined"
                  label={data}
                  onDelete={() => handleDeleteEntity(data, i)}
                />
              </ListItem>
            ))

            }
          </Stack>
          <TextField
            placeholder="add custom entity"
            value={isCustomEntity || ""}
            onChange={handleCustomEntity}
            InputProps={{
              endAdornment:
                (
                  <IconButton size="small" sx={{
                    fontSize: '2rem',
                    mt: "3px",
                    transform: "translate(10px,0px)"
                  }}
                              onClick={addCustomEntity}>
                    <PlusSquareOutlined/>
                  </IconButton>
                )
            }}/>
        </Box>

      </Grid>
    </Grid>
  );
};

export default MessageInfo;







































