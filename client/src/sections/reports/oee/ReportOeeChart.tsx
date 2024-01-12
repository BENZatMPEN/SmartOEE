import { ReportCriteria } from "../../../@types/report";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from "react";
import axios from '../../../utils/axios';
import { fNumber, fNumber2, fPercent, fSeconds } from '../../../utils/formatNumber';
import { da } from "date-fns/locale";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { fAnalyticChartTitle } from "../../../utils/textHelper";
import dayjs from 'dayjs';
import { max } from "lodash";

interface Props {
  criteria: ReportCriteria;
}

interface Column {
  id: 'oeeCode' | 'oeeName' | 'product' | 'lotNo' | 'date' | 'ct' | 'totalTime' | 'operationTime' | 'oee' | 'a' | 'p' | 'q' | 'qok' | 'qng' | 'actual' | 'plan' | 'efficiency';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: any[] = [
  { id: 'oeeCode', label: 'OEE Code', minWidth: 130 },
  { id: 'productName', label: 'OEE (Production Name)', minWidth: 190 },
  { id: 'productSku', label: 'Product (SKU)', minWidth: 170 },
  { id: 'lotNumber', label: 'Lot No.', minWidth: 120 },
  {
    id: 'startDate',
    label: 'Date',
    minWidth: 100,
    formatter: (value: string) => {
      if (!value) {
        return '';
      }
      const date = new Date(value);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  },
  {
    id: 'ct',
    label: 'CT (mm:SS)',
    minWidth: 150,
    formatter: (value: number) => {
      if (!value) {
        return '';
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
  { id: 'totalAutoDefects', label: 'Q (OK)', minWidth: 80 },
  { id: 'qNg', label: 'Q (NG)', minWidth: 80 },
  { id: 'totalCount', label: 'Actual', minWidth: 100 },
  { id: 'plan', label: 'Plan', minWidth: 100 },
  {
    id: 'efficiency', label: 'Efficiency', minWidth: 100,
    formatter: (val: number) => {
      return fNumber2(val);
    },
  }
];

export default function ReportOEEChart({ criteria }: Props) {
  const [maxGraph, setMaxGraph] = useState<number>(100);
  const [dataRows, setDataRows] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
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

  const refresh = async (criteria: ReportCriteria) => {
    try {
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
    }
  }

  useEffect(() => {
    (async () => {
      await refresh(criteria);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria]);

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%' }}>
          <div style={{ width: '100%', height: '100%' }}></div>
        </div>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ top: 57, minWidth: column.minWidth }}
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
          </Table>
        </TableContainer>
      </Paper>
      <ReactApexChart options={options} series={series} type="line" height={600} />
      <ReactApexChart options={options2} series={series2} type="line" height={600} />

    </>
  )
}
