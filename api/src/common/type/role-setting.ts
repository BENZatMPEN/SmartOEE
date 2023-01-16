export class RoleSetting {
  subject: RoleSubject;
  actions: RoleAction[];
}

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
