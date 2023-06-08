import { createSlice } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

const initialState = {
  isOpen: false,
};

const drawerSlice = createSlice({
  name: 'drawer',
  initialState,
  reducers: {
    toggleDrawer: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const drawerReducer = drawerSlice.reducer;

export const useDrawer = () => {
  const dispatch = useAppDispatch();
  const drawer = useAppSelector((state) => state.drawer);

  const toggleDrawer = () => dispatch(drawerSlice.actions.toggleDrawer());

  return {
    drawer,
    toggleDrawer,
  };
};
