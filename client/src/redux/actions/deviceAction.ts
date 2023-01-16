import { Device, DevicePagedList, EditDevice, FilterDevice } from '../../@types/device';
import axios from '../../utils/axios';
import deviceSlice from '../slices/deviceSlice';
import { dispatch } from '../store';

export const { emptyCurrentDevice } = deviceSlice.actions;

export function getDevicePagedList(filter: FilterDevice) {
  return async () => {
    dispatch(deviceSlice.actions.startLoading());

    try {
      const response = await axios.get<DevicePagedList>(`/devices`, { params: filter });
      dispatch(deviceSlice.actions.getDevicePagedListSuccess(response.data));
    } catch (error) {
      dispatch(deviceSlice.actions.hasError(error));
    }
  };
}

export function getDevice(id: number) {
  return async () => {
    dispatch(deviceSlice.actions.startLoading());

    try {
      const response = await axios.get<Device>(`/devices/${id}`);
      dispatch(deviceSlice.actions.getDeviceSuccess(response.data));
    } catch (error) {
      dispatch(deviceSlice.actions.hasError(error));
    }
  };
}

export function createDevice(dto: EditDevice) {
  return async () => {
    dispatch(deviceSlice.actions.startSavingError());

    try {
      const response = await axios.post<Device>(`/devices`, dto);
      return response.data;
    } catch (error) {
      dispatch(deviceSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateDevice(id: number, dto: EditDevice) {
  return async () => {
    dispatch(deviceSlice.actions.startSavingError());

    try {
      const response = await axios.put<Device>(`/devices/${id}`, dto);
      return response.data;
    } catch (error) {
      dispatch(deviceSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteDevice(id: number) {
  return async () => {
    dispatch(deviceSlice.actions.startLoading());

    try {
      await axios.delete(`/devices/${id}`);
    } catch (error) {
      dispatch(deviceSlice.actions.hasError(error));
    }
  };
}

export function deleteDevices(selectedIds: number[]) {
  return async () => {
    dispatch(deviceSlice.actions.startLoading());

    try {
      await axios.delete(`/devices`, {
        params: { ids: selectedIds },
      });
    } catch (error) {
      dispatch(deviceSlice.actions.hasError(error));
    }
  };
}
