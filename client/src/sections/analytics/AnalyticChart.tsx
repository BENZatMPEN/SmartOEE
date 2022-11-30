import { AnalyticCriteria } from '../../@types/analytic';
import AnalyticChartA from './chart/AnalyticChartA';
import AnalyticChartMCState from './chart/AnalyticChartMCState';
import AnalyticChartOEE from './chart/AnalyticChartOEE';
import AnalyticChartP from './chart/AnalyticChartP';
import AnalyticChartQ from './chart/AnalyticChartQ';
import AnalyticChartTimeA from './chart/AnalyticChartTimeA';
import AnalyticChartTimeMCState from './chart/AnalyticChartTimeMCState';
import AnalyticChartTimeOEE from './chart/AnalyticChartTimeOEE';
import AnalyticChartTimeP from './chart/AnalyticChartTimeP';
import AnalyticChartTimeQ from './chart/AnalyticChartTimeQ';

interface Props {
  criteria: AnalyticCriteria;
}

export default function AnalyticChart({ criteria }: Props) {
  const getChart = (criteria: AnalyticCriteria) => {
    if (criteria.viewType === 'object') {
      switch (criteria.chartType) {
        case 'oee':
          return <AnalyticChartOEE criteria={criteria} />;

        case 'mc':
          return <AnalyticChartMCState criteria={criteria} />;

        case 'a':
          return <AnalyticChartA criteria={criteria} />;

        case 'p':
          return <AnalyticChartP criteria={criteria} />;

        case 'q':
          return <AnalyticChartQ criteria={criteria} />;
      }
    } else if (criteria.viewType === 'time') {
      switch (criteria.chartType) {
        case 'oee':
          return <AnalyticChartTimeOEE criteria={criteria} />;

        case 'mc':
          return <AnalyticChartTimeMCState criteria={criteria} />;

        case 'a':
          return <AnalyticChartTimeA criteria={criteria} />;

        case 'p':
          return <AnalyticChartTimeP criteria={criteria} />;

        case 'q':
          return <AnalyticChartTimeQ criteria={criteria} />;
      }
    } else {
      return <></>;
    }
  };

  return getChart(criteria);
}
