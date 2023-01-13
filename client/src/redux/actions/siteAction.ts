import { EditSite, FilterSite, Site, SitePagedList } from '../../@types/site';
import axios from '../../utils/axios';
import siteSlice from '../slices/siteSlice';
import { dispatch } from '../store';

export const { emptyCurrentSite } = siteSlice.actions;

export function getSitePagedList(filter: FilterSite) {
  return async () => {
    dispatch(siteSlice.actions.startLoading());

    try {
      const response = await axios.get<SitePagedList>(`/sites`, { params: filter });
      dispatch(siteSlice.actions.getSitePagedListSuccess(response.data));
    } catch (error) {
      dispatch(siteSlice.actions.hasError(error));
    }
  };
}

export function getSite(id: number) {
  return async () => {
    dispatch(siteSlice.actions.startLoading());

    try {
      const response = await axios.get<Site>(`/sites/${id}`);
      dispatch(siteSlice.actions.getSiteDetailsSuccess(response.data));
    } catch (error) {
      dispatch(siteSlice.actions.hasError(error));
    }
  };
}

export function createSite(dto: EditSite) {
  return async () => {
    dispatch(siteSlice.actions.startSavingError());

    try {
      const response = await axios.post<Site>(`/sites`, dto, {
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

export function deleteSite(id: number) {
  return async () => {
    dispatch(siteSlice.actions.startLoading());

    try {
      await axios.delete(`/sites/${id}`);
    } catch (error) {
      dispatch(siteSlice.actions.hasError(error));
    }
  };
}

export function deleteSites(selectedIds: number[]) {
  return async () => {
    dispatch(siteSlice.actions.startLoading());

    try {
      await axios.delete(`/sites`, {
        params: { ids: selectedIds },
      });
    } catch (error) {
      dispatch(siteSlice.actions.hasError(error));
    }
  };
}
