import {createSlice} from '@reduxjs/toolkit';

export const MainSlice = createSlice({
  name: 'main',
  initialState: {
    activeScreen: 'Home',
  },
  reducers: {
    set_active_screen: {
      reducer: (state, action) => {
        state.activeScreen = action.payload;
      },
    },
  },
});
