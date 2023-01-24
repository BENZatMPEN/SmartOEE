import { createSlice } from '@reduxjs/toolkit';
import { Role, RolePagedList } from '../../@types/role';

export type RoleState = {
  isLoading: boolean;
  error: any | null;
  pagedList: RolePagedList;
  currentRole: Role | null;
  saveError: any | null;
};

const initialState: RoleState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentRole: null,
  saveError: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getRolePagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentRole(state) {
      state.currentRole = null;
    },
    getRoleSuccess(state, action) {
      state.isLoading = false;
      state.currentRole = action.payload;
    },
    deleteSuccess(state) {
      state.isLoading = false;
    },
  },
});

export default roleSlice;
