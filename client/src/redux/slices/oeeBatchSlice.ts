import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import {
  OeeBatch,
  OeeBatchA,
  OeeBatchP,
  OeeBatchPagedList,
  OeeBatchParamParetoData,
  OeeBatchQ,
  OeeBatchStats,
  OeeTimeline,
} from '../../@types/oeeBatch';

const initialParetoData = {
  labels: [],
  counts: [],
  percents: [],
};

export type OeeState = {
  isLoading: boolean;
  error: Error | string | null;
  currentBatch: OeeBatch | null;
  batchPagedList: OeeBatchPagedList;
  errorBatches: Error | string | null;
  canEditBatch: boolean;
  batchParamAs: OeeBatchA[];
  errorParamAs: Error | string | null;
  batchParetoA: OeeBatchParamParetoData;
  errorParetoA: Error | string | null;
  batchParamPs: OeeBatchP[];
  errorParamPs: Error | string | null;
  batchParetoP: OeeBatchParamParetoData;
  errorParetoP: Error | string | null;
  batchParamQs: OeeBatchQ[];
  errorParamQs: Error | string | null;
  batchParetoQ: OeeBatchParamParetoData;
  errorParetoQ: Error | string | null;
  batchTimeline: OeeTimeline[];
  errorTimeline: Error | string | null;
  batchStatsTime: OeeBatchStats[];
  errorBatchStatsTime: Error | string | null;
  batchStatsLine: OeeBatchStats[];
  errorBatchStatsLine: Error | string | null;
};

const initialState: OeeState = {
  isLoading: false,
  error: null,
  currentBatch: null,
  canEditBatch: false,
  batchPagedList: {
    list: [],
    count: 0,
  },
  errorBatches: null,
  batchParamAs: [],
  errorParamAs: null,
  batchParetoA: initialParetoData,
  errorParetoA: null,
  batchParamPs: [],
  errorParamPs: null,
  batchParetoP: initialParetoData,
  errorParetoP: null,
  batchParamQs: [],
  errorParamQs: null,
  batchParetoQ: initialParetoData,
  errorParetoQ: null,
  batchTimeline: [],
  errorTimeline: null,
  batchStatsTime: [],
  errorBatchStatsTime: null,
  batchStatsLine: [],
  errorBatchStatsLine: null,
};

