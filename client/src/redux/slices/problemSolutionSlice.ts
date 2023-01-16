import { createSlice } from '@reduxjs/toolkit';
import { ProblemSolution, ProblemSolutionPagedList } from '../../@types/problemSolution';

export type ProblemSolutionState = {
  isLoading: boolean;
  error: any | null;
  pagedList: ProblemSolutionPagedList;
  currentProblemSolution: ProblemSolution | null;
  saveError: any | null;
};

const initialState: ProblemSolutionState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentProblemSolution: null,
  saveError: null,
};

const problemSolutionSlice = createSlice({
  name: 'problemSolution',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getProblemSolutionPagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentProblemSolution(state) {
      state.currentProblemSolution = null;
    },
    getProblemSolutionSuccess(state, action) {
      state.isLoading = false;
      state.currentProblemSolution = action.payload;
    },
  },
});

export default problemSolutionSlice;
