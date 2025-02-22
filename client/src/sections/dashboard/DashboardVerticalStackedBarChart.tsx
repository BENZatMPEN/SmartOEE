import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { OeeStatusLossAdvancedItem, OeeStatusLossResultAdvancedItem } from 'src/@types/oee';
import { RootState, useSelector } from 'src/redux/store';

type Props = {
  oeeStatusItem: OeeStatusLossAdvancedItem;
  // teepStatusItem? : OeeStatusLossResultAdvancedItem;
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
      borderRadius? : number;
    };
  };
  xaxis: {
    decimalsInFloat : number;
    categories: string[];
    stepSize : number;
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
  const { advancedType } = useSelector((state: RootState) => state.oeeAdvanced);
  const [ chartSeries, setChartSeries ] = useState([])
  const timeSlots = oeeStatusItem?.lossResult?.map((loss) => {
    return dayjs(loss.timeslot).format('DD/MM/YYYY HH:mm:ss');
  });

  const colorOEE = ['#00d000','#ff0000', '#fffa00','#642091' ]
  const colorTEEP = ['#00d000','#ff0000', '#fffa00','#642091', '#595959' ]
  const chartOptions: ChartOptions = {
    chart: {
      type: 'bar',
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: oeeStatusItem?.lossResult.length > 10 ? '75%' : '40%',
        borderRadius: 0,
        
      },
    },
    xaxis: {
      decimalsInFloat : 2,
      categories: timeSlots,
      stepSize : 0
      
    },
    yaxis: {
      show:false,
      title: {
        text: '',
      },
    },
    colors: advancedType === 'oee' ? colorOEE : colorTEEP,
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

  let chartSeriesTEEP =  [
    {
      name: 'OEE',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.oeePercent < 0 ? 0 : loss.oeePercent;
      }),
    },
    {
      name: 'A Loss',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.aLoss < 0 ? 0 : loss.aLoss;
      }),
    },
    {
      name: 'P Loss',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.pLoss < 0 ? 0 : loss.pLoss;
      }),
    },
    {
      name: 'Q Loss',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.qLoss < 0 ? 0 : loss.qLoss;
      }),
    },
    {
      name: 'L Loss',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.lLoss ? (loss?.lLoss < 0 ? 0 : loss?.lLoss) : 0;
      }),
    },
  ];

  const chartSeriesOEE = [
    {
      name: 'OEE',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.oeePercent < 0 ? 0 : loss.oeePercent;
      }),
    },
    {
      name: 'A Loss',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.aLoss < 0 ? 0 : loss.aLoss;
      }),
    },
    {
      name: 'P Loss',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.pLoss < 0 ? 0 : loss.pLoss;
      }),
    },
    {
      name: 'Q Loss',
      data: oeeStatusItem.lossResult.map((loss) => {
        return loss.qLoss < 0 ? 0 : loss.qLoss;
      }),
    },
  ];


  return (
    <div style={{ overflowX: 'auto', width: '100%', maxWidth : 'calc(100% + 80px)' }}>
      <ReactApexChart
        options={chartOptions as any} // ใช้ `as any` เพราะ ReactApexChart อาจไม่รู้จักชนิดข้อมูลที่กำหนด
        series={advancedType === 'oee' ? chartSeriesOEE : chartSeriesTEEP}
        type="bar"
        height={370}
        // width={3500}
      />
    </div>
  );
};

export default DashboardVerticalStackedBarChart;
