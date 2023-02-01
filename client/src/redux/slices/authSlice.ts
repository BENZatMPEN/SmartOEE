import { createSlice } from '@reduxjs/toolkit';
import { User } from '../../@types/user';

export type AuthState = {
  isLoading: boolean;
  error: any | string | null;
  userProfile: User | null;
  saveError: any | null;
};

const initialState: AuthState = {
  isLoading: false,
  error: null,
  userProfile: null,
  saveError: null,
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
    getUserProfileSuccess(state, action) {
      state.isLoading = false;
      state.userProfile = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
  },
});

export default authSlice;
