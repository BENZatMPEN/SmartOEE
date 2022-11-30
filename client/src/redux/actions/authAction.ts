import { Role } from '../../@types/role';
import axios from '../../utils/axios';
import authSlice from '../slices/authSlice';
import { dispatch } from '../store';

export const { resetAuth } = authSlice.actions;

export function getAuthRole() {
  return async () => {
    dispatch(authSlice.actions.startLoading());

    try {
      const response = await axios.get<Role>(`/auth/role`);
      dispatch(authSlice.actions.getRoleSuccess(response.data));
    } catch (error) {
      dispatch(authSlice.actions.hasError(error));
    }
  };
}
