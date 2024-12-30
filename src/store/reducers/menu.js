// third-party
import { createSlice } from '@reduxjs/toolkit';

// initial state
const initialState = {
  openItem: ['dashboard'],
  openComponent: 'buttons',
  drawerOpen: true,
  componentDrawerOpen: false
};

// ==============================|| SLICE - MENU ||============================== //

const menu = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    activeItem(state, action) {
      state.openItem = action.payload.openItem;
    },

    activeComponent(state, action) {
      state.openComponent = action.payload.openComponent;
    },

    openDrawer(state, action) {
      state.drawerOpen = action.payload.drawerOpen;
    },

    openComponentDrawer(state, action) {
      state.componentDrawerOpen = action.payload.componentDrawerOpen;
    },
    triggerWorkerFunction(state,action){
      state.triggerWorker = action.payload
    },
  }
});

export default menu.reducer;

export const { activeItem, activeComponent, openDrawer, openComponentDrawer, triggerWorkerFunction } = menu.actions;
