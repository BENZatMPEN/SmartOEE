import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { OeeTimeline } from '../../../../@types/oeeBatch';
import { RootState, useSelector } from '../../../../redux/store';
import { getColor } from '../../../../utils/colorHelper';
import { fBatchStatusText } from '../../../../utils/textHelper';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

type TimelineHour = {
  hour: string;
  items: OeeTimeline[];
};

export default function DashboardTimelineOee() {
  const { batchTimeline } = useSelector((state: RootState) => state.oeeBatch);

  const [series, setSeries] = useState<any[]>([]);

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
        formatter(val: number, opts?: any): string {
          return dayjs(new Date(val)).format('mm:ss');
        },
      },
      y: {
        title: {
          formatter(seriesName: string): string {
            return fBatchStatusText(seriesName);
          },
        },
      },
    },
  };

  useEffect(() => {
    if (batchTimeline.length === 0) {
      setSeries([]);
      return;
    }

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
        hour: currentDate.format('D-HH'),
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

  return <ReactApexChart options={options} series={series} type="rangeBar" height={chartHeight} />;
}
