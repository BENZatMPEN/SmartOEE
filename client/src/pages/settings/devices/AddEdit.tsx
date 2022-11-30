import { Container } from '@mui/material';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentDevice, getDevice } from '../../../redux/actions/deviceAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import DeviceForm from '../../../sections/settings/devices/addEdit/DeviceForm';

export default function DeviceDetails() {
  const dispatch = useDispatch();

  const { currentDevice, detailsError } = useSelector((state: RootState) => state.device);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getDevice(Number(id)));

        if (detailsError && detailsError.statusCode === 404) {
          navigate(PATH_SETTINGS.devices.root);
        }
      }
    })();

    return () => {
      dispatch(emptyCurrentDevice());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <Page title={currentDevice ? 'Device Settings: Edit Device' : 'Device Settings: Create Device'}>
      <Container maxWidth={false}>
        <DeviceForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
