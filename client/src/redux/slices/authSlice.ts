import { createSlice } from '@reduxjs/toolkit';
import { User } from '../../@types/user';

export type AuthState = {
  isLoading: boolean;
  error: any | string | null;
  userInfo: User | null;
};

const initialState: AuthState = {
  isLoading: false,
  error: null,
  userInfo: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: () => initialState,
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getUserInfoSuccess(state, action) {
      state.isLoading = false;
      state.userInfo = action.payload;
    },
  },
});

export default authSlice;
