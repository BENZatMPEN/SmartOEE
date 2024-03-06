export type ReportViewType = 'grouped' | 'show all';

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
  viewType: ReportViewType;
  date: Date;
  fromDate: Date;
  toDate: Date;
};

export type ReportDuration = 'hourly' | 'daily' | 'monthly';
