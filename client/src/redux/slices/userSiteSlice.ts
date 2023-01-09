import { createSlice } from '@reduxjs/toolkit';
import { Site } from '../../@types/site';

export type SiteState = {
  isLoading: boolean;
  userSites: Site[];
  selectedSiteId: number | null;
  selectedSite: Site | null;
  ganttView: boolean;
};

const initialState: SiteState = {
  isLoading: false,
  userSites: [],
  selectedSiteId: null,
  selectedSite: null,
  ganttView: false,
};

const userSiteSlice = createSlice({
  name: 'userSite',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    selectSite(state, action) {
      state.selectedSiteId = action.payload;
    },
    getUserSitesSuccess(state, action) {
      state.isLoading = false;
      state.userSites = action.payload;

      if (state.selectedSiteId) {
        const idx = state.userSites.findIndex((item) => item.id === state.selectedSiteId);
        state.selectedSite = idx >= 0 ? state.userSites[idx] : null;
      }
    },
    setGanttView(state, action) {
      state.ganttView = action.payload;
    },
  },
});

export default userSiteSlice;
