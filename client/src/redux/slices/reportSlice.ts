import { createSlice } from '@reduxjs/toolkit';
import { OptionItem } from '../../@types/option';
import { ReportCriteria } from '../../@types/report';

export type ReportState = {
  oeeOpts: OptionItem[];
  productOpts: OptionItem[];
  batchOpts: OptionItem[];
  currentCriteria: ReportCriteria | null;
};

const initialState: ReportState = {
  oeeOpts: [],
  productOpts: [],
  batchOpts: [],
  currentCriteria: null,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    getOeeOptsSuccess(state, action) {
      state.oeeOpts = action.payload;
    },
    getProductOptsSuccess(state, action) {
      state.productOpts = action.payload;
    },
    getBatchOptsSuccess(state, action) {
      state.batchOpts = action.payload;
    },
    updateCurrentCriteria(state, action) {
      state.currentCriteria = action.payload;
    },
  }
});

export default reportSlice;
