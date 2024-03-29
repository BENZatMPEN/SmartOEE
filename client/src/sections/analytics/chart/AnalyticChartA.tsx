import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import { TIME_UNIT_MINUTE } from '../../../constants';
import axios from '../../../utils/axios';
import { fNumber2, fPercent, fSeconds } from '../../../utils/formatNumber';
import {
  fAnalyticChartTitle,
  fAnalyticOeeAHeaderText,
  fAnalyticOeeParetoHeaderText,
  fTimeUnitText,
} from '../../../utils/textHelper';
import { convertToUnit } from '../../../utils/timeHelper';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ExportXlsx from './ExportXlsx';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';

interface Props {
  criteria: AnalyticCriteria;
  group?: boolean;
}

const headers: string[] = ['name', 'runningSeconds', 'totalBreakdownSeconds', 'plannedDowntimeSeconds', 'percent'];

const paretoHeaders: string[] = ['name', 'count', 'percent'];

export default function AnalyticChartA({ criteria, group }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dataRows, setDataRows] = useState<any[]>([]);

  const [series, setSeries] = useState<any[]>([]);

  const [options, setOptions] = useState<ApexOptions>({});

  const barOptions: ApexOptions = {
    chart: {
      type: 'bar',
    },
    stroke: {
      width: [0],
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      padding: {
        bottom: 30,
      },
    },
    labels: [],
    xaxis: {
      show: false,
      labels: { rotateAlways: true },
    },
    yaxis: [
      {
        min: 0,
        max: 100,
        labels: {
          formatter(val: number, opts?: any): string | string[] {
            return fPercent(val);
          },
        },
      },
    ],
    colors: ['#FF6699'],
  } as ApexOptions;

  const lineOptions: ApexOptions = {
    chart: {
      type: 'line',
    },
    stroke: {
      curve: 'smooth',
    },
    grid: {
      padding: {
        bottom: 30,
      },
    },
    xaxis: {
      categories: [],
      labels: { rotateAlways: true },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter(val: number, opts?: any): string | string[] {
          return fPercent(val);
        },
      },
    },
    colors: ['#FF6699'],
    markers: {
      size: 5,
      hover: {
        size: 7,
      },
    },
  } as ApexOptions;

  const paretoOptions: ApexOptions = {
    stroke: {
      width: [0, 5],
      curve: 'smooth',
    },
    grid: {
      padding: {
        bottom: 30,
      },
    },
    labels: [],
    xaxis: {
      show: false,
      labels: { rotateAlways: true },
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
    markers: {
      size: 5,
      hover: {
        size: 7,
      },
    },
    legend: {
      show: false,
    },
  } as ApexOptions;

  const refresh = async (criteria: AnalyticCriteria) => {
    setIsLoading(true);

    try {
      const ids = [...criteria.oees, ...criteria.products, ...criteria.batches];
      const url = criteria.chartSubType === 'pareto' ? '/oee-analytics/aParam' : '/oee-analytics/oee';

      const response = await axios.get<any>(url, {
        params: {
          ids,
          type: criteria.comparisonType,
          duration: criteria.duration,
          viewType: criteria.viewType,
          from: criteria.fromDate,
          to: criteria.toDate,
        },
      });

      const { data } = response;
      const { rows, sumRows } = data;

      if (criteria.chartSubType === 'pareto') {
        setDataRows(Object.keys(sumRows).map((key) => sumRows[key]));
      } else {
        setDataRows((rows as any[]).map((row) => Object.keys(row).map((key) => row[key])).flat());
      }

      if (criteria.chartSubType === 'line') {
        setOptions({
          ...lineOptions,
          xaxis: {
            ...lineOptions.xaxis,
            categories: sumRows.map((item: any) => item.key),
          },
          title: {
            text: fAnalyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        setSeries([
          {
            name: 'A',
            data: sumRows.map((item: any) => item.aPercent),
          },
        ]);
      } else if (criteria.chartSubType === 'bar' || criteria.chartSubType === 'bar_min_max') {
        if (criteria.chartSubType === 'bar_min_max') {
          sumRows.sort((a: any, b: any) => {
            if (a.aPercent > b.aPercent) {
              return 1;
            }
            if (a.aPercent < b.aPercent) {
              return -1;
            }
            return 0;
          });
        }

        setOptions({
          ...barOptions,
          labels: sumRows.map((item: any) => item.key),
          title: {
            text: fAnalyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        const currentSeries = [
          {
            name: 'A',
            type: 'column',
            data: sumRows.map((item: any) => item.aPercent),
          },
        ];

        setSeries(currentSeries);
      } else if (criteria.chartSubType === 'pareto') {
        if (ids.length === 0) {
          return;
        }

        const { labels, counts, percents } = sumRows[ids[0]] || { labels: [], counts: [], percents: [] };
        setOptions({
          ...paretoOptions,
          labels: labels,
          title: {
            text: fAnalyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        setSeries([
          {
            name: 'Time',
            type: 'column',
            color: '#FF6699',
            data: counts.map((item: any) => item),
          },
          {
            name: '%',
            type: 'line',
            data: percents.map((item: any) => fNumber2(item)),
          },
        ]);
      }

      // console.log(data);
      setIsLoading(false);
    } catch (error) {
      if (error) {
        if (error instanceof AxiosError) {
          if ('message' in error.response?.data) {
            if (Array.isArray(error.response?.data.message)) {
              for (const item of error.response?.data.message) {
                enqueueSnackbar(item, { variant: 'error' });
              }
            } else {
              enqueueSnackbar(error.response?.data.message, { variant: 'error' });
            }
          }
        } else {
          enqueueSnackbar(error.response?.data.error, { variant: 'error' });
        }
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await refresh(criteria);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria]);

  function tableAPercentCleanUp(rows: any[], format: boolean = false): any[] {
    return rows.map((row) => {
      const { name, runningSeconds, totalBreakdownSeconds, plannedDowntimeSeconds } = row;
      const loadingTime = runningSeconds - plannedDowntimeSeconds;
      const nonZeroLoadingTime = loadingTime === 0 ? 1 : loadingTime;
      const operatingTime = loadingTime - totalBreakdownSeconds;

      return {
        name,
        runningSeconds: format ? fSeconds(runningSeconds) : runningSeconds,
        totalBreakdownSeconds: format ? fSeconds(totalBreakdownSeconds) : totalBreakdownSeconds,
        plannedDowntimeSeconds: format ? fSeconds(plannedDowntimeSeconds) : plannedDowntimeSeconds,
        percent: fPercent((operatingTime / nonZeroLoadingTime) * 100),
      };
    });
  }

  function tableAParetoCleanUp(rows: any[], format: boolean = false): any[] {
    if (rows.length <= 0) {
      return [];
    }

    const row = rows[0];
    const results = [];
    for (let i = 0; i < row.labels.length; i++) {
      results.push({
        name: row.labels[i],
        count: format ? fSeconds(row.counts[i]) : row.counts[i],
        percent: fPercent(row.percents[i]),
      });
    }

    return results;
  }

  return (
    <>
      {(criteria.chartSubType === 'bar' || criteria.chartSubType === 'bar_min_max') && (
        <ReactApexChart options={options} series={series} type="bar" height={600} />
      )}

      {criteria.chartSubType === 'line' && (
        <ReactApexChart options={options} series={series} type="line" height={600} />
      )}

      {criteria.chartSubType === 'pareto' && (
        <ReactApexChart options={options} series={series} type="line" height={600} />
      )}

      {!group && (
        <>
          {(criteria.chartSubType === 'bar' ||
            criteria.chartSubType === 'bar_min_max' ||
            criteria.chartSubType === 'line') && (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <ExportXlsx
                headers={headers.map(fAnalyticOeeAHeaderText)}
                rows={tableAPercentCleanUp(dataRows)}
                filename="a-percent"
              />
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {headers.map((item) => (
                        <TableCell key={item}>{fAnalyticOeeAHeaderText(item)}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableAPercentCleanUp(dataRows, true).map((row) => (
                      <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        {headers.map((key) => (
                          <TableCell key={`${row.name}_${key}`}>{row[key]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {criteria.chartSubType === 'pareto' && (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <ExportXlsx
                headers={paretoHeaders.map(fAnalyticOeeParetoHeaderText)}
                rows={tableAParetoCleanUp(dataRows)}
                filename="a-pareto"
              />
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {paretoHeaders.map((item) => (
                        <TableCell key={item}>{fAnalyticOeeParetoHeaderText(item)}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableAParetoCleanUp(dataRows, true).map((row) => (
                      <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        {paretoHeaders.map((key) => (
                          <TableCell key={`${row.name}_${key}`}>{row[key]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}
    </>
  );
}
