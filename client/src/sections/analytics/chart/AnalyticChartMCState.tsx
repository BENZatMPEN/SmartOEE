import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import axios from '../../../utils/axios';
import { analyticChartTitle } from '../../../utils/formatText';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ExportXlsx from './ExportXlsx';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { RootState, useSelector } from '../../../redux/store';

interface Props {
  group?: boolean;
}

const headers: string[] = ['key', 'running', 'standby', 'breakdown', 'planned', 'mc_setup'];

export default function AnalyticChartMCState({ group }: Props) {
  const { currentCriteria } = useSelector((state: RootState) => state.analytic);

  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dataRows, setDataRows] = useState<any[]>([]);

  const [series, setSeries] = useState<any[]>([]);

  const [barOptions, setBarOptions] = useState<ApexOptions>({
    chart: {
      stacked: true,
      stackType: '100%',
    },
    xaxis: {
      show: false,
      labels: { rotateAlways: true },
    },
  } as ApexOptions);

  const [pieSeries, setPieSeries] = useState<any[]>([]);

  const [pieOptions, setPieOptions] = useState<ApexOptions[]>([]);

  const refresh = async (criteria: AnalyticCriteria) => {
    setIsLoading(true);

    try {
      const response = await axios.get<any>(`/oee-analytics/mc`, {
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
      const { sumRows } = data;

      setDataRows(sumRows);

      if (criteria.chartSubType === 'stack') {
        setBarOptions({
          ...barOptions,
          xaxis: {
            ...barOptions.xaxis,
            categories: sumRows.map((row: any) => row.key),
          },
          title: {
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        setSeries([
          { name: 'Running', data: sumRows.map((row: any) => ('running' in row.status ? row.status.running : 0)) },
          { name: 'Planned', data: sumRows.map((row: any) => ('planned' in row.status ? row.status.planned : 0)) },
          {
            name: 'Breakdown',
            data: sumRows.map((row: any) => ('breakdown' in row.status ? row.status.breakdown : 0)),
          },
          { name: 'M/C Setup', data: sumRows.map((row: any) => ('mc_setup' in row.status ? row.status.mc_setup : 0)) },
          { name: 'Standby', data: sumRows.map((row: any) => ('standby' in row.status ? row.status.standby : 0)) },
        ]);
      } else if (criteria.chartSubType === 'pie') {
        setPieOptions(
          sumRows.map((row: any) => {
            return {
              labels: ['Running', 'Planned', 'Breakdown', 'M/C Setup', 'Standby'],
              title: {
                text: analyticChartTitle(row.key, criteria.fromDate, criteria.toDate),
              },
            } as ApexOptions;
          }),
        );

        setPieSeries(
          sumRows.map((row: any) => [
            'running' in row.status ? row.status.running : 0,
            'planned' in row.status ? row.status.planned : 0,
            'breakdown' in row.status ? row.status.breakdown : 0,
            'mc_setup' in row.status ? row.status.mc_setup : 0,
            'standby' in row.status ? row.status.standby : 0,
          ]),
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
      if (!currentCriteria) {
        return;
      }

      await refresh(currentCriteria);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCriteria]);

  const xlsxCleanUp = (rows: any[]): any[] =>
    rows.map((row) => {
      const { key, status } = row;
      const { running, standby, breakdown, planned, mc_setup } = status;

      return {
        key,
        running: running ? running : 0,
        standby: standby ? standby : 0,
        breakdown: breakdown ? breakdown : 0,
        planned: planned ? planned : 0,
        mc_setup: mc_setup ? mc_setup : 0,
      };
    });

  const tableCleanUp = (rows: any[]): any[] =>
    rows.map((row) => {
      const { key, status } = row;
      const { running, standby, breakdown, planned, mc_setup } = status;

      return {
        key,
        running: running ? running : 0,
        standby: standby ? standby : 0,
        breakdown: breakdown ? breakdown : 0,
        planned: planned ? planned : 0,
        mc_setup: mc_setup ? mc_setup : 0,
      };
    });

  return (
    <>
      {currentCriteria && (
        <>
          {currentCriteria.chartSubType === 'stack' ? (
            <ReactApexChart options={barOptions} series={series} type="bar" height={500} />
          ) : (
            <>
              {pieSeries.map((series: any, idx: number) => (
                <ReactApexChart key={`mcPie${idx}}`} options={pieOptions[idx]} series={series} type="pie" width={500} />
              ))}
            </>
          )}

          {!group && (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <ExportXlsx headers={headers} rows={xlsxCleanUp(dataRows)} filename="test" />
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
                    {tableCleanUp(dataRows).map((row) => (
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
        </>
      )}
    </>
  );
}
