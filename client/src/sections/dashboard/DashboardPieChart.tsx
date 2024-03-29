import { useTheme } from '@mui/material/styles';
import merge from 'lodash/merge';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { BaseOptionChart } from '../../components/chart';
import { OEE_TYPE_OEE } from '../../constants';
import { fNumber, fNumber1 } from '../../utils/formatNumber';

type Props = {
  high: number;
  medium: number;
  low: number;
  percent: number;
  oeeType: string;
  size?: number;
};

export default function DashboardPieChart({ high, medium, low, oeeType, percent, size }: Props) {
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
            name: { offsetY: -16 },
            value: {
              offsetY: oeeType === OEE_TYPE_OEE ? 8 : -5,
              formatter: (val: any) => fNumber(Number(val)),
            },
            total: {
              label: oeeType === OEE_TYPE_OEE ? 'OEE' : '',
            },
          },
        },
      },
    }),
  );

  useEffect(() => {
    setSeries([fNumber1(percent)]);

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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent]);

  return <ReactApexChart type="radialBar" series={series} options={options} height={size ? size : 230} />;
}
