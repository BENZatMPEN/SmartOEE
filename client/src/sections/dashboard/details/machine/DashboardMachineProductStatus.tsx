import { Box, Card, CardContent, CardHeader, LinearProgress, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { initialOeeStats } from '../../../../constants';
import { RootState, useSelector } from '../../../../redux/store';
import { fNumber, fNumber2 } from '../../../../utils/formatNumber';

export default function DashboardMachineProductStatus() {
  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);

  const { plannedQuantity, oeeStats } = currentBatch || { status: '', standardSpeedSeconds: 0, plannedQuantity: 0 };

  const { totalCount, target, efficiency } = oeeStats || initialOeeStats;

  const diff = useMemo(() => plannedQuantity - totalCount, [plannedQuantity, totalCount]);

  const diffPercent = useMemo(() => (totalCount * 100) / plannedQuantity, [plannedQuantity, totalCount]);

  return (
    <Card>
      <CardHeader title="Product Status" />
      <CardContent>
        <Stack spacing={3}>
          <Stack spacing={1} direction="row" justifyContent="space-between">
            <Box>
              <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                Actual
              </Typography>
              <Typography variant={'h2'}>{fNumber(totalCount)}</Typography>
            </Box>

            <Box textAlign="center">
              <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                Efficiency
              </Typography>
              <Typography variant={'h2'}>{fNumber2(efficiency)} %</Typography>
            </Box>

            <Box textAlign="right">
              <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                Difference
              </Typography>
              <Typography variant={'h2'}>{fNumber(diff)}</Typography>
            </Box>
          </Stack>

          <Box sx={{ height: '35px' }}>
            <LinearProgress
              variant="determinate"
              value={diffPercent}
              color="primary"
              sx={{ height: 30, bgcolor: 'grey.50016' }}
            />
          </Box>

          <Stack spacing={1} direction="row" justifyContent="space-between">
            <Box>
              <Typography variant={'h3'}>{fNumber(target)}</Typography>
              <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                Target
              </Typography>
            </Box>

            <Box textAlign="right">
              <Typography variant={'h3'}>{fNumber(plannedQuantity)}</Typography>
              <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                Planned
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
