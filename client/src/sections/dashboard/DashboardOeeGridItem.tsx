import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { OeeStatusItem } from '../../@types/oee';
import { OEE_BATCH_STATUS_ENDED, OEE_BATCH_STATUS_STANDBY, OEE_TYPE_OEE } from '../../constants';
import { RootState, useSelector } from '../../redux/store';
import { PATH_DASHBOARD } from '../../routes/paths';
import { getColor } from '../../utils/colorHelper';
import { fNumber, fNumber2 } from '../../utils/formatNumber';
import { fTimeShort } from '../../utils/formatTime';
import { getPercentSettingsByType } from '../../utils/percentSettingHelper';
import DashboardPieChart from './DashboardPieChart';
import DashboardOeePieChart from './DashboardOeePieChart';

type LegendProps = {
  label: string;
  number: string;
};

type LegendUnitProps = {
  label: string;
  number: string;
  unit: string;
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
    defect,
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
    activeSecondUnit,
  } = oeeStatusItem;

  const percents = useMemo(
    () => getPercentSettingsByType(selectedSite, percentSettings, useSitePercentSettings, OEE_TYPE_OEE),
    [selectedSite, percentSettings, useSitePercentSettings],
  );

  const getHeaderColor = (status: string): string => {
    // if (!status || status === OEE_BATCH_STATUS_ENDED) {
    //   return '#B0B0B0';
    // }
    return getColor(status);
  };

  const yieldValue = ((actual - defect) / plan) * 100;
  const lossValue = (plan - (actual - defect)) / plan * 100;

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
                Start Plan (HH:MM): {startDate ? fTimeShort(startDate) : '-'}
              </Typography>

              <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                End Plan (HH:MM): {endDate ? fTimeShort(endDate) : '-'}
              </Typography>
            </Stack>
            {
              activeSecondUnit ? (
                <Stack direction="row" justifyContent="space-between" spacing={6} sx={{ mt: 1 }}>
                  <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                    Yield {fNumber2(yieldValue)} %
                  </Typography>
                  <Typography variant={'subtitle1'} sx={{ color: 'text.secondary' }}>
                    Loss {fNumber2(lossValue)} %
                  </Typography>
                </Stack>
              ) : null
            }
          </Stack>

          <Box>
            <Grid container spacing={2} alignItems="center" sx={activeSecondUnit ? {} : { mt: 4, mb: 3 }}>
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
                  {
                    activeSecondUnit ?
                      <>
                        <LegendUnit label="Actual" number={fNumber(actual)} unit="pcs" />
                        <LegendUnit label="FG" number={fNumber(actual - defect)} unit="pcs" />
                        <LegendUnit label="NG" number={fNumber(defect)} unit="pcs" />
                        <LegendUnit label="Target" number={fNumber(target)} unit="pcs" />
                        <LegendUnit label="Plan" number={fNumber(plan)} unit="pcs" />
                      </>
                      :
                      <>
                        <Legend label="Actual" number={fNumber(actual)} />
                        <Legend label="Plan" number={fNumber(plan)} />
                        <Legend label="Target" number={fNumber(target)} />
                      </>
                  }

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

function LegendUnit({ label, number, unit }: LegendUnitProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="subtitle1">{number} {unit}</Typography>
    </Stack>
  );
}
