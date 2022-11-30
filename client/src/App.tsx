import MotionLazyContainer from './components/animate/MotionLazyContainer';
import NotistackProvider from './components/NotistackProvider';
import { ProgressBarStyle } from './components/ProgressBar';
import ScrollToTop from './components/ScrollToTop';
import Settings from './components/settings';
import ThemeColorPresets from './components/ThemeColorPresets';
import Router from './routes';
import ThemeProvider from './theme';

export default function App() {
  return (
    <ThemeProvider>
      <ThemeColorPresets>
        <NotistackProvider>
          <MotionLazyContainer>
            <ProgressBarStyle />
            <Settings />
            <ScrollToTop />
            <Router />
          </MotionLazyContainer>
        </NotistackProvider>
      </ThemeColorPresets>
    </ThemeProvider>
  );
}
