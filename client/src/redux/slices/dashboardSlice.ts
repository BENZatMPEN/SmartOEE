import { createSlice } from '@reduxjs/toolkit';
import { Dashboard, DashboardPagedList } from '../../@types/dashboard';

export type DashboardState = {
  isLoading: boolean;
  error: any | string | null;
  pagedList: DashboardPagedList;
  isDetailsLoading: boolean;
  currentDashboard: Dashboard | null;
  detailsError: any | string | null;
  allDashboard: Dashboard[];
};

const initialState: DashboardState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  allDashboard: [],
  isDetailsLoading: false,
  currentDashboard: null,
  detailsError: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getDashboardsSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    getAllDashboardsSuccess(state, action) {
      state.isLoading = false;
      state.allDashboard = action.payload;
    },
    startDetailsLoading(state) {
      state.isDetailsLoading = true;
    },
    hasDetailsError(state, action) {
      state.isDetailsLoading = false;
      state.detailsError = action.payload;
    },
    emptyCurrentDashboard(state) {
      state.currentDashboard = null;
    },
    getDashboardDetailsSuccess(state, action) {
      state.isDetailsLoading = false;
      state.currentDashboard = action.payload;
    },
    createDashboardSuccess(state, action) {
      state.isDetailsLoading = false;
      state.allDashboard = [...state.allDashboard, action.payload];
    },
    updateDashboardSuccess(state, action) {
      state.isDetailsLoading = false;

      const { id } = action.payload;
      const tmp = [...state.allDashboard];
      const itemIdx = tmp.findIndex((item) => item.id === id);
      tmp[itemIdx] = action.payload;
      state.allDashboard = [...tmp];
    },
  },
});

export default dashboardSlice;
