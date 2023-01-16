export type Dashboard = {
  id: number;
  title: string;
  link: string;
  createdAt: Date;
  updatedAt: Date;
  siteId: number;
};

export interface EditDashboard {
  title: string;
  link: string;
  siteId?: number;
}

export type FilterDashboard = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
};

export type DashboardPagedList = {
  list: Dashboard[];
  count: number;
};
