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
import { AnalyticCriteria } from '../../@types/analytic';

interface Prop {
  criteria: AnalyticCriteria;
  group?: boolean;
}

export default function AnalyticChart({ criteria, group }: Prop) {
  return (
    <>
      {criteria.viewType === 'object' && criteria.chartType === 'oee' && (
        <AnalyticChartOEE criteria={criteria} group={group} />
      )}

      {criteria.viewType === 'object' && criteria.chartType === 'mc' && (
        <AnalyticChartMCState criteria={criteria} group={group} />
      )}

      {criteria.viewType === 'object' && criteria.chartType === 'a' && (
        <AnalyticChartA criteria={criteria} group={group} />
      )}

      {criteria.viewType === 'object' && criteria.chartType === 'p' && (
        <AnalyticChartP criteria={criteria} group={group} />
      )}

      {criteria.viewType === 'object' && criteria.chartType === 'q' && (
        <AnalyticChartQ criteria={criteria} group={group} />
      )}

      {criteria.viewType === 'time' && criteria.chartType === 'oee' && (
        <AnalyticChartTimeOEE criteria={criteria} group={group} />
      )}

      {criteria.viewType === 'time' && criteria.chartType === 'mc' && (
        <AnalyticChartTimeMCState criteria={criteria} group={group} />
      )}

      {criteria.viewType === 'time' && criteria.chartType === 'a' && (
        <AnalyticChartTimeA criteria={criteria} group={group} />
      )}

      {criteria.viewType === 'time' && criteria.chartType === 'p' && (
        <AnalyticChartTimeP criteria={criteria} group={group} />
      )}

      {criteria.viewType === 'time' && criteria.chartType === 'q' && (
        <AnalyticChartTimeQ criteria={criteria} group={group} />
      )}
    </>
  );
}
