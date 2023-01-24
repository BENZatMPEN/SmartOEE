import { DeviceModel, DeviceModelPagedList, EditDeviceModel, FilterDeviceModel } from '../../@types/deviceModel';
import axios from '../../utils/axios';
import deviceModelSlice from '../slices/deviceModelSlice';
import { dispatch } from '../store';

export const { emptyCurrentDeviceModel } = deviceModelSlice.actions;

export function getDeviceModelPagedList(filter: FilterDeviceModel) {
  return async () => {
    dispatch(deviceModelSlice.actions.startLoading());

    try {
      const response = await axios.get<DeviceModelPagedList>(`/device-models`, { params: filter });
      dispatch(deviceModelSlice.actions.getDeviceModelPagedListSuccess(response.data));
    } catch (error) {
      dispatch(deviceModelSlice.actions.hasError(error));
    }
  };
}

export function getDeviceModel(id: number) {
  return async () => {
    dispatch(deviceModelSlice.actions.startLoading());

    try {
      const response = await axios.get<DeviceModel>(`/device-models/${id}`);
      dispatch(deviceModelSlice.actions.getDeviceModelSuccess(response.data));
    } catch (error) {
      dispatch(deviceModelSlice.actions.hasError(error));
    }
  };
}

export function createDeviceModel(dto: EditDeviceModel) {
  return async () => {
    dispatch(deviceModelSlice.actions.startSavingError());

    try {
      const response = await axios.post<DeviceModel>(`/device-models`, dto);
      return response.data;
    } catch (error) {
      dispatch(deviceModelSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateDeviceModel(id: number, dto: EditDeviceModel) {
  return async () => {
    dispatch(deviceModelSlice.actions.startSavingError());

    try {
      const response = await axios.put<DeviceModel>(`/device-models/${id}`, dto);
      return response.data;
    } catch (error) {
      dispatch(deviceModelSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteDeviceModel(id: number) {
  return async () => {
    dispatch(deviceModelSlice.actions.startLoading());

    try {
      await axios.delete(`/device-models/${id}`);
      dispatch(deviceModelSlice.actions.deleteSuccess());
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
      dispatch(deviceModelSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(deviceModelSlice.actions.hasError(error));
    }
  };
}
