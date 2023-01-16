import { createSlice } from '@reduxjs/toolkit';
import { Site, SitePagedList } from '../../@types/site';

export type AdminSiteState = {
  isLoading: boolean;
  error: any | null;
  pagedList: SitePagedList;
  currentSite: Site | null;
  saveError: any | null;
};

const initialState: AdminSiteState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentSite: null,
  saveError: null,
};

const adminSiteSlice = createSlice({
  name: 'adminSite',
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
    getSitePagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
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

export default adminSiteSlice;
