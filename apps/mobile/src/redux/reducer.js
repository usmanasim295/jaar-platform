// reducer.js
import {combineReducers} from '@reduxjs/toolkit';
import persistReducer from 'redux-persist/es/persistReducer';
import {AuthSlice} from './slices/authSlice';
import {MainSlice} from './slices/mainSlice';
import storage from '@react-native-community/async-storage';

// persist only auth
const authPersistConfig = {
  key: 'auth',
  storage,
};

const reducer = combineReducers({
  auth: persistReducer(authPersistConfig, AuthSlice.reducer),
  main: MainSlice.reducer,
});

export default reducer;
