import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { RootState, useSelector } from '../../../../redux/store';
import { getColor } from '../../../../utils/colorHelper';
import { fBatchStatusText } from '../../../../utils/textHelper';
import { isInteger } from 'lodash';
import { fSeconds } from '../../../../utils/formatNumber';

export default function DashboardMachineTimeline() {
  const { selectedOee } = useSelector((state: RootState) => state.oeeDashboard);

  const { batchTimeline } = useSelector((state: RootState) => state.oeeBatch);

  const { oeeCode } = selectedOee || { oeeCode: '' };

  const [initOpt, setInitOpt] = useState<boolean>(false);

  const [lastUpdated, setLastUpated] = useState<Date>();

  const [series, setSeries] = useState<any>([]);

  const [options, setOptions] = useState<ApexOptions>({
    chart: {
      animations: {
        enabled: false,
      },
      zoom: {
        enabled: false,
      },
      toolbar: { show: false },
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
        datetimeUTC: false,
      },
    },
    yaxis: {
      show: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      x: {
        formatter(val: any, opts?: any): string {
          if (isInteger(val)) {
            return val;
          }
          return '';
        },
      },
      y: {
        title: {
          formatter(seriesName: string): string {
            return `<div style="color: ${getColor(seriesName)}">${fBatchStatusText(seriesName)} (HH:MM:SS)</div>`;
          },
        },
        formatter(val: any, opts?: any): string {
          if (isInteger(val)) {
            return dayjs(new Date(val)).format('HH:mm:ss');
          }

          if (opts?.start && opts?.end) {
            const start = dayjs(new Date(opts.start));
            const end = dayjs(new Date(opts.end));
            const diff = end.diff(start, 's');
            return `<div>Total: ${fSeconds(diff)}</div>`;
          }

          return '';
        },
      },
    },
  });

  useEffect(() => {
    if (!initOpt && batchTimeline.length > 0) {
      setOptions({
        ...options,
        xaxis: {
          ...options.xaxis,
          min: new Date(batchTimeline[0].fromDate).getTime(),
        },
      });
      setInitOpt(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchTimeline]);

  useEffect(() => {
    if (lastUpdated && dayjs().diff(lastUpdated, 's') <= 10) {
      return;
    }

    setLastUpated(new Date());
    setSeries(
      batchTimeline.map((item) => {
        return {
          name: item.status,
          data: [
            {
              fillColor: getColor(item.status),
              x: oeeCode,
              y: [new Date(item.fromDate).getTime(), new Date(item.toDate).getTime()],
            },
          ],
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchTimeline]);

  return <ReactApexChart options={options} series={series} type="rangeBar" height={110} />;
}
