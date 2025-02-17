import { Oee, OeeStatus } from '../../@types/oee';
import axios from '../../utils/axios';
import oeeDashboardSlice from '../slices/oeeDashboardSlice';
import { dispatch } from '../store';

export const { updateOeeStatus, emptySelectedOee, setFormTimeline } = oeeDashboardSlice.actions;

export function getOee(id: number) {
  return async () => {
    dispatch(oeeDashboardSlice.actions.startLoading());

    try {
      const response = await axios.get<Oee>(`/oees/${id}`);
      dispatch(oeeDashboardSlice.actions.getOeeSuccess(response.data));
    } catch (error) {
      dispatch(oeeDashboardSlice.actions.hasError(error));
    }
  };
}

export function getOeeStatus(userId: number) {
  return async () => {
    dispatch(oeeDashboardSlice.actions.startLoading());

    try {
      const response = await axios.get<OeeStatus>(`/oees/status?userId=${userId}`);
      dispatch(oeeDashboardSlice.actions.getOeeStatusSuccess(response.data));
    } catch (error) {
      dispatch(oeeDashboardSlice.actions.hasError(error));
    }
  };
}
