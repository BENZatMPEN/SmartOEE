import { Role } from './role';
import { Site } from './site';

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  imageName: string;
  roles: Role[];
  sites: Site[];
  createdAt: Date;
  updatedAt: Date;
};

export interface EditUser {
  email: string;
  firstName: string;
  lastName: string;
  image: File | null;
  siteIds: number[];
  roleId: number;
}

export interface EditAdminUser {
  email: string;
  firstName: string;
  lastName: string;
  image: File | null;
  isAdmin: boolean;
  siteIds: number[];
}

export interface EditUserPassword {
  password: string;
  confirmPassword: string;
}

export type FilterUser = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
};

export type UserPagedList = {
  list: User[];
  count: number;
};
