import { createSlice } from '@reduxjs/toolkit';
import { Analytic, AnalyticCriteria } from '../../@types/analytic';
import { OptionItem } from '../../@types/option';

export type AnalyticState = {
  isGroupLoading: boolean;
  groupError: Error | string | null;
  groupAnalytics: Analytic[];
  isLoading: boolean;
  error: Error | string | null;
  analytics: Analytic[];
  currentAnalytics: Analytic | null;
  oeeOpts: OptionItem[];
  productOpts: OptionItem[];
  batchOpts: OptionItem[];
  operatorOpts: OptionItem[];
  currentCriteria: AnalyticCriteria | null;
};

const initialState: AnalyticState = {
  isGroupLoading: false,
  groupError: null,
  groupAnalytics: [],
  isLoading: false,
  error: null,
  analytics: [],
  currentAnalytics: null,
  oeeOpts: [],
  productOpts: [],
  batchOpts: [],
  operatorOpts: [],
  currentCriteria: null,
};

const analyticSlice = createSlice({
  name: 'analytic',
  initialState,
  reducers: {
    startGroupLoading(state) {
      state.isGroupLoading = true;
    },
    hasGroupError(state, action) {
      state.isGroupLoading = false;
      state.groupError = action.payload;
    },
    getGroupAnalyticsSuccess(state, action) {
      state.isGroupLoading = false;
      state.groupAnalytics = action.payload;
    },
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getAnalyticsSuccess(state, action) {
      state.isLoading = false;
      state.analytics = action.payload;
    },
    createAnalyticSuccess(state, action) {
      state.isLoading = false;
      const { group } = action.payload;
      if (group) {
        state.groupAnalytics = [...state.groupAnalytics, action.payload];
      } else {
        state.analytics = [...state.analytics, action.payload];
      }
    },
    updateAnalyticSuccess(state, action) {
      const { id, group } = action.payload;
      const tmp = [...(group ? state.groupAnalytics : state.analytics)];
      const itemIdx = tmp.findIndex((item) => item.id === id);
      tmp[itemIdx] = action.payload;

      if (group) {
        state.groupAnalytics = [...tmp];
      } else {
        state.analytics = [...tmp];
      }
    },
    deleteAnalyticSuccess(state, action) {
      const { id, group } = action.payload;
      const tmp = [...(group ? state.groupAnalytics : state.analytics)];
      const itemIdx = tmp.findIndex((item) => item.id === id);
      tmp.splice(itemIdx, 1);

      if (group) {
        state.groupAnalytics = [...tmp];
      } else {
        state.analytics = [...tmp];
      }
    },
    updateCurrentAnalytics(state, action) {
      state.currentAnalytics = action.payload;
    },
    updateCurrentCriteria(state, action) {
      state.currentCriteria = action.payload;
    },
    getOeeOptsSuccess(state, action) {
      state.oeeOpts = action.payload;
    },
    getProductOptsSuccess(state, action) {
      state.productOpts = action.payload;
    },
    getBatchOptsSuccess(state, action) {
      state.batchOpts = action.payload;
    },

    getOperatorOptsSuccess(state, action) {
      state.operatorOpts = action.payload;
    }
  },
});

export default analyticSlice;
