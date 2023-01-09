import { Site } from '../../@types/site';
import axios from '../../utils/axios';
import userSiteSlice from '../slices/userSiteSlice';
import { dispatch } from '../store';

export const { selectSite, setGanttView } = userSiteSlice.actions;

export function getUserSites() {
  return async () => {
    dispatch(userSiteSlice.actions.startLoading());
    const response = await axios.get<Site[]>(`/sites/user-sites`);
    dispatch(userSiteSlice.actions.getUserSitesSuccess(response.data));
  };
}
