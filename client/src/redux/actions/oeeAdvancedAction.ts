import { Oee, OeeStatus, OeeStatusAdvanced } from '../../@types/oee';
import axios from '../../utils/axios';
import oeeAdvancedSlice from '../slices/oeeAdvancedSlice';
import { dispatch } from '../store';

export const { updateOeeStatus, emptySelectedOee, setModeView, setAdvancedType, setFormStreaming } = oeeAdvancedSlice.actions;

export function getOee(id: number) {
  return async () => {
    dispatch(oeeAdvancedSlice.actions.startLoading());

    try {
      const response = await axios.get<Oee>(`/oees/${id}`);
      dispatch(oeeAdvancedSlice.actions.getOeeSuccess(response.data));
    } catch (error) {
      dispatch(oeeAdvancedSlice.actions.hasError(error));
    }
  };
}

export function getOeeStatus(userId: number, startDate : string, endDate :string, mode:string) {
  return async () => {
    dispatch(oeeAdvancedSlice.actions.startLoading());
    try {
      const response = await axios.get<OeeStatusAdvanced>(`/advances/oee/${mode}?from=${startDate}&to=${endDate}&userId=${userId}`);
      dispatch(oeeAdvancedSlice.actions.getOeeStatusSuccess(response.data));
    } catch (error) {
      dispatch(oeeAdvancedSlice.actions.hasError(error));
    }
  };
}
