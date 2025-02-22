import dayjs from 'dayjs';
import { isInteger } from 'lodash';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { RootState, useSelector } from 'src/redux/store';
import { getColor } from 'src/utils/colorHelper';
import { fSeconds } from 'src/utils/formatNumber';
import { fBatchStatusText } from 'src/utils/textHelper';

const DashboardTimelineOeeStack = () => {
  const { batchTimeline } = useSelector((state: RootState) => state.oeeBatch);
  const [categories, setCategories] = useState<string[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [timelineHours, setTimelineHours] = useState<string[]>([]); // ✅ เก็บค่า timelineHours

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 200,
      stacked: true,
      stackType: '100%',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: categories.length > 10 ? '75%' : '40%',
        borderRadius: 0,
      },
    },
    xaxis: {
      categories: categories,
    },
    colors: ['#00d000', '#fffa00', '#ff0000'],
    yaxis: {
      show: false,
      title: { text: '' },
    },
    tooltip: {
      y: {
        title: {
          formatter(seriesName: string): string {
            return `<div style="color: ${getColor(seriesName)}">${fBatchStatusText(seriesName)}</div>`;
          },
        },
        formatter(val: any, opts?: any): string {
          if (opts?.dataPointIndex !== undefined && opts?.seriesIndex !== undefined) {
            const status = series[opts.seriesIndex]?.name;
            const hourIndex = opts.dataPointIndex;

            if (status === 'planned' && timelineHours.length > hourIndex) {
              // ✅ ค้นหา planned item ที่ตรงกับช่วงเวลานั้น
              const plannedItem: any = batchTimeline.find((item) => {
                return item.status === 'planned';
                // &&
                // dayjs(item.fromDate).startOf("hour").format("YYYY-MM-DD HH:mm") === timelineHours[hourIndex]
              });

              if (plannedItem) {
                const reason = plannedItem.planedDownTime?.name || 'Planned Maintenance';
                return `
                  <div>
                    <b></b> ${reason} <br/>
                    <b>Time:</b> ${dayjs(plannedItem.fromDate).format('HH:mm:ss')} - ${dayjs(plannedItem.toDate).format(
                  'HH:mm:ss',
                )}
                  </div>
                `;
              }
            }

            // 🔥 แสดง Duration ปกติสำหรับสถานะอื่น
            return `<b>Duration:</b> ${fSeconds((val / 100) * 3600)}`;
          }

          return '';
        },
      },
    },
    legend: {
      position: 'top',
    },
    fill: {
      opacity: 1,
    },
    dataLabels: {
      enabled: false,
    },
  };

  useEffect(() => {
    if (!batchTimeline || batchTimeline.length === 0) {
      setSeries([]);
      setCategories([]);
      return;
    }

    const startDate = dayjs(batchTimeline[0].fromDate).startOf('hour');
    const endDate = dayjs(batchTimeline[batchTimeline.length - 1].toDate).endOf('hour');
    const totalHours = endDate.diff(startDate, 'hour') + 1;

    const hours: string[] = [];
    for (let i = 0; i < totalHours; i++) {
      hours.push(startDate.add(i, 'hour').format('YYYY-MM-DD HH:mm'));
    }
    setTimelineHours(hours); // ✅ บันทึก timelineHours
    setCategories(hours);

    const groupedData: { [status: string]: number[] } = {};

    hours.forEach((hour, index) => {
      const startHour = dayjs(hour, 'YYYY-MM-DD HH:mm');
      const endHour = startHour.add(1, 'hour');

      batchTimeline.forEach((item) => {
        const fromDate = dayjs(item.fromDate);
        const toDate = dayjs(item.toDate);

        const startEffective = fromDate.isBefore(startHour) ? startHour : fromDate;
        const endEffective = toDate.isAfter(endHour) ? endHour : toDate;

        if (startEffective.isBefore(endEffective)) {
          const duration = endEffective.diff(startEffective, 's');

          if (!groupedData[item.status]) {
            groupedData[item.status] = new Array(totalHours).fill(0);
          }
          groupedData[item.status][index] += duration;
        }
      });
    });

    hours.forEach((_, index) => {
      let totalTime = Object.values(groupedData)
        .map((arr) => arr[index] || 0)
        .reduce((a, b) => a + b, 0);

      if (totalTime > 0) {
        Object.keys(groupedData).forEach((status) => {
          groupedData[status][index] = (groupedData[status][index] / totalTime) * 100;
        });
      }
    });

    const statusOrder = ['running', 'standby', 'planned', 'breakdown', 'ended'];
    const sortedSeries = statusOrder
      .filter((status) => groupedData[status])
      .map((status) => ({
        name: status,
        data: groupedData[status],
        color: getColor(status),
      }));

    setSeries(sortedSeries);
  }, [batchTimeline]);

  return (
    <div style={{ overflowX: 'auto', width: '100%', maxWidth: 3500 }}>
      <ReactApexChart options={chartOptions as any} series={series} type="bar" height={370} />
    </div>
  );
};

export default DashboardTimelineOeeStack;
