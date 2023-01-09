import { Container } from '@mui/material';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { getDashboard } from '../../../redux/actions/dashboardAction';
import { emptyCurrentDevice } from '../../../redux/actions/deviceAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import DashboardForm from '../../../sections/settings/dashboard/details/DashboardForm';

export default function DashboardDetails() {
  const dispatch = useDispatch();

  const { currentDashboard, detailsError } = useSelector((state: RootState) => state.dashboard);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getDashboard(Number(id)));

        if (detailsError && detailsError.statusCode === 404) {
          navigate(PATH_SETTINGS.dashboard.root);
        }
      }
    })();

    return () => {
      dispatch(emptyCurrentDevice());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <Page title={currentDashboard ? 'Dashboard Settings: Edit Dashboard' : 'Dashboard Settings: Create Dashboard'}>
      <Container maxWidth={false}>
        <DashboardForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
