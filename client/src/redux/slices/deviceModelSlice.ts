import { createSlice } from '@reduxjs/toolkit';
import { DeviceModel, DeviceModelPagedList } from '../../@types/deviceModel';

export type DeviceModelState = {
  isLoading: boolean;
  error: any | null;
  pagedList: DeviceModelPagedList;
  currentDeviceModel: DeviceModel | null;
  saveError: any | null;
};

const initialState: DeviceModelState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentDeviceModel: null,
  saveError: null,
};

const deviceModelSlice = createSlice({
  name: 'deviceModel',
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
    getDeviceModelsSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentDeviceModel(state) {
      state.currentDeviceModel = null;
    },
    getDeviceModelDetailsSuccess(state, action) {
      state.currentDeviceModel = action.payload;
    },
  },
});

export default deviceModelSlice;
