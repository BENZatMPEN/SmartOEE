import { createSlice } from '@reduxjs/toolkit';
import { Role } from '../../@types/role';

export type AuthState = {
  isLoading: boolean;
  error: any | string | null;
  role: Role | null;
};

const initialState: AuthState = {
  isLoading: false,
  error: null,
  role: null,
};

const deviceSlice = createSlice({
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
    getRoleSuccess(state, action) {
      state.isLoading = false;
      state.role = action.payload;
    },
  },
});

export default deviceSlice;
