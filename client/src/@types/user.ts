export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  imageName: string;
  roleId: number;
  siteIds: number[];
  createdAt: Date;
  updatedAt: Date;
};

export type EditUser = {
  email: string;
  firstName: string;
  lastName: string;
  image: File | null;

  roleId: number;
};

export type EditUserPassword = {
  password: string;
  confirmPassword: string;
};

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
