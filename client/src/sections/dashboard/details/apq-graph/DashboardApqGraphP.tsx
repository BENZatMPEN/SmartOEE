import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { OeeBatchParamParetoData } from '../../../../@types/oeeBatch';
import { initialOeeStats, OEE_TYPE_P, TIME_UNIT_SECOND } from '../../../../constants';
import useWebSocket from '../../../../hooks/useWebSocket';
import { getOeeBatchParetoP, updateBatchParetoP } from '../../../../redux/actions/oeeBatchAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { fNumber, fNumber2, fPercent } from '../../../../utils/formatNumber';
import { fChartTitle, fTimeUnitShortText, fTimeUnitText } from '../../../../utils/textHelper';
import { getPercentSettingsByType } from '../../../../utils/percentSettingHelper';
import { convertToUnit } from '../../../../utils/timeHelper';
import DashboardPieChart from '../../DashboardPieChart';

export default function DashboardApqGraphP() {
  const dispatch = useDispatch();

  const { socket } = useWebSocket();

  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { selectedOee } = useSelector((state: RootState) => state.oeeDashboard);

  const { timeUnit, useSitePercentSettings, percentSettings } = selectedOee || {
    timeUnit: '',
    useSitePercentSettings: true,
  };

  const { currentBatch, batchStatsTime, batchParetoP } = useSelector((state: RootState) => state.oeeBatch);

  const {
    id: batchId,
    oeeStats,
    standardSpeedSeconds,
    plannedQuantity,
  } = currentBatch || {
    standardSpeedSeconds: 0,
    plannedQuantity: 0,
    targetQuantity: 0,
  };

  const { pPercent, totalCount, operatingSeconds, target } = oeeStats || initialOeeStats;

  useEffect(() => {
    if (!socket || !batchId) {
      return;
    }

    const updatePareto = (data: OeeBatchParamParetoData) => {
      dispatch(updateBatchParetoP(data));
    };

    socket.on(`p-pareto_${batchId}.updated`, updatePareto);

    return () => {
      socket.off(`p-pareto_${batchId}.updated`, updatePareto);
    };
  }, [socket, batchId, dispatch]);

  const [series, setSeries] = useState<any>([]);

  const [options, setOptions] = useState<ApexOptions>({
    chart: {
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      width: [0, 4],
      curve: 'smooth',
    },
    grid: {
      padding: {
        bottom: 50,
        left: 40,
      },
    },
    labels: [],
    xaxis: {
      show: false,
      labels: { rotateAlways: true, hideOverlappingLabels: false },
    },
    yaxis: [
      {
        // bar
        min: 0,
        labels: {
          formatter(val: number, opts?: any): string | string[] {
            return timeUnit === TIME_UNIT_SECOND ? fNumber(val) : fNumber2(val);
          },
        },
      },
      {
        // line
        opposite: true,
        max: 100,
        labels: {
          formatter(val: number, opts?: any): string | string[] {
            return fPercent(val);
          },
        },
      },
    ],
    legend: {
      show: false,
    },
  } as ApexOptions);

  useEffect(() => {
    if (!batchId) {
      return;
    }

    (async () => {
      await dispatch(getOeeBatchParetoP(batchId));
      //
    })();
  }, [dispatch, batchId]);

  useEffect(() => {
    const { labels, counts, percents } = batchParetoP || { labels: [], counts: [], percents: [] };
    setOptions({
      ...options,
      labels: labels,
      title: {
        text: fChartTitle(currentBatch, batchStatsTime),
        align: 'center',
      },
    });

    setSeries([
      {
        name: fTimeUnitText(timeUnit),
        type: 'column',
        data: counts.map((item) => convertToUnit(item, timeUnit)),
        color: '#00CCFF',
      },
      {
        name: '%',
        type: 'line',
        data: percents.map((item) => fNumber2(item)),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchParetoP, batchStatsTime]);

  const percents = useMemo(
    () => getPercentSettingsByType(selectedSite, percentSettings || [], useSitePercentSettings, OEE_TYPE_P),
    [selectedSite, percentSettings, useSitePercentSettings],
  );

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, gap: 3 }}>
              <Typography variant="h2">P</Typography>

              <Box>
                <DashboardPieChart
                  high={percents.high}
                  medium={percents.medium}
                  low={percents.low}
                  oeeType={OEE_TYPE_P}
                  percent={pPercent}
                />

                <Typography variant="subtitle1" sx={{ mt: 1, textAlign: 'center' }}>
                  Performance
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={3.5}>
            <Stack spacing={1}>
              <Box>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={5}>
                    <Typography variant="body1" textAlign="right">
                      {`Cycle Time (${fTimeUnitShortText(timeUnit)} / pc.)`}
                    </Typography>
                  </Grid>

                  <Grid item xs={3.5} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption">Standard</Typography>

                    <TextItem value={fNumber2(convertToUnit(standardSpeedSeconds, timeUnit))} />
                  </Grid>

                  <Grid item xs={3.5} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption">Current</Typography>

                    <TextItem value={fNumber2(convertToUnit(operatingSeconds / totalCount, timeUnit))} />
                  </Grid>
                </Grid>
              </Box>

              <ItemBox head="Actual" value={fNumber(totalCount)} tail="pcs." />

              <ItemBox head="Plan" value={fNumber(plannedQuantity)} tail="pcs." />

              <ItemBox head="Target" value={fNumber(target)} tail="pcs." />
            </Stack>
          </Grid>

          <Grid item xs={5.5}>
            <ReactApexChart options={options} series={series} type="line" height={400} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

type TextItemPros = {
  value: string;
};

function TextItem({ value }: TextItemPros) {
  return (
    <Box sx={{ border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '6px', p: 1 }}>
      <Typography variant="body1" textAlign="center">
        {value}
      </Typography>
    </Box>
  );
}

type ItemBoxPros = {
  head: string;
  value: string;
  tail: string;
};

function ItemBox({ head, value, tail }: ItemBoxPros) {
  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={5}>
          <Typography variant="body1" textAlign="right">
            {head}
          </Typography>
        </Grid>

        <Grid item xs={3.5}>
          <TextItem value={value} />
        </Grid>

        <Grid item xs={3.5}>
          <Typography variant="body2">{tail}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
