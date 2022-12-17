import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import axios from '../../../utils/axios';
import { analyticChartTitle } from '../../../utils/formatText';
import { fDate } from '../../../utils/formatTime';

interface Props {
  criteria: AnalyticCriteria;
}

export default function AnalyticChartTimeMCState({ criteria }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [barSeries, setBarSeries] = useState<any>([]);

  const [barOptions, setBarOptions] = useState<ApexOptions>({
    chart: {
      stacked: true,
      stackType: '100%',
    },
    xaxis: {
      show: false,
      labels: { rotateAlways: true },
    },
  } as ApexOptions);

  const [pieSeries, setPieSeries] = useState<any[]>([]);

  const [pieOptions, setPieOptions] = useState<ApexOptions[]>([]);

  const getCriteria = async () => {
    setIsLoading(true);

    try {
      const response = await axios.get<any>(`/analytics/mc`, {
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

      if (criteria.chartSubType === 'stack') {
        setBarOptions({
          ...barOptions,
          xaxis: {
            ...barOptions.xaxis,
            categories: sumRows.map((row: any) => dayjs(row.key).format('DD/MM/YYYY HH:mm')),
          },
          title: {
            text: analyticChartTitle(criteria.title, criteria.fromDate, criteria.toDate),
            align: 'center',
          },
        });

        setBarSeries([
          { name: 'Running', data: sumRows.map((row: any) => ('running' in row.status ? row.status.running : 0)) },
          { name: 'Planned', data: sumRows.map((row: any) => ('planned' in row.status ? row.status.planned : 0)) },
          {
            name: 'Breakdown',
            data: sumRows.map((row: any) => ('breakdown' in row.status ? row.status.breakdown : 0)),
          },
          { name: 'M/C Setup', data: sumRows.map((row: any) => ('mc_setup' in row.status ? row.status.mc_setup : 0)) },
          { name: 'Standby', data: sumRows.map((row: any) => ('standby' in row.status ? row.status.standby : 0)) },
        ]);
      } else if (criteria.chartSubType === 'pie') {
        setPieOptions(
          sumRows.map((row: any) => {
            return {
              labels: ['Running', 'Planned', 'Breakdown', 'M/C Setup', 'Standby'],
              title: {
                text: fDate(row.key),
              },
            } as ApexOptions;
          }),
        );

        setPieSeries(
          sumRows.map((row: any) => [
            'running' in row.status ? row.status.running : 0,
            'planned' in row.status ? row.status.planned : 0,
            'breakdown' in row.status ? row.status.breakdown : 0,
            'mc_setup' in row.status ? row.status.mc_setup : 0,
            'standby' in row.status ? row.status.standby : 0,
          ]),
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

  return criteria.chartSubType === 'stack' ? (
    <ReactApexChart key={`mcStack`} options={barOptions} series={barSeries} type="bar" height={600} />
  ) : (
    <>
      {pieSeries.map((series: any, idx: number) => (
        <ReactApexChart key={`mcPie${idx}`} options={pieOptions[idx]} series={series} type="pie" width={500} />
      ))}
    </>
  );
}
