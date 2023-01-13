import { Grid } from '@mui/material';
import { useMemo } from 'react';
import { initialOeeStats, OEE_TYPE_OEE } from '../../../constants';
import { RootState, useSelector } from '../../../redux/store';
import { getPercentSettingsByType } from '../../../utils/percentSettingHelper';
import DashboardAPQBar from '../DashboardAPQBar';
import DashboardPieChart from '../DashboardPieChart';
import DashboardDetailsControlPanel from './DashboardDetailsControlPanel';
import DashboardDetailsStatus from './DashboardDetailsStatus';

export default function DashboardDetailsPanel() {
  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { selectedOee } = useSelector((state: RootState) => state.oeeDashboard);

  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);

  const { oeeStats } = currentBatch || {};

  const { oeePercent } = oeeStats || initialOeeStats;

  const percents = useMemo(
    () =>
      getPercentSettingsByType(
        selectedSite,
        selectedOee?.percentSettings || [],
        selectedOee?.useSitePercentSettings || true,
        OEE_TYPE_OEE,
      ),
    [selectedSite, selectedOee],
  );

  return (
    <Grid container spacing={3} alignItems={'center'}>
      <Grid item xs={12} md={5}>
        <Grid container spacing={3} alignItems={'center'}>
          <Grid item xs={12} md={4}>
            <DashboardPieChart
              high={percents.high}
              medium={percents.medium}
              low={percents.low}
              oeeType={OEE_TYPE_OEE}
              percent={oeePercent}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <DashboardAPQBar />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={7}>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={8.25}>
            <DashboardDetailsStatus />
          </Grid>

          <Grid item xs={12} md={3.75}>
            <DashboardDetailsControlPanel />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
