export type ReportViewType = 'object' | 'time';

export type ReportComparisonType = 'oee' | 'product' | 'batch';

export type ReportType = 'daily' | 'monthly' | 'yearly';

export type ReportChartType = 'oee' | 'mc' | 'a' | 'p' | 'q';

export type ReportCriteria = {
  title: string;
  comparisonType: ReportComparisonType;
  oees: number[];
  products: number[];
  batches: number[];
  reportType: ReportType;
  date: Date;
  fromDate: Date;
  toDate: Date;
};

export type ReportDuration = 'hourly' | 'daily' | 'monthly';
