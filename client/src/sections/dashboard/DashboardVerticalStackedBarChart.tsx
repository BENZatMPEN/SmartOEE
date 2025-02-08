import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { OeeStatusLossAdvancedItem } from 'src/@types/oee';

type Props = {
  oeeStatusItem: OeeStatusLossAdvancedItem;
};
interface ChartOptions {
  chart: {
    type: string;
    stacked: boolean;
  };
  plotOptions: {
    bar: {
      horizontal: boolean;
      columnWidth : string;
      borderRadius : number
    };
  };
  xaxis: {
    decimalsInFloat : boolean;
    categories: string[];
  };
  yaxis: {
    show : boolean;
    title: {
      text: string;
    };
  };
  legend: {
    position: string;
  };
  fill: {
    opacity: number;
  };
  dataLabels: {
    enabled: boolean;
  };
  colors : string[]
}

const DashboardVerticalStackedBarChart = ({ oeeStatusItem }: Props) => {
 
  const timeSlots = oeeStatusItem.lossResult.map((loss) => {
    return loss.timeslot;
  });
 
  const chartOptions: ChartOptions = {
    chart: {
      type: 'bar',
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '95%',
        borderRadius: 4
      },
    },
    xaxis: {
      decimalsInFloat : true,
      categories: timeSlots,
    },
    yaxis: {
      show:false,
      title: {
        text: '',
      },
    },
    colors: ['#00d000','#3091da', '#fffa00', '#ff0000'],
    legend: {
      position: 'top',
    },
    fill: {
      opacity: 1,
    },
    dataLabels: {
      enabled: false,
    },
  };

  const chartSeries = [
    {
      name: 'OEE',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.oeePercent < 0 ? 0 : loss.oeePercent;
      }),
    },
    {
      name: 'ALoss',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.ALoss < 0 ? 0 : loss.ALoss;
      }),
    },
    {
      name: 'PLoss',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.PLoss < 0 ? 0 : loss.PLoss;
      }),
    },
    {
      name: 'QLoss',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.QLoss < 0 ? 0 : loss.QLoss;
      }),
    },
  ];

  return (
    <div style={{ overflowX: 'auto', width: '100%', maxWidth : 3500 }}>
      <ReactApexChart
        options={chartOptions as any} // ใช้ `as any` เพราะ ReactApexChart อาจไม่รู้จักชนิดข้อมูลที่กำหนด
        series={chartSeries}
        type="bar"
        height={300}
        width={3500}
      />
    </div>
  );
};

export default DashboardVerticalStackedBarChart;
