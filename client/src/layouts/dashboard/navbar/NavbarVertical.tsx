import { Drawer, Stack } from '@mui/material';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
// components
import Logo from '../../../components/Logo';
import { NavSectionVertical } from '../../../components/nav-section';
import Scrollbar from '../../../components/Scrollbar';
// config
import { NAVBAR } from '../../../config';
import useCollapseDrawer from '../../../hooks/useCollapseDrawer';
// hooks
import useResponsive from '../../../hooks/useResponsive';
import { RootState, useSelector } from '../../../redux/store';
import { PATH_ANALYTICS } from '../../../routes/paths';
// utils
import cssStyles from '../../../utils/cssStyles';
import CollapseButton from './CollapseButton';
//
import navConfig from './NavConfig';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    transition: theme.transitions.create('width', {
      duration: theme.transitions.duration.shorter,
    }),
  },
}));

// ----------------------------------------------------------------------

type Props = {
  isOpenSidebar: boolean;
  onCloseSidebar: VoidFunction;
};

export default function NavbarVertical({ isOpenSidebar, onCloseSidebar }: Props) {
  const theme = useTheme();

  const { groupAnalytics } = useSelector((state: RootState) => state.analytic);

  const { allDashboard } = useSelector((state: RootState) => state.userSite);

  const { pathname } = useLocation();

  const isDesktop = useResponsive('up', 'lg');

  const [navItems, setNavItems] = useState<any[]>(navConfig);

  const { isCollapse, collapseClick, collapseHover, onToggleCollapse, onHoverEnter, onHoverLeave } =
    useCollapseDrawer();

    useEffect(() => {
      console.log('Updated navConfig:', navConfig);
    }, []);

  useEffect(() => {
    const temp = [...navConfig];
    const idx = temp.findIndex((item) => item.subheader === 'Analytics');
    const item: any = temp[idx].items[0];
    item.children.splice(1, item.children.length - 1);
    item.children = [
      ...item.children,
      ...groupAnalytics.map((analytic) => ({
        title: analytic.name,
        path: PATH_ANALYTICS.group.details(analytic.id.toString()),
      })),
    ];

    setNavItems(temp);
  }, [groupAnalytics]);

  useEffect(() => {
    const temp = [...navConfig];
    const idx = temp.findIndex((item) => item.subheader === 'Dashboard');
    const item: any = temp[idx].items[0];
    item.children.splice(2, item.children.length - 1);
    item.children = [
      ...item.children,
      ...allDashboard.map((dashboard) => ({
        title: dashboard.title,
        path: dashboard.link,
      })),
    ];

    setNavItems(temp);
  }, [allDashboard]);

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          pt: 3,
          pb: 2,
          px: 2.5,
          flexShrink: 0,
          ...(isCollapse && { alignItems: 'center' }),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Logo />

          {isDesktop && !isCollapse && (
            <CollapseButton onToggleCollapse={onToggleCollapse} collapseClick={collapseClick} />
          )}
        </Stack>

        {/*<NavbarAccount isCollapse={isCollapse} />*/}
      </Stack>

      <NavSectionVertical navConfig={navItems} isCollapse={isCollapse} />

      {/*<Box sx={{ flexGrow: 1 }} />*/}

      {/*{!isCollapse && <NavbarDocs />}*/}
    </Scrollbar>
  );

  return (
    <RootStyle
      sx={{
        width: {
          lg: isCollapse ? NAVBAR.DASHBOARD_COLLAPSE_WIDTH : NAVBAR.DASHBOARD_WIDTH,
        },
        ...(collapseClick && {
          position: 'absolute',
        }),
      }}
    >
      {!isDesktop && (
        <Drawer open={isOpenSidebar} onClose={onCloseSidebar} PaperProps={{ sx: { width: NAVBAR.DASHBOARD_WIDTH } }}>
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          onMouseEnter={onHoverEnter}
          onMouseLeave={onHoverLeave}
          PaperProps={{
            sx: {
              width: NAVBAR.DASHBOARD_WIDTH,
              borderRightStyle: 'dashed',
              bgcolor: 'background.default',
              transition: (theme) =>
                theme.transitions.create('width', {
                  duration: theme.transitions.duration.standard,
                }),
              ...(isCollapse && {
                width: NAVBAR.DASHBOARD_COLLAPSE_WIDTH,
              }),
              ...(collapseHover && {
                ...cssStyles(theme).bgBlur(),
                boxShadow: (theme) => theme.customShadows.z24,
              }),
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
  );
}
