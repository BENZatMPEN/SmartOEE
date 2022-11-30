import { Oee, OeeStatus } from '../../@types/oee';
import axios from '../../utils/axios';
import oeeSlice from '../slices/oeeSlice';
import { dispatch } from '../store';

export const { updateOeeStatus, resetOee } = oeeSlice.actions;

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
