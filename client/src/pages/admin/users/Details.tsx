import { Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentUser, getUser } from '../../../redux/actions/adminUserAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_ADMINISTRATOR, PATH_PAGES } from '../../../routes/paths';
import UserForm from '../../../sections/admin/users/details/AdminUserForm';

export default function AdminUserDetails() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { currentUser } = useSelector((state: RootState) => state.adminUser);

  const { userProfile } = useSelector((state: RootState) => state.auth);

  const { pathname } = useLocation();

  const { id } = useParams();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      try {
        if (isEdit || isDuplicate) {
          await dispatch(getUser(Number(id)));
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
            enqueueSnackbar('Not found.', { variant: 'error' });
          } else {
            enqueueSnackbar(error.response?.data.error, { variant: 'error' });
          }
        }

        navigate(PATH_ADMINISTRATOR.users.root);
      }
    })();

    return () => {
      dispatch(emptyCurrentUser());
    };
  }, [dispatch, enqueueSnackbar, id, isDuplicate, isEdit, navigate]);

  if (userProfile && !userProfile.isAdmin) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  return (
    <Page title={`User Settings: ${currentUser ? 'Edit User' : 'Create User'}`}>
      <Container maxWidth={false}>
        <UserForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
