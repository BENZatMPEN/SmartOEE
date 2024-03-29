export type Role = {
  id: number;
  name: string;
  remark: string;
  roles: RoleSetting[];
  createdAt: Date;
  updatedAt: Date;
  siteId: number;
};

export interface EditRole {
  name: string;
  remark: string;
  roles: RoleSetting[];
  siteId?: number;
}

export type FilterRole = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
};

export type RolePagedList = {
  list: Role[];
  count: number;
};

export type RoleSetting = {
  subject: RoleSubject;
  actions: RoleAction[];
};

export enum RoleAction {
  Manage = 'manage',
  Create = 'c',
  Read = 'r',
  Update = 'u',
  Delete = 'd',
  Approve = 'a',
}

export enum RoleSubject {
  All = 'all',
  Dashboard = 'dashboard',
  Analytics = 'analytics',
  ProblemsAndSolutions = 'problemsAndSolutions',
  Faqs = 'faqs',
  Plannings = 'plannings',
  OeeSettings = 'oeeSettings',
  MachineSettings = 'machineSettings',
  ProductSettings = 'productSettings',
  DeviceSettings = 'deviceSettings',
  ModelSettings = 'modelSettings',
  PlannedDowntimeSettings = 'plannedDowntimeSettings',
  DashboardSettings = 'dashboardSettings',
  AlarmSettings = 'alarmSettings',
  SiteSettings = 'siteSettings',
  UserSettings = 'userSettings',
  RoleSettings = 'roleSettings',
}
