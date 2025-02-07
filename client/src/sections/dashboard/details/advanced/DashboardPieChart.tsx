import { useTheme } from '@mui/material/styles';
import merge from 'lodash/merge';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { BaseOptionChart } from '../../../../components/chart';
import { OEE_TYPE_OEE } from '../../../../constants';
import { fNumber, fNumber1 } from '../../../../utils/formatNumber';

type Props = {
  high: number;
  medium: number;
  low: number;
  percent: number;
  oeeType: string;
};

export default function DashboardPieChart({ high, medium, low, oeeType, percent }: Props) {
  const theme = useTheme();

  const [series, setSeries] = useState<any>([0]);

  const highColors = [
    [
      {
        offset: 0,
        color: theme.palette.success.light,
      },
      {
        offset: 100,
        color: theme.palette.success.main,
      },
    ],
  ];

  const mediumColors = [
    [
      {
        offset: 0,
        color: theme.palette.warning.light,
      },
      {
        offset: 100,
        color: theme.palette.warning.main,
      },
    ],
  ];

  const lowColors = [
    [
      {
        offset: 0,
        color: theme.palette.error.light,
      },
      {
        offset: 100,
        color: theme.palette.error.main,
      },
    ],
  ];

  const [options, setOptions] = useState<any>(
    merge(BaseOptionChart(), {
      legend: { show: false },
      grid: {
        padding: { top: -32, bottom: -32 },
      },
      fill: {
        type: 'gradient',
        gradient: {
          colorStops: highColors,
        },
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: { offsetY: -12 },
            value: {
              offsetY: 8,
              formatter: (val: any) => fNumber(Number(val)),
            },
            total: {
              label: 'OEE',
              fontSize: '22px',
              color: '#282828',
              fontWeight: 'bolder',
            },
          },
        },
      },
    }),
  );
  console.log(options);
  
  useEffect(() => {
    setSeries([fNumber1('59')]);

    let colors = highColors;
    if (percent <= medium && percent > low) {
      colors = mediumColors;
    } else if (percent <= low) {
      colors = lowColors;
    }

    setOptions({
      ...options,
      fill: {
        ...options.fill,
        gradient: {
          colorStops: colors,
        },
      },
      plotOptions : {
        ...options.plotOptions,
        ...options.plotOptions.radialBar,
        dataLabels : {
            total: {
              label: oeeType
            }
        }

        
        
      }

    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, oeeType]);

  return <ReactApexChart type="radialBar" series={series} options={options} height={230} />;
}
