import { Card, CardContent, CardHeader, MenuItem, Stack, TextField } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { initialOeeStats } from '../../../../constants';
import {
  getOeeBatchStats,
  getOeeBatchStatsLine,
  updateBatchStats,
  updateBatchStatsLine,
} from '../../../../redux/actions/oeeBatchAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { fPercent } from '../../../../utils/formatNumber';
import { chartTitle } from '../../../../utils/formatText';
import { fDateTime } from '../../../../utils/formatTime';

const samplingOpts = [900, 1800, 3600];

export default function DashboardOeeGraphRealtime() {
  const dispatch = useDispatch();

  const { selectedOee } = useSelector((state: RootState) => state.oeeDashboard);

  const { currentBatch, batchStatsTime, batchStatsLine } = useSelector((state: RootState) => state.oeeBatch);

  const { id: batchId, oeeStats } = currentBatch || { oeeStats: initialOeeStats };

  const [samplingSeconds, setSamplingSeconds] = useState<number>(samplingOpts[2]);

  const [barSeries, setBarSeries] = useState<any>([]);

  const [lineSeries, setLineSeries] = useState<any>([]);

  const [barOptions, setBarOptions] = useState<ApexOptions>({
    chart: {
      type: 'bar',
      animations: {
        enabled: false,
      },
      toolbar: {
        export: {
          csv: {
            dateFormatter(timestamp?: number): any {
              if (timestamp) {
                return dayjs(new Date(timestamp)).format('DD/MM/YYYY HH:mm');
              }
              return '';
            },
          },
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      type: 'datetime',
      categories: [],
      labels: {
        datetimeUTC: false,
      },
      // labels: {
      //   formatter(value: string, timestamp?: number, opts?: any): string | string[] {
      //     if (!value || value === '0') {
      //       return '';
      //     }
      //     return fTime(new Date(value));
      //   },
      // },
    },
    yaxis: {
      max: 100,
      labels: {
        formatter(val: number, opts?: any): string | string[] {
          return fPercent(val);
        },
      },
    },
    tooltip: {
      x: {
        formatter(val: number, opts?: any): string {
          return dayjs(new Date(val)).format('DD/MM/YYYY HH:mm');
        },
      },
    },
  } as ApexOptions);

  const [lineOptions, setLineOptions] = useState<ApexOptions>({
    chart: {
      animations: {
        enabled: false,
      },
      type: 'line',
      zoom: {
        enabled: true,
      },
      toolbar: {
        export: {
          csv: {
            dateFormatter(timestamp?: number): any {
              if (timestamp) {
                return dayjs(new Date(timestamp)).format('DD/MM/YYYY HH:mm');
              }
              return '';
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
    },
    xaxis: {
      type: 'datetime',
      categories: [],
      labels: {
        datetimeUTC: false,
      },
      tooltip: {
        formatter(value: string, opts?: object): string {
          return dayjs(new Date(value)).format('HH:mm:ss');
        },
      },
    },
    yaxis: {
      labels: {
        formatter(val: number, opts?: any): string | string[] {
          return fPercent(val);
        },
      },
    },
    tooltip: {
      x: {
        formatter(val: number, opts?: any): string {
          return dayjs(new Date(val)).format('DD/MM/YYYY HH:mm');
        },
      },
    },
  } as ApexOptions);

  useEffect(() => {
    if (!batchId) {
      return;
    }

    (async () => {
      await dispatch(getOeeBatchStats(batchId, samplingSeconds));
    })();
  }, [dispatch, batchId, samplingSeconds]);

  useEffect(() => {
    if (!batchId) {
      return;
    }

    (async () => {
      await dispatch(getOeeBatchStatsLine(batchId));
    })();
  }, [dispatch, batchId]);

  useEffect(() => {
    dispatch(updateBatchStats({ oeeStats, samplingSeconds }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, oeeStats]);

  useEffect(() => {
    dispatch(updateBatchStatsLine({ oeeStats }));
  }, [dispatch, oeeStats]);

  useEffect(() => {
    if (!batchStatsTime || batchStatsTime.length === 0) {
      return;
    }

    setBarOptions({
      ...barOptions,
      xaxis: {
        ...barOptions.xaxis,
        categories: [
          dayjs(batchStatsTime[0].timestamp).add(-samplingSeconds, 's').toDate().getTime(),
          ...batchStatsTime.map((item: any) => new Date(item.timestamp).getTime()),
          dayjs(batchStatsTime[batchStatsTime.length - 1].timestamp)
            .add(samplingSeconds, 's')
            .toDate()
            .getTime(),
        ],
      },
      title: {
        text: chartTitle(currentBatch, batchStatsTime, selectedOee?.productionName || ''),
        align: 'center',
      },
    });

    setBarSeries([
      {
        name: 'A',
        data: [0, ...batchStatsTime.map((item) => item.data.aPercent), 0],
      },
      {
        name: 'P',
        data: [0, ...batchStatsTime.map((item) => item.data.pPercent), 0],
      },
      {
        name: 'Q',
        data: [0, ...batchStatsTime.map((item) => item.data.qPercent), 0],
      },
      {
        name: 'OEE',
        data: [0, ...batchStatsTime.map((item) => item.data.oeePercent), 0],
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchStatsTime]);

  useEffect(() => {
    setLineOptions({
      ...lineOptions,
      xaxis: {
        ...lineOptions.xaxis,
        categories: batchStatsLine.map((item) => item.timestamp.getTime()),
      },
      title: {
        text: chartTitle(currentBatch, batchStatsTime, selectedOee?.productionName || ''),
        align: 'center',
      },
    });

    setLineSeries([
      {
        name: 'A',
        data: batchStatsLine.map((item) => item.data.aPercent),
      },
      {
        name: 'P',
        data: batchStatsLine.map((item) => item.data.pPercent),
      },
      {
        name: 'Q',
        data: batchStatsLine.map((item) => item.data.qPercent),
      },
      {
        name: 'OEE',
        data: batchStatsLine.map((item) => item.data.oeePercent),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchStatsLine]);

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader title={'OEE Real Time'} />
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="end" spacing={2}>
              <TextField
                size="small"
                label="Sampling Time"
                select
                defaultValue={samplingOpts[2]}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: false }}
                sx={{ width: '200px' }}
                onChange={(event) => {
                  setSamplingSeconds(Number(event.target.value));
                }}
              >
                {samplingOpts.map((item) => (
                  <MenuItem
                    key={item}
                    value={item}
                    sx={{
                      mx: 1,
                      my: 0.5,
                      borderRadius: 0.75,
                      typography: 'body2',
                    }}
                  >
                    {`${item / 60} mins`}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <ReactApexChart type="bar" series={barSeries} options={barOptions} height={500} />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={'OEE Real Time - Line'} />
        <CardContent>
          <ReactApexChart type="line" series={lineSeries} options={lineOptions} height={600} />
        </CardContent>
      </Card>
    </Stack>
  );
}
