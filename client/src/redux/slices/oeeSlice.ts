import { createSlice } from '@reduxjs/toolkit';
import { Oee, OeeStatus } from '../../@types/oee';

export type OeeState = {
  isLoading: boolean;
  error: Error | string | null;
  selectedOee: Oee | null;
  oeeStatus: OeeStatus;
};

const initialState: OeeState = {
  isLoading: false,
  error: null,
  selectedOee: null,
  oeeStatus: {
    running: 0,
    breakdown: 0,
    standby: 0,
    ended: 0,
    oees: [],
  },
};

const oeeSlice = createSlice({
  name: 'oee',
  initialState,
  reducers: {
    resetOee: () => initialState,
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getOeeSuccess(state, action) {
      state.isLoading = false;
      state.selectedOee = action.payload;
    },
    getOeeStatusSuccess(state, action) {
      state.isLoading = false;
      state.oeeStatus = action.payload;
    },
    updateOeeStatus(state, action) {
      state.oeeStatus = action.payload;
    },
  },
});

export default oeeSlice;
