import { Stack } from '@mui/material';
import DashboardApqGraphA from '../../../sections/dashboard/details/apq-graph/DashboardApqGraphA';
import DashboardApqGraphP from '../../../sections/dashboard/details/apq-graph/DashboardApqGraphP';
import DashboardApqGraphQ from '../../../sections/dashboard/details/apq-graph/DashboardApqGraphQ';

export default function ApqGraph() {
  return (
    <Stack spacing={3}>
      <DashboardApqGraphA />

      <DashboardApqGraphP />

      <DashboardApqGraphQ />
    </Stack>
  );
}
