import { PercentSetting } from './type/percent-settings';
import { RoleAction, RoleSetting, RoleSubject } from './type/role-setting';
import { AlertTemplate } from './type/alertTemplate';

export const ROLE_OWNER = 'Owner';

export const OEE_TYPE_STANDALONE = 'standalone';
export const OEE_TYPE_CONTINUOUS = 'continuous';

export const OEE_TIME_UNIT_SECOND = 'second';
export const OEE_TIME_UNIT_MINUTE = 'minute';

export const OEE_TYPE_OEE = 'oee';
export const OEE_TYPE_A = 'a';
export const OEE_TYPE_P = 'p';
export const OEE_TYPE_Q = 'q';

export const OEE_PARAM_TYPE_A = 'a';
export const OEE_PARAM_TYPE_P = 'p';
export const OEE_PARAM_TYPE_Q = 'q';

export const OEE_BATCH_STATUS_STANDBY = 'standby';
export const OEE_BATCH_STATUS_RUNNING = 'running';
export const OEE_BATCH_STATUS_BREAKDOWN = 'breakdown';
export const OEE_BATCH_STATUS_PLANNED = 'planned';
export const OEE_BATCH_STATUS_MC_SETUP = 'mc_setup';
export const OEE_BATCH_STATUS_ENDED = 'ended';
export const OEE_BATCH_STATUS_UNKNOWN = 'unknown';

export const OEE_TAG_MC_STATE = 'mc_state';
export const OEE_TAG_TOTAL = 'total';
export const OEE_TAG_TOTAL_NG = 'total_ng';
export const OEE_TAG_OUT_OEE = 'out_oee';
export const OEE_TAG_OUT_A = 'out_a';
export const OEE_TAG_OUT_P = 'out_p';
export const OEE_TAG_OUT_Q = 'out_q';
export const OEE_TAG_OUT_OPERATING_TIME = 'out_operating_time';
export const OEE_TAG_OUT_PLANNED_DOWNTIME = 'out_planned_downtime';
export const OEE_TAG_OUT_BREAKING_TIME = 'out_breaking_time';
export const OEE_TAG_OUT_TOTAL_NG = 'out_total_ng';
export const OEE_TAG_OUT_CYCLE_TIME = 'out_cycle_time';
export const OEE_TAG_OUT_PLANNED_QUANTITY = 'out_planned_quantity';
export const OEE_TAG_OUT_BATCH_STATUS = 'out_batch_status';
export const OEE_TAG_OUT_RESET = 'out_reset';

export const PLANNED_DOWNTIME_TYPE_PLANNED = 'planned';
export const PLANNED_DOWNTIME_TYPE_MC_SETUP = 'mc_setup';

export const PLANNED_DOWNTIME_TIMING_AUTO = 'auto';
export const PLANNED_DOWNTIME_TIMING_MANUAL = 'manual';
export const PLANNED_DOWNTIME_TIMING_TIMER = 'timer';

export const TASK_STATUS_ON_PROCESS = 'on_process';
export const TASK_STATUS_ON_WAITING = 'waiting';
export const TASK_STATUS_ON_APPROVED = 'approved';
export const TASK_STATUS_ON_COMPLETE = 'complete';

export const OEE_BATCH_HISTORY_TYPE_EDIT = 'edit';

export const ALARM_TYPE_EMAIL = 'email';
export const ALARM_TYPE_LINE = 'line';

export const HISTORY_LOG_TYPE_ACTION = 'action';
export const HISTORY_LOG_TYPE_ALARM = 'alarm';

export const defaultPercentSettings: PercentSetting[] = [
  {
    type: 'oee',
    settings: { high: 80, medium: 60, low: 50 },
  },
  {
    type: 'a',
    settings: { high: 80, medium: 60, low: 50 },
  },
  {
    type: 'p',
    settings: { high: 80, medium: 60, low: 50 },
  },
  {
    type: 'q',
    settings: { high: 80, medium: 60, low: 50 },
  },
];

export const defaultAlertTemplate: AlertTemplate = {
  aParamWithoutParam: 'Breakdown has occurred at {{time}} - {{seconds}} seconds.',
  aParamWithParam: '{{paramName}} has occurred at {{time}} - {{seconds}} seconds.',
  pParamWithoutParam: 'Minor Loss has occurred at {{time}} - {{seconds}} seconds.',
  pParamWithParam: '{{paramName}} has occurred at {{time}} - {{seconds}} seconds.',
  qParamWithParam: '{{paramName}} has increased from {{previousAmount}} to {{currentAmount}}.',
  oeeLow: 'OEE low - previous: {{previousPercent}}, current: {{currentPercent}}',
  aLow: 'A low - previous: {{previousPercent}}, current: {{currentPercent}}',
  pLow: 'P low - previous: {{previousPercent}}, current: {{currentPercent}}',
  qLow: 'Q low - previous: {{previousPercent}}, current: {{currentPercent}}',
};

export const defaultRoles: RoleSetting[] = [
  {
    subject: RoleSubject.Dashboard,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update],
  },
  {
    subject: RoleSubject.Analytics,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.ProblemsAndSolutions,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete, RoleAction.Approve],
  },
  {
    subject: RoleSubject.Faqs,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete, RoleAction.Approve],
  },
  {
    subject: RoleSubject.Plannings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.OeeSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.MachineSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.ProductSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.DeviceSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.ModelSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.PlannedDowntimeSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.DashboardSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.AlarmSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.SiteSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.UserSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.RoleSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
];
