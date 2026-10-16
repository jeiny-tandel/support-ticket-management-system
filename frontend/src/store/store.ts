import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import ticketsReducer from './tickets/ticketsSlice';
import commentsReducer from './comments/commentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketsReducer,
    comments: commentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
