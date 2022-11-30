import { Grid, Typography } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Link } from 'react-router-dom';
import { OeeStatusItem } from '../../@types/oee';
import { OeeTimeline } from '../../@types/oeeBatch';
import useWebSocket from '../../hooks/useWebSocket';
import { PATH_DASHBOARD } from '../../routes/paths';
import axios from '../../utils/axios';
import { getColor } from '../../utils/colorHelper';
import { fPercent } from '../../utils/formatNumber';
import { getBatchStatus } from '../../utils/formatText';

type Props = {
  oeeStatusItem: OeeStatusItem;
};

export default function DashboardOeeTimelineItem({ oeeStatusItem }: Props) {
  const { socket } = useWebSocket();

  const { id, oeeCode, productionName, oeeBatchId, oeePercent } = oeeStatusItem;

  const [timelines, setTimelines] = useState<OeeTimeline[]>([]);

  useEffect(() => {
    if (!socket || !oeeBatchId) {
      return;
    }

    const updateTimeline = (data: OeeTimeline[]) => {
      setTimelines(data);
    };

    socket.on(`batch-timeline_${oeeBatchId}.updated`, updateTimeline);

    return () => {
      socket.off(`batch-timeline_${oeeBatchId}.updated`, updateTimeline);
    };
  }, [socket, oeeBatchId]);

  const [series, setSeries] = useState<any>([]);

  const [options, setOptions] = useState<ApexOptions>({
    chart: {
      zoom: {
        enabled: false,
      },
      toolbar: { show: false },
      parentHeightOffset: 0,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        rangeBarGroupRows: true,
      },
    },
    fill: {
      type: 'solid',
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: false,
        datetimeUTC: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
      labels: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      x: {
        formatter(val: number, opts?: any): string {
          return dayjs(new Date(val)).format('HH:mm:ss');
        },
      },
      y: {
        title: {
          formatter(seriesName: string): string {
            return getBatchStatus(seriesName);
          },
        },
        formatter(val: number, opts?: any): string {
          return '';
        },
      },
    },
  });

  useEffect(() => {
    if (!oeeBatchId) {
      return;
    }

    (async () => {
      const response = await axios.get<any[]>(`/oee-batches/${oeeBatchId}/timelines`);
      const { data } = response;
      setTimelines(data);
      if (data.length > 0) {
        setOptions({
          ...options,
          xaxis: {
            ...options.xaxis,
            min: data[0].fromDate.getTime(),
          },
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSeries(
      timelines.map((item) => ({
        name: item.status,
        data: [
          {
            fillColor: getColor(item.status),
            x: oeeCode,
            y: [new Date(item.fromDate).getTime(), new Date(item.toDate).getTime()],
          },
        ],
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelines]);

  return (
    <Grid container alignItems="center" justifyContent="space-between">
      <Grid item xs={1.5}>
        <Link to={PATH_DASHBOARD.item.root(id.toString())} style={{ textDecoration: 'none' }}>
          <Typography variant="subtitle1" gutterBottom>
            {productionName}
          </Typography>
        </Link>
      </Grid>
      <Grid item xs={9.5}>
        <ReactApexChart options={options} series={series} type="rangeBar" height={100} />
      </Grid>
      <Grid item xs={1}>
        <Typography variant="subtitle1" gutterBottom textAlign="right">
          {fPercent(oeePercent)}
        </Typography>
      </Grid>
    </Grid>
  );
}
