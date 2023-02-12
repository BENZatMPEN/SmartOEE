// @mui
import { Collapse, List } from '@mui/material';
import { Fragment, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getActive } from '..';
import { RoleAction, RoleSubject } from '../../../@types/role';
import { AbilityContext } from '../../../caslContext';
// type
import { NavListProps } from '../type';
//
import { NavItemRoot, NavItemSub } from './NavItem';

// ----------------------------------------------------------------------

type NavListRootProps = {
  list: NavListProps;
  isCollapse: boolean;
};

export function NavListRoot({ list, isCollapse }: NavListRootProps) {
  const ability = useContext(AbilityContext);

  const { pathname } = useLocation();

  const active = getActive(list.path, pathname);

  const [open, setOpen] = useState(active);

  const hasChildren = list.children;

  const hasSettings =
    ability.can(RoleAction.Read, RoleSubject.OeeSettings) ||
    ability.can(RoleAction.Read, RoleSubject.MachineSettings) ||
    ability.can(RoleAction.Read, RoleSubject.ProductSettings) ||
    ability.can(RoleAction.Read, RoleSubject.DeviceSettings) ||
    ability.can(RoleAction.Read, RoleSubject.ModelSettings) ||
    ability.can(RoleAction.Read, RoleSubject.PlannedDowntimeSettings) ||
    ability.can(RoleAction.Read, RoleSubject.DashboardSettings) ||
    ability.can(RoleAction.Read, RoleSubject.AlarmSettings) ||
    ability.can(RoleAction.Read, RoleSubject.SiteSettings) ||
    ability.can(RoleAction.Read, RoleSubject.UserSettings) ||
    ability.can(RoleAction.Read, RoleSubject.RoleSettings);

  if (hasChildren) {
    if (
      (list.title === 'Settings' && hasSettings) ||
      (list.roleSubject && ability.can(RoleAction.Read, list.roleSubject))
    ) {
      return (
        <>
          <NavItemRoot item={list} isCollapse={isCollapse} active={active} open={open} onOpen={() => setOpen(!open)} />

          {!isCollapse && (
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {(list.children || []).map((item, idx) => {
                  if (list.title === 'Settings') {
                    return item.roleSubject && ability.can(RoleAction.Read, item.roleSubject) ? (
                      <NavListSub key={`${item.title}_${idx}`} list={item} />
                    ) : (
                      <Fragment key={`${item.title}_${idx}`} />
                    );
                  } else {
                    return <NavListSub key={`${item.title}_${idx}`} list={item} />;
                  }
                })}
              </List>
            </Collapse>
          )}
        </>
      );
    } else {
      return <></>;
    }
  }

  if (list.roleSubject && ability.can(RoleAction.Read, list.roleSubject)) {
    return <NavItemRoot item={list} active={active} isCollapse={isCollapse} />;
  } else {
    return <></>;
  }

  // if (isAdmin || (list.roleSubject && ability.can(RoleAction.Read, list.roleSubject))) {
  //   return <NavItemRoot item={list} active={active} isCollapse={isCollapse} />;
  // } else {
  //   return <></>;
  // }
}

type NavListSubProps = {
  list: NavListProps;
};

function NavListSub({ list }: NavListSubProps) {
  const { pathname } = useLocation();

  const active = getActive(list.path, pathname);

  const [open, setOpen] = useState(active);

  const hasChildren = list.children;

  if (hasChildren) {
    return (
      <>
        <NavItemSub item={list} onOpen={() => setOpen(!open)} open={open} active={active} />

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 3 }}>
            {(list.children || []).map((item) => (
              <NavItemSub key={item.title} item={item} active={getActive(item.path, pathname)} />
            ))}
          </List>
        </Collapse>
      </>
    );
  }

  return <NavItemSub item={list} active={active} />;
}
