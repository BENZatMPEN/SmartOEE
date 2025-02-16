import { createSlice } from '@reduxjs/toolkit';
import { Oee, OeeStatus, OeeStatusAdvanced } from '../../@types/oee';

export type OeeAdvancedState = {
  selectedOee: Oee | null;
  oeeStatus: OeeStatusAdvanced;
  isLoading: boolean;
  error: any | null;
  modeView : string;
  advancedType : string;
  formStreaming : {
    startDateTime: string;
    endDateTime:string;
    isStreaming : boolean;
  }
};

const initialState: OeeAdvancedState = {
  selectedOee: null,
  oeeStatus: {
    running: 0,
    breakdown: 0,
    standby: 0,
    ended: 0,
    mcSetup: 0,
    oees: [],
    lossOees : [],
    columns : [],
    oeeGroups : []
  },
  isLoading: false,
  error: null,
  modeView: 'mode1',
  advancedType: 'oee',
  formStreaming : {
    startDateTime: "",
    endDateTime:"",
    isStreaming : false
  }
};

const oeeAdvancedSlice = createSlice({
  name: 'oeeAdvanced',
  initialState,
  reducers: {
    // resetOee: () => initialState,
    getOeeStatusSuccess(state, action) {
      state.isLoading = false;
      state.oeeStatus = action.payload;
    },
    updateOeeStatus(state, action) {
      state.oeeStatus = action.payload;
    },
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    stopLoading(state) {
      state.isLoading = false;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getOeeSuccess(state, action) {
      state.isLoading = false;
      state.selectedOee = action.payload;
    },
    emptySelectedOee(state) {
      state.selectedOee = null;
    },
    setModeView(state, action) {
      state.modeView = action.payload;
    },
    setAdvancedType(state, action) {
      state.advancedType = action.payload;
    },
    setFormStreaming(state, action) {
      state.formStreaming = action.payload;
    }
  },
});

export default oeeAdvancedSlice;
