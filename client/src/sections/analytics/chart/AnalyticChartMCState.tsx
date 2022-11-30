import { faker } from '@faker-js/faker';
import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { AnalyticCriteria } from '../../../@types/analytic';
import { OptionItem } from '../../../@types/option';
import { RootState, useSelector } from '../../../redux/store';

interface Props {
  criteria: AnalyticCriteria;
}

export default function AnalyticChartMCState({ criteria }: Props) {
  const { oeeOpts, productOpts, batchOpts } = useSelector((state: RootState) => state.analytic);

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

  const getColumns = (): OptionItem[] => {
    switch (criteria.comparisonType) {
      case 'oee':
        return oeeOpts.filter((item) => criteria.oees.indexOf(item.id) > -1);

      case 'product':
        return productOpts.filter((item) => criteria.products.indexOf(item.id) > -1);

      case 'batch':
        return batchOpts.filter((item) => criteria.batches.indexOf(item.id) > -1);

      default:
        return [];
    }
  };

  const getCriteria = async () => {
    setIsLoading(true);

    try {
      const sumRows: any[] = getColumns().map((item) => ({
        key: item.name,
        status: {
          running: faker.datatype.number({ min: 50, max: 70 }),
          planned: faker.datatype.number({ min: 15, max: 30 }),
          breakdown: faker.datatype.number({ min: 15, max: 30 }),
          mcSetup: faker.datatype.number({ min: 15, max: 30 }),
          standby: faker.datatype.number({ min: 15, max: 30 }),
        },
      }));

      // xaxis: {
      // ...barOptions.xaxis,
      //     title: {
      //     text: chartTitle(),
      //   },
      //   categories: batchStatsTime.map((item: any) => item.timestamp),
      // },

      if (criteria.chartSubType === 'bar') {
        setBarOptions({
          ...barOptions,
          xaxis: {
            ...barOptions.xaxis,
            categories: sumRows.map((row) => row.key),
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
              labels: ['Running', 'Planned', 'Breakdown', 'M/C Setup', 'Standby'],
              title: {
                text: item.key,
              },
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
