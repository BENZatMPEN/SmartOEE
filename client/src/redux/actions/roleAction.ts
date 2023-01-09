import { EditRole, FilterRole, Role, RolePagedList } from '../../@types/role';
import axios from '../../utils/axios';
import roleSlice from '../slices/roleSlice';
import { dispatch } from '../store';

export const { emptyCurrentRole, emptyRoleOptions, updateRoleSettings } = roleSlice.actions;

export function getRoleOptions(siteId: number) {
  return async () => {
    dispatch(roleSlice.actions.startLoading());
    const response = await axios.get<Role[]>(`/roles/options`, { params: { siteId } });
    dispatch(roleSlice.actions.getRoleOptionsSuccess(response.data));
  };
}

export function getRolePagedList(filter: FilterRole) {
  return async () => {
    dispatch(roleSlice.actions.startLoading());
    const response = await axios.get<RolePagedList>(`/roles`, { params: filter });
    dispatch(roleSlice.actions.getRolePagedListSuccess(response.data));
  };
}

export function getRole(id: number) {
  return async () => {
    dispatch(roleSlice.actions.startDetailsLoading());
    const response = await axios.get<Role>(`/roles/${id}`);
    dispatch(roleSlice.actions.getRoleDetailsSuccess(response.data));
  };
}

export function createRole(dto: EditRole) {
  return async () => {
    dispatch(roleSlice.actions.startDetailsLoading());
    const response = await axios.post<Role>(`/roles`, dto);
    dispatch(roleSlice.actions.createRoleSuccess());
    dispatch(roleSlice.actions.emptyCurrentRole());
    return response.data;
  };
}

export function updateRole(id: number, dto: EditRole) {
  return async () => {
    dispatch(roleSlice.actions.startDetailsLoading());
    const response = await axios.put<Role>(`/roles/${id}`, dto);
    dispatch(roleSlice.actions.updateRoleSuccess());
    dispatch(roleSlice.actions.emptyCurrentRole());
    return response.data;
  };
}

export function deleteRole(id: number) {
  return async () => {
    dispatch(roleSlice.actions.startLoading());
    await axios.delete(`/roles/${id}`);
  };
}

export function deleteRoles(selectedIds: number[]) {
  return async () => {
    dispatch(roleSlice.actions.startLoading());
    await axios.delete(`/roles`, {
      params: { ids: selectedIds },
    });
  };
}
