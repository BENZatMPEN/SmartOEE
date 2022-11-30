import { createSlice } from '@reduxjs/toolkit';
import { Role, RolePagedList } from '../../@types/role';

export type RoleState = {
  isLoading: boolean;
  error: any | string | null;
  pagedList: RolePagedList;
  isDetailsLoading: boolean;
  currentRole: Role | null;
  detailsError: any | string | null;
};

const initialState: RoleState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  isDetailsLoading: false,
  currentRole: null,
  detailsError: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getRolesSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startDetailsLoading(state) {
      state.isDetailsLoading = true;
    },
    hasDetailsError(state, action) {
      state.isDetailsLoading = false;
      state.detailsError = action.payload;
    },
    emptyCurrentRole(state) {
      state.currentRole = null;
    },
    updateRoleSettings(state, action) {
      // const {roles} = state.currentRole;

      console.log(action.payload);
      // const newRoles = [...roles];
      // for (const role of roles) {
      //   if (role.role === roleName) {
      //     for (const permission of role.permissions) {
      //       if (permission.permission === permissionName) {
      //         permission.allow = !permission.allow;
      //         break;
      //       }
      //     }
      //     break;
      //   }
      // }
      //
      // onUpdated(newRoles);
    },
    getRoleDetailsSuccess(state, action) {
      state.isDetailsLoading = false;
      state.currentRole = action.payload;
    },
    createRoleSuccess(state) {
      state.isDetailsLoading = false;
    },
    updateRoleSuccess(state) {
      state.isDetailsLoading = false;
    },
  },
});

export default roleSlice;
