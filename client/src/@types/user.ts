export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type EditUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type FilterUser = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
  siteId?: number;
};
