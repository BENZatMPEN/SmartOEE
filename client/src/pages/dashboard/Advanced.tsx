import { Card, CardContent, Container, Divider, Grid, Stack, Typography } from '@mui/material';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { OeeStatus } from '../../@types/oee';
import { RoleAction, RoleSubject } from '../../@types/role';
import { AbilityContext } from '../../caslContext';
import Page from '../../components/Page';
import useWebSocket from '../../hooks/useWebSocket';
import {
  emptySelectedOee,
  getAndonStatus,
  getOee,
  getOeeStatus,
  getTeepStatus,
  updateOeeStatus,
} from '../../redux/actions/oeeAdvancedAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import DashboardHeader from '../../sections/dashboard/DashboardHeader';

import { PATH_PAGES } from '../../routes/paths';
import { Navigate } from 'react-router-dom';
import StreamingForm from 'src/sections/dashboard/details/advanced/StreamingForm';
import AdvancedForm from 'src/sections/dashboard/details/advanced/AdvancedForm';
import DashboardAdvancedGridItem from 'src/sections/dashboard/details/advanced/DashboardAdvancedGridItem';
import DashboardVerticalStackedBarChart from 'src/sections/dashboard/DashboardVerticalStackedBarChart';

import { initialOeeStats, OEE_TYPE_OEE } from 'src/constants';
import { getPercentSettingsByType } from 'src/utils/percentSettingHelper';
import DashboardAPQBar from 'src/sections/dashboard/details/advanced/DashboardAPQBar';
import DashboardPieChart from 'src/sections/dashboard/details/advanced/DashboardPieChart';
import dayjs from 'dayjs';
// import utc from "dayjs/plugin/utc"

import DashboardTableAndon from 'src/sections/dashboard/details/advanced/table-andon/DashboardTableAndon';
// dayjs.extend(utc);

export default function Advanced() {
  const intervalRef: any = useRef(null);
  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { userProfile } = useSelector((state: RootState) => state.auth);

  const { ganttView } = useSelector((state: RootState) => state.userSite);

  const { modeView, advancedType, formStreaming } = useSelector((state: RootState) => state.oeeAdvanced);

  const { oeeStatus, isLoading } = useSelector((state: RootState) => state.oeeAdvanced);

  const { selectedOee } = useSelector((state: RootState) => state.oeeAdvanced);

  const dispatch = useDispatch();

  const { socket } = useWebSocket();
  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);

  const { oeeStats } = currentBatch || {};

  const { oeePercent } = oeeStats || initialOeeStats;

  const { oees, lossOees, columns, oeeGroups, lossHourly } = oeeStatus;
  
  useEffect(() => {
    (async () => {
      if (userProfile && formStreaming.startDateTime && formStreaming.endDateTime) {
        if (formStreaming.isStreaming) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          // Setup new interval
          intervalRef.current = setInterval(async () => {
            await dispatch(
              getOeeStatus(
                userProfile.id,
                dayjs(formStreaming.startDateTime).format('YYYY-MM-DD HH:mm:ss'),
                dayjs(formStreaming.endDateTime).format('YYYY-MM-DD HH:mm:ss'),
                modeView,
              ),
            );
          }, 180000);
          // 180000
          // Clean up on component unmount or state change
          return () => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          };
        }
        clearInterval(intervalRef.current);
        if (advancedType === 'oee') {
          await dispatch(
            getOeeStatus(
              userProfile.id,
              dayjs(formStreaming.startDateTime).format('YYYY-MM-DD HH:mm:ss'),
              dayjs(formStreaming.endDateTime).format('YYYY-MM-DD HH:mm:ss'),
              modeView,
            ),
          );
        }
        if (advancedType === 'teep') {
          await dispatch(
            getTeepStatus(
              userProfile.id,
              dayjs(formStreaming.startDateTime).format('YYYY-MM-DD HH:mm:ss'),
              dayjs(formStreaming.endDateTime).format('YYYY-MM-DD HH:mm:ss'),
              modeView,
            ),
          );
        }

        if (advancedType === 'andon') {
          await dispatch(
            getAndonStatus(
              userProfile.id,
              dayjs(formStreaming.startDateTime).format('YYYY-MM-DD HH:mm:ss'),
              dayjs(formStreaming.endDateTime).format('YYYY-MM-DD HH:mm:ss'),
            ),
          );
        }
      }
    })();
  }, [dispatch, userProfile, formStreaming, modeView, advancedType]);

  const percents = useMemo(
    () =>
      getPercentSettingsByType(
        selectedSite,
        selectedOee?.percentSettings || [],
        selectedOee?.useSitePercentSettings || true,
        advancedType,
      ),
    [selectedSite, selectedOee],
  );

  const ability = useContext(AbilityContext);

  if (!ability.can(RoleAction.Read, RoleSubject.Dashboard)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }
  
  return (
    <Page title="Advanced">
      <Container maxWidth={false}>
        <DashboardHeader showTools={false} />

        <Divider sx={{ marginBottom: '18px' }} />
        <Grid container>
          <Grid item xs={12} sm={6} sx={{ marginBottom: 2 }}>
            <StreamingForm />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AdvancedForm />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item sm={6}>
            <Typography fontSize={20}>
              Time : {formStreaming.endDateTime ? dayjs(formStreaming.endDateTime).format('HH:mm:ss') : '00:00:00'}
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ marginBottom: '18px' }} />

        {isLoading && (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        )}
        {!isLoading && advancedType !== 'andon' ? (
          !isLoading && modeView === 'mode2' ? (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Stack>
                  {advancedType === 'teep' &&
                    lossHourly?.map((item, index) => (
                      <Grid container spacing={2} key={item.oeeId}>
                        <>
                          <Grid
                            item
                            xs={12}
                            sm={2}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              gap: 4,
                              pt: '20px !important',
                            }}
                          >
                            <DashboardPieChart
                              high={percents.high}
                              medium={percents.medium}
                              low={percents.low}
                              oeeType={advancedType.toUpperCase()}
                              percent={oees[index].oeePercent}
                            />

                            <DashboardAPQBar oeeStatusItem={oees[index]} />
                          </Grid>

                          <Grid item xs={12} sm={10}>
                            <DashboardVerticalStackedBarChart oeeStatusItem={item} />
                          </Grid>
                        </>
                      </Grid>
                    ))
                    }
                  {lossOees?.map((item, index) => (
                    <Grid container spacing={2} key={item.oeeId}>
                      <>
                        <Grid
                          item
                          xs={12}
                          sm={2}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 4,
                            pt: '20px !important',
                          }}
                        >
                          <DashboardPieChart
                            high={percents.high}
                            medium={percents.medium}
                            low={percents.low}
                            oeeType={advancedType.toUpperCase()}
                            percent={oees[index].oeePercent}
                          />

                          <DashboardAPQBar oeeStatusItem={oees[index]} />
                        </Grid>

                        <Grid item xs={12} sm={10}>
                          <DashboardVerticalStackedBarChart oeeStatusItem={item} />
                        </Grid>
                      </>
                    </Grid>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {oees &&
                oees.map((item) => (
                  <Grid key={item.id} item sm={6} md={4} sx={{ p: 2 }}>
                    <DashboardAdvancedGridItem oeeStatusItem={item} oeeType={advancedType.toUpperCase()} />
                  </Grid>
                ))}
            </Grid>
          )
        ) : (
          !isLoading && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Stack>
                  <Grid container spacing={2}>
                    {<DashboardTableAndon valueForm={formStreaming} userId={userProfile?.id} />}
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          )
        )}
      </Container>
    </Page>
  );
}
