import { Container } from '@mui/material';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentDeviceModel, getDeviceModel } from '../../../redux/actions/deviceModelAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import DeviceModelForm from '../../../sections/settings/device-models/details/DeviceModelForm';

export default function DeviceModelDetails() {
  const dispatch = useDispatch();

  const { currentDeviceModel, detailsError } = useSelector((state: RootState) => state.deviceModel);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getDeviceModel(Number(id)));

        if (detailsError && detailsError.statusCode === 404) {
          navigate(PATH_SETTINGS.deviceModels.root);
        }
      }
    })();

    return () => {
      dispatch(emptyCurrentDeviceModel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <Page title={currentDeviceModel ? 'Model Settings: Edit Model' : 'Model Settings: Create Model'}>
      <Container maxWidth={false}>
        <DeviceModelForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
