import { DeviceModel, DeviceModelPagedList, EditDeviceModel, FilterDeviceModel } from '../../@types/deviceModel';
import axios from '../../utils/axios';
import deviceModelSlice from '../slices/deviceModelSlice';
import { dispatch } from '../store';

export const { emptyCurrentDeviceModel } = deviceModelSlice.actions;

export function getDeviceModelPagedList(filter: FilterDeviceModel) {
  return async () => {
    dispatch(deviceModelSlice.actions.startLoading());
    const response = await axios.get<DeviceModelPagedList>(`/device-models`, { params: filter });
    dispatch(deviceModelSlice.actions.getDeviceModelsSuccess(response.data));
  };
}

export function getDeviceModel(id: number) {
  return async () => {
    dispatch(deviceModelSlice.actions.startDetailsLoading());
    const response = await axios.get<DeviceModel>(`/device-models/${id}`);
    dispatch(deviceModelSlice.actions.getDeviceModelDetailsSuccess(response.data));
  };
}

export function createDeviceModel(dto: EditDeviceModel) {
  return async () => {
    dispatch(deviceModelSlice.actions.startDetailsLoading());
    const response = await axios.post<DeviceModel>(`/device-models`, dto);
    const { data } = response;
    dispatch(deviceModelSlice.actions.createDeviceModelSuccess());
    dispatch(deviceModelSlice.actions.emptyCurrentDeviceModel());
    return data;
  };
}

export function updateDeviceModel(id: number, dto: EditDeviceModel) {
  return async () => {
    dispatch(deviceModelSlice.actions.startDetailsLoading());
    const response = await axios.put<DeviceModel>(`/device-models/${id}`, dto);
    const { data } = response;
    dispatch(deviceModelSlice.actions.updateDeviceModelSuccess());
    dispatch(deviceModelSlice.actions.emptyCurrentDeviceModel());
    return data;
  };
}

export function deleteDeviceModel(id: number) {
  return async () => {
    dispatch(deviceModelSlice.actions.startLoading());
    await axios.delete(`/device-models/${id}`);
  };
}

export function deleteDeviceModels(selectedIds: number[]) {
  return async () => {
    dispatch(deviceModelSlice.actions.startLoading());
    await axios.delete(`/device-models`, {
      params: { ids: selectedIds },
    });
  };
}
