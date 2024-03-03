import { ReportCriteria } from "../../../@types/report";
import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from "react";
import axios from '../../../utils/axios';
import { fNumber2, fPercent, fSeconds } from "../../../utils/formatNumber";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import dayjs from 'dayjs';
import { fAnalyticChartTitle } from "../../../utils/textHelper";
import { set } from "lodash";
import ExportXlsx from "src/sections/analytics/chart/ExportXlsx";

interface Props {
  criteria: ReportCriteria;
}

const headers: string[] = ['date', 'planDowntime', 'pTime', 'pDuration', 'causeBreakDown', 'cTime', 'cDuration', 'minerStop', 'mTime', 'mDuration', 'ngName', 'ngValue'];

interface Column {
  id: 'date' | 'planDowntime' | 'pTime' | 'pDuration' | 'causeBreakDown' | 'cTime' | 'cDuration' | 'minerStop' | 'mTime' | 'mDuration' | 'ngName' | 'ngValue';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

export default function ReportCauseChart({ criteria }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataRows, setDataRows] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [seriesA, setSeriesA] = useState<any[]>([]);
  const [seriesP, setSeriesP] = useState<any[]>([]);
  const [seriesQ, setSeriesQ] = useState<any[]>([]);
  const [options, setOptions] = useState<ApexOptions>({
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
  } as ApexOptions);
  const [optionsA, setOptionsA] = useState<ApexOptions>({
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
  } as ApexOptions);
  const [optionsP, setOptionsP] = useState<ApexOptions>({
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
  } as ApexOptions);
  const [optionsQ, setOptionsQ] = useState<ApexOptions>({
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
  } as ApexOptions);

  const columns: any[] = [
    {
      id: 'date',
      label: criteria.reportType === 'yearly' ? 'Year' : (criteria.reportType === 'monthly' ? 'Month' : 'Date'),
      minWidth: 120,
      formatter: (value: string) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (!value) {
          return '';
        }
        const date = new Date(value);
        if (criteria.reportType === 'yearly') {
          return `${date.getFullYear()}`;
        } else if (criteria.reportType === 'monthly') {
          return `${months[date.getMonth()]}-${date.getFullYear()}`;
        }
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      }
    },
    { id: 'planDownTimeName', label: 'Plan downtime', minWidth: 130 },
    {
      id: 'planDownTimeExpiredAt',
      label: 'Time (HH:MM:SS)',
      minWidth: 160,
    },
    {
      id: 'planDownTimeSeconds',
      label: 'Duration (HH:MM:SS)',
      minWidth: 180,
      formatter: (val: number) => {
        if (val) {
          return fSeconds(val);
        } else {
          return "";
        }
      },
    },
    { id: 'oeeBatchAName', label: 'Cause Breakdown', minWidth: 170 },
    { id: 'oeeBatchATimestamp', label: 'Time (HH:MM:SS)', minWidth: 180 },
    {
      id: 'oeeBatchASeconds',
      label: 'Duration (HH:MM:SS)',
      minWidth: 180,
      formatter: (val: number) => {
        if (val) {
          return fSeconds(val);
        } else {
          return "";
        }
      },
    },
    { id: 'oeeBatchPName', label: 'Minor Stop', minWidth: 130 },
    { id: 'oeeBatchPTimestamp', label: 'Time (HH:MM:SS)', minWidth: 180 },
    {
      id: 'oeeBatchPSeconds',
      label: 'Duration (HH:MM:SS)',
      minWidth: 180,
      formatter: (val: number) => {
        if (val) {
          return fSeconds(val);
        } else {
          return "";
        }
      },
    },
    { id: 'oeeBatchQName', label: 'Name', minWidth: 320 },
    { id: 'oeeBatchQAmount', label: 'Value', minWidth: 80 },
  ];

  const refresh = async (criteria: ReportCriteria) => {
    try {
      setIsLoading(true);
      const response = await axios.get<any, any>(`/reports/cause`, {
        params: {
          ids: [...criteria.oees, ...criteria.products, ...criteria.batches],
          type: criteria.comparisonType,
          reportType: criteria.reportType,
          from: criteria.fromDate,
          to: criteria.toDate,
        }
      })
      const { data } = response;
      const { rows, sumRows } = data;
      setDataRows(rows);

      const ids = [...criteria.oees, ...criteria.products, ...criteria.batches];
      const { planDownTime, oeeBatchA, oeeBatchP, oeeBatchQ } = sumRows;
      const { labels, counts, percents } = planDownTime[ids[0]] || { labels: [], counts: [], percents: [] };
      const { labels: labelsA, counts: countsA, percents: percentsA } = oeeBatchA[ids[0]] || { labels: [], counts: [], percents: [] };
      const { labels: labelsP, counts: countsP, percents: percentsP } = oeeBatchP[ids[0]] || { labels: [], counts: [], percents: [] };
      const { labels: labelsQ, counts: countsQ, percents: percentsQ } = oeeBatchQ[ids[0]] || { labels: [], counts: [], percents: [] };
      setOptions({
        labels: labels,
        title: {
          text: fAnalyticChartTitle(`Plan downtime`, criteria.fromDate, criteria.toDate),
          align: 'center',
        },
      });

      setOptionsA({
        labels: labelsA,
        title: {
          text: fAnalyticChartTitle(`Cause Breakdown`, criteria.fromDate, criteria.toDate),
          align: 'center',
        },
      });

      setOptionsP({
        labels: labelsP,
        title: {
          text: fAnalyticChartTitle(`Minor Stop`, criteria.fromDate, criteria.toDate),
          align: 'center',
        },
      });

      setOptionsQ({
        labels: labelsQ,
        title: {
          text: fAnalyticChartTitle(`NG`, criteria.fromDate, criteria.toDate),
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

      setSeriesA([
        {
          name: 'Time',
          type: 'column',
          color: '#FF6699',
          data: countsA.map((item: any) => item),
        },
        {
          name: '%',
          type: 'line',
          data: percentsA.map((item: any) => fNumber2(item)),
        },
      ]);

      setSeriesP([
        {
          name: 'Time',
          type: 'column',
          color: '#FF6699',
          data: countsP.map((item: any) => item),
        },
        {
          name: '%',
          type: 'line',
          data: percentsP.map((item: any) => fNumber2(item)),
        },
      ]);

      setSeriesQ([
        {
          name: 'Time',
          type: 'column',
          color: '#FF6699',
          data: countsQ.map((item: any) => item),
        },
        {
          name: '%',
          type: 'line',
          data: percentsQ.map((item: any) => fNumber2(item)),
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
            rows={dataRows}
            filename="oee"
          />
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center" colSpan={1}>
                  </TableCell>
                  <TableCell align="center" colSpan={3}>
                    Plan downtime
                  </TableCell>
                  <TableCell align="center" colSpan={3}>
                    Cause Breakdown
                  </TableCell>
                  <TableCell align="center" colSpan={3}>
                    Minor Stop
                  </TableCell>
                  <TableCell align="center" colSpan={3}>
                    NG
                  </TableCell>

                </TableRow>
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
                {dataRows.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => {
                      return (
                        <TableCell key={`${index}_${column.id}`} align={column.align}>
                          {column.formatter ? column.formatter(row[column.id]) : row[column.id]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <ReactApexChart options={options} series={series} type="line" height={600} />
        <ReactApexChart options={optionsA} series={seriesA} type="line" height={600} />
        <ReactApexChart options={optionsP} series={seriesP} type="line" height={600} />
        <ReactApexChart options={optionsQ} series={seriesQ} type="line" height={600} />
      </div>
    </>
  )
}
