import { Card, CardContent, Container, Grid, Stack } from '@mui/material';
import { useContext, useEffect } from 'react';
import { OeeStatus } from '../../@types/oee';
import { AbilityContext } from '../../caslContext';
import Page from '../../components/Page';
import useWebSocket from '../../hooks/useWebSocket';
import { getOeeStatus, updateOeeStatus } from '../../redux/actions/oeeDashboardAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import DashboardHeader from '../../sections/dashboard/DashboardHeader';
import DashboardOeeGridItem from '../../sections/dashboard/DashboardOeeGridItem';
import DashboardOeeTimelineItem from '../../sections/dashboard/DashboardOeeTimelineItem';

export default function List() {
  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { ganttView } = useSelector((state: RootState) => state.userSite);

  const { oeeStatus } = useSelector((state: RootState) => state.oeeDashboard);

  const dispatch = useDispatch();

  const { socket } = useWebSocket();

  const { oees } = oeeStatus;

  const ability = useContext(AbilityContext);

  useEffect(() => {
    (async () => {
      await dispatch(getOeeStatus());
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!socket || !selectedSite) {
      return;
    }

    const updateDashboard = (data: OeeStatus) => {
      dispatch(updateOeeStatus(data));
    };

    socket.on(`dashboard_${selectedSite.id}`, updateDashboard);

    return () => {
      socket.off(`dashboard_${selectedSite.id}`, updateDashboard);
    };
  }, [dispatch, socket, selectedSite]);

  return (
    <Page title="Dashboard">
      <Container maxWidth={false}>
        {/*{ability.can(RoleAction.Read, RoleSubject.Dashboard) && <div>Can Read</div>}*/}

        {/*{ability.can(RoleAction.Update, RoleSubject.Dashboard) && <div>Can Update</div>}*/}

        <DashboardHeader />

        {ganttView ? (
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
