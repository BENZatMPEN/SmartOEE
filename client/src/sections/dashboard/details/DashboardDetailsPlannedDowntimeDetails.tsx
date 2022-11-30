import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import Countdown, { zeroPad } from 'react-countdown';
import { CountdownRenderProps } from 'react-countdown/dist/Countdown';
import { OeeBatch } from '../../../@types/oeeBatch';
import { OeeBatchPlannedDowntime } from '../../../@types/oeeBatchPlannedDowntime';
import { DOWNTIME_TIMING_AUTO, DOWNTIME_TIMING_MANUAL, DOWNTIME_TIMING_TIMER } from '../../../constants';
import axios from '../../../utils/axios';

type Props = {
  oeeBatch: OeeBatch;
};

export default function DashboardDetailsPlannedDowntimeDetails({ oeeBatch }: Props) {
  const theme = useTheme();

  const [plannedDowntime, setPlannedDowntime] = useState<OeeBatchPlannedDowntime | null>(null);

  const [counter, setCounter] = useState<number>(0);

  const { name, timing, seconds, createdAt } = plannedDowntime || { seconds: 0, createdAt: new Date() };

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get<OeeBatchPlannedDowntime>(
          `/oee-batches/${oeeBatch.id}/active-planned-downtime`,
        );
        setPlannedDowntime(response.data);
        setCounter(0);
      } catch (error) {
        setPlannedDowntime(null);
        console.log(error);
      }
    })();

    return () => {
      setPlannedDowntime(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timer | null = null;

    if (plannedDowntime) {
      interval = setInterval(() => {
        setCounter(Date.now() - createdAt.getTime());
      }, 500);
    }

    if (!plannedDowntime && interval) {
      setCounter(0);
      clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plannedDowntime]);

  const renderer = ({ hours, minutes, seconds }: CountdownRenderProps) => (
    <Typography variant="h5">
      {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
    </Typography>
  );

  const showCounter = plannedDowntime && (timing === DOWNTIME_TIMING_MANUAL || timing === DOWNTIME_TIMING_AUTO);
  const showCountdown = plannedDowntime && timing === DOWNTIME_TIMING_TIMER;

  return plannedDowntime ? (
    <Stack spacing={theme.spacing(1)} textAlign="center">
      <Typography variant="body1">{name}</Typography>
      {showCounter && (
        <Countdown autoStart={false} date={Date.now() + counter} renderer={renderer} onComplete={() => {}} />
      )}

      {showCountdown && (
        <Countdown date={createdAt.getTime() + seconds * 1000} renderer={renderer} onComplete={() => {}} />
      )}

      {timing === DOWNTIME_TIMING_MANUAL && <Typography variant="body2">Have to continue batch manually</Typography>}

      {timing === DOWNTIME_TIMING_AUTO && (
        <Typography variant="body2">Batch will continue when the total increases</Typography>
      )}

      {timing === DOWNTIME_TIMING_TIMER && (
        <Typography variant="body2">Batch will continue when the timer is done</Typography>
      )}
    </Stack>
  ) : (
    <></>
  );
}
