export type PlannedDowntime = {
  id: number;
  name: string;
  type: string;
  timing: string;
  seconds: number;
  siteId: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface EditPlannedDowntime {
  name: string;
  type: string;
  timing: string;
  seconds: number;
}

export type FilterPlannedDowntime = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
  siteId?: number;
};

export type PlannedDowntimePagedList = {
  list: PlannedDowntime[];
  count: number;
};
