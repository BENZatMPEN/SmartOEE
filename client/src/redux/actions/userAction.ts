import { EditUser, EditUserPassword, FilterUser, User, UserPagedList } from '../../@types/user';
import axios from '../../utils/axios';
import userSlice from '../slices/userSlice';
import { dispatch } from '../store';

export const { emptyCurrentUser } = userSlice.actions;

export function getUserPagedList(filter: FilterUser) {
  return async () => {
    dispatch(userSlice.actions.startLoading());

    try {
      const response = await axios.get<UserPagedList>(`/users`, { params: filter });
      dispatch(userSlice.actions.getUserPagedListSuccess(response.data));
    } catch (error) {
      dispatch(userSlice.actions.hasError(error));
    }
  };
}

export function getUser(id: number) {
  return async () => {
    dispatch(userSlice.actions.startLoading());

    try {
      const response = await axios.get<User>(`/users/${id}`);
      dispatch(userSlice.actions.getUserSuccess(response.data));
    } catch (error) {
      dispatch(userSlice.actions.hasError(error));
    }
  };
}

export function createUser(dto: EditUser & EditUserPassword) {
  return async () => {
    dispatch(userSlice.actions.startSavingError());

    try {
      const response = await axios.post<User>(`/users`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(userSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateUser(id: number, dto: EditUser) {
  return async () => {
    dispatch(userSlice.actions.startSavingError());

    try {
      const response = await axios.put<User>(`/users/${id}`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(userSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteUser(id: number) {
  return async () => {
    dispatch(userSlice.actions.startLoading());

    try {
      await axios.delete(`/users/${id}`);
      dispatch(userSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(userSlice.actions.hasError(error));
    }
  };
}

export function deleteUsers(selectedIds: number[]) {
  return async () => {
    dispatch(userSlice.actions.startLoading());

    try {
      await axios.delete(`/users`, {
        params: { ids: selectedIds },
      });
      dispatch(userSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(userSlice.actions.hasError(error));
    }
  };
}
