import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import analyticReducer from './reducers/analyticReducer';
import authReducer from './reducers/authReducer';
import deviceModelReducer from './reducers/deviceModelReducer';
import deviceReducer from './reducers/deviceReducer';
import oeeBatchReducer from './reducers/oeeBatchReducer';
import oeeReducer from './reducers/oeeReducer';
import roleReducer from './reducers/roleReducer';
import siteReducer from './reducers/siteReducer';
import calendarReducer from './slices/calendar';

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

const sitePersistConfig = {
  key: 'site',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['selectedSiteId', 'ganttView'],
};

const rootReducer = combineReducers({
  site: persistReducer(sitePersistConfig, siteReducer),
  auth: authReducer,
  deviceModel: deviceModelReducer,
  device: deviceReducer,
  role: roleReducer,
  oee: oeeReducer,
  oeeBatch: oeeBatchReducer,
  analytic: analyticReducer,
  calendar: calendarReducer,
});

export { rootPersistConfig, rootReducer };
