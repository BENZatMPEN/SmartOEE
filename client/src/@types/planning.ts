import { Oee } from './oee';
import { Product } from './product';
import { User } from './user';

export interface Planning {
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
}

export interface EditPlanning {
  title: string;
  lotNumber: string;
  color: string;
  startDate: Date;
  endDate: Date;
  plannedQuantity: number;
  remark: string;
  productId: number;
  allDay: boolean;
  oeeId: number;
  userId: number;
}

export type FilterPlanning = {
  start: Date;
  end: Date;
};
