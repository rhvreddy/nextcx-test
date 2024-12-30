import {useState, useRef, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';

// material-ui
import {Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';
import {Grid} from '@mui/material';

// project import
import MainCard from 'components/MainCard';


// ==============================|| LIST - NESTED ||============================== //

const NestedList = (props) => {

  const [open, setOpen] = useState('primary');
  const [openChild, setOpenChild] = useState('');
  const [itemClicked, setItemClicked] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(props.basicScreenData);
    setItemClicked(props?.basicScreenData?.[0]?.dialogName);
  },[]);

  const handleClick = (page) => {
    setOpen(open !== page ? page : '');
    setOpenChild('');
    setItemClicked(page);
    props.dialogClicked(page);
  };


  return (
    <MainCard content={false}>
      <Grid container>
        <Grid item xs={12}>
          <ListItem sx={{fontSize: "11px", color: "grey"}}>
            <FormattedMessage defaultMessage="Available Dialogs" id="Available Dialogs"/>
          </ListItem>
          {items?.map((item, index) => (

            <List sx={{p: 0}} key={index}>
              <ListItem disablePadding divider>
                {itemClicked === item?.dialogName ?
                  <ListItemButton onClick={() => {
                    handleClick(item?.dialogName)
                  }} selected>
                    <ListItemText primary={item?.dialogName}/>
                  </ListItemButton> : <ListItemButton onClick={() => {
                    handleClick(item?.dialogName)
                  }}>
                    <ListItemText primary={item?.dialogName}/>
                  </ListItemButton>


                }
              </ListItem>

            </List>
          ))}
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default NestedList;
