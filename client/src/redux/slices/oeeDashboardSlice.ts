import { createSlice } from '@reduxjs/toolkit';
import { Oee, OeeStatus } from '../../@types/oee';

export type OeeDashboardState = {
  selectedOee: Oee | null;
  oeeStatus: OeeStatus;
  isLoading: boolean;
  error: any | null;
};

const initialState: OeeDashboardState = {
  selectedOee: null,
  oeeStatus: {
    running: 0,
    breakdown: 0,
    standby: 0,
    ended: 0,
    mcSetup: 0,
    oees: [],
  },
  isLoading: false,
  error: null,
};

const oeeDashboardSlice = createSlice({
  name: 'oeeDashboard',
  initialState,
  reducers: {
    // resetOee: () => initialState,
    getOeeStatusSuccess(state, action) {
      state.isLoading = false;
      state.oeeStatus = action.payload;
    },
    updateOeeStatus(state, action) {
      state.oeeStatus = action.payload;
    },
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getOeeSuccess(state, action) {
      state.isLoading = false;
      state.selectedOee = action.payload;
    },
    emptySelectedOee(state) {
      state.selectedOee = null;
    },
  },
});

export default oeeDashboardSlice;
