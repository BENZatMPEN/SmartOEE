import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentPlannedDowntime, getPlannedDowntime } from '../../../redux/actions/plannedDowntimeAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import PlannedDowntimeForm from '../../../sections/settings/planned-downtimes/details/PlannedDowntimeForm';

export default function PlannedDowntimeDetails() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentPlannedDowntime, error, isLoading } = useSelector((state: RootState) => state.plannedDowntime);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getPlannedDowntime(Number(id)));
      }
    })();

    return () => {
      dispatch(emptyCurrentPlannedDowntime());
    };
  }, [dispatch, id, isDuplicate, isEdit]);

  useEffect(() => {
    if (error) {
      if (error instanceof AxiosError) {
        if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
          enqueueSnackbar('Not found', { variant: 'error' });
          navigate(PATH_SETTINGS.plannedDowntimes.root);
        }
      }
    }
  }, [error, enqueueSnackbar, navigate]);

  return (
    <Page
      title={`Planned Downtime Settings: ${
        currentPlannedDowntime ? 'Edit Planned Downtime' : 'Create Planned Downtime'
      }`}
    >
      <Container maxWidth={false}>
        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : (
          <PlannedDowntimeForm isEdit={isEdit} />
        )}
      </Container>
    </Page>
  );
}
