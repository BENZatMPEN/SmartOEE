import { FilterOee, Oee, OeePagedList, OeeStatus } from '../../@types/oee';
import axios from '../../utils/axios';
import oeeSlice from '../slices/oeeSlice';
import { dispatch } from '../store';

export const { updateOeeStatus, resetOee, emptyCurrentOee } = oeeSlice.actions;

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
    dispatch(oeeSlice.actions.startDetailsLoading());

    try {
      const response = await axios.get<Oee>(`/oees/${id}`);
      dispatch(oeeSlice.actions.getOeeDetailsSuccess(response.data));
    } catch (error) {
      dispatch(oeeSlice.actions.hasDetailsError(error));
    }
  };
}

export function getOeeStatus() {
  return async () => {
    dispatch(oeeSlice.actions.startLoading());

    try {
      const response = await axios.get<OeeStatus>(`/oees/status`);
      dispatch(oeeSlice.actions.getOeeStatusSuccess(response.data));
    } catch (error) {
      dispatch(oeeSlice.actions.hasError(error));
    }
  };
}

export function createOee(dto: any) {
  return async () => {
    dispatch(oeeSlice.actions.startDetailsLoading());

    try {
      const response = await axios.post<Oee>(`/oees`, dto);
      const { data } = response;
      dispatch(oeeSlice.actions.createOeeSuccess());
      dispatch(oeeSlice.actions.emptyCurrentOee());
      return data;
    } catch (error) {
      dispatch(oeeSlice.actions.hasDetailsError(error));
      return null;
    }
  };
}

export function updateOee(id: number, dto: any) {
  return async () => {
    dispatch(oeeSlice.actions.startDetailsLoading());

    try {
      const response = await axios.put<Oee>(`/oees/${id}`, dto);
      const { data } = response;
      dispatch(oeeSlice.actions.updateOeeSuccess());
      dispatch(oeeSlice.actions.emptyCurrentOee());
      return data;
    } catch (error) {
      dispatch(oeeSlice.actions.hasDetailsError(error));
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
