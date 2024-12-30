import {useState} from 'react';
// material-ui
import {
  Typography,
  Avatar,
  ListItemAvatar,
  Grid,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  // Link
} from '@mui/material';
import {Link} from 'react-router-dom';

// project import
import MainCard from 'components/MainCard';

// assets
import {
  DownOutlined,
  LayoutOutlined,
  RadiusUprightOutlined,
  SettingOutlined,
  UpOutlined,
  MessageOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';

// ==============================|| LIST - NESTED ||============================== //

const NavBarList = (props) => {
  const [open, setOpen] = useState('primary');

  return (
    <MainCard content={false}>
      <Grid container>
        <Grid item xs={12}>
          <ListItem disablePadding divider>
            <Link to={'/welcome'} style={{textDecoration: 'none'}}>
              <ListItemButton>
                <ListItemAvatar sx={{
                  marginLeft: "-13px",
                  marginRight: "-1px"
                }}>
                  <Avatar
                    sx={{
                      color: 'inherit',
                      bgcolor: 'white',
                    }}
                  >
                    <MessageOutlined/>
                  </Avatar>
                </ListItemAvatar>
                <Typography component="span" variant="subtitle1" sx={{marginLeft: "-15px"}}>
                  <ListItemText primary="Welcome"/>
                </Typography>
              </ListItemButton>
            </Link>
          </ListItem>
        </Grid>
        <Grid item xs={12}>
          <ListItem disablePadding divider>
            <ListItemButton>
              <ListItemIcon sx={{
                marginLeft: "-2px",
                marginRight: "2px"
              }}>
                <MenuUnfoldOutlined/>
              </ListItemIcon>

              <ListItemText primary="Menu Levels"/>
              {open === 'Menu Levels' ? <UpOutlined style={{fontSize: '0.75rem'}}/> :
                <DownOutlined style={{fontSize: '0.75rem'}}/>}
            </ListItemButton>
          </ListItem>
          <Collapse in={open === 'Menu Levels'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{bgcolor: 'secondary.100'}}>
              <ListItemButton sx={{pl: 5}}>
                <ListItemText primary="List item 03"/>
              </ListItemButton>
              <ListItemButton sx={{pl: 5}}>
                <ListItemText primary="List item 04"/>
              </ListItemButton>
            </List>
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <ListItem disablePadding divider>
            <ListItemButton component={Link} to="/memory">
              <ListItemText primary="Clear Memory"/>
            </ListItemButton>
          </ListItem>
        </Grid>
        <Grid item xs={12}>
          <ListItem disablePadding divider>
            <ListItemButton>
              <ListItemText primary="Anything Else ?"/>
            </ListItemButton>
          </ListItem>
        </Grid>
        <Grid item xs={12}>
          <ListItem disablePadding divider>
            <ListItemButton>
              <ListItemText primary="Confused"/>
            </ListItemButton>
          </ListItem>
        </Grid>

      </Grid>
    </MainCard>

  );
};

export default NavBarList;
