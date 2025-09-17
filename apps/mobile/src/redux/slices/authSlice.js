import {createSlice} from '@reduxjs/toolkit';

export const AuthSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    role: null,
    lang: 'en',
  },
  reducers: {
    login: {
      reducer: (state, action) => {
        state.user = action.payload;
      },
    },
    logout: {
      reducer: (state, action) => {
        state.user = null;
        state.role = null;
        state.token = null;
      },
    },
    setRole: {
      reducer: (state, action) => {
        state.role = action.payload;
      },
    },
    setToken: {
      reducer: (state, action) => {
        state.token = action.payload;
      },
    },
    setLanguage: {
      reducer: (state, action) => {
        state.lang = action.payload;
      },
    },
  },
});
