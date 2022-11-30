import { createSlice } from '@reduxjs/toolkit';
import { Site } from '../../@types/site';

export type SiteState = {
  isLoading: boolean;
  error: Error | string | null;
  sites: Site[];
  selectedSiteId: number | null;
  selectedSite: Site | null;
  ganttView: boolean;
};

const initialState: SiteState = {
  isLoading: false,
  error: null,
  sites: [],
  selectedSiteId: null,
  selectedSite: null,
  ganttView: false,
};

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    selectSite(state, action) {
      state.selectedSiteId = action.payload;
    },
    getSitesSuccess(state, action) {
      state.isLoading = false;
      state.sites = action.payload;

      if (state.selectedSiteId) {
        const idx = state.sites.findIndex((site) => site.id === state.selectedSiteId);
        state.selectedSite = idx >= 0 ? state.sites[idx] : null;
      }
    },
    setGanttView(state, action) {
      state.ganttView = action.payload;
    },
  },
});

export default siteSlice;
