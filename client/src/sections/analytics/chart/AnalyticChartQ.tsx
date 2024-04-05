import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import axios from '../../../utils/axios';
import { fNumber, fNumber2, fPercent } from '../../../utils/formatNumber';
import { fAnalyticChartTitle, fAnalyticOeeParetoHeaderText, fAnalyticOeeQHeaderText } from '../../../utils/textHelper';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ExportXlsx from './ExportXlsx';

interface Props {
  criteria: AnalyticCriteria;
  group?: boolean;
}

const headers: string[] = ['name', 'totalAutoDefects', 'totalManualDefects', 'totalCount', 'percent'];

const paretoHeaders: string[] = ['name', 'count', 'percent'];

export default function AnalyticChartQ({ criteria, group }: Props) {
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
    colors: ['#FFFA00'],
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
      xaxis: {
        categories: [],
        labels: { rotateAlways: true },
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
            return fNumber(val);
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
      const ids = [...criteria.oees, ...criteria.products, ...criteria.batches, ...criteria.operators];
      const url = criteria.chartSubType === 'pareto' ? '/oee-analytics/qParam' : '/oee-analytics/oee';

      const response = await axios.get<any>(url, {
        params: {
          ids: [...criteria.oees, ...criteria.products, ...criteria.batches, ...criteria.operators],
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
            name: 'Q',
            data: sumRows.map((item: any) => item.qPercent),
          },
        ]);
      } else if (criteria.chartSubType === 'bar' || criteria.chartSubType === 'bar_min_max') {
        if (criteria.chartSubType === 'bar_min_max') {
          sumRows.sort((a: any, b: any) => {
            if (a.qPercent > b.qPercent) {
              return 1;
            }
            if (a.qPercent < b.qPercent) {
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
            name: 'Q',
            type: 'column',
            data: sumRows.map((item: any) => item.qPercent),
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
            name: 'Count',
            type: 'column',
            color: '#FFFA00',
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

  function tableQPercentCleanUp(rows: any[], format: boolean = false): any[] {
    return rows.map((row) => {
      const { name, totalAutoDefects, totalManualDefects, totalCount } = row;
      const totalAllDefects = totalAutoDefects + totalManualDefects;
      const nonZeroTotalCount = totalCount === 0 ? 1 : totalCount;

      return {
        name,
        totalAutoDefects: format ? fNumber(totalAutoDefects) : totalAutoDefects,
        totalManualDefects: format ? fNumber(totalManualDefects) : totalManualDefects,
        totalCount: format ? fNumber(totalCount) : totalCount,
        percent: fPercent(((totalCount - totalAllDefects) / nonZeroTotalCount) * 100),
      };
    });
  }

  function tableQParetoCleanUp(rows: any[], format: boolean = false): any[] {
    if (rows.length <= 0) {
      return [];
    }

    const row = rows[0];
    const results = [];
    for (let i = 0; i < row.labels.length; i++) {
      results.push({
        name: row.labels[i],
        count: format ? fNumber(row.counts[i]) : row.counts[i],
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
                headers={headers.map(fAnalyticOeeQHeaderText)}
                rows={tableQPercentCleanUp(dataRows)}
                filename="q-percent"
              />
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {headers.map((item) => (
                        <TableCell key={item}>{fAnalyticOeeQHeaderText(item)}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableQPercentCleanUp(dataRows, true).map((row) => (
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
                rows={tableQParetoCleanUp(dataRows)}
                filename="q-pareto"
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
                    {tableQParetoCleanUp(dataRows).map((row) => (
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
