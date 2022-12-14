import { Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentUser, getUser } from '../../../redux/actions/userAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_ADMINISTRATOR } from '../../../routes/paths';
import UserForm from '../../../sections/admin/users/details/UserForm';

export default function UserDetails() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { currentUser } = useSelector((state: RootState) => state.user);

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

  return (
    <Page title={`User Settings: ${currentUser ? 'Edit User' : 'Create User'}`}>
      <Container maxWidth={false}>
        <UserForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
