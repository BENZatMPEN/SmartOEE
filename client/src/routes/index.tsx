import { ElementType, lazy, Suspense } from 'react';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { WidgetDialogProvider } from '../contexts/WidgetDialogContext';
import AuthGuard from '../guards/AuthGuard';
import GuestGuard from '../guards/GuestGuard';
import useAuth from '../hooks/useAuth';
import { WebSocketProvider } from '../hooks/useWebSocket';
import DashboardLayout from '../layouts/dashboard';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';

const Loadable = (Component: ElementType) => (props: any) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isAuthenticated } = useAuth();

  const isDashboard = pathname.includes('/dashboard') && isAuthenticated;

  return (
    <Suspense fallback={<LoadingScreen isDashboard={isDashboard} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          ),
        },
        // {
        //   path: 'register',
        //   element: (
        //     <GuestGuard>
        //       <Register />
        //     </GuestGuard>
        //   ),
        // },
        // { path: 'login-unprotected', element: <Login /> },
        // { path: 'register-unprotected', element: <Register /> },
        // { path: 'reset-password', element: <ResetPassword /> },
        // { path: 'new-password', element: <NewPassword /> },
        // { path: 'verify', element: <VerifyCode /> },
      ],
    },
    {
      path: '/',
      element: (
        <AuthGuard>
          <WebSocketProvider>
            <WidgetDialogProvider>
              <DashboardLayout />
            </WidgetDialogProvider>
          </WebSocketProvider>
        </AuthGuard>
      ),
      children: [
        { element: <Home />, index: true },
        {
          path: 'account',
          children: [
            { element: <Navigate to="profile" replace />, index: true },
            { path: 'profile', element: <Profile /> },
            { path: 'change-password', element: <ChangePassword /> },
          ],
        },
        {
          path: 'dashboard',
          children: [
            { element: <Dashboard />, index: true },
            { path: 'advanced', element: <Advanced />, index: true},
            {
              path: ':id',
              element: (
                // <SelectedOeeProvider>
                <DashboardDetails />
                // </SelectedOeeProvider>
              ),
              children: [
                { element: <Navigate to="operating" replace />, index: true },
                { path: 'operating', element: <DashboardDetailsOperating /> },
                { path: 'machine', element: <DashboardDetailsMachine /> },
                { path: 'timeline', element: <DashboardDetailsTimeline /> },
                { path: 'oee-graph', element: <DashboardDetailsOeeGraph /> },
                { path: 'apq-graph', element: <DashboardDetailsApqGraph /> },
                { path: 'history', element: <DashboardDetailsHistory /> },
              ],
            },
          ],
        },
        {
          path: 'analytics',
          children: [
            { element: <Analytics />, index: true },
            { path: 'view', element: <AnalyticView /> },
            {
              path: 'group',
              children: [
                { element: <AnalyticGroup />, index: true },
                { path: ':id', element: <AnalyticGroupDetails /> },
              ],
            },
          ],
        },
        {
          path: 'report',
          children: [
            { path: 'oee', element: <ReportOee /> },
            { path: 'cause', element: <ReportCause /> },
          ]
        },
        {
          path: 'problems-solutions',
          children: [
            { element: <ProblemsSolutions />, index: true },
            { path: 'new', element: <ProblemsSolutionsAddEdit /> },
            { path: ':id', element: <ProblemsSolutionsDetails /> },
            { path: ':id/edit', element: <ProblemsSolutionsAddEdit /> },
            { path: ':id/duplicate', element: <ProblemsSolutionsAddEdit /> },
          ],
        },
        {
          path: 'faqs',
          children: [
            { element: <Faqs />, index: true },
            { path: 'new', element: <FaqsAddEdit /> },
            { path: ':id', element: <FaqsDetails /> },
            { path: ':id/edit', element: <FaqsAddEdit /> },
            { path: ':id/duplicate', element: <FaqsAddEdit /> },
          ],
        },
        {
          path: 'plannings',
          children: [{ element: <Plannings />, index: true }],
        },
        {
          path: 'history',
          element: <History />,
          children: [
            { element: <Navigate to="alarms" replace />, index: true },
            { path: 'alarms', element: <HistoryAlarms /> },
            { path: 'actions', element: <HistoryActions /> },
          ],
        },
        {
          path: 'settings',
          children: [
            { element: <Navigate to="oees" replace />, index: true },
            {
              path: 'oees',
              children: [
                { element: <OEESettings />, index: true },
                { path: 'new', element: <OEESettingsDetails /> },
                { path: ':id/edit', element: <OEESettingsDetails /> },
                { path: ':id/duplicate', element: <OEESettingsDetails /> },
              ],
            },
            {
              path: 'machines',
              children: [
                { element: <MachineSettings />, index: true },
                { path: 'new', element: <MachineSettingsDetails /> },
                { path: ':id/edit', element: <MachineSettingsDetails /> },
                { path: ':id/duplicate', element: <MachineSettingsDetails /> },
              ],
            },
            {
              path: 'products',
              children: [
                { element: <ProductSettings />, index: true },
                { path: 'new', element: <ProductSettingsDetails /> },
                { path: ':id/edit', element: <ProductSettingsDetails /> },
                { path: ':id/duplicate', element: <ProductSettingsDetails /> },
              ],
            },
            {
              path: 'devices',
              children: [
                { element: <DeviceSettings />, index: true },
                { path: 'new', element: <DeviceSettingsAddEdit /> },
                { path: ':id', element: <DeviceSettingsDetails /> },
                { path: ':id/edit', element: <DeviceSettingsAddEdit /> },
                { path: ':id/duplicate', element: <DeviceSettingsAddEdit /> },
              ],
            },
            {
              path: 'models',
              children: [
                { element: <DeviceModelSettings />, index: true },
                { path: 'new', element: <DeviceModelSettingsDetails /> },
                { path: ':id/edit', element: <DeviceModelSettingsDetails /> },
                { path: ':id/duplicate', element: <DeviceModelSettingsDetails /> },
              ],
            },
            {
              path: 'dashboard',
              children: [
                { element: <DashboardSettings />, index: true },
                { path: 'new', element: <DashboardSettingsDetails /> },
                { path: ':id/edit', element: <DashboardSettingsDetails /> },
                { path: ':id/duplicate', element: <DashboardSettingsDetails /> },
              ],
            },
            {
              path: 'alarms',
              children: [
                { element: <AlarmSettings />, index: true },
                { path: 'new', element: <AlarmSettingsDetails /> },
                { path: ':id/edit', element: <AlarmSettingsDetails /> },
                { path: ':id/duplicate', element: <AlarmSettingsDetails /> },
              ],
            },
            {
              path: 'planned-downtimes',
              children: [
                { element: <PlannedDowntimeSettings />, index: true },
                { path: 'new', element: <PlannedDowntimeSettingsDetails /> },
                { path: ':id/edit', element: <PlannedDowntimeSettingsDetails /> },
                { path: ':id/duplicate', element: <PlannedDowntimeSettingsDetails /> },
              ],
            },
            { path: 'site', element: <SiteSettingsDetails />, index: true },
            {
              path: 'users',
              children: [
                { element: <UserSettings />, index: true },
                { path: 'new', element: <UserSettingsDetails /> },
                { path: ':id/edit', element: <UserSettingsDetails /> },
                { path: ':id/duplicate', element: <UserSettingsDetails /> },
                { path: ':id/change-password', element: <UserSettingsChangePassword /> },
              ],
            },
            {
              path: ':roles',
              children: [
                { element: <RoleSettings />, index: true },
                { path: 'new', element: <RoleSettingsDetails /> },
                { path: ':id/edit', element: <RoleSettingsDetails /> },
                { path: ':id/duplicate', element: <RoleSettingsDetails /> },
              ],
            },
          ],
        },
        {
          path: 'admin',
          children: [
            { element: <Navigate to="sites" replace />, index: true },
            {
              path: 'sites',
              children: [
                { element: <AdminSiteSettings />, index: true },
                { path: 'new', element: <AdminSiteSettingsDetails /> },
                { path: ':id/edit', element: <AdminSiteSettingsDetails /> },
                { path: ':id/duplicate', element: <AdminSiteSettingsDetails /> },
              ],
            },
            {
              path: 'users',
              children: [
                { element: <AdminUserSettings />, index: true },
                { path: 'new', element: <AdminUserSettingsDetails /> },
                { path: ':id/edit', element: <AdminUserSettingsDetails /> },
                { path: ':id/duplicate', element: <AdminUserSettingsDetails /> },
                { path: ':id/change-password', element: <AdminUserSettingsChangePassword /> },
              ],
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: '403', element: <Forbidden /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// Authentication
const Login = Loadable(lazy(() => import('../pages/auth/Login')));

// Home
const Home = Loadable(lazy(() => import('../pages/Home')));

// User Profile
const Profile = Loadable(lazy(() => import('../pages/account/Profile')));
const ChangePassword = Loadable(lazy(() => import('../pages/account/ChangePassword')));

// Dashboard
const Dashboard = Loadable(lazy(() => import('../pages/dashboard/List')));
const Advanced = Loadable(lazy(() => import('../pages/dashboard/Advanced')));
const DashboardDetails = Loadable(lazy(() => import('../pages/dashboard/Details')));
const DashboardDetailsOperating = Loadable(lazy(() => import('../pages/dashboard/details/Operating')));
const DashboardDetailsMachine = Loadable(lazy(() => import('../pages/dashboard/details/Machine')));
const DashboardDetailsTimeline = Loadable(lazy(() => import('../pages/dashboard/details/Timeline')));
const DashboardDetailsOeeGraph = Loadable(lazy(() => import('../pages/dashboard/details/OeeGraph')));
const DashboardDetailsApqGraph = Loadable(lazy(() => import('../pages/dashboard/details/ApqGraph')));
const DashboardDetailsHistory = Loadable(lazy(() => import('../pages/dashboard/details/History')));

// Analytics
const Analytics = Loadable(lazy(() => import('../pages/analytics/Home')));
const AnalyticView = Loadable(lazy(() => import('../pages/analytics/View')));
const AnalyticGroup = Loadable(lazy(() => import('../pages/analytics/Group')));
const AnalyticGroupDetails = Loadable(lazy(() => import('../pages/analytics/Group')));


// Report
const ReportOee = Loadable(lazy(() => import('../pages/reports/oee/View')));
const ReportCause = Loadable(lazy(() => import('../pages/reports/cause/View')));
// Problems and Solutions
const ProblemsSolutions = Loadable(lazy(() => import('../pages/problems-solutions/List')));
const ProblemsSolutionsDetails = Loadable(lazy(() => import('../pages/problems-solutions/Details')));
const ProblemsSolutionsAddEdit = Loadable(lazy(() => import('../pages/problems-solutions/AddEdit')));

// FAQs
const Faqs = Loadable(lazy(() => import('../pages/faqs/List')));
const FaqsDetails = Loadable(lazy(() => import('../pages/faqs/Details')));
const FaqsAddEdit = Loadable(lazy(() => import('../pages/faqs/AddEdit')));

// Plannings
const Plannings = Loadable(lazy(() => import('../pages/plannings/List')));

// History
const History = Loadable(lazy(() => import('../pages/history/List')));
const HistoryAlarms = Loadable(lazy(() => import('../pages/history/list/Alarms')));
const HistoryActions = Loadable(lazy(() => import('../pages/history/list/Actions')));

// Settings
// -- OEEs
const OEESettings = Loadable(lazy(() => import('../pages/settings/oees/List')));
const OEESettingsDetails = Loadable(lazy(() => import('../pages/settings/oees/Details')));
// -- Machines
const MachineSettings = Loadable(lazy(() => import('../pages/settings/machines/List')));
const MachineSettingsDetails = Loadable(lazy(() => import('../pages/settings/machines/Details')));
// -- Products
const ProductSettings = Loadable(lazy(() => import('../pages/settings/products/List')));
const ProductSettingsDetails = Loadable(lazy(() => import('../pages/settings/products/Details')));
// -- Models
const DeviceModelSettings = Loadable(lazy(() => import('../pages/settings/device-models/List')));
const DeviceModelSettingsDetails = Loadable(lazy(() => import('../pages/settings/device-models/Details')));
// -- Devices
const DeviceSettings = Loadable(lazy(() => import('../pages/settings/devices/List')));
const DeviceSettingsDetails = Loadable(lazy(() => import('../pages/settings/devices/Details')));
const DeviceSettingsAddEdit = Loadable(lazy(() => import('../pages/settings/devices/AddEdit')));
// -- Dashboard
const DashboardSettings = Loadable(lazy(() => import('../pages/settings/dashboard/List')));
const DashboardSettingsDetails = Loadable(lazy(() => import('../pages/settings/dashboard/Details')));
// -- Alarm
const AlarmSettings = Loadable(lazy(() => import('../pages/settings/alarms/List')));
const AlarmSettingsDetails = Loadable(lazy(() => import('../pages/settings/alarms/Details')));
// -- Downtime
const PlannedDowntimeSettings = Loadable(lazy(() => import('../pages/settings/planned-downtimes/List')));
const PlannedDowntimeSettingsDetails = Loadable(lazy(() => import('../pages/settings/planned-downtimes/Details')));
// -- Site
const SiteSettingsDetails = Loadable(lazy(() => import('../pages/settings/site/Details')));
// -- Roles
const UserSettings = Loadable(lazy(() => import('../pages/settings/users/List')));
const UserSettingsDetails = Loadable(lazy(() => import('../pages/settings/users/Details')));
const UserSettingsChangePassword = Loadable(lazy(() => import('../pages/settings/users/ChangePassword')));
// -- Roles
const RoleSettings = Loadable(lazy(() => import('../pages/settings/roles/List')));
const RoleSettingsDetails = Loadable(lazy(() => import('../pages/settings/roles/Details')));

// Administrator
// -- Sites
const AdminSiteSettings = Loadable(lazy(() => import('../pages/admin/sites/List')));
const AdminSiteSettingsDetails = Loadable(lazy(() => import('../pages/admin/sites/Details')));
// -- Users
const AdminUserSettings = Loadable(lazy(() => import('../pages/admin/users/List')));
const AdminUserSettingsDetails = Loadable(lazy(() => import('../pages/admin/users/Details')));
const AdminUserSettingsChangePassword = Loadable(lazy(() => import('../pages/admin/users/ChangePassword')));

const NotFound = Loadable(lazy(() => import('../pages/Page404')));
const Forbidden = Loadable(lazy(() => import('../pages/Page403')));
