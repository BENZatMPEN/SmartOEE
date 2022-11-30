import { Box, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { RootState, useSelector } from '../../redux/store';
import DashboardHeaderToolbar from './DashboardHeaderToolbar';
import DashboardHeaderWidget from './DashboardHeaderWidget';

export default function DashboardHeader() {
  const theme = useTheme();

  const { oeeStatus } = useSelector((state: RootState) => state.oee);

  const { running, ended, standby, breakdown } = oeeStatus;

  return (
    <Box sx={{ mb: 2, px: 1 }}>
      <Grid container spacing={2}>
        <Grid item md={2} sm={3}>
          <DashboardHeaderWidget title={'Running'} total={running} color={theme.palette.success.dark} />
        </Grid>

        <Grid item md={2} sm={3}>
          <DashboardHeaderWidget title={'Breakdown'} total={breakdown} color={theme.palette.error.dark} />
        </Grid>

        <Grid item md={2} sm={3}>
          <DashboardHeaderWidget title={'No Plan'} total={ended} color={theme.palette.grey.A700} />
        </Grid>

        <Grid item md={2} sm={3}>
          <DashboardHeaderWidget title={'Standby'} total={standby} color={theme.palette.warning.main} />
        </Grid>

        <Grid item md={4} sm={12}>
          <DashboardHeaderToolbar />
        </Grid>
      </Grid>
    </Box>
  );
}
