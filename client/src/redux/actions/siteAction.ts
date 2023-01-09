import { EditSite, FilterSite, Site, SitePagedList } from '../../@types/site';
import axios from '../../utils/axios';
import siteSlice from '../slices/siteSlice';
import { dispatch } from '../store';

export const { emptyCurrentSite, emptySiteOptions } = siteSlice.actions;

export function getSiteOptions() {
  return async () => {
    dispatch(siteSlice.actions.startLoading());
    const response = await axios.get<Site[]>(`/sites/options`);
    dispatch(siteSlice.actions.getSiteOptionsSuccess(response.data));
  };
}

export function getSite(id: number) {
  return async () => {
    dispatch(siteSlice.actions.startDetailsLoading());
    const response = await axios.get<Site>(`/sites/${id}`);
    dispatch(siteSlice.actions.getSiteSuccess(response.data));
  };
}

export function getSitePagedList(filter: FilterSite) {
  return async () => {
    dispatch(siteSlice.actions.startLoading());
    const response = await axios.get<SitePagedList>(`/sites`, { params: filter });
    dispatch(siteSlice.actions.getSitePagedListSuccess(response.data));
  };
}

export function createSite(dto: EditSite) {
  return async () => {
    dispatch(siteSlice.actions.startDetailsLoading());
    const response = await axios.post<Site>(`/sites`, dto, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    dispatch(siteSlice.actions.createSiteSuccess());
    dispatch(siteSlice.actions.emptyCurrentSite());
    return response.data;
  };
}

export function updateSite(id: number, dto: EditSite) {
  return async () => {
    dispatch(siteSlice.actions.startDetailsLoading());
    const response = await axios.put<Site>(`/sites/${id}`, dto, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    dispatch(siteSlice.actions.updateSiteSuccess());
    dispatch(siteSlice.actions.emptyCurrentSite());
    return response.data;
  };
}

export function deleteSite(id: number) {
  return async () => {
    dispatch(siteSlice.actions.startLoading());
    await axios.delete(`/sites/${id}`);
  };
}

export function deleteSites(selectedIds: number[]) {
  return async () => {
    dispatch(siteSlice.actions.startLoading());
    await axios.delete(`/sites`, {
      params: { ids: selectedIds },
    });
  };
}
