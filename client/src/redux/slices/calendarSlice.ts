import { EventInput } from '@fullcalendar/common';
import { createSlice } from '@reduxjs/toolkit';
import { Planning } from '../../@types/planning';

type PlanningState = {
  isLoading: boolean;
  error: Error | string | null;
  plannings: Planning[];
  events: EventInput[];
  isOpenModal: boolean;
  isDuplicate: boolean;
  selectedEventId: null | string;
  selectedRange: null | { start: Date; end: Date };
  currentPlanning: Planning | null;
  saveError: any | null;
  filterTerm: string;
  filteredPlannings: Planning[];
};

const initialState: PlanningState = {
  isLoading: false,
  error: null,
  plannings: [],
  events: [],
  isOpenModal: false,
  isDuplicate: false,
  selectedEventId: null,
  selectedRange: null,
  currentPlanning: null,
  saveError: null,
  filterTerm: '',
  filteredPlannings: [],
};

const mapEvent = (plannings: Planning[]): EventInput[] => {
  return plannings.map((planning: any) => ({
    id: planning.id.toString(),
    title: planning.title,
    start: planning.startDate,
    end: planning.endDate,
    allDay: false,
    textColor: planning.color,
  }));
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getPlanningsSuccess(state, action) {
      state.isLoading = false;
      state.plannings = action.payload;
      state.events = mapEvent(action.payload);
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    createEventSuccess(state, action) {
      const newEvent = action.payload;
      state.isLoading = false;
      state.events = [...state.events, newEvent];
    },
    updateEventSuccess(state, action) {
      const event = action.payload;
      const updateEvent = state.events.map((_event) => {
        if (_event.id === event.id) {
          return event;
        }
        return _event;
      });

      state.isLoading = false;
      state.events = updateEvent;
    },
    // deleteEventSuccess(state, action) {
    //   const { eventId } = action.payload;
    //   const deleteEvent = state.events.filter((event) => event.id !== eventId);
    //   state.events = deleteEvent;
    // },
    selectEvent(state, action) {
      const eventId = action.payload;
      state.isOpenModal = true;
      state.selectedEventId = eventId;
    },
    selectRange(state, action) {
      state.selectedRange = action.payload;
    },
    openModal(state) {
      state.isOpenModal = true;
    },
    closeModal(state) {
      state.isOpenModal = false;
      state.isDuplicate = false;
      state.currentPlanning = null;
    },
    deleteSuccess(state, action) {
      state.isLoading = false;

      const tmp = [...state.plannings];
      for (const id of action.payload) {
        const index = tmp.findIndex((item) => item.id === id);
        tmp.splice(index, 1);
      }

      state.plannings = tmp;
      state.events = state.events = mapEvent(tmp);
    },
    selectPlanning(state, action) {
      const { id, isDuplicate } = action.payload;
      state.isOpenModal = true;
      state.isDuplicate = isDuplicate;
      state.currentPlanning = id ? state.plannings.filter((planning) => planning.id === id)[0] : null;
    },
    setPlanningFilterTerm(state, action) {
      state.filterTerm = action.payload;
    },
    filterPlannings(state) {
      const { filterTerm, plannings } = state;
      if (filterTerm || state.selectedRange) {
        state.filteredPlannings = plannings.filter((item) => {
          return (
            (!state.selectedRange ||
              (item.startDate >= state.selectedRange.start && item.endDate <= state.selectedRange.end)) &&
            (item.title.toUpperCase().indexOf(filterTerm.toUpperCase()) >= 0 ||
              (item.oee ? item.oee.productionName.toUpperCase().indexOf(filterTerm.toUpperCase()) >= 0 : true) ||
              (item.product ? item.product.name.toUpperCase().indexOf(filterTerm.toUpperCase()) >= 0 : true))
          );
        });
        return;
      }

      state.filteredPlannings = plannings;
    },
  },
});

export default calendarSlice;
