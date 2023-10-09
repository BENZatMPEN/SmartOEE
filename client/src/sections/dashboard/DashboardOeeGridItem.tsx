import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { OeeStatusItem } from '../../@types/oee';
import { OEE_BATCH_STATUS_ENDED, OEE_BATCH_STATUS_STANDBY, OEE_TYPE_OEE } from '../../constants';
import { RootState, useSelector } from '../../redux/store';
import { PATH_DASHBOARD } from '../../routes/paths';
import { getColor } from '../../utils/colorHelper';
import { fNumber } from '../../utils/formatNumber';
import { fTimeShort } from '../../utils/formatTime';
import { getPercentSettingsByType } from '../../utils/percentSettingHelper';
import DashboardPieChart from './DashboardPieChart';
import DashboardOeePieChart from './DashboardOeePieChart';

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
    productName,
  } = oeeStatusItem;

  const percents = useMemo(
    () => getPercentSettingsByType(selectedSite, percentSettings, useSitePercentSettings, OEE_TYPE_OEE),
    [selectedSite, percentSettings, useSitePercentSettings],
  );

  const getHeaderColor = (status: string): string => {
    if (!status || status === OEE_BATCH_STATUS_ENDED) {
      return '#B0B0B0';
    }
    return getColor(status);
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Link to={PATH_DASHBOARD.item.root(id.toString())} style={{ textDecoration: 'none' }}>
            <Typography
              variant={'h6'}
              textAlign="center"
              bgcolor={getHeaderColor(batchStatus)}
              color="#fff"
              sx={{
                p: 1,
                borderRadius: 1,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {oeeCode ? `${oeeCode}` : ''}
              {productName ? `- ${productName}` : ''}
            </Typography>
          </Link>

          <Stack direction="column" sx={{ p: 1 }}>
            <div>
              <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                Lot: {lotNumber ? lotNumber : '-'}
              </Typography>
            </div>

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                Start Plan: {startDate ? fTimeShort(startDate) : '-'}
              </Typography>

              <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                End Plan: {endDate ? fTimeShort(endDate) : '-'}
              </Typography>
            </Stack>
          </Stack>

          <Box>
            <Grid container sx={{ mt: 2 }} spacing={2} alignItems="center">
              <Grid item xs={6}>
                <DashboardOeePieChart
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
