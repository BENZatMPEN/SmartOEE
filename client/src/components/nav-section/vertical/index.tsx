// @mui
import { Box, List, ListSubheader } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Fragment } from 'react';
import { RootState, useSelector } from '../../../redux/store';
// type
import { NavSectionProps } from '../type';
//
import { NavListRoot } from './NavList';

// ----------------------------------------------------------------------

export const ListSubheaderStyle = styled((props) => <ListSubheader disableSticky disableGutters {...props} />)(
  ({ theme }) => ({
    ...theme.typography.overline,
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    color: theme.palette.text.primary,
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shorter,
    }),
  }),
);

// ----------------------------------------------------------------------

export default function NavSectionVertical({ navConfig, isCollapse = false, ...other }: NavSectionProps) {
  const { userProfile } = useSelector((state: RootState) => state.auth);

  return (
    <Box {...other}>
      {navConfig.map((group) => {
        if (group.subheader === 'Administrator') {
          if (userProfile && userProfile.isAdmin) {
            return (
              <List key={group.subheader} disablePadding sx={{ px: 2 }}>
                {/*<ListSubheaderStyle*/}
                {/*  sx={{*/}
                {/*    ...(isCollapse && {*/}
                {/*      opacity: 0,*/}
                {/*    }),*/}
                {/*  }}*/}
                {/*>*/}
                {/*  {group.subheader}*/}
                {/*</ListSubheaderStyle>*/}
                {group.items.map((list) => (
                  <NavListRoot key={list.title} list={list} isCollapse={isCollapse} />
                ))}
              </List>
            );
          } else {
            return <Fragment key={group.subheader}></Fragment>;
          }
        } else {
          return (
            <List key={group.subheader} disablePadding sx={{ px: 2 }}>
              {/*<ListSubheaderStyle*/}
              {/*  sx={{*/}
              {/*    ...(isCollapse && {*/}
              {/*      opacity: 0,*/}
              {/*    }),*/}
              {/*  }}*/}
              {/*>*/}
              {/*  {group.subheader}*/}
              {/*</ListSubheaderStyle>*/}
              {group.items.map((list) => (
                <NavListRoot key={list.title} list={list} isCollapse={isCollapse} />
              ))}
            </List>
          );
        }
      })}
    </Box>
  );
}
