import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import axios from '../../../utils/axios';
import { fPercent, fSeconds } from '../../../utils/formatNumber';
import { fAnalyticChartTitle, fAnalyticOeeAHeaderText } from '../../../utils/textHelper';
import { fDate } from '../../../utils/formatTime';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ExportXlsx from './ExportXlsx';

interface Props {
  criteria: AnalyticCriteria;
  group?: boolean;
}

const headers: string[] = ['key', 'runningSeconds', 'totalBreakdownSeconds', 'plannedDowntimeSeconds', 'percent'];

export default function AnalyticChartTimeA({ criteria, group }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [dataRows, setDataRows] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [options, setOptions] = useState<ApexOptions>({});

  const [series, setSeries] = useState<any[]>([]);

  const barOptions: ApexOptions = {
    chart: {
      type: 'bar',
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
    grid: {
      padding: {
        bottom: 30,
      },
    },
    dataLabels: {
      enabled: false,
    },
    labels: [],
    xaxis: {
      type: 'datetime',
      labels: { rotateAlways: true, datetimeUTC: false },
      tooltip: {
        formatter(value: string, opts?: object): string {
          return dayjs(new Date(value)).format('DD/MM/YYYY HH:mm');
        },
      },
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
    tooltip: {
      x: {
        formatter(val: number, opts?: any): string {
          return dayjs(new Date(val)).format('DD/MM/YYYY HH:mm');
        },
      },
    },
    colors: ['#FF6699'],
  } as ApexOptions;

  const lineOptions: ApexOptions = {
    chart: {
      type: 'line',
    },
    grid: {
      padding: {
        bottom: 30,
      },
    },
    stroke: {
      width: [5],
      curve: 'smooth',
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [],
      labels: {
        rotateAlways: true,
      },
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

  const pieOption: ApexOptions = {
    chart: {
      toolbar: {
        show: true,
      },
    },
    tooltip: {
      y: {
        formatter(val: number, opts?: any): string {
          return fSeconds(val);
        },
      },
    },
  } as ApexOptions;

  const [pieOptions, setPieOptions] = useState<ApexOptions[]>([]);

  const stackOptions: ApexOptions = {
    chart: {
      stacked: true,
    },
    grid: {
      padding: {
        bottom: 30,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      show: false,
      labels: { rotateAlways: true },
    },
    yaxis: {
      labels: {
        formatter(val: number, opts?: any): string | string[] {
          return fSeconds(val);
        },
      },
    },
  } as ApexOptions;

  const refresh = async (criteria: AnalyticCriteria) => {
    setIsLoading(true);

    try {
      const ids = [...criteria.oees, ...criteria.products, ...criteria.batches];
      const url =
        criteria.chartSubType === 'pie' || criteria.chartSubType === 'stack'
          ? '/oee-analytics/aParam'
          : '/oee-analytics/oee';

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

      if (criteria.chartSubType === 'stack' || criteria.chartSubType === 'pie') {
        setDataRows(sumRows);
      } else {
        setDataRows(
          (rows as any[])
            .map((row) =>
              Object.keys(row).map((key) => {
                const item = row[key];
                item.key = key;
                return item;
              }),
            )
            .flat(),
        );
      }

      if (criteria.chartSubType === 'line') {
        setOptions({
          ...lineOptions,
          xaxis: {
            ...lineOptions.xaxis,
            categories: sumRows.map((item: any) => dayjs(new Date(item.key)).format('DD/MM/YYYY HH:mm')),
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
      } else if (criteria.chartSubType === 'bar') {
        setOptions({
          ...barOptions,
          labels: sumRows.map((item: any) => new Date(item.key).getTime()),
          title: {
            text: fAnalyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        setSeries([
          {
            name: 'A',
            type: 'column',
            data: sumRows.map((item: any) => item.aPercent),
          },
        ]);
      } else if (criteria.chartSubType === 'pie') {
        setPieOptions(
          sumRows.map((row: any) => {
            return {
              ...pieOption,
              labels: row.data.labels || [],
              title: {
                text: fDate(row.key),
              },
            } as ApexOptions;
          }),
        );

        console.log(sumRows.map((row: any) => row.data.counts || []));
        setSeries(sumRows.map((row: any) => row.data.counts || []));
      } else if (criteria.chartSubType === 'stack') {
        setOptions({
          ...stackOptions,
          xaxis: {
            ...stackOptions.xaxis,
            categories: sumRows.map((row: any) => dayjs(row.key).format('DD/MM/YYYY HH:mm')),
          },
          title: {
            text: fAnalyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        const names = sumRows
          .map((row: any) => row.data.labels)
          .flat()
          .filter((val: string, idx: number, self: string) => self.indexOf(val) === idx);

        // data example
        // {name: 'A1', data: [time1[0], time2[0], time3[0]]}
        // {name: 'A2', data: [time1[1], time2[1], time3[1]]}
        // {name: 'A3', data: [time1[2], time2[2], time3[2]]}

        setSeries(
          names.map((val: string) => {
            return {
              name: val,
              data: sumRows.map((row: any) => {
                const itemIndex = row.data.labels.indexOf(val);
                return itemIndex >= 0 ? row.data.counts[itemIndex] : 0;
              }),
            };
          }),
        );
      }

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
      const { key, runningSeconds, totalBreakdownSeconds, plannedDowntimeSeconds } = row;
      const loadingTime = runningSeconds - plannedDowntimeSeconds;
      const nonZeroLoadingTime = loadingTime === 0 ? 1 : loadingTime;
      const operatingTime = loadingTime - totalBreakdownSeconds;

      return {
        key: dayjs(key).format('YYYY-MM-DD HH:mm'),
        runningSeconds: format ? fSeconds(runningSeconds) : runningSeconds,
        totalBreakdownSeconds: format ? fSeconds(totalBreakdownSeconds) : totalBreakdownSeconds,
        plannedDowntimeSeconds: format ? fSeconds(plannedDowntimeSeconds) : plannedDowntimeSeconds,
        percent: fPercent((operatingTime / nonZeroLoadingTime) * 100),
      };
    });
  }

  function getAParamHeaders(rows: any[]): string[] {
    const items = rows
      .map((row: any) => row.data.labels)
      .flat()
      .filter((val: any, idx: number, self: any) => self.indexOf(val) === idx);
    return ['key', ...items];
  }

  function tableAParamCleanUp(rows: any[], format: boolean = false): any[] {
    const names = getAParamHeaders(rows);
    return rows.map((row) => {
      const { key, data } = row;
      const item: any = {};

      names.forEach((name) => {
        if (name === 'key') {
          item[name] = dayjs(key).format('YYYY-MM-DD HH:mm');
        } else {
          const val = data.labels.indexOf(name) >= 0 ? data.counts[data.labels.indexOf(name)] : 0;
          item[name] = format ? fSeconds(val) : val;
        }
      });

      return item;
    });
  }

  return (
    <>
      {criteria.chartSubType === 'bar' && <ReactApexChart options={options} series={series} type="bar" height={600} />}

      {criteria.chartSubType === 'line' && (
        <ReactApexChart options={options} series={series} type="line" height={600} />
      )}

      {criteria.chartSubType === 'stack' && (
        <ReactApexChart options={options} series={series} type="bar" height={600} />
      )}

      {criteria.chartSubType === 'pie' && (
        <>
          {series.map((pieSeries: any, idx: number) => (
            <div key={`aPie${idx}`} style={{ paddingBottom: '20px' }}>
              <ReactApexChart options={pieOptions[idx]} series={pieSeries} type="pie" width={500} />
            </div>
          ))}
        </>
      )}

      {!group && (
        <>
          {(criteria.chartSubType === 'bar' || criteria.chartSubType === 'line') && (
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
                      <TableRow key={row.key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
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

          {(criteria.chartSubType === 'stack' || criteria.chartSubType === 'pie') && (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <ExportXlsx
                headers={getAParamHeaders(dataRows).map(fAnalyticOeeAHeaderText)}
                rows={tableAParamCleanUp(dataRows)}
                filename="a-param"
              />
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {getAParamHeaders(dataRows).map((item) => (
                        <TableCell key={item}>{fAnalyticOeeAHeaderText(item)}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableAParamCleanUp(dataRows, true).map((row) => (
                      <TableRow key={row.key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        {getAParamHeaders(dataRows).map((key) => (
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
