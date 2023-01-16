import { createSlice } from '@reduxjs/toolkit';
import { Site } from '../../@types/site';

export type SiteState = {
  isLoading: boolean;
  error: any | null;
  currentSite: Site | null;
  saveError: any | null;
};

const initialState: SiteState = {
  isLoading: false,
  error: null,
  currentSite: null,
  saveError: null,
};

const siteSlice = createSlice({
  name: 'site',
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
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentSite(state) {
      state.currentSite = null;
    },
    getSiteSuccess(state, action) {
      state.isLoading = false;
      state.currentSite = action.payload;
    },
  },
});

export default siteSlice;
