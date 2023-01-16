import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentRole, getRole } from '../../../redux/actions/roleAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import RoleForm from '../../../sections/settings/roles/details/RoleForm';

export default function RoleDetails() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { currentRole, error, isLoading } = useSelector((state: RootState) => state.role);

  const { pathname } = useLocation();

  const { siteId, id } = useParams();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getRole(Number(id)));
      }
    })();

    return () => {
      dispatch(emptyCurrentRole());
    };
  }, [dispatch, id, isDuplicate, isEdit]);

  useEffect(() => {
    if (error) {
      if (error instanceof AxiosError) {
        if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
          enqueueSnackbar('Not found', { variant: 'error' });
          navigate(PATH_SETTINGS.devices.root);
        }
      }
    }
  }, [error, enqueueSnackbar, navigate]);

  return (
    <Page title={`Role Settings: ${currentRole ? 'Edit Role' : 'Create Role'}`}>
      <Container maxWidth={false}>
        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : (
          <RoleForm isEdit={isEdit} />
        )}
      </Container>
    </Page>
  );
}
