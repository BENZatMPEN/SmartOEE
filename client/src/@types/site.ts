import { PercentSetting } from './percentSetting';

export type Site = {
  id: number;
  name: string;
  branch: string;
  address: string;
  remark: string;
  imageUrl: string;
  lat: number;
  lng: number;
  createdAt: Date;
  updatedAt: Date;
  sync: boolean;
  active: boolean;
  defaultPercentSettings: PercentSetting[];
  cutoffTime: Date;
};

export type FilterSite = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
};
