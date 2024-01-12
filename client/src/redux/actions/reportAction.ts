import { report } from 'process';
import { OptionItem } from '../../@types/option';
import axios from '../../utils/axios';
import { dispatch } from '../store';
import reportSlice from '../slices/reportSlice';

export const { updateCurrentCriteria } = reportSlice.actions;

export function getReportOeeOpts() {
  return async () => {
    try {
      const response = await axios.get<OptionItem[]>(`/oees/options`);
      dispatch(reportSlice.actions.getOeeOptsSuccess(response.data || []));
    } catch (error) {
      dispatch(reportSlice.actions.getOeeOptsSuccess([]));
    }
  }
}

export function getReportProductOpts() {
  return async () => {
    try {
      const response = await axios.get<OptionItem[]>(`/products/options`);
      dispatch(reportSlice.actions.getProductOptsSuccess(response.data || []));
    } catch (error) {
      dispatch(reportSlice.actions.getProductOptsSuccess([]));
    }
  };
}

export function getReportBatchOpts() {
  return async () => {
    try {
      const response = await axios.get<OptionItem[]>(`/oee-batches/options`);
      dispatch(reportSlice.actions.getBatchOptsSuccess(response.data));
    } catch (error) {
      dispatch(reportSlice.actions.getBatchOptsSuccess([]));
    }
  };
}
