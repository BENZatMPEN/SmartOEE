import {
  FilterOeeBatch,
  OeeBatch,
  OeeBatchA,
  OeeBatchP,
  OeeBatchPagedList,
  OeeBatchParamParetoData,
  OeeBatchQ,
  OeeBatchStats,
  OeeTimeline,
} from '../../@types/oeeBatch';
import axios from '../../utils/axios';
import oeeBatchSlice from '../slices/oeeBatchSlice';
import { dispatch } from '../store';

export const {
  resetBatch,
  newBatch,
  updateBatch,
  enableEditBatch,
  updateBatchParamAs,
  updateBatchParamA,
  updateBatchParetoA,
  updateBatchParamPs,
  updateBatchParamP,
  updateBatchParetoP,
  updateBatchParamQs,
  updateBatchParetoQ,
  updateBatchTimeline,
  updateBatchStats,
  updateBatchStatsLine,
} = oeeBatchSlice.actions;

export function getOeeBatch(oeeId: number, batchId: number) {
  return async () => {
    dispatch(oeeBatchSlice.actions.startLoading());

    try {
      const response = await axios.get<OeeBatch>(`/oee-batches/${batchId}?oeeId=${oeeId}`);
      dispatch(oeeBatchSlice.actions.getBatchSuccess(response.data));
    } catch (error) {
      dispatch(oeeBatchSlice.actions.hasError(error));
    }
  };
}

export function getOeeLatestBatch(oeeId: number) {
  return async () => {
    dispatch(oeeBatchSlice.actions.startLoading());

    try {
      const response = await axios.get<OeeBatch>(`/oees/${oeeId}/latest-batch`);
      dispatch(oeeBatchSlice.actions.getBatchSuccess(response.data));
    } catch (error) {
      dispatch(oeeBatchSlice.actions.hasError(error));
    }
  };
}

export function getOeeBatchPagedList(filter: FilterOeeBatch) {
  return async () => {
    try {
      const response = await axios.get<OeeBatchPagedList>('/oee-batches', { params: filter });
      dispatch(oeeBatchSlice.actions.getBatchPagedListSuccess(response.data));
    } catch (error) {
      dispatch(oeeBatchSlice.actions.getBatchPagedListError(error));
    }
  };
}

export function getOeeBatchAs(batchId: number) {
  return async () => {
    try {
      const response = await axios.get<OeeBatchA[]>(`/oee-batches/${batchId}/a-params`);
      dispatch(oeeBatchSlice.actions.getBatchParamAsSuccess(response.data));
    } catch (error) {
      dispatch(oeeBatchSlice.actions.getBatchParamAError(error));
    }
  };
}

export function getOeeBatchParetoA(batchId: number) {
  return async () => {
    try {
      const response = await axios.get<OeeBatchParamParetoData>(`/oee-batches/${batchId}/a-pareto`);
      dispatch(oeeBatchSlice.actions.getBatchParetoASuccess(response.data));
    } catch (error) {
      dispatch(oeeBatchSlice.actions.getBatchParetoAError(error));
    }
  };
}

export function getOeeBatchPs(batchId: number) {
  return async () => {
    try {
      const response = await axios.get<OeeBatchP[]>(`/oee-batches/${batchId}/p-params`);
      dispatch(oeeBatchSlice.actions.getBatchParamPsSuccess(response.data));
    } catch (error) {
      dispatch(oeeBatchSlice.actions.getBatchParamPError(error));
    }
  };
}

export function getOeeBatchParetoP(batchId: number) {
  return async () => {
    try {
      const response = await axios.get<OeeBatchParamParetoData>(`/oee-batches/${batchId}/p-pareto`);
      dispatch(oeeBatchSlice.actions.getBatchParetoPSuccess(response.data));
    } catch (error) {
      dispatch(oeeBatchSlice.actions.getBatchParetoPError(error));
    }
  };
}

export function getOeeBatchQs(batchId: number) {
  return async () => {
    try {
      const response = await axios.get<OeeBatchQ[]>(`/oee-batches/${batchId}/q-params`);
      dispatch(oeeBatchSlice.actions.getBatchParamQsSuccess(response.data));
    } catch (error) {
      dispatch(oeeBatchSlice.actions.getBatchParamQError(error));
    }
  };
}

export function getOeeBatchParetoQ(batchId: number) {
  return async () => {
    try {
      const response = await axios.get<OeeBatchParamParetoData>(`/oee-batches/${batchId}/q-pareto`);
      dispatch(oeeBatchSlice.actions.getBatchParetoQSuccess(response.data));
    } catch (error) {
      dispatch(oeeBatchSlice.actions.getBatchParetoQError(error));
    }
  };
}

export function getOeeBatchTimeline(batchId: number) {
  return async () => {
    try {
      const response = await axios.get<OeeTimeline[]>(`/oee-batches/${batchId}/timelines`);
      dispatch(oeeBatchSlice.actions.getBatchTimelineSuccess(response.data));
      return response.data;
    } catch (error) {
      dispatch(oeeBatchSlice.actions.getBatchTimelineError(error));
      return [];
    }
  };
}

export function getOeeBatchStats(batchId: number, samplingSeconds: number) {
  return async () => {
    try {
      const response = await axios.get<OeeBatchStats[]>(
        `/oee-batches/${batchId}/oee-stats?samplingSeconds=${samplingSeconds}`,
      );
      dispatch(oeeBatchSlice.actions.getOeeBatchStatsSuccess(response.data || []));
    } catch (error) {
      dispatch(oeeBatchSlice.actions.getOeeBatchStatsError(error));
    }
  };
}

export function getOeeBatchStatsLine(batchId: number) {
  return async () => {
    try {
      const response = await axios.get<OeeBatchStats[]>(`/oee-batches/${batchId}/oee-stats?samplingSeconds=${60}`);
      dispatch(oeeBatchSlice.actions.getOeeBatchStatsLineSuccess(response.data || []));
    } catch (error) {
      dispatch(oeeBatchSlice.actions.getOeeBatchStatsLineError(error));
    }
  };
}

export function deleteBatch(id: number) {
  return async () => {
    try {
      await axios.delete(`/oee-batches/${id}`);
    } catch {}
  };
}
