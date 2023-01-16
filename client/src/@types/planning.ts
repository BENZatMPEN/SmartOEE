import { Oee } from './oee';
import { Product } from './product';
import { User } from './user';

export type Planning = {
  id: number;
  title: string;
  lotNumber: string;
  color: string;
  startDate: Date;
  endDate: Date;
  plannedQuantity: number;
  remark: string;
  productId: number;
  allDay: boolean;
  product: Product;
  oeeId: number;
  oee: Oee;
  siteId: number;
  userId: number;
  user: User;
  createdAt: Date;
  updatedAt: Date;
};

export type FilterPlanning = {
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
};
