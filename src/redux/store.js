import { configureStore } from '@reduxjs/toolkit';
import { api } from './base-url/baseUrlApi';
// import { api } from './apiSlice'; // your RTK Query API
// import userReducer from './userSlice'; // your regular slice

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer, // RTK Query reducer
    // user: userReducer,             // any other slice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(api.middleware),       // add RTK Query middleware
});
