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
import { RootState, useSelector } from '../../redux/store';

interface Prop {
  group?: boolean;
}

export default function AnalyticChart({ group }: Prop) {
  const { currentCriteria: criteria } = useSelector((state: RootState) => state.analytic);

  return (
    <>
      {criteria && (
        <>
          {criteria.viewType === 'object' && criteria.chartType === 'oee' && <AnalyticChartOEE group={group} />}

          {criteria.viewType === 'object' && criteria.chartType === 'mc' && <AnalyticChartMCState group={group} />}

          {criteria.viewType === 'object' && criteria.chartType === 'a' && <AnalyticChartA group={group} />}

          {criteria.viewType === 'object' && criteria.chartType === 'p' && <AnalyticChartP group={group} />}

          {criteria.viewType === 'object' && criteria.chartType === 'q' && <AnalyticChartQ group={group} />}

          {criteria.viewType === 'time' && criteria.chartType === 'oee' && <AnalyticChartTimeOEE group={group} />}

          {criteria.viewType === 'time' && criteria.chartType === 'mc' && <AnalyticChartTimeMCState group={group} />}

          {criteria.viewType === 'time' && criteria.chartType === 'a' && <AnalyticChartTimeA group={group} />}

          {criteria.viewType === 'time' && criteria.chartType === 'p' && <AnalyticChartTimeP group={group} />}

          {criteria.viewType === 'time' && criteria.chartType === 'q' && <AnalyticChartTimeQ group={group} />}
        </>
      )}
    </>
  );
}
