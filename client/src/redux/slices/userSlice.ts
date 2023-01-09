import { createSlice } from '@reduxjs/toolkit';
import { Role } from '../../@types/role';
import { User, UserPagedList } from '../../@types/user';

export type UserState = {
  isLoading: boolean;
  pagedList: UserPagedList;
  isDetailsLoading: boolean;
  currentUser: User | null;
};

const initialState: UserState = {
  isLoading: false,
  pagedList: {
    list: [],
    count: 0,
  },
  isDetailsLoading: false,
  currentUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    getUserPagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startDetailsLoading(state) {
      state.isDetailsLoading = true;
    },
    emptyCurrentUser(state) {
      state.currentUser = null;
    },
    getUserSuccess(state, action) {
      state.isDetailsLoading = false;
      state.currentUser = action.payload;
    },
    createUserSuccess(state) {
      state.isDetailsLoading = false;
    },
    updateUserSuccess(state) {
      state.isDetailsLoading = false;
    },
  },
});

export default userSlice;
