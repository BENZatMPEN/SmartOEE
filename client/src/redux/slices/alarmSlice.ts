import { createSlice } from '@reduxjs/toolkit';
import { Alarm, AlarmPagedList } from '../../@types/alarm';

export type AlarmState = {
  isLoading: boolean;
  error: any | null;
  pagedList: AlarmPagedList;
  currentAlarm: Alarm | null;
  saveError: any | null;
};

const initialState: AlarmState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentAlarm: null,
  saveError: null,
};

const alarmSlice = createSlice({
  name: 'alarm',
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
    getAlarmPagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentAlarm(state) {
      state.currentAlarm = null;
    },
    getAlarmSuccess(state, action) {
      state.isLoading = false;
      state.currentAlarm = action.payload;
    },
    deleteSuccess(state) {
      state.isLoading = false;
    },
  },
});

export default alarmSlice;
