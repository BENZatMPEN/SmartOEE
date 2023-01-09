import { Box, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { initialOeeStats, initialPercentSettings, OEE_TYPE_A, OEE_TYPE_P, OEE_TYPE_Q } from '../../constants';
import { RootState, useSelector } from '../../redux/store';
import { fPercent } from '../../utils/formatNumber';

export default function DashboardAPQBar() {
  const theme = useTheme();

  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { currentOee } = useSelector((state: RootState) => state.oee);

  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);

  const percentSettings =
    (currentOee?.useSitePercentSettings || true ? selectedSite?.defaultPercentSettings : currentOee?.percentSettings) ||
    initialPercentSettings;
  const aPercentSetting = percentSettings.filter((item) => item.type === OEE_TYPE_A)[0];
  const pPercentSetting = percentSettings.filter((item) => item.type === OEE_TYPE_P)[0];
  const qPercentSetting = percentSettings.filter((item) => item.type === OEE_TYPE_Q)[0];

  const [aColor, setAColor] = useState<'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit'>(
    'success',
  );
  const [pColor, setPColor] = useState<'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit'>(
    'success',
  );
  const [qColor, setQColor] = useState<'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit'>(
    'success',
  );

  const { oeeStats } = currentBatch || { oeeStats: initialOeeStats };
  const { aPercent, pPercent, qPercent } = oeeStats;

  useEffect(() => {
    setAColor('success');

    if (aPercent <= aPercentSetting.settings.medium && aPercent > aPercentSetting.settings.low) {
      setAColor('warning');
    } else if (aPercent <= aPercentSetting.settings.low) {
      setAColor('error');
    }
  }, [aPercent, aPercentSetting]);

  useEffect(() => {
    setPColor('success');

    if (pPercent <= pPercentSetting.settings.medium && pPercent > pPercentSetting.settings.low) {
      setPColor('warning');
    } else if (pPercent <= pPercentSetting.settings.low) {
      setPColor('error');
    }
  }, [pPercent, pPercentSetting]);

  useEffect(() => {
    setQColor('success');

    if (qPercent <= qPercentSetting.settings.medium && qPercent > qPercentSetting.settings.low) {
      setQColor('warning');
    } else if (qPercent <= qPercentSetting.settings.low) {
      setQColor('error');
    }
  }, [qPercent, qPercentSetting]);

  return (
    <Stack spacing={theme.spacing(3)}>
      <ProgressItem label="A" value={aPercent} color={aColor} />

      <ProgressItem label="P" value={pPercent} color={pColor} />

      <ProgressItem label="Q" value={qPercent} color={qColor} />
    </Stack>
  );
}

type ProgressItemProps = {
  label: string;
  color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
  value: number;
};

function ProgressItem({ label, value, color }: ProgressItemProps) {
  const theme = useTheme();

  return (
    <Box>
      <Grid container spacing={theme.spacing(2)}>
        <Grid item xs={1}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            {label}
          </Typography>
        </Grid>

        <Grid item xs={8}>
          <LinearProgress
            variant="determinate"
            value={value}
            color={color}
            sx={{ height: 20, bgcolor: 'grey.50016' }}
          />
        </Grid>

        <Grid item xs={2}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {fPercent(value ? value : 0)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
