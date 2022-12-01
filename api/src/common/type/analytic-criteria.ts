export class AnalyticCriteria {
  viewType: 'oee' | 'time';
  fromDate: Date;
  toDate: Date;
  oees: number[];
  products: number[];
  batches: number[];
}
