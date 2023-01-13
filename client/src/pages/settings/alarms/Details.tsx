import { Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentAlarm, getAlarm } from '../../../redux/actions/alarmAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import AlarmForm from '../../../sections/settings/alarms/details/AlarmForm';

export default function AlarmDetails() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentAlarm, error } = useSelector((state: RootState) => state.alarm);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getAlarm(Number(id)));
      }
    })();

    return () => {
      dispatch(emptyCurrentAlarm());
    };
  }, [dispatch, id, isDuplicate, isEdit]);

  useEffect(() => {
    if (error) {
      if (error instanceof AxiosError) {
        if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
          enqueueSnackbar('Not found', { variant: 'error' });
          navigate(PATH_SETTINGS.alarms.root);
        }
      }
    }
  }, [error, enqueueSnackbar, navigate]);

  return (
    <Page title={currentAlarm ? 'Alarm Settings: Edit Alarm' : 'Alarm Settings: Create Alarm'}>
      <Container maxWidth={false}>
        <AlarmForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
