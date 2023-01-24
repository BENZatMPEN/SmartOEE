import { createSlice } from '@reduxjs/toolkit';
import { Machine, MachinePagedList } from '../../@types/machine';

export type MachineState = {
  isLoading: boolean;
  error: any | null;
  pagedList: MachinePagedList;
  currentMachine: Machine | null;
  saveError: any | null;
};

const initialState: MachineState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentMachine: null,
  saveError: null,
};

const machineSlice = createSlice({
  name: 'machine',
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
    getMachinePagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentMachine(state) {
      state.currentMachine = null;
    },
    getMachineSuccess(state, action) {
      state.isLoading = false;
      state.currentMachine = action.payload;
    },
    deleteSuccess(state) {
      state.isLoading = false;
    },
  },
});

export default machineSlice;
