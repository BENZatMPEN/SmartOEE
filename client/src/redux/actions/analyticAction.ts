import { Analytic } from '../../@types/analytic';
import { OptionItem } from '../../@types/option';
import axios from '../../utils/axios';
import analyticSlice from '../slices/analyticSlice';
import { dispatch } from '../store';

export const { updateCurrentAnalytics } = analyticSlice.actions;

export function getGroupAnalytics() {
  return async () => {
    dispatch(analyticSlice.actions.startGroupLoading());

    try {
      const response = await axios.get<Analytic[]>(`/analytics`, { params: { group: true } });
      dispatch(analyticSlice.actions.getGroupAnalyticsSuccess(response.data));
    } catch (error) {
      dispatch(analyticSlice.actions.hasGroupError(error));
    }
  };
}

export function getAnalytics() {
  return async () => {
    dispatch(analyticSlice.actions.startLoading());

    try {
      const response = await axios.get<Analytic[]>(`/analytics`, { params: { group: false } });
      dispatch(analyticSlice.actions.getAnalyticsSuccess(response.data || []));
    } catch (error) {
      dispatch(analyticSlice.actions.hasError(error));
    }
  };
}

export function createAnalytic(dto: any) {
  return async () => {
    dispatch(analyticSlice.actions.startLoading());

    try {
      const response = await axios.post<Analytic>(`/analytics`, dto);
      const { data } = response;
      dispatch(analyticSlice.actions.createAnalyticSuccess(data));
      dispatch(analyticSlice.actions.updateCurrentAnalytics(data));
      return data;
    } catch (error) {
      dispatch(analyticSlice.actions.hasError(error));
      return null;
    }
  };
}

export function updateAnalytic(id: number, dto: any) {
  return async () => {
    dispatch(analyticSlice.actions.startLoading());

    try {
      const response = await axios.put<Analytic>(`/analytics/${id}`, dto);
      const { data } = response;
      dispatch(analyticSlice.actions.updateAnalyticSuccess(data));
      dispatch(analyticSlice.actions.updateCurrentAnalytics(data));
      return data;
    } catch (error) {
      dispatch(analyticSlice.actions.hasError(error));
      return null;
    }
  };
}

export function deleteAnalytic(id: number, group: boolean = false) {
  return async () => {
    dispatch(analyticSlice.actions.startLoading());

    try {
      await axios.delete(`/analytics/${id}`);
      dispatch(analyticSlice.actions.deleteAnalyticSuccess({ id, group }));
      dispatch(analyticSlice.actions.updateCurrentAnalytics(null));
    } catch (error) {
      dispatch(analyticSlice.actions.hasError(error));
    }
  };
}

export function getAnalyticOeeOpts() {
  return async () => {
    try {
      const response = await axios.get<OptionItem[]>(`/oees/options`);
      dispatch(analyticSlice.actions.getOeeOptsSuccess(response.data || []));
    } catch (error) {
      dispatch(analyticSlice.actions.getOeeOptsSuccess([]));
    }
  };
}

export function getAnalyticProductOpts() {
  return async () => {
    try {
      const response = await axios.get<OptionItem[]>(`/products/options`);
      dispatch(analyticSlice.actions.getProductOptsSuccess(response.data || []));
    } catch (error) {
      dispatch(analyticSlice.actions.getProductOptsSuccess([]));
    }
  };
}

export function getAnalyticBatchOpts() {
  return async () => {
    try {
      const response = await axios.get<OptionItem[]>(`/oee-batches/options`);
      dispatch(analyticSlice.actions.getBatchOptsSuccess(response.data));
    } catch (error) {
      dispatch(analyticSlice.actions.getBatchOptsSuccess([]));
    }
  };
}
