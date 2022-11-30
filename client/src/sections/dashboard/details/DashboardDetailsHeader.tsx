import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { RootState, useSelector } from '../../../redux/store';
import { fDate, fTime } from '../../../utils/formatTime';

export default function DashboardDetailsHeader() {
  const theme = useTheme();

  const [time, setTime] = useState<Date>(new Date());

  const { selectedOee } = useSelector((state: RootState) => state.oee);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const { oeeCode, productionName } = selectedOee ?? {};

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack spacing={theme.spacing(2)} direction="row" alignItems="center">
        <Typography variant="h6" sx={{ color: 'text.disabled' }}>
          OEE Code:
        </Typography>

        <Typography variant="h5">{oeeCode}</Typography>

        <Typography variant="h6" sx={{ color: 'text.disabled' }}>
          Production Name:
        </Typography>

        <Typography variant="h5">{productionName}</Typography>
      </Stack>

      <Stack direction="row" spacing={theme.spacing(2)} justifyContent="end">
        <Typography variant="h4">{fDate(time)}</Typography>

        <Typography variant="h4">{fTime(time)}</Typography>
      </Stack>
    </Stack>
  );
}
