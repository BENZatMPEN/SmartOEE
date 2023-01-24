import { EditPlanning, FilterPlanning, Planning } from '../../@types/planning';
import axios from '../../utils/axios';
import calendarSlice from '../slices/calendarSlice';
import { dispatch } from '../store';

export const {
  openModal,
  closeModal,
  selectEvent,
  selectRange,
  selectPlanning,
  setPlanningFilterTerm,
  filterPlannings,
} = calendarSlice.actions;

export function getPlanningsByRange(filter: FilterPlanning) {
  return async () => {
    dispatch(calendarSlice.actions.startLoading());

    try {
      const response = await axios.get<Planning>('/plannings', { params: filter });
      dispatch(calendarSlice.actions.getPlanningsSuccess(response.data));
    } catch (error) {
      dispatch(calendarSlice.actions.hasError(error));
    }
  };
}

export function createPlanning(dto: EditPlanning) {
  return async () => {
    dispatch(calendarSlice.actions.startSavingError());

    try {
      const response = await axios.post<Planning>(`/plannings`, dto);
      return response.data;
    } catch (error) {
      dispatch(calendarSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updatePlanning(id: number, dto: EditPlanning) {
  return async () => {
    dispatch(calendarSlice.actions.startSavingError());

    try {
      const response = await axios.put<Planning>(`/plannings/${id}`, dto);
      return response.data;
    } catch (error) {
      dispatch(calendarSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

// export function createEvent(newEvent: Omit<EventInput, 'id'>) {
//   return async () => {
//     dispatch(calendarSlice.actions.startLoading());
//     try {
//       const response = await axios.post('/api/calendar/events/new', newEvent);
//       dispatch(calendarSlice.actions.createEventSuccess(response.data.event));
//     } catch (error) {
//       dispatch(calendarSlice.actions.hasError(error));
//     }
//   };
// }

// export function updateEvent(
//   eventId: string,
//   updateEvent: Partial<{
//     allDay: boolean;
//     start: Date | null;
//     end: Date | null;
//   }>,
// ) {
//   return async () => {
//     dispatch(calendarSlice.actions.startLoading());
//     try {
//       const response = await axios.post('/api/calendar/events/update', {
//         eventId,
//         updateEvent,
//       });
//       dispatch(calendarSlice.actions.updateEventSuccess(response.data.event));
//     } catch (error) {
//       dispatch(calendarSlice.actions.hasError(error));
//     }
//   };
// }

export function deletePlanning(id: number) {
  return async () => {
    dispatch(calendarSlice.actions.startLoading());

    try {
      await axios.delete(`/plannings/${id}`);
      dispatch(calendarSlice.actions.deleteSuccess([id]));
    } catch (error) {
      dispatch(calendarSlice.actions.hasError(error));
    }
  };
}

export function deletePlannings(selectedIds: number[]) {
  return async () => {
    dispatch(calendarSlice.actions.startLoading());

    try {
      await axios.delete(`/plannings`, {
        params: { ids: selectedIds },
      });
      dispatch(calendarSlice.actions.deleteSuccess(selectedIds));
    } catch (error) {
      dispatch(calendarSlice.actions.hasError(error));
    }
  };
}
