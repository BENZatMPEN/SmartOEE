import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { OeeBatchParamParetoData } from '../../../../@types/oeeBatch';
import { initialOeeStats, OEE_TYPE_Q } from '../../../../constants';
import useWebSocket from '../../../../hooks/useWebSocket';
import { getOeeBatchParetoQ, updateBatchParetoQ } from '../../../../redux/actions/oeeBatchAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { fNumber, fNumber2, fPercent } from '../../../../utils/formatNumber';
import { fChartTitle } from '../../../../utils/textHelper';
import { getPercentSettingsByType } from '../../../../utils/percentSettingHelper';
import DashboardPieChart from '../../DashboardPieChart';
import dayjs from 'dayjs';

export default function DashboardApqGraphQ() {
  const dispatch = useDispatch();

  const { socket } = useWebSocket();

  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { selectedOee } = useSelector((state: RootState) => state.oeeDashboard);

  const { useSitePercentSettings, percentSettings } = selectedOee || {
    useSitePercentSettings: true,
  };

  const { currentBatch, batchStatsTime, batchParetoQ } = useSelector((state: RootState) => state.oeeBatch);

  const { id: batchId, oeeStats } = currentBatch || {};

  const { qPercent, totalCount, totalManualDefects, totalAutoDefects } = oeeStats || initialOeeStats;

  useEffect(() => {
    if (!socket || !batchId) {
      return;
    }

    const updatePareto = (data: OeeBatchParamParetoData) => {
      dispatch(updateBatchParetoQ(data));
    };

    socket.on(`q-pareto_${batchId}.updated`, updatePareto);

    return () => {
      socket.off(`q-pareto_${batchId}.updated`, updatePareto);
    };
  }, [socket, batchId, dispatch]);

  const [series, setSeries] = useState<any>([]);

  const [options, setOptions] = useState<ApexOptions>({
    chart: {
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      width: [0, 4],
      curve: 'smooth',
    },
    grid: {
      padding: {
        bottom: 50,
        left: 40,
      },
    },
    labels: [],
    xaxis: {
      show: false,
      labels: { rotateAlways: true, hideOverlappingLabels: false },
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
    legend: {
      show: false,
    },
  } as ApexOptions);

  useEffect(() => {
    if (!batchId) {
      return;
    }

    (async () => {
      await dispatch(getOeeBatchParetoQ(batchId));
      //
    })();
  }, [dispatch, batchId]);

  useEffect(() => {
    const { labels, counts, percents } = batchParetoQ || { labels: [], counts: [], percents: [] };
    const filename = `${selectedOee?.oeeCode || ''}${currentBatch?.lotNumber || ''}${
      currentBatch?.startDate ? dayjs(currentBatch.startDate).format('DDMMYYYY') : ''
    } OEE Quality`;

    setOptions({
      ...options,
      chart: {
        toolbar: {
          export: {
            csv: {
              filename: filename,
            },
            svg: {
              filename: filename,
            },
            png: {
              filename: filename,
            },
          },
        },
      },
      labels: labels,
      title: {
        text: fChartTitle(currentBatch, batchStatsTime),
        align: 'center',
      },
    });

    setSeries([
      {
        name: 'Defect (pcs)',
        type: 'column',
        data: counts,
        color: '#FFFA00',
      },
      {
        name: '%',
        type: 'line',
        data: percents.map((item) => fNumber2(item)),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchParetoQ, batchStatsTime]);

  const percents = useMemo(
    () => getPercentSettingsByType(selectedSite, percentSettings || [], useSitePercentSettings, OEE_TYPE_Q),
    [selectedSite, percentSettings, useSitePercentSettings],
  );

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, gap: 3 }}>
              <Typography variant="h2">Q</Typography>

              <Box>
                <DashboardPieChart
                  high={percents.high}
                  medium={percents.medium}
                  low={percents.low}
                  oeeType={OEE_TYPE_Q}
                  percent={qPercent}
                  size={270}
                />

                <Typography variant="subtitle1" textAlign="center" sx={{ mt: 1 }}>
                  Quality
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={3.5}>
            <Stack spacing={1}>
              <ItemBox head="Total Product" value={fNumber(totalCount)} tail="pcs." />

              <ItemBox
                head="Good Product"
                value={fNumber(totalCount - totalAutoDefects + totalManualDefects)}
                tail="pcs."
              />

              <ItemBox head="Defect Product" value={fNumber(totalAutoDefects + totalManualDefects)} tail="pcs." />
            </Stack>
          </Grid>

          <Grid item xs={5.5}>
            <ReactApexChart options={options} series={series} type="line" height={400} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

type ItemBoxPros = {
  head: string;
  value: string;
  tail: string;
};

function ItemBox({ head, value, tail }: ItemBoxPros) {
  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={5}>
          <Typography variant="body1" textAlign="right">
            {head}
          </Typography>
        </Grid>

        <Grid item xs={3.5}>
          <Box sx={{ border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '6px', p: 1 }}>
            <Typography variant="body1" textAlign="center">
              {value}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={3.5}>
          <Typography variant="body2">{tail}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