const oeeBatchSlice = createSlice({
  name: 'oee',
  initialState,
  reducers: {
    resetBatch: () => initialState,
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getBatchSuccess(state, action) {
      const { batchStoppedDate } = action.payload;
      state.isLoading = false;
      state.canEditBatch = batchStoppedDate === null;
      state.currentBatch = action.payload;
    },
    enableEditBatch(state, action) {
      state.canEditBatch = action.payload;
    },
    newBatch(state, action) {
      state.currentBatch = action.payload;
    },
    updateBatch(state, action) {
      state.currentBatch = {
        ...state.currentBatch,
        ...action.payload,
      };
    },
    updateBatchNow(state, action) {
      state.currentBatch = { ...action.payload };
    },
    getBatchPagedListSuccess(state, action) {
      state.batchPagedList = action.payload;
    },
    getBatchPagedListError(state, action) {
      state.errorBatches = action.payload;
      state.batchPagedList = {
        list: [],
        count: 0,
      };
    },
    // As
    getBatchParamAsSuccess(state, action) {
      state.batchParamAs = action.payload;
    },
    getBatchParamAError(state, action) {
      state.errorParamAs = action.payload;
      state.batchParamAs = [];
    },
    updateBatchParamAs(state, action) {
      state.batchParamAs = action.payload;
    },
    updateBatchParamA(state, action) {
      const { param, index } = action.payload;
      const tmp = [...state.batchParamAs];
      tmp[index] = param;
      state.batchParamAs = [...tmp];
    },
    getBatchParetoASuccess(state, action) {
      state.batchParetoA = action.payload;
    },
    getBatchParetoAError(state, action) {
      state.errorParetoA = action.payload;
      state.batchParetoA = initialParetoData;
    },
    updateBatchParetoA(state, action) {
      state.batchParetoA = action.payload;
    },
    // Ps
    getBatchParamPsSuccess(state, action) {
      state.batchParamPs = action.payload;
    },
    getBatchParamPError(state, action) {
      state.errorParamPs = action.payload;
      state.batchParamPs = [];
    },
    updateBatchParamPs(state, action) {
      state.batchParamPs = action.payload;
    },
    updateBatchParamP(state, action) {
      const { param, index } = action.payload;
      const tmp = [...state.batchParamPs];
      tmp[index] = param;
      state.batchParamPs = [...tmp];
    },
    getBatchParetoPSuccess(state, action) {
      state.batchParetoP = action.payload;
    },
    getBatchParetoPError(state, action) {
      state.errorParetoP = action.payload;
      state.batchParetoP = initialParetoData;
    },
    updateBatchParetoP(state, action) {
      state.batchParetoP = action.payload;
    },
    // Qs
    getBatchParamQsSuccess(state, action) {
      state.batchParamQs = action.payload;
    },
    getBatchParamQError(state, action) {
      state.errorParamQs = action.payload;
      state.batchParamQs = [];
    },
    updateBatchParamQs(state, action) {
      state.batchParamQs = action.payload;
    },
    getBatchParetoQSuccess(state, action) {
      state.batchParetoQ = action.payload;
    },
    getBatchParetoQError(state, action) {
      state.errorParetoQ = action.payload;
      state.batchParetoQ = initialParetoData;
    },
    updateBatchParetoQ(state, action) {
      state.batchParetoQ = action.payload;
    },
    // Timeline
    getBatchTimelineSuccess(state, action) {
      state.batchTimeline = action.payload;
    },
    getBatchTimelineError(state, action) {
      state.errorTimeline = action.payload;
      state.batchTimeline = [];
    },
    updateBatchTimeline(state, action) {
      state.batchTimeline = action.payload;
    },
    // A/P/Q/Oee chart
    getOeeBatchStatsSuccess(state, action) {
      state.batchStatsTime = action.payload;
    },
    getOeeBatchStatsError(state, action) {
      state.errorBatchStatsTime = action.payload;
      state.batchStatsTime = [];
    },
    getOeeBatchStatsLineSuccess(state, action) {
      state.batchStatsLine = action.payload;
    },
    getOeeBatchStatsLineError(state, action) {
      state.errorBatchStatsLine = action.payload;
      state.batchStatsLine = [];
    },
    updateBatchStats(state, action) {
      if (state.batchStatsTime.length === 0) {
        return;
      }

      if (!dayjs().startOf('s').isSame(dayjs().startOf('m'))) {
        return;
      }

      const { oeeStats, samplingSeconds } = action.payload;
      const { aPercent, pPercent, qPercent, oeePercent } = oeeStats || {
        aPercent: 0,
        pPercent: 0,
        qPercent: 0,
        oeePercent: 0,
      };

      const tmp = [...state.batchStatsTime];
      const lastIndex = state.batchStatsTime.length - 1;
      const currentTime = dayjs.unix(dayjs().unix() - (dayjs().unix() % samplingSeconds));
      if (currentTime.startOf('s').isSame(dayjs(tmp[lastIndex].timestamp))) {
        tmp[lastIndex].data = {
          aPercent,
          pPercent,
          qPercent,
          oeePercent,
        };
      } else {
        tmp.push({
          timestamp: currentTime.toDate(),
          data: {
            aPercent,
            pPercent,
            qPercent,
            oeePercent,
          },
        });
      }

      state.batchStatsTime = [...tmp];
    },
    updateBatchStatsLine(state, action) {
      if (state.batchStatsLine.length === 0) {
        return;
      }

      if (!dayjs().startOf('s').isSame(dayjs().startOf('m'))) {
        return;
      }

      const { oeeStats } = action.payload;
      const { aPercent, pPercent, qPercent, oeePercent } = oeeStats || {
        aPercent: 0,
        pPercent: 0,
        qPercent: 0,
        oeePercent: 0,
      };

      const tmp = [...state.batchStatsLine];
      const lastIndex = state.batchStatsLine.length - 1;
      const currentTime = dayjs.unix(dayjs().unix() - (dayjs().unix() % 60));
      if (currentTime.startOf('s').isSame(dayjs(tmp[lastIndex].timestamp))) {
        tmp[lastIndex].data = {
          aPercent,
          pPercent,
          qPercent,
          oeePercent,
        };
      } else {
        tmp.push({
          timestamp: currentTime.toDate(),
          data: {
            aPercent,
            pPercent,
            qPercent,
            oeePercent,
          },
        });
      }

      state.batchStatsLine = [...tmp];
    },
  },
});

export default oeeBatchSlice;
