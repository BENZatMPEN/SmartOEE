import React from 'react';
import ReactApexChart from 'react-apexcharts';

// กำหนดชนิดข้อมูลสำหรับ options และ series
interface ChartOptions {
  chart: {
    type: string;
    stacked: boolean;
  };
  plotOptions: {
    bar: {
      horizontal: boolean;
    };
  };
  xaxis: {
    categories: string[];
  };
  yaxis: {
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
}

const DashboardVerticalStackedBarChart: React.FC = () => {
  const chartOptions: ChartOptions = {
    chart: {
      type: 'bar',
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    xaxis: {
      categories: [ 
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',],
    },
    yaxis: {
      title: {
        text: '',
        
      },
    },
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
    { name: 'Product A', data: [44, 55, 41, 67, 22, 43, 21, 49, 55, 62, 45, 58] },
    { name: 'Product B', data: [13, 23, 20, 8, 13, 27, 33, 12, 19, 25, 18, 22] },
    { name: 'Product C', data: [11, 17, 15, 15, 12, 13, 10, 19, 20, 21, 16, 14] },
    { name: 'Product D', data: [21, 14, 25, 18, 32, 25, 24, 29, 30, 28, 23, 25] },
    { name: 'Product E', data: [31, 22, 33, 19, 43, 35, 34, 21, 29, 36, 40, 38] },
    { name: 'Product F', data: [23, 31, 17, 25, 18, 15, 20, 14, 22, 26, 19, 21] },
    { name: 'Product G', data: [15, 19, 24, 11, 10, 9, 13, 20, 17, 15, 18, 16] },
    { name: 'Product H', data: [20, 15, 21, 17, 25, 20, 22, 30, 27, 29, 28, 31] },
    { name: 'Product I', data: [27, 32, 29, 24, 35, 31, 28, 22, 26, 34, 30, 33] },
    { name: 'Product J', data: [34, 40, 35, 29, 43, 38, 36, 31, 40, 44, 39, 42] },
  ];

  return (
    <div>
      <ReactApexChart
        options={chartOptions as any} // ใช้ `as any` เพราะ ReactApexChart อาจไม่รู้จักชนิดข้อมูลที่กำหนด
        series={chartSeries}
        type="bar"
        height={600}
      />
    </div>
  );
};

export default DashboardVerticalStackedBarChart;
