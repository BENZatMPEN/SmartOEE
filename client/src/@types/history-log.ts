export type HistoryLog = {
  id: number;
  type: string;
  data: any;
  message: string;
  siteId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type FilterHistoryLog = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
  type: string;
  fromDate: Date;
  toDate: Date;
};

export type AlarmHistory = {
  // oee
  oeeId: number;
  oeeCode: string;
  oeeType: string;
  oeeLocation: string;
  productionName: string;
  // batch
  oeeBatchId: number;
  lotNumber: string;
  productName: string;
};

export type UserHistory = {
  userName: string;
  firstName: string;
  lastName: string;
};
