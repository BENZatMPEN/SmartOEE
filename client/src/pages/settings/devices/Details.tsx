import { Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
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

  const { enqueueSnackbar } = useSnackbar();

  const { currentDevice, error } = useSelector((state: RootState) => state.device);

  useEffect(() => {
    (async () => {
      await dispatch(getDevice(Number(id)));
    })();

    return () => {
      dispatch(emptyCurrentDevice());
    };
  }, [dispatch, id]);

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
    <Page title="Device">
      <Container maxWidth={false}>{currentDevice && <DeviceSummary />}</Container>
    </Page>
  );
}
