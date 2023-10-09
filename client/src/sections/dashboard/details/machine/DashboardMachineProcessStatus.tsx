import { Box, Card, CardContent, CardHeader, LinearProgress, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { initialOeeStats } from '../../../../constants';
import { RootState, useSelector } from '../../../../redux/store';
import { fSeconds } from '../../../../utils/formatNumber';
import { fBatchStatusText } from '../../../../utils/textHelper';
import { fDate, fTime } from '../../../../utils/formatTime';

export default function DashboardMachineProcessStatus() {
  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);

  const { status, batchStartedDate, batchStoppedDate, oeeStats } = currentBatch || { status: '' };

  const { operatingSeconds, runningSeconds, plannedDowntimeSeconds, totalBreakdownSeconds } =
    oeeStats || initialOeeStats;

  const actualRunningTime = (operatingSeconds / runningSeconds) * 100;
  const plannedDowntimeTime = (plannedDowntimeSeconds / runningSeconds) * 100;
  const breakdownTime = (totalBreakdownSeconds / runningSeconds) * 100;

  return (
    <Card>
      <CardHeader title="Process Status" />
      <CardContent>
        <Stack spacing={1}>
          <StatusItem title="Status:" value={fBatchStatusText(status)} />

          <StatusItem title="Start Date:" value={batchStartedDate ? fDate(batchStartedDate) : ''} />

          <StatusItem title="Start Time:" value={batchStartedDate ? fTime(batchStartedDate) : ''} />

          <StatusItem title="End Date:" value={batchStoppedDate ? fDate(batchStoppedDate) : ''} />

          <StatusItem title="End Time:" value={batchStoppedDate ? fTime(batchStoppedDate) : ''} />

          <StatusItem title="Total Available Time:" value={fSeconds(runningSeconds)} />

          <StatusItem
            title="Operating Time:"
            value={
              <Stack direction="row">
                <Typography variant="subtitle1" flexGrow={1} flexBasis={0}>
                  {fSeconds(operatingSeconds)}
                </Typography>

                <Box flexGrow={2} flexBasis={0}>
                  <ProgressItem color="success" value={actualRunningTime} />
                </Box>
              </Stack>
            }
          />

          <StatusItem
            title="Planned Downtime:"
            value={
              <Stack direction="row">
                <Typography variant="subtitle1" flexGrow={1} flexBasis={0}>
                  {fSeconds(plannedDowntimeSeconds)}
                </Typography>

                <Box flexGrow={2} flexBasis={0}>
                  <ProgressItem color="success" value={plannedDowntimeTime} />
                </Box>
              </Stack>
            }
          />

          <StatusItem
            title="Breakdown Time:"
            value={
              <Stack direction="row">
                <Typography variant="subtitle1" flexGrow={1} flexBasis={0}>
                  {fSeconds(totalBreakdownSeconds)}
                </Typography>

                <Box flexGrow={2} flexBasis={0}>
                  <ProgressItem color="error" value={breakdownTime} />
                </Box>
              </Stack>
            }
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

type StatusItemProps = {
  title: string;
  value: ReactNode;
};

function StatusItem({ title, value }: StatusItemProps) {
  return (
    <Stack direction="row">
      <Typography variant="body1" sx={{ color: 'text.secondary' }} flexGrow={1} flexBasis={0}>
        {title}
      </Typography>

      <Typography variant="subtitle1" flexGrow={1} flexBasis={0}>
        {value}
      </Typography>
    </Stack>
  );
}

type ProgressItemProps = {
  value: number;
  color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
};

function ProgressItem({ value, color }: ProgressItemProps) {
  return (
    <LinearProgress variant="determinate" value={value} color={color} sx={{ height: 20, bgcolor: 'grey.50016' }} />
  );
}
