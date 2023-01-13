import { createSlice } from '@reduxjs/toolkit';
import { PlannedDowntime, PlannedDowntimePagedList } from '../../@types/plannedDowntime';

export type PlannedDowntimeState = {
  isLoading: boolean;
  error: any | null;
  pagedList: PlannedDowntimePagedList;
  currentPlannedDowntime: PlannedDowntime | null;
  saveError: any | null;
};

const initialState: PlannedDowntimeState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentPlannedDowntime: null,
  saveError: null,
};

const plannedDowntimeSlice = createSlice({
  name: 'plannedDowntime',
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
    getPlannedDowntimesSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentPlannedDowntime(state) {
      state.currentPlannedDowntime = null;
    },
    getPlannedDowntimeDetailsSuccess(state, action) {
      state.currentPlannedDowntime = action.payload;
    },
  },
});

export default plannedDowntimeSlice;
