import { Box, Card, CardContent, CardHeader, LinearProgress, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { initialOeeStats } from '../../../../constants';
import { RootState, useSelector } from '../../../../redux/store';
import { fNumber, fNumber2 } from '../../../../utils/formatNumber';

export default function DashboardMachineProductStatus() {
  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);

  const { plannedQuantity, oeeStats, product } = currentBatch || { status: '', standardSpeedSeconds: 0, plannedQuantity: 0 };

  const { totalAutoDefects, totalManualDefects, totalCount = 0, target, efficiency } = oeeStats || initialOeeStats;

  const diff = useMemo(() => plannedQuantity - totalCount, [plannedQuantity, totalCount]);

  const diffPercent = useMemo(() => (totalCount * 100) / plannedQuantity, [plannedQuantity, totalCount]);

  const totalDefect = totalAutoDefects + totalManualDefects;
  const safePlannedQuantity = plannedQuantity || 1; // default to 1 to avoid division by zero
  const yieldValue = ((totalCount - totalDefect) / safePlannedQuantity) * 100;
  const lossValue = (safePlannedQuantity - (totalCount - totalDefect)) / safePlannedQuantity * 100;

  return (
    <Card>
      <CardHeader title="Product Status" />

      <CardContent>

        {
          product?.activePcs && (
            <>
              <Stack spacing={2} sx={{ m: 2, width: '100%', gap: '100px' }} direction="row" justifyContent="center">
                <Typography variant={'subtitle1'} sx={{ color: 'text.secondary', fontSize: '20px' }}>
                  {`Yield ${yieldValue}%`}
                </Typography>
                <Typography variant={'subtitle1'} sx={{ color: 'text.secondary', fontSize: '20px' }}>
                  {`Loss ${lossValue}%`}
                </Typography>
              </Stack>
            </>
          )
        }

        <Stack spacing={3}>
          <Stack spacing={1} direction="row" justifyContent="space-between">
            <Box>
              <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                Actual
              </Typography>
              <Typography variant={'h2'}>
                {`${fNumber(totalCount)} ${product?.activePcs ? `${product?.pscGram != null ? `= ${fNumber(Number(totalCount) * Number(product.pscGram))}` : '0'} ${product?.secondUnit ?? 'pcs'}` : ''}`}
              </Typography>
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
              <Typography variant={'h2'}>
                {`${fNumber(diff)} ${product?.activePcs ? `${product?.pscGram != null ? `= ${fNumber(Number(diff) * Number(product.pscGram))}` : '0'} ${product?.secondUnit ?? 'pcs'}` : ''}`}
              </Typography>
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
              <Typography variant={'h3'}>
                {`${fNumber(target)} ${product?.activePcs ? `${product?.pscGram != null ? `= ${fNumber(Number(target) * Number(product.pscGram))}` : '0'} ${product?.secondUnit ?? 'pcs'}` : ''}`}
              </Typography>
              <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                Target
              </Typography>
            </Box>

            <Box textAlign="right">
              <Typography variant={'h3'}>
                {`${fNumber(plannedQuantity)} ${product?.activePcs ? `${product?.pscGram != null ? `= ${fNumber(Number(plannedQuantity) * Number(product.pscGram))}` : '0'} ${product?.secondUnit ?? 'pcs'}` : ''}`}
              </Typography>
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
