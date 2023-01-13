import { Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentDashboard, getDashboard } from '../../../redux/actions/dashboardAction';
import { emptyCurrentDevice } from '../../../redux/actions/deviceAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import DashboardForm from '../../../sections/settings/dashboard/details/DashboardForm';

export default function DashboardDetails() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentDashboard, error } = useSelector((state: RootState) => state.dashboard);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getDashboard(Number(id)));
      }
    })();

    return () => {
      dispatch(emptyCurrentDashboard());
    };
  }, [dispatch, id, isDuplicate, isEdit]);

  useEffect(() => {
    if (error) {
      if (error instanceof AxiosError) {
        if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
          enqueueSnackbar('Not found', { variant: 'error' });
          navigate(PATH_SETTINGS.dashboard.root);
        }
      }
    }
  }, [error, enqueueSnackbar, navigate]);

  return (
    <Page title={currentDashboard ? 'Dashboard Settings: Edit Dashboard' : 'Dashboard Settings: Create Dashboard'}>
      <Container maxWidth={false}>
        <DashboardForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
