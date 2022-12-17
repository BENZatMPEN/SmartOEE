import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import axios from '../../../utils/axios';
import { fPercent } from '../../../utils/formatNumber';
import { analyticChartTitle } from '../../../utils/formatText';
import { fDate } from '../../../utils/formatTime';

interface Props {
  criteria: AnalyticCriteria;
}

export default function AnalyticChartTimeA({ criteria }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [barSeries, setBarSeries] = useState<any>([]);

  const [barOptions, setBarOptions] = useState<ApexOptions>({
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
    grid: {
      padding: {
        bottom: 30,
      },
    },
    stroke: {
      width: [0, 4],
      curve: 'straight',
    },
    labels: [],
    xaxis: {
      type: 'datetime',
      labels: { rotateAlways: true, datetimeUTC: false },
      tooltip: {
        formatter(value: string, opts?: object): string {
          return dayjs(new Date(value)).format('HH:mm:ss');
        },
      },
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
    tooltip: {
      x: {
        formatter(val: number, opts?: any): string {
          return dayjs(new Date(val)).format('DD/MM/YYYY HH:mm');
        },
      },
    },
  } as ApexOptions);

  const [lineOptions, setLineOptions] = useState<ApexOptions>({
    chart: {
      type: 'line',
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
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
    },
    xaxis: {
      type: 'datetime',
      categories: [],
      labels: {
        datetimeUTC: false,
      },
      tooltip: {
        formatter(value: string, opts?: object): string {
          return dayjs(new Date(value)).format('HH:mm:ss');
        },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter(val: number, opts?: any): string | string[] {
          return fPercent(val);
        },
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

  const [pieSeries, setPieSeries] = useState<any[]>([]);

  const [pieOptions, setPieOptions] = useState<ApexOptions[]>([]);

  const [stackSeries, setStackSeries] = useState<any>([]);

  const [stackOptions, setStackOptions] = useState<ApexOptions>({
    chart: {
      stacked: true,
      stackType: '100%',
    },
    xaxis: {
      show: false,
      labels: { rotateAlways: true },
    },
  } as ApexOptions);

  const getCriteria = async () => {
    setIsLoading(true);

    try {
      const ids = [...criteria.oees, ...criteria.products, ...criteria.batches];
      const url =
        criteria.chartSubType === 'pie' || criteria.chartSubType === 'stack' ? '/analytics/aParam' : '/analytics/oee';

      const response = await axios.get<any>(url, {
        params: {
          ids,
          type: criteria.comparisonType,
          duration: criteria.duration,
          viewType: criteria.viewType,
          from: criteria.fromDate,
          to: criteria.toDate,
        },
      });

      const { data } = response;
      const { rows, sumRows } = data;

      if (criteria.chartSubType === 'line') {
        setLineOptions({
          ...lineOptions,
          xaxis: {
            ...lineOptions.xaxis,
            categories: sumRows.map((item: any) => new Date(item.key).getTime()),
          },
          title: {
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        setBarSeries([
          {
            name: 'A',
            data: sumRows.map((item: any) => item.aPercent),
          },
        ]);
      } else if (criteria.chartSubType === 'bar') {
        setBarOptions({
          ...barOptions,
          labels: sumRows.map((item: any) => new Date(item.key).getTime()),
          title: {
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        setBarSeries([
          {
            name: 'A',
            type: 'column',
            data: sumRows.map((item: any) => item.aPercent),
          },
        ]);
      } else if (criteria.chartSubType === 'pie') {
        setPieOptions(
          sumRows.map((row: any) => {
            return {
              labels: row.data.labels || [],
              title: {
                text: fDate(row.key),
              },
            } as ApexOptions;
          }),
        );

        setPieSeries(sumRows.map((row: any) => row.data.counts || []));
      } else if (criteria.chartSubType === 'stack') {
        setStackOptions({
          ...stackOptions,
          xaxis: {
            ...stackOptions.xaxis,
            categories: sumRows.map((row: any) => dayjs(row.key).format('DD/MM/YYYY HH:mm')),
          },
          title: {
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        const names = sumRows
          .map((row: any) => row.data.labels)
          .flat()
          .filter((val: string, idx: number, self: string) => self.indexOf(val) === idx);

        // data example
        // {name: 'A1', data: [time1[0], time2[0], time3[0]]}
        // {name: 'A2', data: [time1[1], time2[1], time3[1]]}
        // {name: 'A3', data: [time1[2], time2[2], time3[2]]}

        setStackSeries(
          names.map((val: string) => {
            return {
              name: val,
              data: sumRows.map((row: any) => {
                const itemIndex = row.data.labels.indexOf(val);
                return itemIndex >= 0 ? row.data.counts[itemIndex] : 0;
              }),
            };
          }),
        );
      }

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await getCriteria();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria]);

  const getChart = () => {
    switch (criteria.chartSubType) {
      case 'bar':
        return <ReactApexChart key={`aBar`} options={barOptions} series={barSeries} type="bar" height={600} />;

      case 'line':
        return <ReactApexChart key={`aLine`} options={lineOptions} series={barSeries} type="line" height={600} />;

      case 'stack':
        return <ReactApexChart key={`aStack`} options={stackOptions} series={stackSeries} type="bar" height={600} />;

      case 'pie':
        return (
          <>
            {pieSeries.map((series: any, idx: number) => (
              <ReactApexChart key={`aPie${idx}`} options={pieOptions[idx]} series={series} type="pie" width={500} />
            ))}
          </>
        );

      default:
        return <></>;
    }
  };

  return getChart();
}
