import { Dashboard } from '../../@types/dashboard';
import { Site } from '../../@types/site';
import axios from '../../utils/axios';
import userSiteSlice from '../slices/userSiteSlice';
import { dispatch } from '../store';

export const { selectSite, setGanttView } = userSiteSlice.actions;

export function getUserSites() {
  return async () => {
    dispatch(userSiteSlice.actions.startLoading());

    try {
      const response = await axios.get<Site[]>(`/sites/user-sites`);
      dispatch(userSiteSlice.actions.getUserSitesSuccess(response.data));
    } catch (error) {
      dispatch(userSiteSlice.actions.getUserSitesSuccess([]));
    }
  };
}

export function getAllDashboard() {
  return async () => {
    try {
      const response = await axios.get<Dashboard[]>(`/dashboard/all`);
      dispatch(userSiteSlice.actions.getAllDashboardsSuccess(response.data));
    } catch (error) {
      dispatch(userSiteSlice.actions.getAllDashboardsSuccess([]));
    }
  };
}
