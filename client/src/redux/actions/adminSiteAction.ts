import { EditSite, FilterSite, Site, SitePagedList } from '../../@types/site';
import axios from '../../utils/axios';
import adminSiteSlice from '../slices/adminSiteSlice';
import { dispatch } from '../store';

export const { emptyCurrentSite } = adminSiteSlice.actions;

export function getSitePagedList(filter: FilterSite) {
  return async () => {
    dispatch(adminSiteSlice.actions.startLoading());

    try {
      const response = await axios.get<SitePagedList>(`/admin/sites`, { params: filter });
      dispatch(adminSiteSlice.actions.getSitePagedListSuccess(response.data));
    } catch (error) {
      dispatch(adminSiteSlice.actions.hasError(error));
    }
  };
}

export function getSite(id: number) {
  return async () => {
    dispatch(adminSiteSlice.actions.startLoading());

    try {
      const response = await axios.get<Site>(`/admin/sites/${id}`);
      dispatch(adminSiteSlice.actions.getSiteSuccess(response.data));
    } catch (error) {
      dispatch(adminSiteSlice.actions.hasError(error));
    }
  };
}

export function createSite(dto: EditSite) {
  return async () => {
    dispatch(adminSiteSlice.actions.startSavingError());

    try {
      const response = await axios.post<Site>(`/admin/sites`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(adminSiteSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateSite(id: number, dto: EditSite) {
  return async () => {
    dispatch(adminSiteSlice.actions.startSavingError());

    try {
      const response = await axios.put<Site>(`/admin/sites/${id}`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(adminSiteSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteSite(id: number) {
  return async () => {
    dispatch(adminSiteSlice.actions.startLoading());

    try {
      await axios.delete(`/admin/sites/${id}`);
    } catch (error) {
      dispatch(adminSiteSlice.actions.hasError(error));
    }
  };
}

export function deleteSites(selectedIds: number[]) {
  return async () => {
    dispatch(adminSiteSlice.actions.startLoading());

    try {
      await axios.delete(`/admin/sites`, {
        params: { ids: selectedIds },
      });
    } catch (error) {
      dispatch(adminSiteSlice.actions.hasError(error));
    }
  };
}
