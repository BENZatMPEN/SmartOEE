import { EditMachine, FilterMachine, Machine, MachinePagedList } from '../../@types/machine';
import axios from '../../utils/axios';
import machineSlice from '../slices/machineSlice';
import { dispatch } from '../store';

export const { emptyCurrentMachine } = machineSlice.actions;

export function getMachinePagedList(filter: FilterMachine) {
  return async () => {
    dispatch(machineSlice.actions.startLoading());

    try {
      const response = await axios.get<MachinePagedList>(`/machines`, { params: filter });
      dispatch(machineSlice.actions.getMachinesSuccess(response.data));
    } catch (error) {
      dispatch(machineSlice.actions.hasError(error));
    }
  };
}

export function getMachine(id: number) {
  return async () => {
    dispatch(machineSlice.actions.startLoading());

    try {
      const response = await axios.get<Machine>(`/machines/${id}`);
      dispatch(machineSlice.actions.getMachineDetailsSuccess(response.data));
    } catch (error) {
      dispatch(machineSlice.actions.hasError(error));
    }
  };
}

export function createMachine(dto: EditMachine) {
  return async () => {
    dispatch(machineSlice.actions.startSavingError());

    try {
      const response = await axios.post<Machine>(`/machines`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(machineSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateMachine(id: number, dto: EditMachine) {
  return async () => {
    dispatch(machineSlice.actions.startSavingError());

    try {
      const response = await axios.put<Machine>(`/machines/${id}`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(machineSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteMachine(id: number) {
  return async () => {
    dispatch(machineSlice.actions.startLoading());

    try {
      await axios.delete(`/machines/${id}`);
    } catch (error) {
      dispatch(machineSlice.actions.hasError(error));
    }
  };
}

export function deleteMachines(selectedIds: number[]) {
  return async () => {
    dispatch(machineSlice.actions.startLoading());

    try {
      await axios.delete(`/machines`, {
        params: { ids: selectedIds },
      });
    } catch (error) {
      dispatch(machineSlice.actions.hasError(error));
    }
  };
}
