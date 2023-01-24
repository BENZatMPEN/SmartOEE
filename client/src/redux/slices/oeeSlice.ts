import { createSlice } from '@reduxjs/toolkit';
import { Oee, OeePagedList } from '../../@types/oee';

export type OeeState = {
  isLoading: boolean;
  error: any | null;
  pagedList: OeePagedList;
  currentOee: Oee | null;
  saveError: any | null;
};

const initialState: OeeState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentOee: null,
  saveError: null,
};

const oeeSlice = createSlice({
  name: 'oee',
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
    getOeePagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentOee(state) {
      state.currentOee = null;
    },
    getOeeSuccess(state, action) {
      state.isLoading = false;
      state.currentOee = action.payload;
    },
    deleteSuccess(state) {
      state.isLoading = false;
    },
  },
});

export default oeeSlice;
