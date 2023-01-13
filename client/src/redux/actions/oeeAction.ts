import { EditOee, FilterOee, Oee, OeePagedList } from '../../@types/oee';
import axios from '../../utils/axios';
import oeeSlice from '../slices/oeeSlice';
import { dispatch } from '../store';

export const { emptyCurrentOee } = oeeSlice.actions;

export function getOeePagedList(filter: FilterOee) {
  return async () => {
    dispatch(oeeSlice.actions.startLoading());

    try {
      const response = await axios.get<OeePagedList>(`/oees`, { params: filter });
      dispatch(oeeSlice.actions.getOeesSuccess(response.data));
    } catch (error) {
      dispatch(oeeSlice.actions.hasError(error));
    }
  };
}

export function getOee(id: number) {
  return async () => {
    dispatch(oeeSlice.actions.startLoading());

    try {
      const response = await axios.get<Oee>(`/oees/${id}`);
      dispatch(oeeSlice.actions.getOeeDetailsSuccess(response.data));
    } catch (error) {
      dispatch(oeeSlice.actions.hasError(error));
    }
  };
}

export function createOee(dto: EditOee) {
  return async () => {
    dispatch(oeeSlice.actions.startSavingError());

    try {
      const response = await axios.post<Oee>(`/oees`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(oeeSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateOee(id: number, dto: EditOee) {
  return async () => {
    dispatch(oeeSlice.actions.startSavingError());

    try {
      const response = await axios.put<Oee>(`/oees/${id}`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(oeeSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteOee(id: number) {
  return async () => {
    dispatch(oeeSlice.actions.startLoading());

    try {
      await axios.delete(`/oees/${id}`);
    } catch (error) {
      dispatch(oeeSlice.actions.hasError(error));
    }
  };
}

export function deleteOees(selectedIds: number[]) {
  return async () => {
    dispatch(oeeSlice.actions.startLoading());

    try {
      await axios.delete(`/oees`, {
        params: { ids: selectedIds },
      });
    } catch (error) {
      dispatch(oeeSlice.actions.hasError(error));
    }
  };
}
