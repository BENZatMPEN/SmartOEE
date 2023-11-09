import { User } from './user';

export type HistoryLog = {
  id: number;
  type: string;
  data: any;
  message: string;
  siteId: number;
  userId: number;
  user: User;
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
