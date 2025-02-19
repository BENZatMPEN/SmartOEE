import { Box, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import {
  initialOeeStats,
  initialPercentSettings,
  OEE_TYPE_A,
  OEE_TYPE_L,
  OEE_TYPE_P,
  OEE_TYPE_Q,
} from '../../../../constants';
import { RootState, useSelector } from '../.././../../redux/store';
import { fPercent } from '../../../../utils/formatNumber';
import { OeeStatusAdvancedItem } from 'src/@types/oee';
type Props = {
  oeeStatusItem: OeeStatusAdvancedItem;
};
export default function DashboardAPQBar({ oeeStatusItem }: Props) {
  const theme = useTheme();
  
  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { selectedOee, oeeStatus } = useSelector((state: RootState) => state.oeeAdvanced);

  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);
  // console.log('selectedOee?.useSitePercentSettings =>',selectedOee?.useSitePercentSettings);
  // console.log('selectedSite?.defaultPercentSettings =>',selectedSite?.defaultPercentSettings);
  // console.log('selectedOee?.percentSettings =>',selectedOee?.percentSettings); 
  // console.log('initialPercentSettings =>',initialPercentSettings);
  const percentSettings =
    (selectedOee?.useSitePercentSettings || true
      ? selectedSite?.defaultPercentSettings
      : selectedOee?.percentSettings) || initialPercentSettings;

      
  const aPercentSetting = percentSettings.filter((item) => item.type === OEE_TYPE_A)[0];
  const pPercentSetting = percentSettings.filter((item) => item.type === OEE_TYPE_P)[0];
  const qPercentSetting = percentSettings.filter((item) => item.type === OEE_TYPE_Q)[0];
  const lPercentSetting = percentSettings.filter((item) => item.type === OEE_TYPE_L)[0];
   
  const [aColor, setAColor] = useState<'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit'>(
    'success',
  );
  const [pColor, setPColor] = useState<'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit'>(
    'success',
  );
  const [qColor, setQColor] = useState<'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit'>(
    'success',
  );

  const [lColor, setLColor] = useState<'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit'>(
    'success',
  );

  const { oeeStats } = currentBatch || { oeeStats: initialOeeStats };
  const { aPercent, pPercent, qPercent, loadingFactorPercent: lPercent } = oeeStatusItem;

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

  useEffect(() => {
    if (lPercent) {
      setLColor('success');

      if (lPercent <= lPercentSetting.settings.medium && lPercent > lPercentSetting.settings.low) {
        setLColor('warning');
      } else if (lPercent <= lPercentSetting.settings.low) {
        setLColor('error');
      }
    }
   
    
  }, [lPercent, lPercentSetting]);

  return (
    <Stack spacing={theme.spacing(3)}>
      <ProgressItem label="A" value={aPercent} color={aColor} />

      <ProgressItem label="P" value={pPercent} color={pColor} />

      <ProgressItem label="Q" value={qPercent} color={qColor} />

      {lPercent && <ProgressItem label="L" value={lPercent} color={lColor} />}
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
