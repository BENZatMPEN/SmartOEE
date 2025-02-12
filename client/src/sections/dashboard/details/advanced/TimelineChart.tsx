import React from 'react';
import ReactApexChart from 'react-apexcharts';


interface ChartOptions {
  chart: {
    type: string;
    stacked: boolean;
    height : number;
    stackType : string;
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
}

const TimelineChart: React.FC = () => {
  const chartOptions = {
    chart: {
      type: 'bar',
      height: 200,
      stacked: true,
      stackType: '100%'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '95%',
      },
    },
    xaxis: {
      categories: [ 
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
        '24',
      '25',
        '26',
        '27',
        '28',
        '29',
        '30',
        '31',
        '32',
        '33',
        '34',
        '35',
        '36',
      '37',
        '38',
        '39',
        '40',
        '41',
        '42',
        '43',
        '44',
        '45',
        '46',
        '47',
        '48',],
       
    },
    colors: ['#00d000', '#fffa00', '#ff0000'],
    yaxis: {
      show: false,
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
    { name: 'Running', data:    [44, 55, 41, 67, 22, 43, 21, 49, 55, 62, 45, 58,44, 55, 41, 67, 22, 43, 21, 49, 55, 62, 45, 58,44, 55, 41, 67, 22, 43, 21, 49, 55, 62, 45, 58,44, 55, 41, 67, 22, 43, 21, 49, 55, 62, 45, 58] },
    { name: 'Standby', data:    [13, 23, 20, 8, 13, 27, 33, 12, 19, 25, 18, 22 ,13, 23, 20, 8, 13, 27, 33, 12, 19, 25, 18, 22,13, 23, 20, 8, 13, 27, 33, 12, 19, 25, 18, 22 ,13, 23, 20, 8, 13, 27, 33, 12, 19, 25, 18, 22 ] },
   
    { name: 'Break Down', data: [11, 17, 15, 15, 12, 13, 10, 19, 20, 21, 16, 14,11, 17, 15, 15, 12, 13, 10, 19, 20, 21, 16, 14,11, 17, 15, 15, 12, 13, 10, 19, 20, 21, 16, 14,11, 17, 15, 15, 12, 13, 10, 19, 20, 21, 16, 14] },
    // { name: 'Product D', data: [21, 14, 25, 18, 32, 25, 24, 29, 30, 28, 23, 25,21, 14, 25, 18, 32, 25, 24, 29, 30, 28, 23, 25] },
    // { name: 'Product E', data: [31, 22, 33, 19, 43, 35, 34, 21, 29, 36, 40, 38,31, 22, 33, 19, 43, 35, 34, 21, 29, 36, 40, 38] },
    // { name: 'Product F', data: [23, 31, 17, 25, 18, 15, 20, 14, 22, 26, 19, 21,23, 31, 17, 25, 18, 15, 20, 14, 22, 26, 19, 21] },
    // { name: 'Product G', data: [15, 19, 24, 11, 10, 9, 13, 20, 17, 15, 18, 16 ,15, 19, 24, 11, 10, 9, 13, 20, 17, 15, 18, 16 ] },
    // { name: 'Product H', data: [20, 15, 21, 17, 25, 20, 22, 30, 27, 29, 28, 31,20, 15, 21, 17, 25, 20, 22, 30, 27, 29, 28, 31] },
    // { name: 'Product I', data: [27, 32, 29, 24, 35, 31, 28, 22, 26, 34, 30, 33,27, 32, 29, 24, 35, 31, 28, 22, 26, 34, 30, 33] },
    // { name: 'Product J', data: [34, 40, 35, 29, 43, 38, 36, 31, 40, 44, 39, 42,34, 40, 35, 29, 43, 38, 36, 31, 40, 44, 39, 42] },
  ];

  return (
    <div style={{ overflowX: 'auto', width: '100%', maxWidth : 3500 }}>
      <ReactApexChart
        options={chartOptions as any} // ใช้ `as any` เพราะ ReactApexChart อาจไม่รู้จักชนิดข้อมูลที่กำหนด
        series={chartSeries}
        type="bar"
        height={250}
        width={3500}
      />
    </div>
  );
};

export default TimelineChart;
