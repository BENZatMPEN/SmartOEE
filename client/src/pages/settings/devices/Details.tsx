import { Container } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentDevice, getDevice } from '../../../redux/actions/deviceAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import DeviceSummary from '../../../sections/settings/devices/details/DeviceSummary';

export default function DeviceDetails() {
  const { id } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { currentDevice, detailsError } = useSelector((state: RootState) => state.device);

  useEffect(() => {
    (async () => {
      await dispatch(getDevice(Number(id)));

      if (detailsError && detailsError.statusCode === 404) {
        navigate(PATH_SETTINGS.devices.root);
      }
    })();

    return () => {
      dispatch(emptyCurrentDevice());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <Page title="Device">
      <Container maxWidth={false}>{currentDevice && <DeviceSummary />}</Container>
    </Page>
  );
}
