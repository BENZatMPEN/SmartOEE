import { PercentSetting } from './percentSetting';

export type Site = {
  id: number;
  name: string;
  branch: string;
  address: string;
  remark: string;
  imageName: string;
  lat: number;
  lng: number;
  createdAt: Date;
  updatedAt: Date;
  sync: boolean;
  active: boolean;
  defaultPercentSettings: PercentSetting[];
  cutoffTime: Date;
  oeeLimit: number;
  userLimit: number;
};

export type EditSite = {
  name: string;
  branch: string;
  address: string;
  remark: string;
  lat: number;
  lng: number;
  sync: boolean;
  active?: boolean;
  defaultPercentSettings: PercentSetting[];
  cutoffTime: Date | null;
  image: File | null;
  oeeLimit?: number;
  userLimit?: number;
};

export type FilterSite = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
};

export type SitePagedList = {
  list: Site[];
  count: number;
};
