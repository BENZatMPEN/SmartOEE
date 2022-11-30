import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HEADER, NAVBAR } from '../../config';
import useCollapseDrawer from '../../hooks/useCollapseDrawer';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
import { getGroupAnalytics } from '../../redux/actions/analyticAction';
import { getAuthRole } from '../../redux/actions/authAction';
import { getSites } from '../../redux/actions/siteAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';
import DashboardHeader from './header';
import NavbarHorizontal from './navbar/NavbarHorizontal';
import NavbarVertical from './navbar/NavbarVertical';

type MainStyleProps = {
  collapseClick: boolean;
};

const MainStyle = styled('main', {
  shouldForwardProp: (prop) => prop !== 'collapseClick',
})<MainStyleProps>(({ collapseClick, theme }) => ({
  flexGrow: 1,
  paddingTop: HEADER.MOBILE_HEIGHT + 24,
  paddingBottom: HEADER.MOBILE_HEIGHT + 24,
  [theme.breakpoints.up('lg')]: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: HEADER.DASHBOARD_DESKTOP_HEIGHT + 24,
    paddingBottom: HEADER.DASHBOARD_DESKTOP_HEIGHT + 24,
    width: `calc(100% - ${NAVBAR.DASHBOARD_WIDTH}px)`,
    transition: theme.transitions.create('margin-left', {
      duration: theme.transitions.duration.shorter,
    }),
    ...(collapseClick && {
      marginLeft: NAVBAR.DASHBOARD_COLLAPSE_WIDTH,
    }),
  },
}));

export default function DashboardLayout() {
  const { collapseClick, isCollapse } = useCollapseDrawer();

  const { themeLayout } = useSettings();

  const isDesktop = useResponsive('up', 'lg');

  const [open, setOpen] = useState(false);

  const verticalLayout = themeLayout === 'vertical';

  const dispatch = useDispatch();

  const { selectedSite, selectedSiteId, isLoading } = useSelector((state: RootState) => state.site);

  useEffect(() => {
    (async () => {
      await dispatch(getSites());
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!selectedSiteId) {
      return;
    }

    (async () => {})();
  }, [dispatch, selectedSiteId]);

  useEffect(() => {
    if (selectedSiteId) {
      axios.defaults.params = { siteId: selectedSiteId };
    }

    (async () => {
      await dispatch(getAuthRole());
      await dispatch(getGroupAnalytics());
    })();
  }, [dispatch, selectedSiteId]);

  const isNotFound = !isLoading && !selectedSite;

  if (verticalLayout) {
    return (
      <>
        <DashboardHeader onOpenSidebar={() => setOpen(true)} verticalLayout={verticalLayout} />

        {isDesktop ? (
          <NavbarHorizontal />
        ) : (
          <NavbarVertical isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
        )}

        <Box
          component="main"
          sx={{
            px: { lg: 2 },
            pt: {
              xs: `${HEADER.MOBILE_HEIGHT + 24}px`,
              lg: `${HEADER.DASHBOARD_DESKTOP_HEIGHT + 80}px`,
            },
            pb: {
              xs: `${HEADER.MOBILE_HEIGHT + 24}px`,
              lg: `${HEADER.DASHBOARD_DESKTOP_HEIGHT + 24}px`,
            },
          }}
        >
          {isLoading ? <>Loading...</> : isNotFound ? <>Not found</> : <Outlet />}
        </Box>
      </>
    );
  }

  return (
    <Box
      sx={{
        display: { lg: 'flex' },
        minHeight: { lg: 1 },
      }}
    >
      <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpen(true)} />

      <NavbarVertical isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />

      <MainStyle collapseClick={collapseClick}>
        {isLoading ? <>Loading...</> : isNotFound ? <>Not found</> : <Outlet />}
      </MainStyle>
    </Box>
  );
}
