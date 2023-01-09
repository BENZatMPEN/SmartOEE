import { EditUser, EditUserPassword, FilterUser, User, UserPagedList } from '../../@types/user';
import axios from '../../utils/axios';
import userSlice from '../slices/userSlice';
import { dispatch } from '../store';

export const { emptyCurrentUser } = userSlice.actions;

export function getUserPagedList(filter: FilterUser) {
  return async () => {
    dispatch(userSlice.actions.startLoading());
    const response = await axios.get<UserPagedList>(`/users`, { params: filter });
    dispatch(userSlice.actions.getUserPagedListSuccess(response.data));
  };
}

export function getUser(id: number) {
  return async () => {
    dispatch(userSlice.actions.startDetailsLoading());
    const response = await axios.get<User>(`/users/${id}`);
    dispatch(userSlice.actions.getUserSuccess(response.data));
  };
}

export function createUser(dto: EditUser & EditUserPassword) {
  return async () => {
    dispatch(userSlice.actions.startDetailsLoading());
    const response = await axios.post<User>(`/users`, dto, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    dispatch(userSlice.actions.createUserSuccess());
    dispatch(userSlice.actions.emptyCurrentUser());
    return response.data;
  };
}

export function updateUser(id: number, dto: EditUser) {
  return async () => {
    dispatch(userSlice.actions.startDetailsLoading());
    const response = await axios.put<User>(`/users/${id}`, dto, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    dispatch(userSlice.actions.updateUserSuccess());
    dispatch(userSlice.actions.emptyCurrentUser());
    return response.data;
  };
}

export function deleteUser(id: number) {
  return async () => {
    dispatch(userSlice.actions.startLoading());
    await axios.delete(`/users/${id}`);
  };
}

export function deleteUsers(selectedIds: number[]) {
  return async () => {
    dispatch(userSlice.actions.startLoading());
    await axios.delete(`/users`, {
      params: { ids: selectedIds },
    });
  };
}
