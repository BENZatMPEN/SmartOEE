// @mui
import { styled } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
// components
import Logo from '../components/Logo';
import { Box, Stack } from '@mui/material';

// ----------------------------------------------------------------------

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  left: 0,
  lineHeight: 0,
  width: '100%',
  position: 'absolute',
  padding: theme.spacing(3, 3, 0),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(5, 5, 0),
  },
}));

// ----------------------------------------------------------------------

export default function LogoOnlyLayout() {
  return (
    <>
      <HeaderStyle>
        <Stack alignItems="center">
          <Box sx={{ width: 250 }}>
            <Logo />
          </Box>
        </Stack>
      </HeaderStyle>

      <Outlet />
    </>
  );
}
