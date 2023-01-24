import { createSlice } from '@reduxjs/toolkit';
import { User, UserPagedList } from '../../@types/user';

export type UserState = {
  isLoading: boolean;
  error: any | null;
  pagedList: UserPagedList;
  currentUser: User | null;
  saveError: any | null;
};

const initialState: UserState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentUser: null,
  saveError: null,
};

const userSlice = createSlice({
  name: 'user',
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
    getUserPagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentUser(state) {
      state.currentUser = null;
    },
    getUserSuccess(state, action) {
      state.isLoading = false;
      state.currentUser = action.payload;
    },
    deleteSuccess(state) {
      state.isLoading = false;
    },
  },
});

export default userSlice;
