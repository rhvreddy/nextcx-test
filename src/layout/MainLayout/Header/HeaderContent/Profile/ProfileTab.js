import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// assets
import { EditOutlined, ProfileOutlined, LogoutOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

const ProfileTab = ({ handleLogout, handleClose }) => {
  const [selectedIndex, setSelectedIndex] = useState();
  const navigate = useNavigate();

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
    navigate('/apps/profiles/user/personal')
    handleClose(event)
  };

  return (
    <List
      component="nav"
      sx={{
        pt: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <ListItemButton
        sx={{
          color: "primary.main",
          px:"50%",
          '&:hover': {
            bgcolor: "primary.lighter",
          }
        }}
        selected={selectedIndex === 1}
        onClick={(event) => handleListItemClick(event, 1)}
      >
        <ListItemIcon>
          <UserOutlined style={{ color: "#6e45e9" }} />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </ListItemButton>
      <ListItemButton
        sx={{
          color: "primary.main",
          px:"50%",
          '&:hover': {
            bgcolor: "primary.lighter",
          }
        }}
        selected={selectedIndex === 2}
        onClick={handleLogout}
      >
        <ListItemIcon>
          <LogoutOutlined style={{ color: "#6e45e9" }} />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
};

ProfileTab.propTypes = {
  handleLogout: PropTypes.func
};

export default ProfileTab;
