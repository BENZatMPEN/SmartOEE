import { EditOee, ExportToAnotherOee, FilterOee, Oee, OeePagedList } from '../../@types/oee';
import axios from '../../utils/axios';
import oeeSlice from '../slices/oeeSlice';
import { dispatch } from '../store';

export const { emptyCurrentOee } = oeeSlice.actions;

export function getOeePagedList2(filter: FilterOee) {
  return async () => {
    // dispatch(oeeSlice.actions.startLoading());

    try {
      const response = await axios.get<OeePagedList>(`/oees`, { params: filter });
      dispatch(oeeSlice.actions.getOeePagedListSuccess(response.data));
    } catch (error) {
      dispatch(oeeSlice.actions.hasError(error));
    }
  };
}

export function getOeePagedList(filter: FilterOee) {
  return async () => {
    dispatch(oeeSlice.actions.startLoading());

    try {
      const response = await axios.get<OeePagedList>(`/oees`, { params: filter });
      dispatch(oeeSlice.actions.getOeePagedListSuccess(response.data));
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
      dispatch(oeeSlice.actions.getOeeSuccess(response.data));
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
          'Content-Type': 'application/json',
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
          'Content-Type': 'application/json',
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
      dispatch(oeeSlice.actions.deleteSuccess());
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
      dispatch(oeeSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(oeeSlice.actions.hasError(error));
    }
  };
}


export function exportWorkShiftToAnotherOee(dto: ExportToAnotherOee) {
  return async () => {
    // dispatch(oeeSlice.actions.startSavingError());

    try {
      const response = await axios.post<any>(`/oees/clone-work-shift`, dto, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      dispatch(oeeSlice.actions.hasSaveError(error));
      return null;
    }
  };
}
