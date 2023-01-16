import { User } from '../../@types/user';
import axios from '../../utils/axios';
import authSlice from '../slices/authSlice';
import { dispatch } from '../store';

export const { resetAuth } = authSlice.actions;

export function getUserInfo() {
  return async () => {
    dispatch(authSlice.actions.startLoading());

    try {
      const response = await axios.get<User>(`/auth/user-info`);
      dispatch(authSlice.actions.getUserInfoSuccess(response.data));
    } catch (error) {
      dispatch(authSlice.actions.hasError(error));
    }
  };
}
