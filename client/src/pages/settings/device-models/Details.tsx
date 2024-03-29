import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useContext, useEffect } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentDeviceModel, getDeviceModel } from '../../../redux/actions/deviceModelAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_PAGES, PATH_SETTINGS } from '../../../routes/paths';
import DeviceModelForm from '../../../sections/settings/device-models/details/DeviceModelForm';
import { AbilityContext } from '../../../caslContext';
import { RoleAction, RoleSubject } from '../../../@types/role';

export default function DeviceModelDetails() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentDeviceModel, error, isLoading } = useSelector((state: RootState) => state.deviceModel);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getDeviceModel(Number(id)));
      }
    })();

    return () => {
      dispatch(emptyCurrentDeviceModel());
    };
  }, [dispatch, id, isDuplicate, isEdit]);

  useEffect(() => {
    if (error) {
      if (error instanceof AxiosError) {
        if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
          enqueueSnackbar('Not found', { variant: 'error' });
          navigate(PATH_SETTINGS.deviceModels.root);
        }
      }
    }
  }, [error, enqueueSnackbar, navigate]);

  const ability = useContext(AbilityContext);

  if (!isEdit && !ability.can(RoleAction.Create, RoleSubject.ModelSettings)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  if (isEdit && !ability.can(RoleAction.Update, RoleSubject.ModelSettings)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  return (
    <Page title={`Model Settings: ${currentDeviceModel ? 'Edit Model' : 'Create Model'}`}>
      <Container maxWidth={false}>
        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : (
          <DeviceModelForm isEdit={isEdit} />
        )}
      </Container>
    </Page>
  );
}
