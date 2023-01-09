import { createSlice } from '@reduxjs/toolkit';
import { OptionItem } from '../../@types/option';
import { Site, SitePagedList } from '../../@types/site';

export type SiteState = {
  isLoading: boolean;
  siteOptions: OptionItem[];
  pagedList: SitePagedList;
  isDetailsLoading: boolean;
  currentSite: Site | null;
};

const initialState: SiteState = {
  isLoading: false,
  siteOptions: [],
  pagedList: {
    list: [],
    count: 0,
  },
  isDetailsLoading: false,
  currentSite: null,
};

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    getSiteOptionsSuccess(state, action) {
      state.isLoading = false;
      state.siteOptions = action.payload;
    },
    emptySiteOptions(state) {
      state.siteOptions = [];
    },
    getSitePagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startDetailsLoading(state) {
      state.isDetailsLoading = true;
    },
    emptyCurrentSite(state) {
      state.currentSite = null;
    },
    getSiteSuccess(state, action) {
      state.isDetailsLoading = false;
      state.currentSite = action.payload;
    },
    createSiteSuccess(state) {
      state.isDetailsLoading = false;
    },
    updateSiteSuccess(state) {
      state.isDetailsLoading = false;
    },
  },
});

export default siteSlice;
