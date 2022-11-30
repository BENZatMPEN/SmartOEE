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

export default function AnalyticChartOEE({ criteria }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [series, setSeries] = useState<any>([]);

  const [options, setOptions] = useState<ApexOptions>({
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

      setOptions({
        ...options,
        labels: sumRows.map((item: any) => item.key),
        title: {
          text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
          align: 'center',
        },
      });

      setSeries([
        {
          name: 'OEE',
          type: 'column',
          data: sumRows.map((item: any) => item.oeePercent),
        },
        {
          name: 'A',
          type: 'line',
          data: sumRows.map((item: any) => item.aPercent),
        },
        {
          name: 'P',
          type: 'line',
          data: sumRows.map((item: any) => item.pPercent),
        },
        {
          name: 'Q',
          type: 'line',
          data: sumRows.map((item: any) => item.qPercent),
        },
      ]);

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

  return (
    <>
      <ReactApexChart key={`oee${new Date().getTime()}`} options={options} series={series} type="line" height={600} />
    </>
  );
}
