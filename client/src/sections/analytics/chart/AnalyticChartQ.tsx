import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import axios from '../../../utils/axios';
import { fPercent } from '../../../utils/formatNumber';
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

  const getCriteria = async () => {
    setIsLoading(true);

    try {
      const response = await axios.get<any>(`/analytics/oee`, {
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

      // const sumRows = getColumns().map((item) => ({
      //   key: item.name,
      //   oeePercent: faker.datatype.number({ min: 20, max: 100 }),
      //   qPercent: faker.datatype.number({ min: 50, max: 100 }),
      //   pPercent: faker.datatype.number({ min: 50, max: 100 }),
      //   qPercent: faker.datatype.number({ min: 50, max: 100 }),
      // }));

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
      } else {
        if (criteria.chartSubType === 'pareto') {
          sumRows.sort((a: any, b: any) => {
            if (a.oeePercent > b.oeePercent) {
              return -1;
            }
            if (a.oeePercent < b.oeePercent) {
              return 1;
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

        if (criteria.chartSubType === 'pareto') {
          currentSeries.push({
            name: 'Q',
            type: 'line',
            data: sumRows.map((item: any) => item.qPercent),
          });
        }

        setSeries(currentSeries);
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
        return (
          <ReactApexChart
            key={`aBar${new Date().getTime()}`}
            options={barOptions}
            series={series}
            type="bar"
            height={600}
          />
        );

      case 'pareto':
        return (
          <ReactApexChart
            key={`aPareto${new Date().getTime()}`}
            options={barOptions}
            series={series}
            type="line"
            height={600}
          />
        );

      case 'line':
        return (
          <ReactApexChart
            key={`aLine${new Date().getTime()}`}
            options={lineOptions}
            series={series}
            type="line"
            height={600}
          />
        );

      default:
        return <></>;
    }
  };

  return getChart();
}
