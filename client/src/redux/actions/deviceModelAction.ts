import { DeviceModel, DeviceModelPagedList, FilterDeviceModel } from '../../@types/deviceModel';
import axios from '../../utils/axios';
import deviceModelSlice from '../slices/deviceModelSlice';
import { dispatch } from '../store';

export const { emptyCurrentDeviceModel } = deviceModelSlice.actions;

export function getDeviceModelPagedList(filter: FilterDeviceModel) {
  return async () => {
    dispatch(deviceModelSlice.actions.startLoading());

    try {
      const response = await axios.get<DeviceModelPagedList>(`/device-models`, { params: filter });
      dispatch(deviceModelSlice.actions.getDeviceModelsSuccess(response.data));
    } catch (error) {
      dispatch(deviceModelSlice.actions.hasError(error));
    }
  };
}

export function getDeviceModel(id: number) {
  return async () => {
    dispatch(deviceModelSlice.actions.startDetailsLoading());

    try {
      const response = await axios.get<DeviceModel>(`/device-models/${id}`);
      dispatch(deviceModelSlice.actions.getDeviceModelDetailsSuccess(response.data));
    } catch (error) {
      dispatch(deviceModelSlice.actions.hasDetailsError(error));
    }
  };
}

export function createDeviceModel(dto: any) {
  return async () => {
    dispatch(deviceModelSlice.actions.startDetailsLoading());

    try {
      const response = await axios.post<DeviceModel>(`/device-models`, dto);
      const { data } = response;
      dispatch(deviceModelSlice.actions.createDeviceModelSuccess());
      dispatch(deviceModelSlice.actions.emptyCurrentDeviceModel());
      return data;
    } catch (error) {
      dispatch(deviceModelSlice.actions.hasDetailsError(error));
      return null;
    }
  };
}

export function updateDeviceModel(id: number, dto: any) {
  return async () => {
    dispatch(deviceModelSlice.actions.startDetailsLoading());

    try {
      const response = await axios.put<DeviceModel>(`/device-models/${id}`, dto);
      const { data } = response;
      dispatch(deviceModelSlice.actions.updateDeviceModelSuccess());
      dispatch(deviceModelSlice.actions.emptyCurrentDeviceModel());
      return data;
    } catch (error) {
      dispatch(deviceModelSlice.actions.hasDetailsError(error));
      return null;
    }
  };
}

export function deleteDeviceModel(id: number) {
  return async () => {
    dispatch(deviceModelSlice.actions.startLoading());

    try {
      await axios.delete(`/device-models/${id}`);
    } catch (error) {
      dispatch(deviceModelSlice.actions.hasError(error));
    }
  };
}

export function deleteDeviceModels(selectedIds: number[]) {
  return async () => {
    dispatch(deviceModelSlice.actions.startLoading());

    try {
      await axios.delete(`/device-models`, {
        params: { ids: selectedIds },
      });
    } catch (error) {
      dispatch(deviceModelSlice.actions.hasError(error));
    }
  };
}
