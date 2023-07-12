import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import axios from '../../../utils/axios';
import { fPercent } from '../../../utils/formatNumber';
import { fAnalyticChartTitle } from '../../../utils/textHelper';
import { fDate } from '../../../utils/formatTime';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ExportXlsx from './ExportXlsx';

interface Props {
  criteria: AnalyticCriteria;
  group?: boolean;
}

const headers: string[] = ['key', 'totalAutoDefects', 'totalManualDefects', 'totalCount', 'percent'];

export default function AnalyticChartTimeQ({ criteria, group }: Props) {
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
          return dayjs(new Date(value)).format('HH:mm:ss');
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
    colors: ['#FFFA00'],
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
    colors: ['#FFFA00'],
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
  } as ApexOptions;

  const refresh = async (criteria: AnalyticCriteria) => {
    setIsLoading(true);

    try {
      const ids = [...criteria.oees, ...criteria.products, ...criteria.batches];
      const url =
        criteria.chartSubType === 'pie' || criteria.chartSubType === 'stack'
          ? '/oee-analytics/qParam'
          : '/oee-analytics/oee';

      const response = await axios.get<any>(url, {
        params: {
          ids: [...criteria.oees, ...criteria.products, ...criteria.batches],
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
            name: 'Q',
            data: sumRows.map((item: any) => item.qPercent),
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
            name: 'Q',
            type: 'column',
            data: sumRows.map((item: any) => item.qPercent),
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
        // {name: 'Q1', data: [time1[0], time2[0], time3[0]]}
        // {name: 'Q2', data: [time1[1], time2[1], time3[1]]}
        // {name: 'Q3', data: [time1[2], time2[2], time3[2]]}
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

  function tableQPercentCleanUp(rows: any[]): any[] {
    return rows.map((row) => {
      const { key, totalAutoDefects, totalManualDefects, totalCount } = row;
      const totalAllDefects = totalAutoDefects + totalManualDefects;
      const nonZeroTotalCount = totalCount === 0 ? 1 : totalCount;

      return {
        key: dayjs(key).format('YYYY-MM-DD HH:mm'),
        totalAutoDefects,
        totalManualDefects,
        totalCount,
        percent: (totalCount - totalAllDefects) / nonZeroTotalCount,
      };
    });
  }

  function getQParamHeaders(rows: any[]): string[] {
    const items = rows
      .map((row: any) => row.data.labels)
      .flat()
      .filter((val: any, idx: number, self: any) => self.indexOf(val) === idx);
    return ['key', ...items];
  }

  function tableQParamCleanUp(rows: any[]): any[] {
    const names = getQParamHeaders(rows);
    return rows.map((row) => {
      const { key, data } = row;
      const item: any = {};

      names.forEach((name) => {
        if (name === 'key') {
          item[name] = dayjs(key).format('YYYY-MM-DD HH:mm');
        } else {
          item[name] = data.labels.indexOf(name) >= 0 ? data.counts[data.labels.indexOf(name)] : 0;
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
            <div key={`qPie${idx}`} style={{ paddingBottom: '20px' }}>
              <ReactApexChart options={pieOptions[idx]} series={pieSeries} type="pie" width={500} />
            </div>
          ))}
        </>
      )}

      {!group && (
        <>
          {(criteria.chartSubType === 'bar' || criteria.chartSubType === 'line') && (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <ExportXlsx headers={headers} rows={tableQPercentCleanUp(dataRows)} filename="q-percent" />
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {headers.map((item) => (
                        <TableCell key={item}>{item}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableQPercentCleanUp(dataRows).map((row) => (
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
              <ExportXlsx headers={getQParamHeaders(dataRows)} rows={tableQParamCleanUp(dataRows)} filename="q-param" />
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {getQParamHeaders(dataRows).map((item) => (
                        <TableCell key={item}>{item}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableQParamCleanUp(dataRows).map((row) => (
                      <TableRow key={row.key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        {getQParamHeaders(dataRows).map((key) => (
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
