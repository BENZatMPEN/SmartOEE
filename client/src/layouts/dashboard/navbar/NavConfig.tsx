import Iconify from '../../../components/Iconify';
import SvgIconStyle from '../../../components/SvgIconStyle';
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
          { title: 'OEE', path: PATH_SETTINGS.oees.root },
          { title: 'Machines', path: PATH_SETTINGS.machines.root },
          { title: 'Products', path: PATH_SETTINGS.products.root },
          { title: 'Devices', path: PATH_SETTINGS.devices.root },
          { title: 'Models', path: PATH_SETTINGS.deviceModels.root },
          { title: 'Planned Downtimes', path: PATH_SETTINGS.plannedDowntimes.root },
          { title: 'Dashboard', path: PATH_SETTINGS.dashboard.root },
          { title: 'Alarms', path: PATH_SETTINGS.alarms.root },
          { title: 'Site', path: PATH_SETTINGS.site.root },
        ],
      },
    ],
  },
  {
    subheader: 'administrator',
    items: [
      {
        title: 'Administrator',
        path: PATH_ADMINISTRATOR.root,
        icon: <Iconify icon="ic:outline-admin-panel-settings" />,
        children: [
          { title: 'Sites', path: PATH_ADMINISTRATOR.sites.root },
          { title: 'Users', path: PATH_ADMINISTRATOR.users.root },
          { title: 'Roles', path: PATH_ADMINISTRATOR.roles.root },
        ],
      },
    ],
  },
];

export default navConfig;
