import { Oee, OeeStatus, OeeStatusAdvanced, updateColumnsReq } from '../../@types/oee';
import axios from '../../utils/axios';
import oeeAdvancedSlice from '../slices/oeeAdvancedSlice';
import { dispatch } from '../store';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc"
dayjs.extend(utc);

const formatUTC = "YYYY-MM-DD[T]HH:mm:00.SSS[Z]"

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
     
      const response = await axios.get<OeeStatusAdvanced>(`/advances/oee/${mode}`, {
        params : {
          from : dayjs(startDate).utc().format(formatUTC),
          to: dayjs(endDate).utc().format(formatUTC),
          userId:userId
        }
      });
      dispatch(oeeAdvancedSlice.actions.getOeeStatusSuccess(response.data));
    } catch (error) {
      dispatch(oeeAdvancedSlice.actions.hasError(error));
    }
  };
}

export function getTeepStatus(userId: number, startDate : string, endDate :string, mode:string) {
  return async () => {
    dispatch(oeeAdvancedSlice.actions.startLoading());
    try {
      const response = await axios.get<OeeStatusAdvanced>(`/advances/teep/${mode}`, {
        params : {
          from : dayjs(startDate).utc().format(formatUTC),
          to: dayjs(endDate).utc().format(formatUTC),
          userId:userId
        }
      });
      dispatch(oeeAdvancedSlice.actions.getOeeStatusSuccess(response.data));
    } catch (error) {
      dispatch(oeeAdvancedSlice.actions.hasError(error));
    }
  };
}

export function getAndonStatus(userId: number, startDate : string, endDate :string) {
  return async () => {
    dispatch(oeeAdvancedSlice.actions.startLoading());
    try {
      const response = await axios.get<OeeStatusAdvanced>(`/advances/andons/all`, {
        params : {
          from : dayjs(startDate).utc().format(formatUTC),
          to: dayjs(endDate).utc().format(formatUTC),
          userId:userId
        }
      });
      
      dispatch(oeeAdvancedSlice.actions.getOeeStatusSuccess(response.data));
    } catch (error) {
      dispatch(oeeAdvancedSlice.actions.hasError(error));
    }
  };
}

export function updateColumns(dto: any) {
  return async () => {
    dispatch(oeeAdvancedSlice.actions.startLoading());

    try {
      const response = await axios.put<updateColumnsReq>(`advances/andons`, dto, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const { data } = response;
      return data;
    } catch (error) {
      dispatch(oeeAdvancedSlice.actions.hasError(error));
      return null;
    } finally {
      dispatch(oeeAdvancedSlice.actions.stopLoading());
    }
  };
}
