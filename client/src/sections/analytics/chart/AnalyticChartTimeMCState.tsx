import { faker } from '@faker-js/faker';
import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
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
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      show: false,
      labels: { rotateAlways: true },
    },
    plotOptions: {
      bar: {},
    },
  } as ApexOptions);

  const [pieSeries, setPieSeries] = useState<any[]>([]);

  const [pieOptions, setPieOptions] = useState<ApexOptions[]>([]);

  const getCriteria = async () => {
    setIsLoading(true);

    try {
      const columns = dayjs(criteria.toDate).diff(criteria.fromDate, criteria.duration === 'daily' ? 'd' : 'M');
      const sumRows: any[] = [...Array(columns)].map((item, idx) => ({
        key: dayjs(criteria.fromDate)
          .add(idx + 1, criteria.duration === 'daily' ? 'd' : 'M')
          .hour(12)
          .minute(30)
          .toDate(),
        status: {
          running: faker.datatype.number({ min: 50, max: 70 }),
          planned: faker.datatype.number({ min: 15, max: 30 }),
          breakdown: faker.datatype.number({ min: 15, max: 30 }),
          mcSetup: faker.datatype.number({ min: 15, max: 30 }),
          standby: faker.datatype.number({ min: 15, max: 30 }),
        },
      }));

      if (criteria.chartSubType === 'bar') {
        setBarOptions({
          ...barOptions,
          xaxis: {
            ...barOptions.xaxis,
            categories: sumRows.map((row) => dayjs(row.key).format('DD/MM/YYYY')),
          },
        });

        setBarSeries([
          { name: 'Running', data: sumRows.map((row) => row.status.running) },
          { name: 'Planned', data: sumRows.map((row) => row.status.planned) },
          { name: 'Breakdown', data: sumRows.map((row) => row.status.breakdown) },
          { name: 'M/C Setup', data: sumRows.map((row) => row.status.mcSetup) },
          { name: 'Standby', data: sumRows.map((row) => row.status.standby) },
        ]);
      } else if (criteria.chartSubType === 'pie') {
        setPieOptions(
          sumRows.map((item) => {
            return {
              chart: {
                width: 380,
                type: 'pie',
              },
              title: {
                text: fDate(item.key),
              },
              labels: ['Running', 'Planned', 'Breakdown', 'M/C Setup', 'Standby'],
            } as ApexOptions;
          }),
        );

        setPieSeries(
          sumRows.map((item) => [
            item.status.running,
            item.status.planned,
            item.status.breakdown,
            item.status.mcSetup,
            item.status.standby,
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

  return criteria.chartSubType === 'bar' ? (
    <ReactApexChart options={barOptions} series={barSeries} type="bar" height={500} />
  ) : (
    <>
      {pieSeries.map((series: any, idx: number) => (
        <ReactApexChart key={idx} options={pieOptions[idx]} series={series} type="pie" width={380} />
      ))}
    </>
  );
}
