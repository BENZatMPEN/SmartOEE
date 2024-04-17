import { Card, CardContent, Container, Grid, Stack } from '@mui/material';
import { useContext, useEffect } from 'react';
import { OeeStatus } from '../../@types/oee';
import { RoleAction, RoleSubject } from '../../@types/role';
import { AbilityContext } from '../../caslContext';
import Page from '../../components/Page';
import useWebSocket from '../../hooks/useWebSocket';
import { getOeeStatus, updateOeeStatus } from '../../redux/actions/oeeDashboardAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import DashboardHeader from '../../sections/dashboard/DashboardHeader';
import DashboardOeeGridItem from '../../sections/dashboard/DashboardOeeGridItem';
import DashboardOeeTimelineItem from '../../sections/dashboard/DashboardOeeTimelineItem';
import { PATH_PAGES } from '../../routes/paths';
import { Navigate, useNavigate } from 'react-router-dom';

export default function List() {
  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { userProfile } = useSelector((state: RootState) => state.auth);

  const { ganttView } = useSelector((state: RootState) => state.userSite);

  const { oeeStatus, isLoading } = useSelector((state: RootState) => state.oeeDashboard);

  const dispatch = useDispatch();

  const { socket } = useWebSocket();

  const { oees } = oeeStatus;

  useEffect(() => {
    (async () => {
      if (userProfile) {
        await dispatch(getOeeStatus(userProfile.id));
      }
    })();
  }, [dispatch, userProfile]);

  useEffect(() => {
    if (!socket || !selectedSite) {
      return;
    }

    const updateDashboard = (data: OeeStatus) => {
      dispatch(updateOeeStatus(data));
    };
    if (userProfile?.isAdmin) {
      socket.on(`dashboard_${selectedSite.id}`, updateDashboard);

      return () => {
        socket.off(`dashboard_${selectedSite.id}`, updateDashboard);
      };
    } else {
      socket.on(`dashboard_${selectedSite.id}_${userProfile?.id}`, updateDashboard);

      return () => {
        socket.off(`dashboard_${selectedSite.id}_${userProfile?.id}`, updateDashboard);
      };
    }

  }, [dispatch, socket, selectedSite, userProfile]);

  const ability = useContext(AbilityContext);

  if (!ability.can(RoleAction.Read, RoleSubject.Dashboard)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  return (
    <Page title="Dashboard">
      <Container maxWidth={false}>
        <DashboardHeader />

        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : ganttView ? (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Stack>
                {oees.map((item) => (
                  <DashboardOeeTimelineItem key={item.id} oeeStatusItem={item} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {oees.map((item) => (
              <Grid key={item.id} item sm={6} md={4} sx={{ p: 2 }}>
                <DashboardOeeGridItem oeeStatusItem={item} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Page>
  );
}
