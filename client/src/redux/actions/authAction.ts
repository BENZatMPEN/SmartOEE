import { EditProfile, EditUserPassword, User } from '../../@types/user';
import axios from '../../utils/axios';
import authSlice from '../slices/authSlice';
import { dispatch } from '../store';

export const { resetAuth } = authSlice.actions;

export function getUserProfile() {
  return async () => {
    dispatch(authSlice.actions.startLoading());

    try {
      const response = await axios.get<User>(`/auth/user-profile`);
      dispatch(authSlice.actions.getUserProfileSuccess(response.data));
    } catch (error) {
      dispatch(authSlice.actions.hasError(error));
    }
  };
}

export function updateProfile(dto: EditProfile) {
  return async () => {
    dispatch(authSlice.actions.startSavingError());

    try {
      const response = await axios.put<User>(`/auth/update-profile`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(authSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function changePassword(dto: EditUserPassword) {
  return async () => {
    dispatch(authSlice.actions.startSavingError());

    try {
      await axios.put(`/auth/change-password`, dto);
    } catch (error) {
      dispatch(authSlice.actions.hasSaveError(error));
      return null;
    }
  };
}
