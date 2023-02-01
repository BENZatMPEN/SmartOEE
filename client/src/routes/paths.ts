function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/dashboard';
const ROOTS_ANALYTICS = '/analytics';
const ROOTS_PROBLEMS_SOLUTIONS = '/problems-solutions';
const ROOTS_FAQS = '/faqs';
const ROOTS_PLANNINGS = '/plannings';
const ROOTS_HISTORY = '/history';
const ROOTS_SETTINGS = '/settings';
const ROOTS_ADMINISTRATOR = '/admin';

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  item: {
    root: (id: string) => path(ROOTS_DASHBOARD, `/${id}`),
    operating: (id: string) => path(ROOTS_DASHBOARD, `/${id}/operating`),
    machine: (id: string) => path(ROOTS_DASHBOARD, `/${id}/machine`),
    timeline: (id: string) => path(ROOTS_DASHBOARD, `/${id}/timeline`),
    oeeGraph: (id: string) => path(ROOTS_DASHBOARD, `/${id}/oee-graph`),
    apqGraph: (id: string) => path(ROOTS_DASHBOARD, `/${id}/apq-graph`),
    history: (id: string) => path(ROOTS_DASHBOARD, `/${id}/history`),
  },
};

export const PATH_ANALYTICS = {
  root: ROOTS_ANALYTICS,
  group: {
    root: path(ROOTS_ANALYTICS, `/group`),
    details: (id: string) => path(ROOTS_ANALYTICS, `/group/${id}`),
  },
  view: {
    root: path(ROOTS_ANALYTICS, `/view`),
    details: (id: string) => path(ROOTS_ANALYTICS, `/single/${id}`),
  },
};

export const PATH_PROBLEMS_SOLUTIONS = {
  root: ROOTS_PROBLEMS_SOLUTIONS,
  item: {
    new: path(ROOTS_PROBLEMS_SOLUTIONS, `/new`),
    details: (id: string) => path(ROOTS_PROBLEMS_SOLUTIONS, `/${id}`),
    edit: (id: string) => path(ROOTS_PROBLEMS_SOLUTIONS, `/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_PROBLEMS_SOLUTIONS, `/${id}/duplicate`),
  },
};

export const PATH_FAQS = {
  root: ROOTS_FAQS,
  item: {
    new: path(ROOTS_FAQS, `/new`),
    details: (id: string) => path(ROOTS_FAQS, `/${id}`),
    edit: (id: string) => path(ROOTS_FAQS, `/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_FAQS, `/${id}/duplicate`),
  },
};

export const PATH_PLANNINGS = {
  root: ROOTS_PLANNINGS,
  item: {
    // new: path(ROOTS_PLANNINGS, `/new`),
    // details: (id: string) => path(ROOTS_FAQS, `/${id}`),
    // edit: (id: string) => path(ROOTS_FAQS, `/${id}/edit`),
    // duplicate: (id: string) => path(ROOTS_FAQS, `/${id}/duplicate`),
  },
};

export const PATH_HISTORY = {
  root: ROOTS_HISTORY,
  item: {
    alarms: path(ROOTS_HISTORY, '/alarms'),
    actions: path(ROOTS_HISTORY, '/actions'),
  },
};

export const PATH_SETTINGS = {
  root: ROOTS_SETTINGS,
  oees: {
    root: path(ROOTS_SETTINGS, '/oees'),
    new: path(ROOTS_SETTINGS, '/oees/new'),
    edit: (id: string) => path(ROOTS_SETTINGS, `/oees/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_SETTINGS, `/oees/${id}/duplicate`),
  },
  machines: {
    root: path(ROOTS_SETTINGS, '/machines'),
    new: path(ROOTS_SETTINGS, '/machines/new'),
    edit: (id: string) => path(ROOTS_SETTINGS, `/machines/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_SETTINGS, `/machines/${id}/duplicate`),
  },
  products: {
    root: path(ROOTS_SETTINGS, '/products'),
    new: path(ROOTS_SETTINGS, '/products/new'),
    edit: (id: string) => path(ROOTS_SETTINGS, `/products/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_SETTINGS, `/products/${id}/duplicate`),
  },
  deviceModels: {
    root: path(ROOTS_SETTINGS, '/models'),
    new: path(ROOTS_SETTINGS, '/models/new'),
    edit: (id: string) => path(ROOTS_SETTINGS, `/models/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_SETTINGS, `/models/${id}/duplicate`),
  },
  devices: {
    root: path(ROOTS_SETTINGS, '/devices'),
    new: path(ROOTS_SETTINGS, '/devices/new'),
    details: (id: string) => path(ROOTS_SETTINGS, `/devices/${id}`),
    edit: (id: string) => path(ROOTS_SETTINGS, `/devices/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_SETTINGS, `/devices/${id}/duplicate`),
  },
  dashboard: {
    root: path(ROOTS_SETTINGS, '/dashboard'),
    new: path(ROOTS_SETTINGS, '/dashboard/new'),
    edit: (id: string) => path(ROOTS_SETTINGS, `/dashboard/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_SETTINGS, `/dashboard/${id}/duplicate`),
  },
  alarms: {
    root: path(ROOTS_SETTINGS, '/alarms'),
    new: path(ROOTS_SETTINGS, '/alarms/new'),
    edit: (id: string) => path(ROOTS_SETTINGS, `/alarms/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_SETTINGS, `/alarms/${id}/duplicate`),
  },
  plannedDowntimes: {
    root: path(ROOTS_SETTINGS, '/planned-downtimes'),
    new: path(ROOTS_SETTINGS, '/planned-downtimes/new'),
    edit: (id: string) => path(ROOTS_SETTINGS, `/planned-downtimes/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_SETTINGS, `/planned-downtimes/${id}/duplicate`),
  },
  site: {
    root: path(ROOTS_SETTINGS, '/site'),
  },
  users: {
    root: path(ROOTS_SETTINGS, `/users`),
    new: path(ROOTS_SETTINGS, `/users/new`),
    edit: (id: string) => path(ROOTS_SETTINGS, `/users/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_SETTINGS, `/users/${id}/duplicate`),
    changePassword: (id: string) => path(ROOTS_SETTINGS, `/users/${id}/change-password`),
  },
  roles: {
    root: path(ROOTS_SETTINGS, `/roles`),
    new: path(ROOTS_SETTINGS, `/roles/new`),
    edit: (id: string) => path(ROOTS_SETTINGS, `/roles/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_SETTINGS, `/roles/${id}/duplicate`),
  },
};

export const PATH_ADMINISTRATOR = {
  root: ROOTS_ADMINISTRATOR,
  sites: {
    root: path(ROOTS_ADMINISTRATOR, '/sites'),
    new: path(ROOTS_ADMINISTRATOR, '/sites/new'),
    edit: (id: string) => path(ROOTS_ADMINISTRATOR, `/sites/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_ADMINISTRATOR, `/sites/${id}/duplicate`),
  },
  users: {
    root: path(ROOTS_ADMINISTRATOR, '/users'),
    new: path(ROOTS_ADMINISTRATOR, '/users/new'),
    edit: (id: string) => path(ROOTS_ADMINISTRATOR, `/users/${id}/edit`),
    duplicate: (id: string) => path(ROOTS_ADMINISTRATOR, `/users/${id}/duplicate`),
    changePassword: (id: string) => path(ROOTS_ADMINISTRATOR, `/users/${id}/change-password`),
  },
};
