import { createSlice } from '@reduxjs/toolkit';
import { Faq, FaqPagedList } from '../../@types/faq';

export type FaqState = {
  isLoading: boolean;
  error: any | null;
  pagedList: FaqPagedList;
  currentFaq: Faq | null;
  saveError: any | null;
};

const initialState: FaqState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentFaq: null,
  saveError: null,
};

const faqSlice = createSlice({
  name: 'faq',
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
    getFaqPagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentFaq(state) {
      state.currentFaq = null;
    },
    getFaqSuccess(state, action) {
      state.isLoading = false;
      state.currentFaq = action.payload;
    },
    deleteSuccess(state) {
      state.isLoading = false;
    },
  },
});

export default faqSlice;
