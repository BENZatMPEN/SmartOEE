import { createSlice } from '@reduxjs/toolkit';
import { Device, DevicePagedList } from '../../@types/device';

export type DeviceState = {
  isLoading: boolean;
  error: any | string | null;
  pagedList: DevicePagedList;
  isDetailsLoading: boolean;
  currentDevice: Device | null;
  detailsError: any | string | null;
};

const initialState: DeviceState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  isDetailsLoading: false,
  currentDevice: null,
  detailsError: null,
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getDevicesSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startDetailsLoading(state) {
      state.isDetailsLoading = true;
    },
    hasDetailsError(state, action) {
      state.isDetailsLoading = false;
      state.detailsError = action.payload;
    },
    emptyCurrentDevice(state) {
      state.currentDevice = null;
    },
    getDeviceDetailsSuccess(state, action) {
      state.isDetailsLoading = false;
      state.currentDevice = action.payload;
    },
    createDeviceSuccess(state) {
      state.isDetailsLoading = false;
    },
    updateDeviceSuccess(state) {
      state.isDetailsLoading = false;
    },
  },
});

export default deviceSlice;
