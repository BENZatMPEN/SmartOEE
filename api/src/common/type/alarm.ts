export class AlarmCondition {
  aParams: boolean;
  pParams: boolean;
  qParams: boolean;
  aLow: boolean;
  pLow: boolean;
  qLow: boolean;
  oeeLow: boolean;
  oees: number[];
}

export type AlarmEmailDataItem = {
  name: string;
  email: string;
};

export type AlarmLineData = {
  token: string;
};
