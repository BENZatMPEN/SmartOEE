import { Widget } from './widget';

export type Machine = {
  id: number;
  code: string;
  name: string;
  location: string;
  remark: string;
  imageName: string;
  createdAt: Date;
  updatedAt: Date;
  parameters: MachineParameter[];
  widgets: Widget[];
  siteId: number;
};

export type MachineParameter = {
  id: number;
  name: string;
  oeeType: string;
  deviceId: number | null;
  tagId: number | null;
};

export type EditMachine = {
  code: string;
  name: string;
  location: string;
  remark: string;
  image: File | null;
  parameters: MachineParameter[];
  widgets: Widget[];
  siteId?: number;
};

export type FilterMachine = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
  siteId?: number;
};
