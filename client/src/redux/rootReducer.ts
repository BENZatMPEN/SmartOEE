import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import adminSiteReducer from './reducers/adminSiteReducer';
import adminUserReducer from './reducers/adminUserReducer';
import alarmReducer from './reducers/alarmReducer';
import analyticReducer from './reducers/analyticReducer';
import authReducer from './reducers/authReducer';
import dashboardReducer from './reducers/dashboardReducer';
import deviceModelReducer from './reducers/deviceModelReducer';
import deviceReducer from './reducers/deviceReducer';
import faqReducer from './reducers/faqReducer';
import machineReducer from './reducers/machineReducer';
import oeeBatchReducer from './reducers/oeeBatchReducer';
import oeeDashboardReducer from './reducers/oeeDashboardReducer';
import oeeAdvancedReducer from './reducers/oeeAdvancedReducer';
import oeeReducer from './reducers/oeeReducer';
import plannedDowntimeReducer from './reducers/plannedDowntimeReducer';
import problemSolutionReducer from './reducers/problemSolutionReducer';
import productReducer from './reducers/productReducer';
import roleReducer from './reducers/roleReducer';
import siteReducer from './reducers/siteReducer';
import userReducer from './reducers/userReducer';
import userSiteReducer from './reducers/userSiteReducer';
import calendarReducer from './reducers/calendarReducer';
import reportReducer from './reducers/reportReducer';
const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: [],
};

// const oeePersistConfig = {
//   key: 'oee',
//   storage,
//   keyPrefix: 'redux-',
//   whitelist: ['sortBy'],
// };

// const machinePersistConfig = {
//   key: 'machine',
//   storage,
//   keyPrefix: 'redux-',
//   whitelist: ['sortBy'],
// };

// const productPersistConfig = {
//   key: 'product',
//   storage,
//   keyPrefix: 'redux-',
//   whitelist: ['sortBy'],
// };
//
// const deviceModelPersistConfig = {
//   key: 'deviceModel',
//   storage,
//   keyPrefix: 'redux-',
//   whitelist: ['sortBy'],
// };
//
// const devicePersistConfig = {
//   key: 'device',
//   storage,
//   keyPrefix: 'redux-',
//   whitelist: ['sortBy'],
// };

const userSitePersistConfig = {
  key: 'user-site',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['selectedSiteId', 'ganttView'],
};

const rootReducer = combineReducers({
  userSite: persistReducer(userSitePersistConfig, userSiteReducer),
  site: siteReducer,
  dashboard: dashboardReducer,
  auth: authReducer,
  deviceModel: deviceModelReducer,
  device: deviceReducer,
  role: roleReducer,
  user: userReducer,
  oee: oeeReducer,
  oeeBatch: oeeBatchReducer,
  analytic: analyticReducer,
  report: reportReducer,
  plannedDowntime: plannedDowntimeReducer,
  alarm: alarmReducer,
  product: productReducer,
  machine: machineReducer,
  oeeDashboard: oeeDashboardReducer,
  oeeAdvanced: oeeAdvancedReducer,
  problemSolution: problemSolutionReducer,
  faq: faqReducer,
  adminUser: adminUserReducer,
  adminSite: adminSiteReducer,
  calendar: calendarReducer,
});

export { rootPersistConfig, rootReducer };
