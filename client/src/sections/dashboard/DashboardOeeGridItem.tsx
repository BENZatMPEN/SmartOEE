import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { OeeStatusItem } from '../../@types/oee';
import { OEE_TYPE_OEE } from '../../constants';
import { RootState, useSelector } from '../../redux/store';
import { PATH_DASHBOARD } from '../../routes/paths';
import { getColor } from '../../utils/colorHelper';
import { fNumber } from '../../utils/formatNumber';
import { fTimeShort } from '../../utils/formatTime';
import { getPercentSettingsByType } from '../../utils/percentSettingHelper';
import DashboardPieChart from './DashboardPieChart';

type LegendProps = {
  label: string;
  number: string;
};

type Props = {
  oeeStatusItem: OeeStatusItem;
};

export default function DashboardOeeGridItem({ oeeStatusItem }: Props) {
  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const {
    id,
    oeeCode,
    productionName,
    actual,
    plan,
    target,
    oeePercent,
    lotNumber,
    batchStatus,
    startDate,
    endDate,
    useSitePercentSettings,
    percentSettings,
  } = oeeStatusItem;

  const percents = useMemo(
    () => getPercentSettingsByType(selectedSite, percentSettings, useSitePercentSettings, OEE_TYPE_OEE),
    [selectedSite, percentSettings, useSitePercentSettings],
  );

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Link to={PATH_DASHBOARD.item.root(id.toString())} style={{ textDecoration: 'none' }}>
            <Typography
              variant={'h6'}
              textAlign="center"
              bgcolor={getColor(batchStatus)}
              color="#fff"
              sx={{
                p: 1,
                borderRadius: 1,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {oeeCode ? `${oeeCode} - ` : ''}
              {productionName}
            </Typography>
          </Link>

          <Stack direction="row" justifyContent="space-between" sx={{ p: 1 }}>
            <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
              Lot: {lotNumber ? lotNumber : '-'}
            </Typography>

            <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
              Start: {startDate ? fTimeShort(startDate) : '-'}
            </Typography>

            <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
              End: {endDate ? fTimeShort(endDate) : '-'}
            </Typography>
          </Stack>

          <Box>
            <Grid container sx={{ mt: 2 }} spacing={2} alignItems="center">
              <Grid item xs={6}>
                <DashboardPieChart
                  high={percents.high}
                  medium={percents.medium}
                  low={percents.low}
                  percent={oeePercent}
                  oeeType={OEE_TYPE_OEE}
                />
              </Grid>

              <Grid item xs={6}>
                <Stack spacing={2}>
                  <Legend label="Actual" number={fNumber(actual)} />
                  <Legend label="Plan" number={fNumber(plan)} />
                  <Legend label="Target" number={fNumber(target)} />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Legend({ label, number }: LegendProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="subtitle1">{number}</Typography>
    </Stack>
  );
}
