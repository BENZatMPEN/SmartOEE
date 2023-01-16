import { RoleSubject } from '../../../@types/role';
import Iconify from '../../../components/Iconify';
import {
  PATH_ADMINISTRATOR,
  PATH_ANALYTICS,
  PATH_DASHBOARD,
  PATH_FAQS,
  PATH_PLANNINGS,
  PATH_PROBLEMS_SOLUTIONS,
  PATH_SETTINGS,
} from '../../../routes/paths';

// const getIcon = (name: string) => <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />;

// const ICONS = {
//   user: getIcon('ic_user'),
//   ecommerce: getIcon('ic_ecommerce'),
//   analytics: getIcon('ic_analytics'),
//   dashboard: getIcon('ic_dashboard'),
// };

const navConfig = [
  {
    subheader: 'Dashboard',
    items: [
      {
        title: 'Dashboard',
        path: PATH_DASHBOARD.root,
        icon: <Iconify icon="ic:round-dashboard" />,
        children: [{ title: 'Home', path: PATH_DASHBOARD.root }],
        roleSubject: RoleSubject.Dashboard,
      },
    ],
  },
  {
    subheader: 'Analytics',
    items: [
      {
        title: 'Analytics',
        path: PATH_ANALYTICS.root,
        icon: <Iconify icon="ic:baseline-area-chart" />,
        children: [{ title: 'Home', path: PATH_ANALYTICS.root }],
        roleSubject: RoleSubject.Analytics,
      },
    ],
  },
  {
    subheader: 'Problems & Solutions',
    items: [
      {
        title: 'Problems & Solutions',
        path: PATH_PROBLEMS_SOLUTIONS.root,
        icon: <Iconify icon="ic:outline-lightbulb" />,
        roleSubject: RoleSubject.ProblemsAndSolutions,
      },
    ],
  },
  {
    subheader: 'FAQs',
    items: [
      {
        title: 'FAQs',
        path: PATH_FAQS.root,
        icon: <Iconify icon="ic:round-question-answer" />,
        roleSubject: RoleSubject.Faqs,
      },
    ],
  },
  {
    subheader: 'Plannings',
    items: [
      {
        title: 'Plannings',
        path: PATH_PLANNINGS.root,
        icon: <Iconify icon="ic:round-calendar-month" />,
        roleSubject: RoleSubject.Plannings,
      },
    ],
  },
  {
    subheader: 'Settings',
    items: [
      {
        title: 'Settings',
        path: PATH_SETTINGS.root,
        icon: <Iconify icon="ic:baseline-display-settings" />,
        children: [
          { title: 'OEE', path: PATH_SETTINGS.oees.root, roleSubject: RoleSubject.OeeSettings },
          { title: 'Machines', path: PATH_SETTINGS.machines.root, roleSubject: RoleSubject.MachineSettings },
          { title: 'Products', path: PATH_SETTINGS.products.root, roleSubject: RoleSubject.ProductSettings },
          { title: 'Devices', path: PATH_SETTINGS.devices.root, roleSubject: RoleSubject.DeviceSettings },
          { title: 'Models', path: PATH_SETTINGS.deviceModels.root, roleSubject: RoleSubject.ModelSettings },
          {
            title: 'Planned Downtimes',
            path: PATH_SETTINGS.plannedDowntimes.root,
            roleSubject: RoleSubject.PlannedDowntimeSettings,
          },
          { title: 'Dashboard', path: PATH_SETTINGS.dashboard.root, roleSubject: RoleSubject.DashboardSettings },
          { title: 'Alarms', path: PATH_SETTINGS.alarms.root, roleSubject: RoleSubject.AlarmSettings },
          { title: 'Site', path: PATH_SETTINGS.site.root, roleSubject: RoleSubject.SiteSettings },
          { title: 'Users', path: PATH_SETTINGS.users.root, roleSubject: RoleSubject.UserSettings },
          { title: 'Roles', path: PATH_SETTINGS.roles.root, roleSubject: RoleSubject.RoleSettings },
        ],
      },
    ],
  },
  {
    subheader: 'Administrator',
    items: [
      {
        title: 'FUYUU Admin',
        path: PATH_ADMINISTRATOR.root,
        icon: <Iconify icon="ic:outline-admin-panel-settings" />,
        roleSubject: 'Administrator',
        children: [
          { title: 'Sites', path: PATH_ADMINISTRATOR.sites.root },
          { title: 'Users', path: PATH_ADMINISTRATOR.users.root },
        ],
      },
    ],
  },
];

export default navConfig;
