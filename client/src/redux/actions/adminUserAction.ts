import { EditAdminUser, EditUser, EditUserPassword, FilterUser, User, UserPagedList } from '../../@types/user';
import axios from '../../utils/axios';
import adminUserSlice from '../slices/adminUserSlice';
import { dispatch } from '../store';

export const { emptyCurrentUser } = adminUserSlice.actions;

export function getUserPagedList(filter: FilterUser) {
  return async () => {
    dispatch(adminUserSlice.actions.startLoading());

    try {
      const response = await axios.get<UserPagedList>(`/admin/users`, { params: filter });
      dispatch(adminUserSlice.actions.getUserPagedListSuccess(response.data));
    } catch (error) {
      dispatch(adminUserSlice.actions.hasError(error));
    }
  };
}

export function getUser(id: number) {
  return async () => {
    dispatch(adminUserSlice.actions.startLoading());

    try {
      const response = await axios.get<User>(`/admin/users/${id}`);
      dispatch(adminUserSlice.actions.getUserSuccess(response.data));
    } catch (error) {
      dispatch(adminUserSlice.actions.hasError(error));
    }
  };
}

export function createUser(dto: EditAdminUser & EditUserPassword) {
  return async () => {
    dispatch(adminUserSlice.actions.startSavingError());

    try {
      const response = await axios.post<User>(`/admin/users`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(adminUserSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateUser(id: number, dto: EditAdminUser) {
  return async () => {
    dispatch(adminUserSlice.actions.startSavingError());

    try {
      const response = await axios.put<User>(`/admin/users/${id}`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(adminUserSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteUser(id: number) {
  return async () => {
    dispatch(adminUserSlice.actions.startLoading());

    try {
      await axios.delete(`/admin/users/${id}`);
    } catch (error) {
      dispatch(adminUserSlice.actions.hasError(error));
    }
  };
}

export function deleteUsers(selectedIds: number[]) {
  return async () => {
    dispatch(adminUserSlice.actions.startLoading());

    try {
      await axios.delete(`/admin/users`, {
        params: { ids: selectedIds },
      });
    } catch (error) {
      dispatch(adminUserSlice.actions.hasError(error));
    }
  };
}
