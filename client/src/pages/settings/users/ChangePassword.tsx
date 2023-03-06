import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useContext, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentUser, getUser } from '../../../redux/actions/userAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_PAGES, PATH_SETTINGS } from '../../../routes/paths';
import ChangePasswordForm from '../../../sections/settings/users/details/ChangePasswordForm';
import { AbilityContext } from '../../../caslContext';
import { RoleAction, RoleSubject } from '../../../@types/role';

export default function UserChangePassword() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { error, isLoading } = useSelector((state: RootState) => state.user);

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

  const ability = useContext(AbilityContext);

  if (!ability.can(RoleAction.Update, RoleSubject.UserSettings)) {
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
