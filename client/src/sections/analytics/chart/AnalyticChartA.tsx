import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import { TIME_UNIT_MINUTE } from '../../../constants';
import axios from '../../../utils/axios';
import { fNumber2, fPercent } from '../../../utils/formatNumber';
import { analyticChartTitle, getTimeUnitText } from '../../../utils/formatText';
import { convertToUnit } from '../../../utils/timeHelper';
import { RootState, useSelector } from '../../../redux/store';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ExportXlsx from './ExportXlsx';

interface Props {
  group?: boolean;
}

const headers: string[] = ['name', 'runningSeconds', 'totalBreakdownSeconds', 'plannedDowntimeSeconds', 'percent'];

const paretoHeaders: string[] = ['name', 'count', 'percent'];

export default function AnalyticChartA({ group }: Props) {
  const { currentCriteria } = useSelector((state: RootState) => state.analytic);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dataRows, setDataRows] = useState<any[]>([]);

  const [series, setSeries] = useState<any[]>([]);

  const [options, setOptions] = useState<ApexOptions>({});

  const barOptions: ApexOptions = {
    chart: {
      type: 'bar',
    },
    grid: {
      padding: {
        bottom: 30,
      },
    },
    stroke: {
      width: [0, 4],
      curve: 'straight',
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
    // plotOptions: {
    //   bar: {
    //     endingShape: 'rounded',
    //     borderRadius: 5,
    //   },
    // },
  } as ApexOptions;

  const lineOptions: ApexOptions = {
    chart: {
      type: 'line',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
    },
    xaxis: {
      // type: 'datetime',
      categories: [],
      // labels: {
      //   datetimeUTC: false,
      // },
      // tooltip: {
      //   formatter(value: string, opts?: object): string {
      //     return dayjs(new Date(value)).format('HH:mm:ss');
      //   },
      // },
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
    // tooltip: {
    //   x: {
    //     formatter(val: number, opts?: any): string {
    //       return dayjs(new Date(val)).format('DD/MM/YYYY HH:mm');
    //     },
    //   },
    // },
  } as ApexOptions;

  const paretoOptions: ApexOptions = {
    stroke: {
      width: [0, 4],
      // curve: 'smooth',
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
            return fNumber2(val);
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
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
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
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
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
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        setSeries([
          {
            name: getTimeUnitText(TIME_UNIT_MINUTE),
            type: 'column',
            data: counts.map((item: any) => convertToUnit(item, TIME_UNIT_MINUTE)),
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
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (!currentCriteria) {
        return;
      }

      await refresh(currentCriteria);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCriteria]);

  const calAPercent = (runningSeconds: number, plannedDowntimeSeconds: number, totalBreakdownSeconds: number) => {
    const loadingTime = runningSeconds - plannedDowntimeSeconds;
    const nonZeroLoadingTime = loadingTime === 0 ? 1 : loadingTime;
    const operatingTime = loadingTime - totalBreakdownSeconds;
    return operatingTime / nonZeroLoadingTime;
  };

  const xlsxAPercentCleanUp = (rows: any[]): any[] =>
    rows.map((row) => {
      const { name, runningSeconds, totalBreakdownSeconds, plannedDowntimeSeconds } = row;
      return {
        name,
        runningSeconds,
        totalBreakdownSeconds,
        plannedDowntimeSeconds,
        percent: calAPercent(runningSeconds, plannedDowntimeSeconds, totalBreakdownSeconds),
      };
    });

  const tableAPercentCleanUp = (rows: any[]): any[] =>
    rows.map((row) => {
      const { name, runningSeconds, totalBreakdownSeconds, plannedDowntimeSeconds } = row;
      return {
        name,
        runningSeconds,
        totalBreakdownSeconds,
        plannedDowntimeSeconds,
        percent: calAPercent(runningSeconds, plannedDowntimeSeconds, totalBreakdownSeconds),
      };
    });

  const xlsxAParetoCleanUp = (rows: any[]): any[] => {
    if (rows.length <= 0) {
      return [];
    }

    const row = rows[0];
    const results = [];
    for (let i = 0; i < row.labels.length; i++) {
      results.push({
        name: row.labels[i],
        count: row.counts[i],
        percent: row.percents[i],
      });
    }

    return results;
  };

  const tableAParetoCleanUp = (rows: any[]): any[] => {
    if (rows.length <= 0) {
      return [];
    }

    const row = rows[0];
    const results = [];
    for (let i = 0; i < row.labels.length; i++) {
      results.push({
        name: row.labels[i],
        count: row.counts[i],
        percent: row.percents[i],
      });
    }

    return results;
  };

  return (
    <>
      {currentCriteria && (
        <>
          {(currentCriteria.chartSubType === 'bar' || currentCriteria.chartSubType === 'bar_min_max') && (
            <ReactApexChart options={options} series={series} type="bar" height={600} />
          )}

          {currentCriteria.chartSubType === 'line' && (
            <ReactApexChart options={options} series={series} type="line" height={600} />
          )}

          {currentCriteria.chartSubType === 'pareto' && (
            <ReactApexChart options={options} series={series} type="line" height={600} />
          )}

          {!group && (
            <>
              {(currentCriteria.chartSubType === 'bar' ||
                currentCriteria.chartSubType === 'bar_min_max' ||
                currentCriteria.chartSubType === 'line') && (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                  <ExportXlsx headers={headers} rows={xlsxAPercentCleanUp(dataRows)} filename="test" />
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
                        {tableAPercentCleanUp(dataRows).map((row) => (
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

              {currentCriteria.chartSubType === 'pareto' && (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                  <ExportXlsx headers={paretoHeaders} rows={xlsxAParetoCleanUp(dataRows)} filename="test" />
                  <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          {paretoHeaders.map((item) => (
                            <TableCell key={item}>{item}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableAParetoCleanUp(dataRows).map((row) => (
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
      )}
    </>
  );
}
