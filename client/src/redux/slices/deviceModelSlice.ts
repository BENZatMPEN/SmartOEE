import { createSlice } from '@reduxjs/toolkit';
import { DeviceModel, DeviceModelPagedList } from '../../@types/deviceModel';

export type DeviceModelState = {
  isLoading: boolean;
  error: any | string | null;
  pagedList: DeviceModelPagedList;
  isDetailsLoading: boolean;
  currentDeviceModel: DeviceModel | null;
  detailsError: any | string | null;
};

const initialState: DeviceModelState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  isDetailsLoading: false,
  currentDeviceModel: null,
  detailsError: null,
};

const deviceModelSlice = createSlice({
  name: 'deviceModel',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getDeviceModelsSuccess(state, action) {
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
    emptyCurrentDeviceModel(state) {
      state.currentDeviceModel = null;
    },
    getDeviceModelDetailsSuccess(state, action) {
      state.isDetailsLoading = false;
      state.currentDeviceModel = action.payload;
    },
    createDeviceModelSuccess(state) {
      state.isDetailsLoading = false;
    },
    updateDeviceModelSuccess(state) {
      state.isDetailsLoading = false;
    },
  },
});

export default deviceModelSlice;
