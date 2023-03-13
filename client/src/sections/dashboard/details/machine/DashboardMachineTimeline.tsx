import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { RootState, useSelector } from '../../../../redux/store';
import { getColor } from '../../../../utils/colorHelper';
import { fBatchStatusText } from '../../../../utils/textHelper';

export default function DashboardMachineTimeline() {
  const { selectedOee } = useSelector((state: RootState) => state.oeeDashboard);

  const { batchTimeline } = useSelector((state: RootState) => state.oeeBatch);

  const { oeeCode } = selectedOee || { oeeCode: '' };

  const [initOpt, setInitOpt] = useState<boolean>(false);

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
        formatter(val: number, opts?: any): string {
          return dayjs(new Date(val)).format('HH:mm:ss');
        },
      },
      y: {
        title: {
          formatter(seriesName: string): string {
            return fBatchStatusText(seriesName);
          },
        },
        formatter(val: any, opts?: any): string {
          if (/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/.test(val)) {
            return val;
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
