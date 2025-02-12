export type Analytic = {
  id: number;
  name: string;
  data: any;
  group: boolean;
  siteId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AnalyticCriteria = {
  title: string;
  viewType: AnalyticViewType;
  comparisonType: AnalyticComparisonType;
  chartType: AnalyticChartType;
  chartSubType: string;
  duration: AnalyticDuration;
  fromDate: Date;
  toDate: Date;
  oees: number[];
  products: number[];
  batches: number[];
  operators: number[];
};

export type AnalyticGroupCriteriaItem = {
  criteriaId: number;
  gridData?: any;
  fromDate: Date;
  toDate: Date;
};

export type AnalyticGroupCriteria = {
  title: string;
  list: AnalyticGroupCriteriaItem[];
};

export type AnalyticGroupCriteriaDetailItem = AnalyticCriteria & AnalyticGroupCriteriaItem;

export type AnalyticViewType = 'object' | 'time';

export type AnalyticComparisonType = 'oee' | 'product' | 'batch' | 'operator';

export type AnalyticChartType = 'oee' | 'mc' | 'a' | 'p' | 'q' | 'pd' | 'l';

export type AnalyticDuration = 'hourly' | 'daily' | 'monthly';
