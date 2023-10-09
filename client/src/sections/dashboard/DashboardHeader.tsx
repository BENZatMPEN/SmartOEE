import { Box, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { RootState, useSelector } from '../../redux/store';
import DashboardHeaderToolbar from './DashboardHeaderToolbar';
import DashboardHeaderWidget from './DashboardHeaderWidget';
import { getColor } from '../../utils/colorHelper';
import {
  OEE_BATCH_STATUS_BREAKDOWN,
  OEE_BATCH_STATUS_MC_SETUP,
  OEE_BATCH_STATUS_PLANNED,
  OEE_BATCH_STATUS_RUNNING,
  OEE_BATCH_STATUS_STANDBY,
} from '../../constants';

export default function DashboardHeader() {
  const theme = useTheme();

  const { oeeStatus } = useSelector((state: RootState) => state.oeeDashboard);

  const { running, ended, standby, breakdown, mcSetup } = oeeStatus;

  return (
    <Box sx={{ mb: 2, px: 1 }}>
      <Grid container spacing={2}>
        <Grid item md={1.75} sm={3}>
          <DashboardHeaderWidget title={'Running'} total={running} color={getColor(OEE_BATCH_STATUS_RUNNING)} />
        </Grid>

        <Grid item md={1.75} sm={3}>
          <DashboardHeaderWidget title={'Breakdown'} total={breakdown} color={getColor(OEE_BATCH_STATUS_BREAKDOWN)} />
        </Grid>

        <Grid item md={1.75} sm={3}>
          <DashboardHeaderWidget title={'No Plan'} total={ended} color={getColor(OEE_BATCH_STATUS_PLANNED)} />
        </Grid>

        <Grid item md={1.75} sm={3}>
          <DashboardHeaderWidget title={'Standby'} total={standby} color={getColor(OEE_BATCH_STATUS_STANDBY)} />
        </Grid>

        <Grid item md={1.75} sm={3}>
          <DashboardHeaderWidget title={'M/C Setup'} total={mcSetup} color={getColor(OEE_BATCH_STATUS_MC_SETUP)} />
        </Grid>

        <Grid item md={3.25} sm={12}>
          <DashboardHeaderToolbar />
        </Grid>
      </Grid>
    </Box>
  );
}
