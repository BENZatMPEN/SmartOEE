import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import axios from '../../../utils/axios';
import { fNumber, fNumber2, fPercent } from '../../../utils/formatNumber';
import { analyticChartTitle } from '../../../utils/formatText';

interface Props {
  criteria: AnalyticCriteria;
}

export default function AnalyticChartQ({ criteria }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [series, setSeries] = useState<any>([]);

  const [barOptions, setBarOptions] = useState<ApexOptions>({
    chart: {
      type: 'bar',
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
      show: false,
      labels: { rotateAlways: true },
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
    // plotOptions: {
    //   bar: {
    //     endingShape: 'rounded',
    //     borderRadius: 5,
    //   },
    // },
  } as ApexOptions);

  const [lineOptions, setLineOptions] = useState<ApexOptions>({
    chart: {
      type: 'line',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
    },
    xaxis: {
      // type: 'datetime',
      categories: [],
      // labels: {
      //   datetimeUTC: false,
      // },
      // tooltip: {
      //   formatter(value: string, opts?: object): string {
      //     return dayjs(new Date(value)).format('HH:mm:ss');
      //   },
      // },
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
    // tooltip: {
    //   x: {
    //     formatter(val: number, opts?: any): string {
    //       return dayjs(new Date(val)).format('DD/MM/YYYY HH:mm');
    //     },
    //   },
    // },
  } as ApexOptions);

  const [paretoOptions, setParetoOptions] = useState<ApexOptions>({
    stroke: {
      width: [0, 4],
      // curve: 'smooth',
    },
    grid: {
      padding: {
        bottom: 30,
      },
    },
    labels: [],
    xaxis: {
      show: false,
      labels: { rotateAlways: true },
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

  const getCriteria = async () => {
    setIsLoading(true);

    try {
      const ids = [...criteria.oees, ...criteria.products, ...criteria.batches];
      const url = criteria.chartSubType === 'pareto' ? '/analytics/qParam' : '/analytics/oee';

      const response = await axios.get<any>(url, {
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

      if (criteria.chartSubType === 'line') {
        setLineOptions({
          ...lineOptions,
          xaxis: {
            ...lineOptions.xaxis,
            categories: sumRows.map((item: any) => item.key),
          },
          title: {
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        setSeries([
          {
            name: 'Q',
            data: sumRows.map((item: any) => item.qPercent),
          },
        ]);
      } else if (criteria.chartSubType === 'bar' || criteria.chartSubType === 'bar_min_max') {
        if (criteria.chartSubType === 'bar_min_max') {
          sumRows.sort((a: any, b: any) => {
            if (a.qPercent > b.qPercent) {
              return 1;
            }
            if (a.qPercent < b.qPercent) {
              return -1;
            }
            return 0;
          });
        }

        setBarOptions({
          ...barOptions,
          labels: sumRows.map((item: any) => item.key),
          title: {
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        const currentSeries = [
          {
            name: 'Q',
            type: 'column',
            data: sumRows.map((item: any) => item.qPercent),
          },
        ];

        setSeries(currentSeries);
      } else if (criteria.chartSubType === 'pareto') {
        if (ids.length === 0) {
          return;
        }

        const { labels, counts, percents } = sumRows[ids[0]] || { labels: [], counts: [], percents: [] };
        setParetoOptions({
          ...paretoOptions,
          labels: labels,
          title: {
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        setSeries([
          {
            name: 'Count',
            type: 'column',
            data: counts.map((item: any) => item),
          },
          {
            name: '%',
            type: 'line',
            data: percents.map((item: any) => fNumber2(item)),
          },
        ]);
      }

      // console.log(data);
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
      case 'bar_min_max':
        return <ReactApexChart key={`qBar`} options={barOptions} series={series} type="bar" height={600} />;

      case 'line':
        return <ReactApexChart key={`qLine`} options={lineOptions} series={series} type="line" height={600} />;

      case 'pareto':
        return <ReactApexChart key={`qPareto}`} options={paretoOptions} series={series} type="line" height={600} />;

      default:
        return <></>;
    }
  };

  return getChart();
}
