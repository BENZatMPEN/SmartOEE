import { Alarm, AlarmPagedList, EditAlarm, FilterAlarm } from '../../@types/alarm';
import axios from '../../utils/axios';
import alarmSlice from '../slices/alarmSlice';
import { dispatch } from '../store';

export const { emptyCurrentAlarm } = alarmSlice.actions;

export function getAlarmPagedList(filter: FilterAlarm) {
  return async () => {
    dispatch(alarmSlice.actions.startLoading());

    try {
      const response = await axios.get<AlarmPagedList>(`/alarms`, { params: filter });
      dispatch(alarmSlice.actions.getAlarmsSuccess(response.data));
    } catch (error) {
      dispatch(alarmSlice.actions.hasError(error));
    }
  };
}

export function getAlarm(id: number) {
  return async () => {
    dispatch(alarmSlice.actions.startLoading());

    try {
      const response = await axios.get<Alarm>(`/alarms/${id}`);
      dispatch(alarmSlice.actions.getAlarmDetailsSuccess(response.data));
    } catch (error) {
      dispatch(alarmSlice.actions.hasError(error));
    }
  };
}

export function createAlarm(dto: EditAlarm) {
  return async () => {
    dispatch(alarmSlice.actions.startSavingError());

    try {
      const response = await axios.post<Alarm>(`/alarms`, dto);
      return response.data;
    } catch (error) {
      dispatch(alarmSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateAlarm(id: number, dto: EditAlarm) {
  return async () => {
    dispatch(alarmSlice.actions.startSavingError());

    try {
      const response = await axios.put<Alarm>(`/alarms/${id}`, dto);
      return response.data;
    } catch (error) {
      dispatch(alarmSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteAlarm(id: number) {
  return async () => {
    dispatch(alarmSlice.actions.startLoading());

    try {
      await axios.delete(`/alarms/${id}`);
    } catch (error) {
      dispatch(alarmSlice.actions.hasError(error));
    }
  };
}

export function deleteAlarms(selectedIds: number[]) {
  return async () => {
    dispatch(alarmSlice.actions.startLoading());

    try {
      await axios.delete(`/alarms`, {
        params: { ids: selectedIds },
      });
    } catch (error) {
      dispatch(alarmSlice.actions.hasError(error));
    }
  };
}
