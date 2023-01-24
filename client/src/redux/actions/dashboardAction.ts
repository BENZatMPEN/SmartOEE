import { Dashboard, DashboardPagedList, EditDashboard, FilterDashboard } from '../../@types/dashboard';
import axios from '../../utils/axios';
import dashboardSlice from '../slices/dashboardSlice';
import { dispatch } from '../store';

export const { emptyCurrentDashboard } = dashboardSlice.actions;

export function getDashboardPagedList(filter: FilterDashboard) {
  return async () => {
    dispatch(dashboardSlice.actions.startLoading());

    try {
      const response = await axios.get<DashboardPagedList>(`/dashboard`, { params: filter });
      dispatch(dashboardSlice.actions.getDashboardPagedListSuccess(response.data));
    } catch (error) {
      dispatch(dashboardSlice.actions.hasError(error));
    }
  };
}

export function getDashboard(id: number) {
  return async () => {
    dispatch(dashboardSlice.actions.startLoading());

    try {
      const response = await axios.get<Dashboard>(`/dashboard/${id}`);
      dispatch(dashboardSlice.actions.getDashboardSuccess(response.data));
    } catch (error) {
      dispatch(dashboardSlice.actions.hasError(error));
    }
  };
}

export function createDashboard(dto: EditDashboard) {
  return async () => {
    dispatch(dashboardSlice.actions.startSavingError());

    try {
      const response = await axios.post<Dashboard>(`/dashboard`, dto);
      return response.data;
    } catch (error) {
      dispatch(dashboardSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateDashboard(id: number, dto: EditDashboard) {
  return async () => {
    dispatch(dashboardSlice.actions.startSavingError());

    try {
      const response = await axios.put<Dashboard>(`/dashboard/${id}`, dto);
      return response.data;
    } catch (error) {
      dispatch(dashboardSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteDashboard(id: number) {
  return async () => {
    dispatch(dashboardSlice.actions.startLoading());

    try {
      await axios.delete(`/dashboard/${id}`);
      dispatch(dashboardSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(dashboardSlice.actions.hasError(error));
    }
  };
}

export function deleteDashboards(selectedIds: number[]) {
  return async () => {
    dispatch(dashboardSlice.actions.startLoading());

    try {
      await axios.delete(`/dashboard`, {
        params: { ids: selectedIds },
      });
      dispatch(dashboardSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(dashboardSlice.actions.hasError(error));
    }
  };
}
