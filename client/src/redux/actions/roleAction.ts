import { EditRole, FilterRole, Role, RolePagedList } from '../../@types/role';
import axios from '../../utils/axios';
import roleSlice from '../slices/roleSlice';
import { dispatch } from '../store';

export const { emptyCurrentRole } = roleSlice.actions;

export function getRolePagedList(filter: FilterRole) {
  return async () => {
    dispatch(roleSlice.actions.startLoading());

    try {
      const response = await axios.get<RolePagedList>(`/roles`, { params: filter });
      dispatch(roleSlice.actions.getRolePagedListSuccess(response.data));
    } catch (error) {
      dispatch(roleSlice.actions.hasError(error));
    }
  };
}

export function getRole(id: number) {
  return async () => {
    dispatch(roleSlice.actions.startLoading());

    try {
      const response = await axios.get<Role>(`/roles/${id}`);
      dispatch(roleSlice.actions.getRoleSuccess(response.data));
    } catch (error) {
      dispatch(roleSlice.actions.hasError(error));
    }
  };
}

export function createRole(dto: EditRole) {
  return async () => {
    dispatch(roleSlice.actions.startSavingError());

    try {
      const response = await axios.post<Role>(`/roles`, dto);
      return response.data;
    } catch (error) {
      dispatch(roleSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateRole(id: number, dto: EditRole) {
  return async () => {
    dispatch(roleSlice.actions.startSavingError());

    try {
      const response = await axios.put<Role>(`/roles/${id}`, dto);
      return response.data;
    } catch (error) {
      dispatch(roleSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteRole(id: number) {
  return async () => {
    dispatch(roleSlice.actions.startLoading());

    try {
      await axios.delete(`/roles/${id}`);
      dispatch(roleSlice.actions.deleteSuccess());
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
      dispatch(roleSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(roleSlice.actions.hasError(error));
    }
  };
}
