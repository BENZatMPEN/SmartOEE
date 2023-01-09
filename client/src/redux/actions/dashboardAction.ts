import { Dashboard, DashboardPagedList, EditDashboard, FilterDashboard } from '../../@types/dashboard';
import axios from '../../utils/axios';
import dashboardSlice from '../slices/dashboardSlice';
import { dispatch } from '../store';

export const { emptyCurrentDashboard } = dashboardSlice.actions;

export function getDashboardPagedList(filter: FilterDashboard) {
  return async () => {
    dispatch(dashboardSlice.actions.startLoading());
    const response = await axios.get<DashboardPagedList>(`/dashboard`, { params: filter });
    dispatch(dashboardSlice.actions.getDashboardsSuccess(response.data));
  };
}

export function getAllDashboard() {
  return async () => {
    dispatch(dashboardSlice.actions.startLoading());
    const response = await axios.get<Dashboard[]>(`/dashboard/all`);
    dispatch(dashboardSlice.actions.getAllDashboardsSuccess(response.data));
  };
}

export function getDashboard(id: number) {
  return async () => {
    dispatch(dashboardSlice.actions.startDetailsLoading());
    const response = await axios.get<Dashboard>(`/dashboard/${id}`);
    dispatch(dashboardSlice.actions.getDashboardDetailsSuccess(response.data));
  };
}

export function createDashboard(dto: EditDashboard) {
  return async () => {
    dispatch(dashboardSlice.actions.startDetailsLoading());
    const response = await axios.post<Dashboard>(`/dashboard`, dto);
    const { data } = response;
    dispatch(dashboardSlice.actions.createDashboardSuccess(data));
    dispatch(dashboardSlice.actions.emptyCurrentDashboard());
    return data;
  };
}

export function updateDashboard(id: number, dto: EditDashboard) {
  return async () => {
    dispatch(dashboardSlice.actions.startDetailsLoading());
    const response = await axios.put<Dashboard>(`/dashboard/${id}`, dto);
    const { data } = response;
    dispatch(dashboardSlice.actions.updateDashboardSuccess(data));
    dispatch(dashboardSlice.actions.emptyCurrentDashboard());
    return data;
  };
}

export function deleteDashboard(id: number) {
  return async () => {
    dispatch(dashboardSlice.actions.startLoading());
    await axios.delete(`/dashboard/${id}`);
  };
}

export function deleteDashboards(selectedIds: number[]) {
  return async () => {
    dispatch(dashboardSlice.actions.startLoading());
    await axios.delete(`/dashboard`, {
      params: { ids: selectedIds },
    });
  };
}
