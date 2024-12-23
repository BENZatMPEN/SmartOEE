import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { OeeBatchParamParetoData } from '../../../../@types/oeeBatch';
import { initialOeeStats, OEE_TYPE_A } from '../../../../constants';
import useWebSocket from '../../../../hooks/useWebSocket';
import { getOeeBatchParetoA, updateBatchParetoA } from '../../../../redux/actions/oeeBatchAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { fNumber2, fPercent, fSeconds } from '../../../../utils/formatNumber';
import { getPercentSettingsByType } from '../../../../utils/percentSettingHelper';
import { convertToUnit } from '../../../../utils/timeHelper';
import DashboardPieChart from '../../DashboardPieChart';
import dayjs from 'dayjs';
import { fChartTitle } from '../../../../utils/textHelper';

type MachineChart = {
  code: string;
  series: any;
  options: ApexOptions;
  onUpdate?: (data: string) => void;
};

export default function DashboardApqGraphA() {
  const dispatch = useDispatch();

  const { socket } = useWebSocket();

  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { selectedOee } = useSelector((state: RootState) => state.oeeDashboard);

  const { timeUnit, useSitePercentSettings, percentSettings } = selectedOee || {
    timeUnit: '',
    useSitePercentSettings: true,
  };

  const { currentBatch, batchStatsTime, batchParetoA } = useSelector((state: RootState) => state.oeeBatch);

  const { id: batchId, oeeStats } = currentBatch || {
    standardSpeedSeconds: 0,
    plannedQuantity: 0,
    targetQuantity: 0,
  };

  const { aPercent, operatingSeconds, plannedDowntimeSeconds, totalBreakdownSeconds } = oeeStats || initialOeeStats;

  useEffect(() => {
    if (!socket || !batchId) {
      return;
    }

    const updatePareto = (data: OeeBatchParamParetoData) => {
      dispatch(updateBatchParetoA(data));
    };

    socket.on(`a-pareto_${batchId}.updated`, updatePareto);

    return () => {
      socket.off(`a-pareto_${batchId}.updated`, updatePareto);
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
      labels: {
        rotateAlways: true,
        hideOverlappingLabels: false,
      },
    },
    yaxis: [
      {
        // bar
        min: 0,
        labels: {
          formatter(val: number, opts?: any): string | string[] {
            return fSeconds(val);
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
  const [machineCharts, setMachineCharts] = useState<MachineChart[]>([]);

  useEffect(() => {
    if (!batchId) {
      return;
    }

    (async () => {
      await dispatch(getOeeBatchParetoA(batchId));
    })();
  }, [dispatch, batchId]);

  useEffect(() => {
    const { labels, counts, percents, machines } = batchParetoA || {
      labels: [],
      counts: [],
      percents: [],
      machines: [],
    };
    const filename = `${selectedOee?.oeeCode || ''}${currentBatch?.lotNumber || ''}${
      currentBatch?.startDate ? dayjs(currentBatch.startDate).format('DDMMYYYY') : ''
    } OEE Availability`;

    setOptions({
      ...options,
      chart: {
        ...options.chart,
        toolbar: {
          export: {
            csv: {
              filename: filename,
            },
            svg: {
              filename: filename,
            },
            png: {
              filename: filename,
            },
          },
        },
      },
      labels: labels,
      title: {
        text: fChartTitle(currentBatch, batchStatsTime),
        align: 'center',
      },
    });

    setSeries([
      {
        name: 'Time',
        type: 'column',
        data: counts.map((item) => convertToUnit(item, timeUnit)),
        color: '#FF6699',
      },
      {
        name: '%',
        type: 'line',
        data: percents.map((item) => fNumber2(item)),
      },
    ]);

    setMachineCharts(
      machines.map((machine) => ({
        code: machine.machineCode,
        series: [
          {
            name: 'Time',
            type: 'column',
            data: machine.counts.map((item) => convertToUnit(item, timeUnit)),
            color: '#FF6699',
          },
          {
            name: '%',
            type: 'line',
            data: machine.percents.map((item) => fNumber2(item)),
          },
        ],
        options: {
          chart: {
            zoom: {
              enabled: false,
            },
            toolbar: {
              export: {
                csv: {
                  filename: `${filename} (${machine.machineCode})`,
                },
                svg: {
                  filename: `${filename} (${machine.machineCode})`,
                },
                png: {
                  filename: `${filename} (${machine.machineCode})`,
                },
              },
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
          labels: machine.labels,
          xaxis: {
            show: false,
            labels: {
              rotateAlways: true,
              hideOverlappingLabels: false,
            },
          },
          yaxis: [
            {
              // bar
              min: 0,
              labels: {
                formatter(val: number, opts?: any): string | string[] {
                  return fSeconds(val);
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
          title: {
            text: machine.machineCode,
            align: 'center',
          },
        } as ApexOptions,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchParetoA, batchStatsTime]);

  const percents = useMemo(
    () => getPercentSettingsByType(selectedSite, percentSettings || [], useSitePercentSettings, OEE_TYPE_A),
    [selectedSite, percentSettings, useSitePercentSettings],
  );

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, gap: 3 }}>
              <Typography variant="h2">A</Typography>

              <Box>
                <DashboardPieChart
                  high={percents.high}
                  medium={percents.medium}
                  low={percents.low}
                  oeeType={OEE_TYPE_A}
                  percent={aPercent}
                  size={270}
                />

                <Typography variant="subtitle1" textAlign="center" sx={{ mt: 1 }}>
                  Availability
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={3.5}>
            <Stack spacing={1}>
              <ItemBox head="Total Operating Time" value={fSeconds(operatingSeconds)} />

              <ItemBox head="Planned Downtime" value={fSeconds(plannedDowntimeSeconds)} />

              <ItemBox head="Breakdown Time" value={fSeconds(totalBreakdownSeconds)} />
            </Stack>
          </Grid>

          <Grid item xs={5.5}>
            <ReactApexChart options={options} series={series} type="line" height={400} />
          </Grid>
        </Grid>

        <Grid container alignItems="center" spacing={3}>
          {machineCharts.map((chart) => (
            <Grid item xs={6} key={chart.code}>
              <MachineParetoChart chart={(machineCharts || []).find((item) => item.code === chart.code) || chart} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

type ItemBoxPros = {
  head: string;
  value: string;
  tail?: string;
};

function ItemBox({ head, value, tail }: ItemBoxPros) {
  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6}>
          <Typography variant="body1" textAlign="right">
            {head}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Box sx={{ border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '6px', p: 1 }}>
            <Typography variant="body1" textAlign="center">
              {value}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function MachineParetoChart({ chart }: { chart: MachineChart }) {
  const [series, setSeries] = useState<any>(chart.series);
  const [options, setOptions] = useState<ApexOptions>(chart.options);

  useEffect(() => {
    setOptions(chart.options);
    setSeries(chart.series);
  }, [chart]);

  return <ReactApexChart options={options} series={series} type="line" height={400} />;
}
