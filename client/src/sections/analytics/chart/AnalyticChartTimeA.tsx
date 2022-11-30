import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import axios from '../../../utils/axios';
import { fPercent } from '../../../utils/formatNumber';
import { analyticChartTitle } from '../../../utils/formatText';

interface Props {
  criteria: AnalyticCriteria;
}

export default function AnalyticChartTimeA({ criteria }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [series, setSeries] = useState<any>([]);

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

        setSeries([
          {
            name: 'A',
            data: sumRows.map((item: any) => item.aPercent),
          },
        ]);
      } else if (criteria.chartSubType === 'bar') {
        // if (criteria.chartSubType === 'pareto') {
        //   sumRows.sort((a: any, b: any) => {
        //     if (a.oeePercent > b.oeePercent) {
        //       return -1;
        //     }
        //     if (a.oeePercent < b.oeePercent) {
        //       return 1;
        //     }
        //     return 0;
        //   });
        // }

        setBarOptions({
          ...barOptions,
          labels: sumRows.map((item: any) => new Date(item.key).getTime()),
          title: {
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        // const currentSeries = ;
        //
        // if (criteria.chartSubType === 'pareto') {
        //   currentSeries.push({
        //     name: 'A',
        //     type: 'line',
        //     data: sumRows.map((item: any) => item.aPercent),
        //   });
        // }

        setSeries([
          {
            name: 'A',
            type: 'column',
            data: sumRows.map((item: any) => item.aPercent),
          },
        ]);
      } else if (criteria.chartSubType === 'pie') {
        // setPieOptions(
        //   sumRows.map((item: any) => {
        //     return {
        //       chart: {
        //         width: 380,
        //         type: 'pie',
        //       },
        //       labels: sumRows.map((item: any) => new Date(item.key).getTime()),
        //       title: {
        //         text: item.key,
        //       },
        //     } as ApexOptions;
        //   }),
        // );
        //
        // setPieSeries(
        //   sumRows.map((item) => [
        //     item.status.running,
        //     item.status.planned,
        //     item.status.breakdown,
        //     item.status.mcSetup,
        //     item.status.standby,
        //   ]),
        // );
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

      // case 'pareto':
      //   return (
      //     <ReactApexChart
      //       key={`aPareto${new Date().getTime()}`}
      //       options={barOptions}
      //       series={series}
      //       type="line"
      //       height={600}
      //     />
      //   );

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

      case 'pie':
        return (
          <>
            {/*{pieSeries.map((series: any, idx: number) => (*/}
            {/*  <ReactApexChart key={idx} options={pieOptions[idx]} series={series} type="pie" width={380} />*/}
            {/*))}*/}
          </>
        );

      default:
        return <></>;
    }
  };

  return getChart();
}
