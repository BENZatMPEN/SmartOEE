import { EditSite, Site } from '../../@types/site';
import axios from '../../utils/axios';
import siteSlice from '../slices/siteSlice';
import { dispatch } from '../store';

export const { emptyCurrentSite } = siteSlice.actions;

export function getSite(id: number) {
  return async () => {
    dispatch(siteSlice.actions.startLoading());

    try {
      const response = await axios.get<Site>(`/sites/${id}`);
      dispatch(siteSlice.actions.getSiteSuccess(response.data));
    } catch (error) {
      dispatch(siteSlice.actions.hasError(error));
    }
  };
}

export function updateSite(id: number, dto: EditSite) {
  return async () => {
    dispatch(siteSlice.actions.startSavingError());

    try {
      const response = await axios.put<Site>(`/sites/${id}`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(siteSlice.actions.hasSaveError(error));
      return null;
    }
  };
}
