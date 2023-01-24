import {
  EditPlannedDowntime,
  FilterPlannedDowntime,
  PlannedDowntime,
  PlannedDowntimePagedList,
} from '../../@types/plannedDowntime';
import axios from '../../utils/axios';
import plannedDowntimeSlice from '../slices/plannedDowntimeSlice';
import { dispatch } from '../store';

export const { emptyCurrentPlannedDowntime } = plannedDowntimeSlice.actions;

export function getPlannedDowntimePagedList(filter: FilterPlannedDowntime) {
  return async () => {
    dispatch(plannedDowntimeSlice.actions.startLoading());

    try {
      const response = await axios.get<PlannedDowntimePagedList>(`/planned-downtimes`, { params: filter });
      dispatch(plannedDowntimeSlice.actions.getPlannedDowntimePagedListSuccess(response.data));
    } catch (error) {
      dispatch(plannedDowntimeSlice.actions.hasError(error));
    }
  };
}

export function getPlannedDowntime(id: number) {
  return async () => {
    dispatch(plannedDowntimeSlice.actions.startLoading());

    try {
      const response = await axios.get<PlannedDowntime>(`/planned-downtimes/${id}`);
      dispatch(plannedDowntimeSlice.actions.getPlannedDowntimeSuccess(response.data));
    } catch (error) {
      dispatch(plannedDowntimeSlice.actions.hasError(error));
    }
  };
}

export function createPlannedDowntime(dto: EditPlannedDowntime) {
  return async () => {
    dispatch(plannedDowntimeSlice.actions.startSavingError());

    try {
      const response = await axios.post<PlannedDowntime>(`/planned-downtimes`, dto);
      return response.data;
    } catch (error) {
      dispatch(plannedDowntimeSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updatePlannedDowntime(id: number, dto: EditPlannedDowntime) {
  return async () => {
    dispatch(plannedDowntimeSlice.actions.startSavingError());
    try {
      const response = await axios.put<PlannedDowntime>(`/planned-downtimes/${id}`, dto);
      return response.data;
    } catch (error) {
      dispatch(plannedDowntimeSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deletePlannedDowntime(id: number) {
  return async () => {
    dispatch(plannedDowntimeSlice.actions.startLoading());

    try {
      await axios.delete(`/planned-downtimes/${id}`);
      dispatch(plannedDowntimeSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(plannedDowntimeSlice.actions.hasError(error));
    }
  };
}

export function deletePlannedDowntimes(selectedIds: number[]) {
  return async () => {
    dispatch(plannedDowntimeSlice.actions.startLoading());

    try {
      await axios.delete(`/planned-downtimes`, {
        params: { ids: selectedIds },
      });
      dispatch(plannedDowntimeSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(plannedDowntimeSlice.actions.hasError(error));
    }
  };
}
