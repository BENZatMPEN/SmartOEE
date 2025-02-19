import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { RootState, useSelector } from 'src/redux/store';

interface ChartOptions {
  chart: {
    type: string;
    stacked: boolean;
    height: number;
    stackType: string;
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
    show: boolean;
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

const DashboardTimelineOeeStack = () => {
  const { batchTimeline } = useSelector((state: RootState) => state.oeeBatch);
 
  const chartOptions = {
    chart: {
      type: 'bar',
      height: 200,
      stacked: true,
      stackType: '100%',
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
      ],
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
    {
      name: 'Running',
      data: [
        44, 55, 41, 67, 22, 43, 21, 49, 55, 62, 45, 58, 44, 55, 41, 67, 22, 43, 21, 49, 55, 62, 45, 58, 44, 55, 41, 67,
        22, 43, 21, 49, 55, 62, 45, 62, 45, 58,
      ],
    },
    {
      name: 'Standby',
      data: [
        13, 23, 20, 8, 13, 27, 33, 12, 19, 25, 18, 22, 13, 23, 20, 8, 13, 27, 33, 12, 19, 25, 18, 22, 13, 23, 20, 8, 13,
        27, 33, 12, 19, 25, 18, 22, 18, 22,
      ],
    },
    {
      name: 'Break Down',
      data: [
        11, 17, 15, 15, 12, 13, 10, 19, 20, 21, 16, 14, 11, 17, 15, 15, 12, 13, 10, 19, 20, 21, 16, 14, 11, 17, 15, 15,
        12, 13, 10, 19, 20, 21, 20, 21, 16, 14,
      ],
    },
  ];

  useEffect(() =>{
    const startItem = batchTimeline[0];
    const endItem = batchTimeline[batchTimeline.length - 1];
    const startDate = dayjs(startItem.fromDate);
    const endDate = dayjs(endItem.toDate);
    const hours = endDate.add(1, 'h').startOf('h').diff(startDate.startOf('h'), 'h');
    // console.log('startItem =>' ,startItem);
    // console.log('endItem =>',endItem);
    // console.log('hours =>',hours);
    
  },[])

  return (
    <div style={{ overflowX: 'auto', width: '100%', maxWidth: 3500 }}>
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

export default DashboardTimelineOeeStack;
