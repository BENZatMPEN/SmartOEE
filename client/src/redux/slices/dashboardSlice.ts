import { createSlice } from '@reduxjs/toolkit';
import { Dashboard, DashboardPagedList } from '../../@types/dashboard';

export type DashboardState = {
  isLoading: boolean;
  error: any | null;
  pagedList: DashboardPagedList;
  currentDashboard: Dashboard | null;
  saveError: any | null;
};

const initialState: DashboardState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentDashboard: null,
  saveError: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
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
    getDashboardsSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentDashboard(state) {
      state.currentDashboard = null;
    },
    getDashboardDetailsSuccess(state, action) {
      state.currentDashboard = action.payload;
    },
  },
});

export default dashboardSlice;
