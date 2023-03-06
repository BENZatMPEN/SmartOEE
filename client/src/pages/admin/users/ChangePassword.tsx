import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentUser, getUser } from '../../../redux/actions/adminUserAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_PAGES, PATH_SETTINGS } from '../../../routes/paths';
import ChangePasswordForm from '../../../sections/admin/users/details/AdminChangePasswordForm';

export default function AdminChangePassword() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { error, isLoading } = useSelector((state: RootState) => state.user);

  const { userProfile } = useSelector((state: RootState) => state.auth);

  const { id } = useParams();

  useEffect(() => {
    (async () => {
      await dispatch(getUser(Number(id)));
    })();

    return () => {
      dispatch(emptyCurrentUser());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      if (error instanceof AxiosError) {
        if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
          enqueueSnackbar('Not found', { variant: 'error' });
          navigate(PATH_SETTINGS.users.root);
        }
      }
    }
  }, [error, enqueueSnackbar, navigate]);

  if (userProfile && !userProfile.isAdmin) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  return (
    <Page title={`User Settings: Change User Password`}>
      <Container maxWidth={false}>
        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : (
          <ChangePasswordForm />
        )}
      </Container>
    </Page>
  );
}
