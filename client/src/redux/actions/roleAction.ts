import { FilterRole, Role, RolePagedList } from '../../@types/role';
import axios from '../../utils/axios';
import roleSlice from '../slices/roleSlice';
import { dispatch } from '../store';

export const { emptyCurrentRole, updateRoleSettings } = roleSlice.actions;

export function getRolePagedList(filter: FilterRole) {
  return async () => {
    dispatch(roleSlice.actions.startLoading());

    try {
      const response = await axios.get<RolePagedList>(`/roles`, { params: filter });
      dispatch(roleSlice.actions.getRolesSuccess(response.data));
    } catch (error) {
      dispatch(roleSlice.actions.hasError(error));
    }
  };
}

export function getRole(id: number) {
  return async () => {
    dispatch(roleSlice.actions.startDetailsLoading());

    try {
      const response = await axios.get<Role>(`/roles/${id}`);
      dispatch(roleSlice.actions.getRoleDetailsSuccess(response.data));
    } catch (error) {
      dispatch(roleSlice.actions.hasDetailsError(error));
    }
  };
}

export function createRole(dto: any) {
  return async () => {
    dispatch(roleSlice.actions.startDetailsLoading());

    try {
      const response = await axios.post<Role>(`/roles`, dto);
      const { data } = response;
      dispatch(roleSlice.actions.createRoleSuccess());
      dispatch(roleSlice.actions.emptyCurrentRole());
      return data;
    } catch (error) {
      dispatch(roleSlice.actions.hasDetailsError(error));
      return null;
    }
  };
}

export function updateRole(id: number, dto: any) {
  return async () => {
    dispatch(roleSlice.actions.startDetailsLoading());

    try {
      const response = await axios.put<Role>(`/roles/${id}`, dto);
      const { data } = response;
      dispatch(roleSlice.actions.updateRoleSuccess());
      dispatch(roleSlice.actions.emptyCurrentRole());
      return data;
    } catch (error) {
      dispatch(roleSlice.actions.hasDetailsError(error));
      return null;
    }
  };
}

export function deleteRole(id: number) {
  return async () => {
    dispatch(roleSlice.actions.startLoading());

    try {
      await axios.delete(`/roles/${id}`);
    } catch (error) {
      dispatch(roleSlice.actions.hasError(error));
    }
  };
}

export function deleteRoles(selectedIds: number[]) {
  return async () => {
    dispatch(roleSlice.actions.startLoading());

    try {
      await axios.delete(`/roles`, {
        params: { ids: selectedIds },
      });
    } catch (error) {
      dispatch(roleSlice.actions.hasError(error));
    }
  };
}
