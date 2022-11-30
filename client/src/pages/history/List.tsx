import { Box, Container, Stack } from '@mui/material';
import { Outlet } from 'react-router-dom';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { NavSectionHorizontal } from '../../components/nav-section';
import Page from '../../components/Page';
import { PATH_HISTORY } from '../../routes/paths';

export default function History() {
  const navConfig = [
    {
      subheader: 'Alarm History',
      items: [
        {
          title: 'Alarm History',
          path: PATH_HISTORY.item.alarms,
        },
      ],
    },
    {
      subheader: 'Action History',
      items: [
        {
          title: 'Action History',
          path: PATH_HISTORY.item.actions,
        },
      ],
    },
  ];

  return (
    <Page title="History">
      <Container maxWidth={false}>
        <HeaderBreadcrumbs
          heading="Alarm History"
          links={[
            { name: 'Home', href: '/' },
            {
              name: 'Alarm History',
            },
          ]}
        />

        <Stack spacing={3}>
          <NavSectionHorizontal navConfig={navConfig} />
          <Box>
            <Outlet />
          </Box>
        </Stack>
      </Container>
    </Page>
  );
}
