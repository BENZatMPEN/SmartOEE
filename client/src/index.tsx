import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import relativeTime from 'dayjs/plugin/relativeTime';
import ReactDOM from 'react-dom';
import 'react-grid-layout/css/styles.css';
import { HelmetProvider } from 'react-helmet-async';
import 'react-image-lightbox/style.css';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import 'react-quill/dist/quill.snow.css';
import { Provider as ReduxProvider } from 'react-redux';
import 'react-resizable/css/styles.css';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/lib/integration/react';
import 'simplebar/src/simplebar.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { RoleAction, RoleSubject } from './@types/role';
import { User } from './@types/user';
import App from './App';
import { buildAbilityFor } from './caslConfig';
import { AbilityContext } from './caslContext';
import { CollapseDrawerProvider } from './contexts/CollapseDrawerContext';
import { AuthProvider } from './contexts/JwtContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { persistor, store } from './redux/store';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './utils/highlight';

dayjs.extend(relativeTime);
dayjs.extend(buddhistEra);

const ability = buildAbilityFor([]);

store.subscribe(() => {
  const authState = store.getState().auth;
  const user = authState?.userProfile as User;

  // if (!user) {
  //   cannot(RoleAction.Manage, RoleSubject.All);
  //   return build();
  // }

  // if (user.isAdmin) {
  //   can([RoleAction.Manage], RoleSubject.All);
  // } else {

  // TODO: if no role cannot do anything

  if (!user) {
    return;
  }

  if (user.isAdmin) {
    ability.update([{ action: [RoleAction.Manage], subject: RoleSubject.All }]);
  } else if ((user.roles || []).length >= 0) {
    const role = user.roles[0];
    ability.update(role.roles.map((sub) => ({ action: sub.actions, subject: sub.subject })));
  }
});

ReactDOM.render(
  <HelmetProvider>
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AuthProvider>
            <AbilityContext.Provider value={ability}>
              <SettingsProvider>
                <CollapseDrawerProvider>
                  <BrowserRouter>
                    <App />
                  </BrowserRouter>
                </CollapseDrawerProvider>
              </SettingsProvider>
            </AbilityContext.Provider>
          </AuthProvider>
        </LocalizationProvider>
      </PersistGate>
    </ReduxProvider>
  </HelmetProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
