import {
  EditProblemSolution,
  FilterProblemSolution,
  ProblemSolution,
  ProblemSolutionPagedList,
} from '../../@types/problemSolution';
import axios from '../../utils/axios';
import problemSolutionSlice from '../slices/problemSolutionSlice';
import { dispatch } from '../store';

export const { emptyCurrentProblemSolution } = problemSolutionSlice.actions;

export function getProblemSolutionPagedList(filter: FilterProblemSolution) {
  return async () => {
    dispatch(problemSolutionSlice.actions.startLoading());

    try {
      const response = await axios.get<ProblemSolutionPagedList>(`/problems-solutions`, { params: filter });
      dispatch(problemSolutionSlice.actions.getProblemSolutionPagedListSuccess(response.data));
    } catch (error) {
      dispatch(problemSolutionSlice.actions.hasError(error));
    }
  };
}

export function getProblemSolution(id: number) {
  return async () => {
    dispatch(problemSolutionSlice.actions.startLoading());

    try {
      const response = await axios.get<ProblemSolution>(`/problems-solutions/${id}`);
      dispatch(problemSolutionSlice.actions.getProblemSolutionSuccess(response.data));
    } catch (error) {
      dispatch(problemSolutionSlice.actions.hasError(error));
    }
  };
}

export function createProblemSolution(dto: EditProblemSolution) {
  return async () => {
    dispatch(problemSolutionSlice.actions.startSavingError());

    try {
      const response = await axios.post<ProblemSolution>(`/problems-solutions`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(problemSolutionSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateProblemSolution(id: number, dto: EditProblemSolution) {
  return async () => {
    dispatch(problemSolutionSlice.actions.startSavingError());

    try {
      const response = await axios.put<ProblemSolution>(`/problems-solutions/${id}`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(problemSolutionSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteProblemSolution(id: number) {
  return async () => {
    dispatch(problemSolutionSlice.actions.startLoading());

    try {
      await axios.delete(`/problems-solutions/${id}`);
      dispatch(problemSolutionSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(problemSolutionSlice.actions.hasError(error));
    }
  };
}

export function deleteProblemSolutions(selectedIds: number[]) {
  return async () => {
    dispatch(problemSolutionSlice.actions.startLoading());

    try {
      await axios.delete(`/problems-solutions`, {
        params: { ids: selectedIds },
      });
      dispatch(problemSolutionSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(problemSolutionSlice.actions.hasError(error));
    }
  };
}
