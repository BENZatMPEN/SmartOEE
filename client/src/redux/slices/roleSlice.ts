import { createSlice } from '@reduxjs/toolkit';
import { OptionItem } from '../../@types/option';
import { Role, RolePagedList } from '../../@types/role';

export type RoleState = {
  isLoading: boolean;
  roleOptions: OptionItem[];
  pagedList: RolePagedList;
  isDetailsLoading: boolean;
  currentRole: Role | null;
};

const initialState: RoleState = {
  isLoading: false,
  roleOptions: [],
  pagedList: {
    list: [],
    count: 0,
  },
  isDetailsLoading: false,
  currentRole: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    getRoleOptionsSuccess(state, action) {
      state.isLoading = false;
      state.roleOptions = action.payload;
    },
    getRolePagedListSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startDetailsLoading(state) {
      state.isDetailsLoading = true;
    },
    emptyCurrentRole(state) {
      state.currentRole = null;
    },
    emptyRoleOptions(state) {
      state.roleOptions = [];
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
