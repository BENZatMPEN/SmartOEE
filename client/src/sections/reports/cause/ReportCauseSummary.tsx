import { ReportCriteria } from "../../../@types/report";
import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from "react";
import axios from '../../../utils/axios';
import { fNumber, fNumber2, fPercent, fPercent2, fSeconds } from "../../../utils/formatNumber";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { fAnalyticChartTitle } from "../../../utils/textHelper";
import ExportXlsx from "src/sections/analytics/chart/ExportXlsx";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { AxiosError } from "axios";

interface Props {
  criteria: ReportCriteria;
}

export default function ReportCauseSummary({ criteria }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataRows, setDataRows] = useState<any[]>([]);
  const [totalDataRows, setTotalDataRows] = useState<any>([]);
  const columns: any[] = [
    {
      id: 'date',
      label: criteria.reportType === 'yearly' ? 'Year' : (criteria.reportType === 'monthly' ? 'Month' : 'Date'),
      minWidth: 120,
      formatter: (value: string) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (!value) {
          return '-';
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
    { id: 'planDownTimeName', label: 'Plan downtime', minWidth: 130, formatter: (val: string) => val ? val : '-' },
    { id: 'planDownTimeCount', label: 'Count', minWidth: 80, formatter: (val: number) => val ? val : 0 },
    { id: 'oeeBatchAName', label: 'Cause Breakdown', minWidth: 170, formatter: (val: string) => val ? val : '-' },
    { id: 'oeeBatchACount', label: 'Count', minWidth: 80, formatter: (val: number) => val ? val : 0 },
    { id: 'oeeBatchPName', label: 'Minor Stop', minWidth: 130, formatter: (val: string) => val ? val : '-' },
    { id: 'oeeBatchPCount', label: 'Count', minWidth: 80, formatter: (val: number) => val ? val : 0 },
    { id: 'oeeBatchQName', label: 'NG', minWidth: 130, formatter: (val: string) => val ? val : '-' },
    { id: 'oeeBatchQAmount', label: 'Count', minWidth: 80, formatter: (val: number) => val ? val : 0 },
    { id: 'oeeBatchQPercent', label: '%NG', minWidth: 80, formatter: (val: number) => val ? fPercent2(val) : 0 },
    { id: 'oeeBatchQAmountPcs', label: 'NG(L)', minWidth: 80, formatter: (val: number) => val ? val : 0 },
    { id: 'FG', label: 'FG', minWidth: 80, formatter: (val: number) => val ? val : '' },
    { id: 'FGL', label: 'FG(L)', minWidth: 80, formatter: (val: number) => val ? val : '' },
    { id: 'yield', label: 'Yield', minWidth: 80, formatter: (val: number) => val ? fPercent2(val) : '' },
    { id: 'loss', label: 'Loss', minWidth: 80, formatter: (val: number) => val ? fPercent2(val) : '' },
  ];

  const { enqueueSnackbar } = useSnackbar();

  const refresh = async (criteria: ReportCriteria) => {
    try {
      setIsLoading(true);
      const response = await axios.get<any, any>(`/reports/cause`, {
        params: {
          ids: [...criteria.oees, ...criteria.products, ...criteria.batches],
          type: criteria.comparisonType,
          reportType: criteria.reportType,
          viewType: criteria.viewType,
          from: criteria.fromDate,
          to: criteria.toDate,
        }
      })
      const { data } = response;
      const { rows, sumRows, total } = data;
      setDataRows(rows);
      setTotalDataRows(total);
    } catch (error) {
      if (error) {
        if (error instanceof AxiosError) {
          console.log('1')
          if ('message' in error.response?.data) {
            console.log('2')
            if (Array.isArray(error.response?.data.message)) {
              console.log(error.response)
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
            </Box></>
          )
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
                  <TableCell align="center" colSpan={2}>
                    Plan downtime
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    Cause Breakdown
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    Minor Stop
                  </TableCell>
                  <TableCell align="center" colSpan={4}>
                    NG
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    FG
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    Yield / Loss
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
              {dataRows.length > 0 && (
                <TableBody>
                  <TableRow key="summary">
                    <TableCell align="center" key="total">Total</TableCell>
                    <TableCell align="center" key="planDowntime">Plan downtime	</TableCell>
                    <TableCell key="planDownTimeCount">{Number(totalDataRows?.planDownTimeCount)}</TableCell>
                    <TableCell key="oeeBatchAName">Cause Breakdown</TableCell>
                    <TableCell key="oeeBatchACount">{Number(totalDataRows?.oeeBatchACount)}</TableCell>
                    <TableCell key="oeeBatchPName">Minor Stop</TableCell>
                    <TableCell key="oeeBatchPCount">{Number(totalDataRows?.oeeBatchPCount)}</TableCell>
                    <TableCell key="oeeBatchQName">NG</TableCell>
                    <TableCell key="oeeBatchQCount">{Number(totalDataRows?.oeeBatchQCount)}</TableCell>
                    <TableCell key="oeeBatchQPercent">{fPercent(totalDataRows?.oeeBatchQPercent)}</TableCell>
                    <TableCell key="NGL">{Number(totalDataRows?.oeeBatchQPcs)}</TableCell>
                    <TableCell key="FG">{Number(totalDataRows?.totalFg)}</TableCell>
                    <TableCell key="FGL">{Number(totalDataRows?.totalFgPcs)}</TableCell>
                    <TableCell key="yield">{fPercent2(totalDataRows?.sumYield)}</TableCell>
                    <TableCell key="loss">{fPercent2(totalDataRows?.sumLoss)}</TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Paper>
        {/* <ReactApexChart options={options} series={series} type="line" height={600} />
        <ReactApexChart options={optionsA} series={seriesA} type="line" height={600} />
        <ReactApexChart options={optionsP} series={seriesP} type="line" height={600} />
        <ReactApexChart options={optionsQ} series={seriesQ} type="line" height={600} /> */}
      </div>
    </>
  )
}
