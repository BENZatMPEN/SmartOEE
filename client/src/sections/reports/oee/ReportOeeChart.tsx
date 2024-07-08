import { ReportCriteria } from "../../../@types/report";
import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from "react";
import axios from '../../../utils/axios';
import { fNumber, fNumber2, fPercent, fSeconds } from '../../../utils/formatNumber';
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { fAnalyticChartTitle } from "../../../utils/textHelper";
import dayjs from 'dayjs';
import { max } from "lodash";
import ExportXlsx from "src/sections/analytics/chart/ExportXlsx";

interface Props {
  criteria: ReportCriteria;
}

export default function ReportOEEChart({ criteria }: Props) {
  const [maxGraph, setMaxGraph] = useState<number>(100);
  const [dataRows, setDataRows] = useState<any[]>([]);
  const [sumDataRows, setSumDataRows] = useState<any>({});
  const [series, setSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<ApexOptions>({
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
    stroke: {
      width: [0, 5, 5, 5],
      curve: 'smooth',
    },
    grid: {
      padding: {
        bottom: 30,
      },
    },
    labels: [],
    xaxis: {
      type: 'datetime',
      labels: { rotateAlways: true, datetimeUTC: false },
      // tooltip: {
      //   formatter(value: string, opts?: object): string {
      //     return dayjs(new Date(value)).format('HH:mm:ss');
      //   },
      // },
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
    colors: ['#00C000', '#FF6699', '#00CCFF', '#FFFA00'],
    markers: {
      size: 5,
      hover: {
        size: 7,
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

  const [series2, setSeries2] = useState<any[]>([]);
  const [options2, setOptions2] = useState<ApexOptions>({
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
    stroke: {
      width: [0, 0, 0, 0, 5],
      curve: 'smooth',
    },
    grid: {
      padding: {
        bottom: 30,
      },
    },
    labels: [],
    xaxis: {
      type: 'datetime',
      labels: { rotateAlways: true, datetimeUTC: false },
    },
    colors: ['#00C000', '#FF6699', '#00CCFF', '#FFFA00'],
    markers: {
      size: 5,
      hover: {
        size: 7,
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

  const columns: any[] = [
    { id: 'oeeCode', label: 'OEE Code', minWidth: 130 },
    { id: 'productName', label: 'OEE (Production Name)', minWidth: 190 },
    {
      id: 'productSku', label: 'Product (SKU)', minWidth: 170,
      formatter: (value: string) => {
        if (value === '') {
          return '-'
        } else {
          return value
        }
      }
    },
    {
      id: 'lotNumber', label: 'Lot No.', minWidth: 120,
      formatter: (value: string) => {
        if (value === '') {
          return '-'
        } else {
          return value
        }
      }
    },
    {
      id: 'startDate',
      label: 'Date',
      minWidth: 100,
      formatter: (value: string) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (!value) {
          return '';
        }
        const date = new Date(value);
        if (criteria.reportType === 'yearly') {
          return `${months[date.getMonth()]}-${date.getFullYear()}`;
        } else if (criteria.reportType === 'monthly') {
          return `${months[date.getMonth()]}-${date.getFullYear()}`;
        }
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      }
    },
    {
      id: 'ct',
      label: 'CT (mm:SS)',
      minWidth: 150,
      formatter: (value: number) => {
        if (!value) {
          return '-';
        }
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    },
    {
      id: 'runningSeconds',
      label: 'Total Available Time (HH:MM:SS)',
      minWidth: 200,
      formatter: (val: number) => {
        return fSeconds(val);
      },
    },
    {
      id: 'operatingSeconds',
      label: 'Operating Time (HH:MM:SS)',
      minWidth: 200,
      formatter: (val: number) => {
        return fSeconds(val);
      },
    },
    {
      id: 'oeePercent',
      label: '%OEE',
      minWidth: 80,
      formatter: (value: number) => {
        return fNumber2(value);
      }
    },
    {
      id: 'aPercent', label: '%A', minWidth: 60, formatter: (value: number) => {
        return fNumber2(value);
      }
    },
    {
      id: 'pPercent', label: '%P', minWidth: 60, formatter: (value: number) => {
        return fNumber2(value);
      }
    },
    {
      id: 'qPercent', label: '%Q', minWidth: 60, formatter: (value: number) => {
        return fNumber2(value);
      }
    },
    { id: 'qOk', label: 'Q (OK)', minWidth: 80 },
    { id: 'qNg', label: 'Q (NG)', minWidth: 80 },
    { id: 'totalCount', label: 'Actual', minWidth: 100 },
    { id: 'plan', label: 'Plan', minWidth: 100 },
    {
      id: 'efficiency', label: 'Efficiency', minWidth: 100,
      formatter: (val: number) => {
        return fPercent(val);
      },
    },
    { id: 'yield', label: 'Yield', minWidth: 100, formatter: (val: number) => fPercent(val) },
    { id: 'loss', label: 'Loss', minWidth: 100, formatter: (val: number) => fPercent(val) },
  ];
  const refresh = async (criteria: ReportCriteria) => {
    try {
      setIsLoading(true);
      const response = await axios.get<any, any>(`/reports/oee`, {
        params: {
          ids: [...criteria.oees, ...criteria.products, ...criteria.batches],
          type: criteria.comparisonType,
          reportType: criteria.reportType,
          from: criteria.fromDate,
          to: criteria.toDate,
        }
      });
      const { data } = response;
      const { table, chart } = data;
      const rows = table.rows;
      const sumRows = chart.sumRows;
      const sumRowsProduction = chart.sumRowsProduction;
      if (sumRowsProduction.length > 0) {
        const maxGraph = max(sumRowsProduction.map((item: any) => item.plan));
        setOptions2({
          ...options2,
          yaxis: [
            {
              seriesName: 'Q(OK)',
              show: false,
              max: maxGraph,
              labels: {
                formatter(val: number, opts?: any): string | string[] {
                  return fNumber(val);
                },
              }
            },
            {
              seriesName: 'Q(NG)',
              show: false,
              max: maxGraph,
              labels: {
                formatter(val: number, opts?: any): string | string[] {
                  return fNumber(val);
                },
              }
            },
            {
              seriesName: 'Actual',
              show: false,
              max: maxGraph,
              labels: {
                formatter(val: number, opts?: any): string | string[] {
                  return fNumber(val);
                },
              }
            },
            {
              seriesName: 'Plan',
              max: maxGraph,
              labels: {
                formatter(val: number, opts?: any): string | string[] {
                  return fNumber(val);
                },
              }
            },
            {
              seriesName: 'Efficiency',
              opposite: true,
              min: 0,
              max: 100,
              labels: {
                formatter(val: number, opts?: any): string | string[] {
                  return fPercent(val);
                },
              },
            },
          ],
        } as ApexOptions);
      }

      setSumDataRows(data?.table?.total);

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

      setOptions({
        ...options,
        labels: sumRows.map((item: any) => new Date(item.key).getTime()),
        title: {
          text: fAnalyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
          align: 'center',
        },
      });


      setOptions2({
        ...options2,
        labels: sumRowsProduction.map((item: any) => new Date(item.key).getTime()),
        title: {
          text: fAnalyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
          align: 'center',
        },
      });

      setSeries([
        {
          name: 'OEE',
          type: 'column',
          data: sumRows.map((item: any) => item.oeePercent),
        },
        {
          name: 'A',
          type: 'line',
          data: sumRows.map((item: any) => item.aPercent),
        },
        {
          name: 'P',
          type: 'line',
          data: sumRows.map((item: any) => item.pPercent),
        },
        {
          name: 'Q',
          type: 'line',
          data: sumRows.map((item: any) => item.qPercent),
        },
      ]);

      setSeries2([
        {
          name: 'Q(OK)',
          type: 'column',
          data: sumRowsProduction.map((item: any) => item.qOk),
        },
        {
          name: 'Q(NG)',
          type: 'column',
          data: sumRowsProduction.map((item: any) => item.qNg),
        },
        {
          name: 'Actual',
          type: 'column',
          data: sumRowsProduction.map((item: any) => item.actual),
        },
        {
          name: 'Plan',
          type: 'column',
          data: sumRowsProduction.map((item: any) => item.plan),
        },
        {
          name: 'Efficiency',
          type: 'line',
          data: sumRowsProduction.map((item: any) => item.efficiency),
        },
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await refresh(criteria);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria]);

  const xlsxCleanUp = (rows: any[]): any[] =>
    rows.map((row) => {
      const { totalCountByBatch, ...other } = row;
      const batchKeys = Object.keys(totalCountByBatch);
      return {
        ...other,
        totalTimeSeconds: Object.keys(totalCountByBatch).reduce((acc, key) => {
          acc += totalCountByBatch[key].totalCount * totalCountByBatch[key].standardSpeedSeconds;
          return acc;
        }, 0),
        totalCountByBatch: batchKeys
          .map((batchKey) => {
            const { lotNumber, standardSpeedSeconds, totalCount } = totalCountByBatch[batchKey];
            return `Lot Number: ${lotNumber ? lotNumber : batchKey
              }, Standard Speed: ${standardSpeedSeconds}, Total Count: ${totalCount}`;
          })
          .join(', '),
      };
    });

  return (
    <>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {
          isLoading && (<>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              position: 'absolute', // changed from 'fixed' to 'absolute'
              zIndex: 9999, // any value higher than the z-index of other content
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'white', // added this line
            }}>
              <CircularProgress size={100} />
            </Box></>)
        }
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <ExportXlsx
            headers={columns.map((column) => column.label)}
            rows={xlsxCleanUp(dataRows)}
            filename="oee"
          />
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dataRows.map((row) => (
                  <TableRow key={row.key}>
                    {columns.map((column) =>
                      <TableCell key={`${row.name}_${column.id}`} align={column.align}>
                        {column.formatter ? column.formatter(row[column.id]) : row[column.id]}
                      </TableCell>
                    )}
                  </TableRow>
                ))
                }
              </TableBody>
              {criteria.reportType !== 'daily' && (
                <TableBody>
                  <TableRow key="summary">
                    <TableCell colSpan={6} align="center" key="total">Total</TableCell>
                    <TableCell key={sumDataRows?.runningSeconds}>{fSeconds(sumDataRows?.runningSeconds)}</TableCell>
                    <TableCell key={sumDataRows?.operatingSeconds}>{fSeconds(sumDataRows?.operatingSeconds)}</TableCell>
                    <TableCell key={sumDataRows?.oeeSum}>{fNumber2(sumDataRows?.oeeSum)}</TableCell>
                    <TableCell key={sumDataRows?.aSum}>{fNumber2(sumDataRows?.aSum)}</TableCell>
                    <TableCell key={sumDataRows?.pSum}>{fNumber2(sumDataRows?.pSum)}</TableCell>
                    <TableCell key={sumDataRows?.qSum}>{fNumber2(sumDataRows?.qSum)}</TableCell>
                    <TableCell key={sumDataRows?.qOk}>{fNumber(sumDataRows?.qOk)}</TableCell>
                    <TableCell key={sumDataRows?.qNg}>{fNumber(sumDataRows?.qNg)}</TableCell>
                    <TableCell key={sumDataRows?.totalCount}>{fNumber(sumDataRows?.totalCount)}</TableCell>
                    <TableCell key={sumDataRows?.plan}>{fNumber(sumDataRows?.plan)}</TableCell>
                    <TableCell key={sumDataRows?.efficiency}>{fPercent(sumDataRows?.efficiency)}</TableCell>
                    <TableCell key={sumDataRows?.yield}>{fPercent(sumDataRows?.yield)}</TableCell>
                    <TableCell key={sumDataRows?.loss}>{fPercent(sumDataRows?.loss)}</TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Paper>
        <ReactApexChart options={options} series={series} type="line" height={600} />
        <ReactApexChart options={options2} series={series2} type="line" height={600} />
      </div >
    </>
  )
}
