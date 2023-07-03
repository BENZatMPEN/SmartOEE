import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import * as React from 'react';
import { ReactNode, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import axios from '../../../utils/axios';
import { fPercent, fSeconds } from '../../../utils/formatNumber';
import { fAnalyticChartTitle, fAnalyticOeeHeaderText } from '../../../utils/textHelper';
import {
  Box,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import ExportXlsx from './ExportXlsx';
import Button from '@mui/material/Button';
import { AnalyticChartOEELotDialog } from './AnalyticChartOEELotDialog';

interface Props {
  criteria: AnalyticCriteria;
  group?: boolean;
}

const headers: any[] = [
  {
    key: 'key',
    width: 200,
  },
  {
    key: 'name',
    width: 200,
  },
  {
    key: 'runningSeconds',
    width: 200,
    formatter: (val: number) => fSeconds(val),
  },
  {
    key: 'totalBreakdownSeconds',
    width: 200,
    formatter: (val: number) => fSeconds(val),
  },
  {
    key: 'plannedDowntimeSeconds',
    width: 200,
    formatter: (val: number) => fSeconds(val),
  },
  {
    key: 'totalCount',
    width: 200,
  },
  {
    key: 'totalAutoDefects',
    width: 200,
  },
  {
    key: 'totalManualDefects',
    width: 200,
  },
  {
    key: 'totalOtherDefects',
    width: 200,
  },
  {
    key: 'totalTimeSeconds',
    width: 200,
    formatter: (val: number) => fSeconds(val),
  },
  {
    key: 'totalCountByBatch',
    width: 100,
  },
];

export default function AnalyticChartTimeOEE({ criteria, group }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [dataRows, setDataRows] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [lotOpen, setLotOpen] = useState<boolean>(false);

  const [lotDetails, setLotDetails] = useState<ReactNode>();

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

  const refresh = async (criteria: AnalyticCriteria) => {
    setIsLoading(true);

    try {
      const response = await axios.get<any>(`/oee-analytics/oee`, {
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

  const xlsxCleanUp = (rows: any[]): any[] =>
    rows.map((row) => {
      const { key, totalCountByBatch, ...other } = row;
      const batchKeys = Object.keys(totalCountByBatch);
      return {
        key: dayjs(key).format('YYYY-MM-DD HH:mm'),
        ...other,
        totalTimeSeconds: Object.keys(totalCountByBatch).reduce((acc, key) => {
          acc += totalCountByBatch[key].totalCount * totalCountByBatch[key].standardSpeedSeconds;
          return acc;
        }, 0),
        totalCountByBatch: batchKeys
          .map((batchKey) => {
            const { lotNumber, standardSpeedSeconds, totalCount } = totalCountByBatch[batchKey];
            return `Lot Number: ${
              lotNumber ? lotNumber : batchKey
            }, Standard Speed: ${standardSpeedSeconds}, Total Count: ${totalCount}`;
          })
          .join('\n'),
      };
    });

  const tableCleanUp = (rows: any[]): any[] =>
    rows.map((row) => {
      const { key, totalCountByBatch, ...other } = row;
      const batchKeys = Object.keys(totalCountByBatch);
      return {
        key: dayjs(key).format('YYYY-MM-DD HH:mm'),
        ...other,
        totalTimeSeconds: Object.keys(totalCountByBatch).reduce((acc, key) => {
          acc += totalCountByBatch[key].totalCount * totalCountByBatch[key].standardSpeedSeconds;
          return acc;
        }, 0),
        totalCountByBatch: (
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setLotOpen(true);
                setLotDetails(
                  <>
                    <Stack spacing={3} divider={<Divider />}>
                      {batchKeys.map((batchKey) => {
                        const { lotNumber, standardSpeedSeconds, totalCount } = totalCountByBatch[batchKey];
                        return (
                          <Box key={batchKey}>
                            <Typography variant="subtitle1" gutterBottom>
                              Lot Number: {lotNumber ? lotNumber : batchKey}
                            </Typography>
                            <div>Standard Speed: {standardSpeedSeconds}</div>
                            <div>Total Count: {totalCount}</div>
                          </Box>
                        );
                      })}
                    </Stack>
                  </>,
                );
              }}
            >
              Lot Details
            </Button>
          </>
        ),
      };
    });

  useEffect(() => {
    (async () => {
      await refresh(criteria);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria]);

  return (
    <>
      <ReactApexChart options={options} series={series} type="line" height={600} />

      {!group && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <ExportXlsx
            headers={headers.map((item) => fAnalyticOeeHeaderText(item.key))}
            rows={xlsxCleanUp(dataRows)}
            filename="oee"
          />
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {headers.map((item) => (
                    <TableCell key={item.key} width={item.width}>
                      {fAnalyticOeeHeaderText(item.key)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableCleanUp(dataRows).map((row) => (
                  <TableRow key={row.key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    {headers.map((item) => (
                      <TableCell key={`${row.name}_${item.key}`}>
                        {item.formatter ? item.formatter(row[item.key]) : row[item.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <AnalyticChartOEELotDialog
        details={lotDetails}
        open={lotOpen}
        onClose={() => {
          setLotOpen(false);
          setLotDetails(<></>);
        }}
      />
    </>
  );
}
