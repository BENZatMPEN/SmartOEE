import { createSlice } from '@reduxjs/toolkit';
import { Oee, OeeStatus } from '../../@types/oee';

export type OeeDashboardState = {
  selectedOee: Oee | null;
  oeeStatus: OeeStatus;
  isLoading: boolean;
  error: any | null;
  formTimeline : {
    start : string;
    end : string;
  }
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
  formTimeline : {
    start : '',
    end : '',
  }
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
    setFormTimeline(state, action) {
      state.formTimeline = action.payload;;
    },
  },
});

export default oeeDashboardSlice;
