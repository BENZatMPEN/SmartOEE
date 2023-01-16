import { BoxProps } from '@mui/material';
import { ReactElement } from 'react';
import { RoleSubject } from '../../@types/role';

// ----------------------------------------------------------------------

export type NavListProps = {
  title: string;
  path: string;
  icon?: ReactElement;
  info?: ReactElement;
  roleSubject?: RoleSubject;
  children?: {
    title: string;
    path: string;
    roleSubject?: RoleSubject;
    children?: { title: string; path: string }[];
  }[];
};

export type NavItemProps = {
  item: NavListProps;
  isCollapse?: boolean;
  active?: boolean | undefined;
  open?: boolean;
  onOpen?: VoidFunction;
  onMouseEnter?: VoidFunction;
  onMouseLeave?: VoidFunction;
};

export interface NavSectionProps extends BoxProps {
  isCollapse?: boolean;
  navConfig: {
    subheader: string;
    items: NavListProps[];
  }[];
}
