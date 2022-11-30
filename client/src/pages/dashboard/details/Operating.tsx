import { Stack } from '@mui/material';
import DashboardOperatingOeeA from '../../../sections/dashboard/details/operating/DashboardOperatingOeeA';
import DashboardOperatingOeeP from '../../../sections/dashboard/details/operating/DashboardOperatingOeeP';
import DashboardOperatingOeeQ from '../../../sections/dashboard/details/operating/DashboardOperatingOeeQ';

export default function Operating() {
  return (
    <Stack spacing={3}>
      <DashboardOperatingOeeA />

      <DashboardOperatingOeeP />

      <DashboardOperatingOeeQ />
    </Stack>
  );
}
