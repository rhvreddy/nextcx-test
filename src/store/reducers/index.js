// third-party
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// project import
import chat from './chat';
import menu from './menu';
import snackbar from './snackbar';
import cartReducer from './cart';
import kanban from './kanban';
import menuItems from './menuItems'
import profile from './profile'
import botRecords from './botRecords'
import userRecords from "./userRecords";

// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  menuItems,
  chat,
  menu,
  profile,
  snackbar,
  botRecords,
  userRecords,
  cart: persistReducer(
    {
      key: 'cart',
      storage,
      keyPrefix: 'mantis-ts-'
    },
    cartReducer
  ),
  kanban
});

export default reducers;
