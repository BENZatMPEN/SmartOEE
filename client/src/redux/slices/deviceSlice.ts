import { createSlice } from '@reduxjs/toolkit';
import { Device, DevicePagedList } from '../../@types/device';

export type DeviceState = {
  isLoading: boolean;
  error: any | null;
  pagedList: DevicePagedList;
  currentDevice: Device | null;
  saveError: any | null;
};

const initialState: DeviceState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentDevice: null,
  saveError: null,
};

const deviceSlice = createSlice({
  name: 'device',
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
    getDevicePagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentDevice(state) {
      state.currentDevice = null;
    },
    getDeviceSuccess(state, action) {
      state.isLoading = false;
      state.currentDevice = action.payload;
    },
  },
});

export default deviceSlice;
