import { Avatar, Box, Divider, MenuItem, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import defaultUser from '../../../assets/default_user.png';
import { IconButtonAnimate } from '../../../components/animate';
import MenuPopover from '../../../components/MenuPopover';
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import { RootState, useSelector } from '../../../redux/store';
import { PATH_AUTH } from '../../../routes/paths';
import { getFileUrl } from '../../../utils/imageHelper';

const MENU_OPTIONS = [
  // {
  //   label: 'Home',
  //   linkTo: '/',
  // },
  {
    label: 'Profile',
    linkTo: '/account/profile',
  },
  {
    label: 'Change Password',
    linkTo: '/account/change-password',
  },
];

export default function AccountPopover() {
  const navigate = useNavigate();

  const { userProfile } = useSelector((state: RootState) => state.auth);

  const { logout } = useAuth();

  const isMountedRef = useIsMountedRef();

  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(PATH_AUTH.login, { replace: true });

      if (isMountedRef.current) {
        handleClose();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  return (
    userProfile && (
      <>
        <Box sx={{ my: 1.5, px: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }} noWrap>
            {userProfile.firstName} {userProfile.lastName}
          </Typography>
        </Box>

        <IconButtonAnimate
          onClick={handleOpen}
          sx={{
            p: 0,
            ...(open && {
              '&:before': {
                zIndex: 1,
                content: "''",
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                position: 'absolute',
                bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
              },
            }),
          }}
        >
          <Avatar
            src={userProfile.imageName ? getFileUrl(userProfile.imageName) : defaultUser}
            alt={userProfile.email}
          />
        </IconButtonAnimate>

        <MenuPopover
          open={Boolean(open)}
          anchorEl={open}
          onClose={handleClose}
          sx={{
            p: 0,
            mt: 1.5,
            ml: 0.75,
            '& .MuiMenuItem-root': {
              typography: 'body2',
              borderRadius: 0.75,
            },
          }}
        >
          <Box sx={{ my: 1.5, px: 2.5 }}>
            <Typography variant="subtitle2" noWrap>
              {userProfile.email}
            </Typography>
            {/*<Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>*/}
            {/*  {user1@user.com}*/}
            {/*</Typography>*/}
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack sx={{ p: 1 }}>
            {MENU_OPTIONS.map((option) => (
              <MenuItem key={option.label} onClick={handleClose} to={option.linkTo} component={RouterLink}>
                {option.label}
              </MenuItem>
            ))}
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
            Logout
          </MenuItem>
        </MenuPopover>
      </>
    )
  );
}
