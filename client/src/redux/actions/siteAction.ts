import { Site } from '../../@types/site';
import axios from '../../utils/axios';
import siteSlice from '../slices/siteSlice';
import { dispatch } from '../store';

export const { selectSite, setGanttView } = siteSlice.actions;

export function getSites() {
  return async () => {
    dispatch(siteSlice.actions.startLoading());

    try {
      const response = await axios.get<Site[]>(`/sites/all`);
      dispatch(siteSlice.actions.getSitesSuccess(response.data));
    } catch (error) {
      dispatch(siteSlice.actions.hasError(error));
    }
  };
}
