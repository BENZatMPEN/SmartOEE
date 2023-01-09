import { createSlice } from '@reduxjs/toolkit';
import { Oee, OeePagedList, OeeStatus } from '../../@types/oee';

export type OeeState = {
  isDetailsLoading: boolean;
  detailsError: Error | string | null;
  currentOee: Oee | null;
  oeeStatus: OeeStatus;
  isLoading: boolean;
  error: any | string | null;
  pagedList: OeePagedList;
};

const initialState: OeeState = {
  isDetailsLoading: false,
  detailsError: null,
  currentOee: null,
  oeeStatus: {
    running: 0,
    breakdown: 0,
    standby: 0,
    ended: 0,
    oees: [],
  },
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
};

const oeeSlice = createSlice({
  name: 'oee',
  initialState,
  reducers: {
    resetOee: () => initialState,
    startDetailsLoading(state: OeeState) {
      state.isDetailsLoading = true;
    },
    hasDetailsError(state: OeeState, action) {
      state.isDetailsLoading = false;
      state.detailsError = action.payload;
    },
    getOeeDetailsSuccess(state: OeeState, action) {
      state.isDetailsLoading = false;
      state.currentOee = action.payload;
    },
    getOeeStatusSuccess(state: OeeState, action) {
      state.isDetailsLoading = false;
      state.oeeStatus = action.payload;
    },
    updateOeeStatus(state: OeeState, action) {
      state.oeeStatus = action.payload;
    },
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getOeesSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    emptyCurrentOee(state) {
      state.currentOee = null;
    },
    createOeeSuccess(state) {
      state.isDetailsLoading = false;
    },
    updateOeeSuccess(state) {
      state.isDetailsLoading = false;
    },
  },
});

export default oeeSlice;
