import { Stack } from '@mui/material';
import DashboardApgGraphA from '../../../sections/dashboard/details/apq-graph/DashboardApgGraphA';
import DashboardApgGraphP from '../../../sections/dashboard/details/apq-graph/DashboardApgGraphP';
import DashboardApgGraphQ from '../../../sections/dashboard/details/apq-graph/DashboardApgGraphQ';

export default function ApqGraph() {
  return (
    <Stack spacing={3}>
      <DashboardApgGraphA />

      <DashboardApgGraphP />

      <DashboardApgGraphQ />
    </Stack>
  );
}
