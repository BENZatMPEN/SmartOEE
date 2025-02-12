import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { OeeTimeline } from '../../../../@types/oeeBatch';
import { RootState, useSelector } from '../../../../redux/store';
import { getColor } from '../../../../utils/colorHelper';
import { fBatchStatusText } from '../../../../utils/textHelper';
import isBetween from 'dayjs/plugin/isBetween';
import { isInteger } from 'lodash';
import { fSeconds } from '../../../../utils/formatNumber';

dayjs.extend(isBetween);

type TimelineHour = {
  hour: string;
  items: OeeTimeline[];
};

type Props = {
  handleClick: () => void;
}

export default function DashboardTimelineOee({handleClick} : Props) {
  const { batchTimeline } = useSelector((state: RootState) => state.oeeBatch);

  const [series, setSeries] = useState<any[]>([]);

  const [lastUpdated, setLastUpated] = useState<Date>();

  const [chartHeight, setChartHeight] = useState<number>(80);

  const options: ApexOptions = {
    chart: {
      animations: {
        enabled: false,
      },
      zoom: {
        enabled: false,
      },
      toolbar: { show: false },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const seriesIndex = config.seriesIndex;
          const dataPointIndex = config.dataPointIndex;
          handleClick?.()
 
        },
      },
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
  };

  useEffect(() => {
    if (batchTimeline.length === 0) {
      setSeries([]);
      return;
    }

    if (lastUpdated && dayjs().diff(lastUpdated, 's') <= 10) {
      return;
    }

    setLastUpated(new Date());

    const startItem = batchTimeline[0];
    const endItem = batchTimeline[batchTimeline.length - 1];
    const startDate = dayjs(startItem.fromDate);
    const endDate = dayjs(endItem.toDate);
    const hours = endDate.add(1, 'h').startOf('h').diff(startDate.startOf('h'), 'h');

    setChartHeight(hours === 1 ? 110 : hours * 60 + 30);

    const timelineHours: TimelineHour[] = [];
    for (let i = 0; i < hours; i++) {
      const currentDate = startDate.add(i, 'h').startOf('h');
      const startLot = dayjs(currentDate);
      const endLot = dayjs(currentDate).endOf('h');

      timelineHours.push({
        hour: currentDate.format('DD/MM/YYYY HH:mm:ss'),
        items: batchTimeline
          .filter(
            (item) =>
              (dayjs(item.fromDate).isBetween(startLot, endLot) || dayjs(item.fromDate).isBefore(startLot)) &&
              (dayjs(item.toDate).isBetween(startLot, endLot) || dayjs(item.toDate).isAfter(endLot)),
          )
          .map((item) => {
            const fromDate = dayjs(item.fromDate);
            const toDate = dayjs(item.toDate);
            const from = fromDate.isBefore(startLot) ? startLot : fromDate;
            const to = toDate.isAfter(endLot) ? endLot : toDate;

            return {
              status: item.status,
              fromDate: from.year(2000).month(1).date(1).hour(0).toDate(),
              toDate: to.year(2000).month(1).date(1).hour(0).toDate(),
              currentDate: currentDate.toDate(),
            };
          }),
      });
    }

    const tempSeries: any = [];
    for (const timelineHour of timelineHours) {
      tempSeries.push(
        timelineHour.items.map((item) => ({
          name: item.status,
          data: [
            {
              fillColor: getColor(item.status),
              x: timelineHour.hour,
              y: [item.fromDate.getTime(), item.toDate.getTime()],
            },
          ],
        })),
      );
    }

    setSeries(tempSeries.flat());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchTimeline]);

  return (
    <div
      style={{
        cursor: 'pointer',
      }}
    >
      <ReactApexChart options={options} series={series} type="rangeBar" height={chartHeight} />
    </div>
  );
}
