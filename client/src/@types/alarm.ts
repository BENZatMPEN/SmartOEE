export type Alarm = {
  id: number;
  type: string;
  name: string;
  notify: boolean;
  data: any;
  condition: AlarmCondition;
  siteId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type FilterAlarm = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
  siteId?: number;
};

export type AlarmCondition = {
  aParams: boolean;
  pParams: boolean;
  qParams: boolean;
  aLow: boolean;
  pLow: boolean;
  qLow: boolean;
  oeeLow: boolean;
  oees: number[];
};

export const initAlarmCondition: AlarmCondition = {
  aParams: true,
  pParams: true,
  qParams: true,
  aLow: true,
  pLow: true,
  qLow: true,
  oeeLow: true,
  oees: [],
};

export type AlarmEmailDataItem = {
  name: string;
  email: string;
};

export type AlarmLineData = {
  token: string;
};
